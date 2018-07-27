
import { WebSocketPublisher } from "./WebSocketPublisher";
import { WebSocketSubscriber } from "./WebSocketSubscriber";
import { ApiConfiguration } from "../configuration/apiConfiguration";
import { Session } from "../interfaces/Session";
import { PrivateTopics } from "../interfaces/PrivateTopics";
import { StateMachineUpdateListener } from "../interfaces/StateMachineUpdateListener";
import { StateMachineInstance } from "../interfaces/StateMachineInstance";
import { Observable } from "rxjs";
import { WebSocketWrapper } from "./WebSocketWrapper";

export class WebSocketSession implements Session {
    private publisher: WebSocketPublisher;
    private subscriber: WebSocketSubscriber;
    public privateTopics: PrivateTopics;

    constructor(webSocketWrapper: WebSocketWrapper, configuration: ApiConfiguration, sessionData?: string) {
        this.subscriber = new WebSocketSubscriber(webSocketWrapper, configuration);
        this.privateTopics = new PrivateTopics(this.subscriber);
        this.publisher = new WebSocketPublisher(webSocketWrapper, configuration, this.privateTopics, sessionData);
        this.subscriber.setStateMachineRefSendPublisher(this.publisher);
    }

    public send(componentName: string, stateMachineName: string, messageType: string, jsonMessage: any, visibilityPrivate: boolean = false, specifiedPrivateTopic: string = undefined): void {
        this.publisher.send(componentName, stateMachineName, messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic);
    }

    public canSend(componentName: string, stateMachineName: string, messageType: string): boolean {
        return this.publisher.canSend(componentName, stateMachineName, messageType);
    }

    public getSnapshot(componentName: string, stateMachineName: string): Promise<Array<StateMachineInstance>> {
        return this.subscriber.getSnapshot(componentName, stateMachineName, this.privateTopics);
    }

    public getStateMachineUpdates(componentName: string, stateMachineName: string): Observable<StateMachineInstance> {
        return this.subscriber.getStateMachineUpdates(componentName, stateMachineName);
    }

    public subscribe(componentName: string, stateMachineName: string, stateMachineUpdateListener: StateMachineUpdateListener): void {
        this.subscriber.subscribe(componentName, stateMachineName, stateMachineUpdateListener);
    }

    public unsubscribe(componentName: string, stateMachineName: string): void {
        this.subscriber.unsubscribe(componentName, stateMachineName);
        throw new Error("Method not implemented.");
    }

    public canSubscribe(componentName: string, stateMachineName: string): boolean {
        return this.subscriber.canSubscribe(componentName, stateMachineName);
    }

    public dispose(): void {
        this.privateTopics.dispose();
    }
}