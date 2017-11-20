import { Commands, Kinds } from "../configuration/xcWebSocketBridgeConfiguration";
import { ApiConfiguration, SubscriberEventType } from "../configuration/apiConfiguration";
import { Observable } from "rxjs/Rx";

import { Publisher } from "./xcWebSocketPublisher";
import { Packet, StateMachineRef, Component, CompositionModel, DeserializedData, CommandData, Header, Event, Data, getHeaderWithIncomingType, Serializer, Deserializer, fatalErrorState } from "./xcomponentMessages";
import { } from "./clientMessages";
import { FSharpFormat, getFSharpFormat } from "../configuration/FSharpConfiguration";
import { isDebugEnabled } from "../loggerConfiguration";
import { error } from "util";

let log = require("loglevel");
let uuid = require("uuid/v4");

export interface Subscriber {
    privateTopics: Array<String>;
    replyPublisher: Publisher;
    getHeartbeatTimer(heartbeatIntervalSeconds: number): NodeJS.Timer;
    getCompositionModel(xcApiName: string): Promise<CompositionModel>;
    getXcApiList(): Promise<Array<String>>;
    getXcApi(xcApiFileName: string): Promise<string>;
    getSnapshot(componentName: string, stateMachineName: string): Promise<Array<Packet>>;
    getStateMachineUpdates(componentName: string, stateMachineName: string): Observable<Packet>;
    canSubscribe(componentName: string, stateMachineName: string): boolean;
    subscribe(componentName: string, stateMachineName: string, stateMachineUpdateListener: (data: Packet) => void): void;
    sendSubscribeRequestToTopic(topic: string, kind: number): void;
    sendUnsubscribeRequestToTopic(topic: string, kind: number): void;
    unsubscribe(componentName: string, stateMachineName: string): void;
    dispose(): void;
}

export class DefaultSubscriber implements Subscriber {

    private webSocket: WebSocket;
    private configuration: ApiConfiguration;
    private subscribedStateMachines: { [componentName: string]: Array<String> };
    private observableMsg: Observable<MessageEvent>;
    private deserializer: Deserializer;
    private serializer: Serializer;
    private timeout: string;

    public privateTopics: Array<String>;
    public replyPublisher: Publisher;

    constructor(webSocket: WebSocket, configuration: ApiConfiguration, replyPublisher: Publisher, privateTopics: Array<String>) {
        this.webSocket = webSocket;
        this.configuration = configuration;
        this.replyPublisher = replyPublisher;
        this.subscribedStateMachines = {};
        this.observableMsg = Observable.fromEvent(this.webSocket, "message");
        this.privateTopics = privateTopics;
        this.deserializer = new Deserializer();
        this.serializer = new Serializer();
        this.timeout = "00:00:10";
    }

    getHeartbeatTimer(heartbeatIntervalSeconds: number): NodeJS.Timer {
        let thisSubscriber = this;
        let command = Commands[Commands.hb];
        this.observableMsg
            .map((rawMessage: MessageEvent) => thisSubscriber.deserializer.deserializeWithoutTopic(rawMessage.data || rawMessage))
            .filter((data: DeserializedData) => data.command === command)
            .subscribe((data: DeserializedData) => {
                log.info("Heartbeat received successfully");
            });
        let commandData = {
            Command: command,
            Data: {}
        };
        let input = thisSubscriber.serializer.convertCommandDataToWebsocketInputFormat(commandData);
        return setInterval(() => {
            thisSubscriber.webSocket.send(input);
            log.info("Heartbeat sent");
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
                log.info("Model " + xcApiName + " received successfully");
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
                log.info("ApiList received successfully");
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
                log.info(xcApiFileName + " " + "received successfully");
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


    getSnapshot(componentName: string, stateMachineName: string): Promise<Array<Packet>> {
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


    private prepareStateMachineUpdates(componentName: string, stateMachineName: string): Observable<Packet> {
        const componentCode = this.configuration.getComponentCode(componentName);
        const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
        let thisSubscriber = this;
        let filteredObservable = this.observableMsg
            .map((rawMessage: MessageEvent) => thisSubscriber.deserializer.deserialize(rawMessage.data || rawMessage))
            .filter((data: DeserializedData) => data.command === Commands[Commands.update])
            .map((data: DeserializedData) => thisSubscriber.getJsonDataFromEvent(data.stringData, data.topic))
            .filter((jsonData: Packet) => thisSubscriber.isSameComponent(jsonData, componentCode) && thisSubscriber.isSameStateMachine(jsonData, stateMachineCode));
        return filteredObservable;
    };


    private isSameComponent(jsonData: Packet, componentCode: number): boolean {
        let sameComponent = jsonData.stateMachineRef.ComponentCode === componentCode;
        return sameComponent;
    }

    private isSameStateMachine(jsonData: Packet, stateMachineCode: number): boolean {
        let sameStateMachine = jsonData.stateMachineRef.StateMachineCode === stateMachineCode;
        return sameStateMachine;
    }


    getStateMachineUpdates(componentName: string, stateMachineName: string): Observable<Packet> {
        let filteredObservable = this.prepareStateMachineUpdates(componentName, stateMachineName);
        this.sendSubscribeRequest(componentName, stateMachineName);
        return filteredObservable;
    };


    canSubscribe(componentName: string, stateMachineName: string): boolean {
        const componentCode = this.configuration.getComponentCode(componentName);
        const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
        return this.configuration.containsSubscriber(componentCode, stateMachineCode, SubscriberEventType.Update);
    };


    subscribe(componentName: string, stateMachineName: string, stateMachineUpdateListener: (data: Packet) => void): void {
        this.prepareStateMachineUpdates(componentName, stateMachineName)
            .subscribe((jsonData: Packet) => {
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

    public getJsonDataFromSnapshot(data: string, topic: string): Array<Packet> {
        if (isDebugEnabled()) {
            log.debug(`JsonData received from snapshot: ${topic} ${data}`);
        }
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
                    thisSubscriber.replyPublisher.sendWithStateMachineRef(stateMachineRef, messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic);
                }
            };
            snapshotItems.push({
                stateMachineRef: stateMachineRef,
                jsonMessage: items[i].PublicMember
            });
        }
        return snapshotItems;
    };

    public getJsonDataFromEvent(data: string, topic: string): Packet {
        if (isDebugEnabled()) {
            log.debug(`JsonData received from event: ${topic} ${data}`);
        }
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
                thisSubscriber.replyPublisher.sendWithStateMachineRef(stateMachineRef, messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic);
            }
        };
        return {
            stateMachineRef: stateMachineRef,
            jsonMessage: JSON.parse(jsonData.JsonMessage)
        };
    };

}
