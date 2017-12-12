import { WebSocketPublisher } from "./WebSocketPublisher";
import { WebSocketSubscriber } from "./WebSocketSubscriber";
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
    private configuration: ApiConfiguration;
    private stateMachineRefSendPublisher: WebSocketPublisher;
    public privateTopic: string;
    public privateSubscriber: Subscriber;

    constructor(public webSocket: WebSocket, private sessionData?: string) {
        this.privateTopic = uuid();
        this.privateSubscriber = new WebSocketSubscriber(this.webSocket, null, null, null);
        this.privateSubscriber.sendSubscribeRequestToTopic(this.privateTopic, Kinds.Private);
        this.stateMachineRefSendPublisher = new WebSocketPublisher(this.webSocket, null, this.privateTopic, this.sessionData);
        this.publishers = [this.stateMachineRefSendPublisher];
        this.subscribers = [];
        this.privateTopics = [this.privateTopic];
    }

    public setConfiguration(configuration: ApiConfiguration) {
        this.configuration = configuration;
        this.stateMachineRefSendPublisher.configuration = configuration;
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
            this.privateSubscriber.sendSubscribeRequestToTopic(privateTopic, kindPrivate);
            this.privateTopics.push(privateTopic);
            this.subscribers.forEach((subscriber: Subscriber) => {
                subscriber.privateTopics = this.privateTopics;
            }, this);
        }
    };

    removePrivateTopic(privateTopic: string): void {
        const kindPrivate = Kinds.Private;
        this.privateSubscriber.sendUnsubscribeRequestToTopic(privateTopic, kindPrivate);
        WebSocketSession.removeElement(this.privateTopics, privateTopic);
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
        this.privateTopics.forEach((privateTopic: string) => {
            this.privateSubscriber.sendUnsubscribeRequestToTopic(privateTopic, Kinds.Private);
        }, this);
        this.publishers.forEach((publisher: WebSocketPublisher) => {
            WebSocketSession.removeElement(this.publishers, publisher);
        }, this);
        this.subscribers.forEach((subscriber: WebSocketSubscriber) => {
            WebSocketSession.removeElement(this.subscribers, subscriber);
        }, this);
    };

    public static removeElement<T>(array: Array<T>, e: T): void {
        const index = array.indexOf(e);
        if (index > -1) {
            array.splice(index, 1);
        } else {
            throw new Error("Element to remove not found");
        }
    };
}