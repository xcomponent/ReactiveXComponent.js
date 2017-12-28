
import { WebSocketPublisher } from "./WebSocketPublisher";
import { WebSocketSubscriber } from "./WebSocketSubscriber";
import { Utils } from "./Utils";
import { Kinds } from "../configuration/xcWebSocketBridgeConfiguration";
import * as definition from "definition";
import { ApiConfiguration } from "../configuration/apiConfiguration";
import { Session } from "../interfaces/Session";
import { PrivateTopics } from "../interfaces/PrivateTopics";
import { StateMachineUpdateListener } from "../interfaces/StateMachineUpdateListener";
import { StateMachineInstance } from "../interfaces/StateMachineInstance";
import { Observable } from "rxjs/Observable";
import * as uuid from "uuid/v4";

export class WebSocketSession implements Session {
    private publisher: WebSocketPublisher;
    private subscriber: WebSocketSubscriber;
    public privateTopics: PrivateTopics;

    constructor(private webSocket: WebSocket, private configuration: ApiConfiguration, private sessionData?: string) {
        this.privateTopics = new PrivateTopics();
        this.publisher = new WebSocketPublisher(this.webSocket, configuration, this.privateTopics, sessionData);
        this.subscriber = new WebSocketSubscriber(this.webSocket, configuration, this.publisher, this.privateTopics);
    }

    public send(componentName: string, stateMachineName: string, messageType: string, jsonMessage: any, visibilityPrivate: boolean = false, specifiedPrivateTopic: string = undefined): void {
        this.publisher.send(componentName, stateMachineName, messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic);
    }

    public canSend(componentName: string, stateMachineName: string, messageType: string): boolean {
        return this.publisher.canSend(componentName, stateMachineName, messageType);
    }

    public getSnapshot(componentName: string, stateMachineName: string): Promise<Array<StateMachineInstance>> {
        return this.subscriber.getSnapshot(componentName, stateMachineName);
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
        this.publisher.dispose();
        this.subscriber.dispose();
    };
}