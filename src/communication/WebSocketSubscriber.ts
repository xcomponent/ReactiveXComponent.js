import { Observable } from 'rxjs';
import { map, first, filter } from 'rxjs/operators';
import { Commands, Kinds } from '../configuration/xcWebSocketBridgeConfiguration';
import { ApiConfiguration, SubscriberEventType } from '../configuration/apiConfiguration';
import 'rxjs/add/operator/toPromise';
import { WebSocketPublisher } from './WebSocketPublisher';
import {
    DeserializedData,
    Event,
    Data,
    getHeaderWithIncomingType,
    Serializer,
    Deserializer,
    fatalErrorState,
    JsonMessage,
} from './xcomponentMessages';
import { PrivateTopics } from '../interfaces/PrivateTopics';
import { StateMachineInstance } from '../interfaces/StateMachineInstance';
import { StateMachineRef } from '../interfaces/StateMachineRef';
import { StateMachineUpdateListener } from '../interfaces/StateMachineUpdateListener';
import { generateUUID } from '../utils/uuid';
import { Logger } from '../utils/Logger';
import { WebSocketWrapper } from './WebSocketWrapper';

export class WebSocketSubscriber {
    private logger = Logger.getLogger('WebSocketSubscriber');
    private stateMachineRefSendPublisher: WebSocketPublisher;
    private subscribedStateMachines: { [componentName: string]: Array<String> };
    private updates$: Observable<DeserializedData>;
    private deserializer: Deserializer;
    private serializer: Serializer;
    private timeout: string;

    constructor(private webSocketWrapper: WebSocketWrapper, private configuration: ApiConfiguration) {
        this.subscribedStateMachines = {};
        this.deserializer = new Deserializer();
        this.serializer = new Serializer();
        this.timeout = '00:00:10';
        const thisSubscriber = this;
        const webSocketUpdates$ = this.webSocketWrapper.getObservable();
        if (webSocketUpdates$ !== undefined && webSocketUpdates$ !== null) {
            this.updates$ = webSocketUpdates$.pipe(
                map((rawMessage: MessageEvent) =>
                    thisSubscriber.deserializer.deserialize(rawMessage.data || rawMessage)
                )
            );
        }
    }

    public setStateMachineRefSendPublisher(stateMachineRefSendPublisher: WebSocketPublisher) {
        this.stateMachineRefSendPublisher = stateMachineRefSendPublisher;
    }

    public getSnapshot(
        componentName: string,
        stateMachineName: string,
        privateTopics: PrivateTopics
    ): Promise<Array<StateMachineInstance>> {
        const replyTopic = generateUUID();
        const thisSubscriber = this;
        const promise = this.updates$
            .pipe(
                filter(
                    (data: DeserializedData) =>
                        data.command === Commands[Commands.snapshot] && data.topic === replyTopic
                ),
                first(),
                map((data: DeserializedData) => {
                    thisSubscriber.sendUnsubscribeRequestToTopic(replyTopic, Kinds.Snapshot);
                    return thisSubscriber.getJsonDataFromSnapshot(data.stringData, data.topic);
                })
            )
            .toPromise();
        this.sendSubscribeRequestToTopic(replyTopic, Kinds.Snapshot);
        const dataToSendSnapshot = this.getDataToSendSnapshot(
            componentName,
            stateMachineName,
            replyTopic,
            privateTopics
        );
        this.webSocketWrapper.send(thisSubscriber.serializer.convertToWebsocketInputFormat(dataToSendSnapshot));
        return promise;
    }

    private getDataToSendSnapshot(
        componentName: string,
        stateMachineName: string,
        replyTopic: string,
        privateTopics: PrivateTopics
    ): Data {
        const componentCode = this.configuration.getComponentCode(componentName);
        const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
        let topic = this.configuration.getSnapshotTopic(componentCode);
        let jsonMessage = {
            Timeout: this.timeout,
            CallerPrivateTopic: privateTopics.getSubscriberTopics(),
            ReplyTopic: replyTopic,
        };
        let header = getHeaderWithIncomingType();
        header.ComponentCode = componentCode;
        header.StateMachineCode = stateMachineCode;
        let dataToSendSnapshot = {
            RoutingKey: topic,
            ComponentCode: componentCode,
            Event: {
                Header: header,
                JsonMessage: JSON.stringify(jsonMessage),
            },
        };
        return dataToSendSnapshot;
    }

    private prepareStateMachineUpdates(
        componentName: string,
        stateMachineName: string
    ): Observable<StateMachineInstance> {
        const componentCode = this.configuration.getComponentCode(componentName);
        const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
        let thisSubscriber = this;
        let filteredObservable = this.updates$.pipe(
            filter((data: DeserializedData) => data.command === Commands[Commands.update]),
            map((data: DeserializedData) => thisSubscriber.getJsonDataFromEvent(data.stringData, data.topic)),
            filter(
                (jsonData: StateMachineInstance) =>
                    thisSubscriber.isSameComponent(jsonData, componentCode) &&
                    thisSubscriber.isSameStateMachine(jsonData, stateMachineCode)
            )
        );
        return filteredObservable;
    }

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
    }

    canSubscribe(componentName: string, stateMachineName: string): boolean {
        const componentCode = this.configuration.getComponentCode(componentName);
        const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
        return this.configuration.containsSubscriber(componentCode, stateMachineCode, SubscriberEventType.Update);
    }

    subscribe(
        componentName: string,
        stateMachineName: string,
        stateMachineUpdateListener: StateMachineUpdateListener
    ): void {
        this.prepareStateMachineUpdates(componentName, stateMachineName).subscribe(
            (stateMachineInstance: StateMachineInstance) => {
                stateMachineUpdateListener.onStateMachineUpdate(stateMachineInstance);
            }
        );
        this.sendSubscribeRequest(componentName, stateMachineName);
    }

    private sendSubscribeRequest(componentName: string, stateMachineName: string): void {
        if (!this.isSubscribed(this.subscribedStateMachines, componentName, stateMachineName)) {
            const componentCode = this.configuration.getComponentCode(componentName);
            const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
            let topic = this.configuration.getSubscriberTopic(
                componentCode,
                stateMachineCode,
                SubscriberEventType.Update
            );
            let kind = Kinds.Public;
            this.sendSubscribeRequestToTopic(topic, kind);
            this.addSubscribedStateMachines(componentName, stateMachineName);
        }
    }

    sendSubscribeRequestToTopic(topic: string, kind: number): void {
        let data = this.getDataToSend(topic, kind);
        let commandData = {
            Command: Commands[Commands.subscribe],
            Data: data,
        };
        let input = this.serializer.convertCommandDataToWebsocketInputFormat(commandData);
        this.webSocketWrapper.send(input);
    }

    sendUnsubscribeRequestToTopic(topic: string, kind: number): void {
        let data = this.getDataToSend(topic, kind);
        let commandData = {
            Command: Commands[Commands.unsubscribe],
            Data: data,
        };
        let input = this.serializer.convertCommandDataToWebsocketInputFormat(commandData);
        this.webSocketWrapper.send(input);
    }

    private getDataToSend(topic: string, kind: number): Event {
        return {
            Header: getHeaderWithIncomingType(),
            JsonMessage: JSON.stringify({
                Topic: {
                    Key: topic,
                    kind: kind,
                },
            }),
        };
    }

    unsubscribe(componentName: string, stateMachineName: string): void {
        if (this.isSubscribed(this.subscribedStateMachines, componentName, stateMachineName)) {
            const componentCode = this.configuration.getComponentCode(componentName);
            const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
            let topic = this.configuration.getSubscriberTopic(
                componentCode,
                stateMachineCode,
                SubscriberEventType.Update
            );
            let kind = Kinds.Public;
            let data = this.getDataToSend(topic, kind);
            let commandData = {
                Command: Commands[Commands.unsubscribe],
                Data: data,
            };
            this.webSocketWrapper.send(this.serializer.convertCommandDataToWebsocketInputFormat(commandData));
            this.removeSubscribedStateMachines(componentName, stateMachineName);
        }
    }

    private isSubscribed(
        subscribedStateMachines: { [componentName: string]: Array<String> },
        componentName: string,
        stateMachineName: string
    ): boolean {
        let isSubscribed =
            subscribedStateMachines[componentName] !== undefined &&
            subscribedStateMachines[componentName].indexOf(stateMachineName) > -1;
        return isSubscribed;
    }

    private addSubscribedStateMachines(componentName: string, stateMachineName: string): void {
        if (this.subscribedStateMachines[componentName] === undefined) {
            this.subscribedStateMachines[componentName] = [stateMachineName];
        } else {
            this.subscribedStateMachines[componentName].push(stateMachineName);
        }
    }

    private removeSubscribedStateMachines(componentName: string, stateMachineName: string): void {
        let index = this.subscribedStateMachines[componentName].indexOf(stateMachineName);
        this.subscribedStateMachines[componentName].splice(index, 1);
    }

    public getJsonDataFromSnapshot(data: string, topic?: string): Array<StateMachineInstance> {
        this.logger.debug('JsonData received from snapshot: ', { data: data, topic: topic }, 2);
        let jsonData = this.deserializer.getJsonData(data);
        let b64Data = JSON.parse(jsonData.JsonMessage).Items;
        let items;
        try {
            const raw = JSON.parse(this.deserializer.decodeServerMessage(b64Data)!);
            if (raw.$values) {
                items = raw.$values;
            }
			else {
				items = raw;
			}
        } catch (e) {
            items = b64Data;
        }
        let snapshotItems = new Array<StateMachineInstance>();
        for (let i = 0; i < items.length; i++) {
            let stateMachineRef = this.getStateMachineRef(
                items[i].StateMachineId,
                parseInt(items[i].WorkerId, undefined),
                parseInt(items[i].ComponentCode, undefined),
                parseInt(items[i].StateMachineCode, undefined),
                parseInt(items[i].StateCode, undefined)
            );
            snapshotItems.push(new StateMachineInstance(stateMachineRef, items[i].PublicMember));
        }
        return snapshotItems;
    }

    public getJsonDataFromEvent(data: string, topic?: string): StateMachineInstance {
        this.logger.debug('JsonData received from event: ', { data: data, topic: topic }, 2);
        let jsonData = this.deserializer.getJsonData(data);
        let stateMachineRef = this.getStateMachineRef(
            jsonData.Header.StateMachineId,
            jsonData.Header.WorkerId,
            jsonData.Header.ComponentCode,
            jsonData.Header.StateMachineCode,
            jsonData.Header.StateCode,
            jsonData.Header.ErrorMessage
        );
        return new StateMachineInstance(stateMachineRef, JSON.parse(jsonData.JsonMessage));
    }

    private getStateMachineRef(
        StateMachineId: string,
        workerId: number,
        componentCode: number,
        stateMachineCode: number,
        stateCode: number,
        errorMessage?: string
    ): StateMachineRef {
        let thisSubscriber = this;
        let stateMachineRef = {
            StateMachineId: StateMachineId,
            WorkerId: workerId,
            ComponentCode: componentCode,
            StateMachineCode: stateMachineCode,
            StateName: errorMessage
                ? fatalErrorState
                : thisSubscriber.configuration.getStateName(componentCode, stateMachineCode, stateCode),
            send: (
                messageType: string,
                jsonMessage: JsonMessage,
                visibilityPrivate?: boolean,
                specifiedPrivateTopic?: string
            ) => {
                thisSubscriber.stateMachineRefSendPublisher.sendWithStateMachineRef(
                    stateMachineRef,
                    messageType,
                    jsonMessage,
                    visibilityPrivate,
                    specifiedPrivateTopic
                );
            },
            ErrorMessage: errorMessage,
        };
        return stateMachineRef;
    }
}
