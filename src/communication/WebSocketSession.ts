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
    private sessionData: string;
    private publishers: Array<Publisher>;
    private subscribers: Array<Subscriber>;
    private privateTopics: Array<string>;
    private configuration: ApiConfiguration;
    public heartbeatIntervalSeconds: number;
    public privateTopic: string;
    public closedByUser: boolean;
    public heartbeatTimer: number;
    public privateSubscriber: Subscriber;
    public replyPublisher: WebSocketPublisher;
    public webSocket: WebSocket;

    constructor(webSocket: WebSocket, sessionData?: string) {
        this.webSocket = webSocket;
        this.privateTopic = uuid();
        this.sessionData = sessionData;
        this.privateSubscriber = new WebSocketSubscriber(this.webSocket, null, null, null);
        this.replyPublisher = new WebSocketPublisher(this.webSocket, null, this.privateTopic, this.sessionData);
        this.publishers = [this.replyPublisher];
        this.subscribers = [];
        this.privateTopics = [this.privateTopic];
        this.heartbeatIntervalSeconds = 10;
        this.closedByUser = false;
    }

    public setConfiguration(configuration: ApiConfiguration) {
        this.configuration = configuration;
        this.replyPublisher.configuration = configuration;
    }

    setPrivateTopic(privateTopic: string): void {
        if (privateTopic) {
            this.addPrivateTopic(privateTopic);
            this.removePrivateTopic(this.privateTopic);
            this.privateTopic = privateTopic;
            this.publishers.forEach((publisher: Publisher) => {
                publisher.privateTopic = privateTopic;
            });
            this.subscribers.forEach((subscriber: Subscriber) => {
                subscriber.replyPublisher = this.replyPublisher;
            }, this);
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
        this.removeElement(this.privateTopics, privateTopic);
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
        const subscriber = new WebSocketSubscriber(this.webSocket, this.configuration, this.replyPublisher, this.privateTopics);
        this.subscribers.push(subscriber);
        return subscriber;
    };

    private removeElement<T>(array: Array<T>, e: T): void {
        const index = array.indexOf(e);
        if (index > -1) {
            array.splice(index, 1);
        } else {
            throw new Error("Element to remove not found");
        }
    };

    disposePublisher(publisher: Publisher): void {
        this.removeElement(this.publishers, publisher);
    };

    disposeSubscriber(subscriber: Subscriber): void {
        this.removeElement(this.subscribers, subscriber);
        subscriber.dispose();
    };

    dispose(): void {
        this.publishers.forEach((publisher: Publisher) => {
            this.disposePublisher(publisher);
        }, this);
        this.subscribers.forEach((subscriber: Subscriber) => {
            this.disposeSubscriber(subscriber);
        }, this);
    };

    close(): void {
        this.privateTopics.forEach((privateTopic: string) => {
            this.privateSubscriber.sendUnsubscribeRequestToTopic(privateTopic, Kinds.Private);
        }, this);
        clearInterval(this.heartbeatTimer);
        this.dispose();
        this.closedByUser = true;
        this.webSocket.close();
    };
}