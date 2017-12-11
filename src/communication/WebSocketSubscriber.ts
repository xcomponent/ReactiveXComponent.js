import { Commands, Kinds } from "../configuration/xcWebSocketBridgeConfiguration";
import { ApiConfiguration, SubscriberEventType } from "../configuration/apiConfiguration";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/first";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/operator/toPromise";
import { Publisher } from "../interfaces/Publisher";
import {
    StateMachineInstance, StateMachineRef, Component,
    CompositionModel, DeserializedData, CommandData, Header,
    Event, Data, getHeaderWithIncomingType,
    Serializer, Deserializer, fatalErrorState } from "./xcomponentMessages";
import { } from "./clientMessages";
import { error } from "util";
import { Subscriber } from "../interfaces/Subscriber";
import * as uuid from "uuid/v4";
import { Logger } from "log4ts";

export class WebSocketSubscriber implements Subscriber {
    private logger: Logger = Logger.getLogger("WebSocketSubscriber");
    private subscribedStateMachines: { [componentName: string]: Array<String> };
    private observableMsg: Observable<MessageEvent>;
    private deserializer: Deserializer;
    private serializer: Serializer;
    private timeout: string;

    constructor(private webSocket: WebSocket, private configuration: ApiConfiguration, private stateMachineRefSendPublisher: Publisher, public privateTopics: Array<String>) {
        this.subscribedStateMachines = {};
        this.observableMsg = Observable.fromEvent(this.webSocket, "message");
        this.deserializer = new Deserializer();
        this.serializer = new Serializer();
        this.timeout = "00:00:10";
    }

    getHeartbeatTimer(heartbeatIntervalSeconds: number): number {
        let thisSubscriber = this;
        let command = Commands[Commands.hb];
        this.observableMsg
            .map((rawMessage: MessageEvent) => thisSubscriber.deserializer.deserializeWithoutTopic(rawMessage.data || rawMessage))
            .filter((data: DeserializedData) => data.command === command)
            .subscribe((data: DeserializedData) => {
                this.logger.info("Heartbeat received successfully");
            });
        let commandData = {
            Command: command,
            Data: {}
        };
        let input = thisSubscriber.serializer.convertCommandDataToWebsocketInputFormat(commandData);
        return setInterval(() => {
            thisSubscriber.webSocket.send(input);
            this.logger.info("Heartbeat sent");
        }, heartbeatIntervalSeconds * 1000);
    }

    getCompositionModel(xcApiName: string): Promise<CompositionModel> {
        const thisSubscriber = this;
        const command = Commands[Commands.getModel];
        const promise = this.observableMsg
            .map((rawMessage: MessageEvent) => thisSubscriber.deserializer.deserializeWithoutTopic(rawMessage.data || rawMessage))
            .filter((data: DeserializedData) => data.command === command)
            .first()
            .map((data: DeserializedData) => {
                this.logger.info("Model " + xcApiName + " received successfully");
                return thisSubscriber.deserializer.getJsonDataFromGetModelRequest(data.stringData);
            })
            .toPromise();
        const commandData = {
            Command: command,
            Data: { "Name": xcApiName }
        };
        const input = thisSubscriber.serializer.convertCommandDataToWebsocketInputFormat(commandData);
        this.webSocket.send(input);
        return promise;
    }

    getXcApiList(): Promise<Array<String>> {
        const thisSubscriber = this;
        const command = Commands[Commands.getXcApiList];
        const promise = this.observableMsg
            .map((rawMessage: MessageEvent) => thisSubscriber.deserializer.deserializeWithoutTopic(rawMessage.data || rawMessage))
            .filter((data: DeserializedData) => data.command === command)
            .first()
            .map((data: DeserializedData) => {
                this.logger.info("ApiList received successfully");
                return thisSubscriber.deserializer.getJsonDataFromGetXcApiListRequest(data.stringData);
            })
            .toPromise();
        const commandData = {
            Command: command,
            Data: {}
        };
        this.webSocket.send(thisSubscriber.serializer.convertCommandDataToWebsocketInputFormat(commandData));
        return promise;
    };

    getXcApi(xcApiFileName: string): Promise<string> {
        const thisSubscriber = this;
        const command = Commands[Commands.getXcApi];
        const promise = this.observableMsg
            .map((rawMessage: MessageEvent) => thisSubscriber.deserializer.deserializeWithoutTopic(rawMessage.data || rawMessage))
            .filter((data: DeserializedData) => data.command === command)
            .first()
            .map((data: DeserializedData) => {
                this.logger.info(xcApiFileName + " " + "received successfully");
                return thisSubscriber.deserializer.getJsonDataFromXcApiRequest(data.stringData);
            })
            .toPromise();
        const commandData = {
            Command: command,
            Data: { Name: xcApiFileName }
        };
        this.webSocket.send(thisSubscriber.serializer.convertCommandDataToWebsocketInputFormat(commandData));
        return promise;
    };

    getSnapshot(componentName: string, stateMachineName: string): Promise<Array<StateMachineInstance>> {
        const replyTopic = uuid();
        const thisSubscriber = this;
        const promise = this.observableMsg
            .map((rawMessage: MessageEvent) => thisSubscriber.deserializer.deserialize(rawMessage.data || rawMessage))
            .filter((data: DeserializedData) => (data.command === Commands[Commands.snapshot] && data.topic === replyTopic))
            .first()
            .map((data: DeserializedData) => {
                thisSubscriber.sendUnsubscribeRequestToTopic(replyTopic, Kinds.Snapshot);
                return thisSubscriber.getJsonDataFromSnapshot(data.stringData, data.topic);
            })
            .toPromise();
        this.sendSubscribeRequestToTopic(replyTopic, Kinds.Snapshot);
        const dataToSendSnapshot = this.getDataToSendSnapshot(componentName, stateMachineName, replyTopic);
        this.webSocket.send(thisSubscriber.serializer.convertToWebsocketInputFormat(dataToSendSnapshot));
        return promise;
    };

    private getDataToSendSnapshot(componentName: string, stateMachineName: string, replyTopic: string): Data {
        const componentCode = this.configuration.getComponentCode(componentName);
        const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
        let topic = this.configuration.getSnapshotTopic(componentCode);
        let jsonMessage = {
            Timeout: this.timeout,
            CallerPrivateTopic: this.privateTopics,
            ReplyTopic: replyTopic
        };
        let header = getHeaderWithIncomingType();
        header.ComponentCode = componentCode;
        header.StateMachineCode = stateMachineCode;
        let dataToSendSnapshot = {
            RoutingKey: topic,
            ComponentCode: componentCode,
            Event: {
                Header: header,
                JsonMessage: JSON.stringify(jsonMessage)
            }
        };
        return dataToSendSnapshot;
    }

    private prepareStateMachineUpdates(componentName: string, stateMachineName: string): Observable<StateMachineInstance> {
        const componentCode = this.configuration.getComponentCode(componentName);
        const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
        let thisSubscriber = this;
        let filteredObservable = this.observableMsg
            .map((rawMessage: MessageEvent) => thisSubscriber.deserializer.deserialize(rawMessage.data || rawMessage))
            .filter((data: DeserializedData) => data.command === Commands[Commands.update])
            .map((data: DeserializedData) => thisSubscriber.getJsonDataFromEvent(data.stringData, data.topic))
            .filter((jsonData: StateMachineInstance) => thisSubscriber.isSameComponent(jsonData, componentCode) && thisSubscriber.isSameStateMachine(jsonData, stateMachineCode));
        return filteredObservable;
    };

    private isSameComponent(jsonData: StateMachineInstance, componentCode: number): boolean {
        let sameComponent = jsonData.stateMachineRef.ComponentCode === componentCode;
        return sameComponent;
    }

    private isSameStateMachine(jsonData: StateMachineInstance, stateMachineCode: number): boolean {
        let sameStateMachine = jsonData.stateMachineRef.StateMachineCode === stateMachineCode;
        return sameStateMachine;
    }

    getStateMachineUpdates(componentName: string, stateMachineName: string): Observable<StateMachineInstance> {
        let filteredObservable = this.prepareStateMachineUpdates(componentName, stateMachineName);
        this.sendSubscribeRequest(componentName, stateMachineName);
        return filteredObservable;
    };

    canSubscribe(componentName: string, stateMachineName: string): boolean {
        const componentCode = this.configuration.getComponentCode(componentName);
        const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
        return this.configuration.containsSubscriber(componentCode, stateMachineCode, SubscriberEventType.Update);
    };

    subscribe(componentName: string, stateMachineName: string, stateMachineUpdateListener: (data: StateMachineInstance) => void): void {
        this.prepareStateMachineUpdates(componentName, stateMachineName)
            .subscribe((jsonData: StateMachineInstance) => {
                stateMachineUpdateListener(jsonData);
            });
        this.sendSubscribeRequest(componentName, stateMachineName);
    };

    private sendSubscribeRequest(componentName: string, stateMachineName: string): void {
        if (!this.isSubscribed(this.subscribedStateMachines, componentName, stateMachineName)) {
            const componentCode = this.configuration.getComponentCode(componentName);
            const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
            let topic = this.configuration.getSubscriberTopic(componentCode, stateMachineCode, SubscriberEventType.Update);
            let kind = Kinds.Public;
            this.sendSubscribeRequestToTopic(topic, kind);
            this.addSubscribedStateMachines(componentName, stateMachineName);
        }
    };

    sendSubscribeRequestToTopic(topic: string, kind: number): void {
        let data = this.getDataToSend(topic, kind);
        let commandData = {
            Command: Commands[Commands.subscribe],
            Data: data
        };
        let input = this.serializer.convertCommandDataToWebsocketInputFormat(commandData);
        this.webSocket.send(input);
    };

    sendUnsubscribeRequestToTopic(topic: string, kind: number): void {
        let data = this.getDataToSend(topic, kind);
        let commandData = {
            Command: Commands[Commands.unsubscribe],
            Data: data
        };
        let input = this.serializer.convertCommandDataToWebsocketInputFormat(commandData);
        this.webSocket.send(input);
    };

    private getDataToSend(topic: string, kind: number): Event {
        return {
            "Header": getHeaderWithIncomingType(),
            "JsonMessage": JSON.stringify({
                "Topic": {
                    "Key": topic,
                    "kind": kind
                }
            })
        };
    };

    unsubscribe(componentName: string, stateMachineName: string): void {
        if (this.isSubscribed(this.subscribedStateMachines, componentName, stateMachineName)) {
            const componentCode = this.configuration.getComponentCode(componentName);
            const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
            let topic = this.configuration.getSubscriberTopic(componentCode, stateMachineCode, SubscriberEventType.Update);
            let kind = Kinds.Public;
            let data = this.getDataToSend(topic, kind);
            let commandData = {
                Command: Commands[Commands.unsubscribe],
                Data: data
            };
            this.webSocket.send(this.serializer.convertCommandDataToWebsocketInputFormat(commandData));
            this.removeSubscribedStateMachines(componentName, stateMachineName);
        }
    };

    private isSubscribed(subscribedStateMachines: { [componentName: string]: Array<String> }, componentName: string, stateMachineName: string): boolean {
        let isSubscribed = subscribedStateMachines[componentName] !== undefined && subscribedStateMachines[componentName].indexOf(stateMachineName) > -1;
        return isSubscribed;
    }

    dispose(): void {
    };

    private addSubscribedStateMachines(componentName: string, stateMachineName: string): void {
        if (this.subscribedStateMachines[componentName] === undefined) {
            this.subscribedStateMachines[componentName] = [stateMachineName];
        } else {
            this
                .subscribedStateMachines[componentName]
                .push(stateMachineName);
        }
    };
    private removeSubscribedStateMachines(componentName: string, stateMachineName: string): void {
        let index = this
            .subscribedStateMachines[componentName]
            .indexOf(stateMachineName);
        this
            .subscribedStateMachines[componentName]
            .splice(index, 1);
    };

    public getJsonDataFromSnapshot(data: string, topic: string): Array<StateMachineInstance> {
        this.logger.debug("JsonData received from snapshot: ", { data: data, topic: topic }, 2);
        let jsonData = this.deserializer.getJsonData(data);
        let b64Data = JSON.parse(jsonData.JsonMessage).Items;
        let items;
        try {
            items = JSON.parse(this.deserializer.decodeServerMessage(b64Data));
        } catch (e) {
            items = b64Data;
        }
        let snapshotItems = [];
        let thisSubscriber = this;
        for (let i = 0; i < items.length; i++) {
            let stateMachineRef = {
                "StateMachineId": parseInt(items[i].StateMachineId),
                "WorkerId": parseInt(items[i].WorkerId),
                "StateMachineCode": parseInt(items[i].StateMachineCode),
                "ComponentCode": parseInt(items[i].ComponentCode),
                "StateName": thisSubscriber.configuration.getStateName(items[i].ComponentCode, items[i].StateMachineCode, items[i].StateCode),
                "send": (messageType: string, jsonMessage: any, visibilityPrivate: boolean = undefined, specifiedPrivateTopic: string = undefined) => {
                    thisSubscriber.stateMachineRefSendPublisher.sendWithStateMachineRef(stateMachineRef, messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic);
                }
            };
            snapshotItems.push({
                stateMachineRef: stateMachineRef,
                jsonMessage: items[i].PublicMember
            });
        }
        return snapshotItems;
    };

    public getJsonDataFromEvent(data: string, topic: string): StateMachineInstance {
        this.logger.debug("JsonData received from event: ", { data: data, topic: topic }, 2);
        let jsonData = this.deserializer.getJsonData(data);
        let componentCode = jsonData.Header.ComponentCode;
        let stateMachineCode = jsonData.Header.StateMachineCode;
        let stateCode = jsonData.Header.StateCode;
        let thisSubscriber = this;
        let stateMachineRef = {
            "ErrorMessage": jsonData.Header.ErrorMessage,
            "StateMachineId": jsonData.Header.StateMachineId,
            "WorkerId": jsonData.Header.WorkerId,
            "StateMachineCode": jsonData.Header.StateMachineCode,
            "ComponentCode": jsonData.Header.ComponentCode,
            "StateName": (jsonData.Header.ErrorMessage) ? fatalErrorState : thisSubscriber.configuration.getStateName(componentCode, stateMachineCode, stateCode),
            "send": (messageType: string, jsonMessage: any, visibilityPrivate: boolean = undefined, specifiedPrivateTopic: string = undefined) => {
                thisSubscriber.stateMachineRefSendPublisher.sendWithStateMachineRef(stateMachineRef, messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic);
            }
        };
        return {
            stateMachineRef: stateMachineRef,
            jsonMessage: JSON.parse(jsonData.JsonMessage)
        };
    };
}