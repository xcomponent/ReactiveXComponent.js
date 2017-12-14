import { WebSocketPublisher } from "./WebSocketPublisher";
import { WebSocketSubscriber } from "./WebSocketSubscriber";
import { Utils } from "./Utils";
import { Kinds } from "../configuration/xcWebSocketBridgeConfiguration";
import * as definition from "definition";
import { ApiConfiguration } from "../configuration/apiConfiguration";
import { Publisher } from "../interfaces/Publisher";
import { Subscriber } from "../interfaces/Subscriber";
import { Session } from "../interfaces/Session";
import * as uuid from "uuid/v4";

export class WebSocketSession implements Session {
    private publishers: Array<WebSocketPublisher>;
    private subscribers: Array<WebSocketSubscriber>;
    private privateTopics: Array<string>;
    private stateMachineRefSendPublisher: WebSocketPublisher;
    public privateTopic: string;

    constructor(private webSocket: WebSocket, private configuration: ApiConfiguration, private sessionData?: string) {
        this.privateTopic = uuid();
        this.stateMachineRefSendPublisher = new WebSocketPublisher(this.webSocket, configuration, this.privateTopic, this.sessionData);
        this.publishers = [this.stateMachineRefSendPublisher];
        this.subscribers = [];
        this.privateTopics = [this.privateTopic];
    }

    setPrivateTopic(privateTopic: string): void {
        if (privateTopic) {
            this.addPrivateTopic(privateTopic);
            this.removePrivateTopic(this.privateTopic);
            this.privateTopic = privateTopic;
            this.publishers.forEach((publisher: Publisher) => {
                publisher.privateTopic = privateTopic;
            });
        }
    };

    addPrivateTopic(privateTopic: string): void {
        if (privateTopic && this.privateTopics.indexOf(privateTopic) === -1) {
            const kindPrivate = Kinds.Private;
            this.privateTopics.push(privateTopic);
            this.subscribers.forEach((subscriber: Subscriber) => {
                subscriber.privateTopics = this.privateTopics;
            }, this);
        }
    };

    removePrivateTopic(privateTopic: string): void {
        const kindPrivate = Kinds.Private;
        Utils.removeElementFromArray(this.privateTopics, privateTopic);
        this.subscribers.forEach((subscriber: Subscriber) => {
            subscriber.privateTopics = this.privateTopics;
        }, this);
    };

    getDefaultPrivateTopic(): string {
        return this.privateTopic;
    };

    getPrivateTopics(): string[] {
        return this.privateTopics;
    };

    createPublisher(): Publisher {
        const publisher = new WebSocketPublisher(this.webSocket, this.configuration, this.privateTopic, this.sessionData);
        this.publishers.push(publisher);
        return publisher;
    };

    createSubscriber(): Subscriber {
        const subscriber = new WebSocketSubscriber(this.webSocket, this.configuration, this.stateMachineRefSendPublisher, this.privateTopics);
        this.subscribers.push(subscriber);
        return subscriber;
    };

    public dispose(): void {
        this.publishers.forEach((publisher: WebSocketPublisher) => {
            Utils.removeElementFromArray(this.publishers, publisher);
        }, this);
        this.subscribers.forEach((subscriber: WebSocketSubscriber) => {
            Utils.removeElementFromArray(this.subscribers, subscriber);
        }, this);
    };
}