import javascriptHelper from "../javascriptHelper";
import { Publisher, DefaultPublisher } from "./xcWebSocketPublisher";
import { DefaultSubscriber, Subscriber } from "./xcWebSocketSubscriber";
import { Kinds } from "../configuration/xcWebSocketBridgeConfiguration";
import * as definition from "definition";
import { ApiConfiguration } from "../configuration/apiConfiguration";

let log = require("loglevel");
let uuid = require("uuid/v4");

export interface Session {
    privateSubscriber: Subscriber;
    replyPublisher: Publisher;
    configuration: ApiConfiguration;
    webSocket: WebSocket;
    getDefaultPrivateTopic(): string;
    getPrivateTopics(): string[];
    setPrivateTopic(privateTopic: string): void;
    addPrivateTopic(privateTopic: string): void;
    removePrivateTopic(privateTopic: string): void;
    init(openListener: (e: Event) => void, errorListener: (err: Error) => void): void;
    createPublisher(): Publisher;
    createSubscriber(): Subscriber;
    disposePublisher(publisher: Publisher): void;
    disposeSubscriber(subscriber: Subscriber): void;
    dispose(): void;
    close(): void;
}

export class DefaultSession implements Session {

    private serverUrl: string;
    private sessionData: string;
    private privateTopic: string;
    private publishers: Array<Publisher>;
    private subscribers: Array<Subscriber>;
    private privateTopics: Array<string>;
    private heartbeatTimer: NodeJS.Timer;
    private heartbeatIntervalSeconds: number;

    public privateSubscriber: Subscriber;
    public replyPublisher: Publisher;
    public configuration: ApiConfiguration;
    public webSocket: WebSocket;

    constructor(serverUrl: string, webSocket: WebSocket, configuration: ApiConfiguration, sessionData: string) {
        this.serverUrl = serverUrl;
        this.webSocket = webSocket;
        this.configuration = configuration;
        this.privateTopic = uuid();
        this.sessionData = sessionData;
        this.privateSubscriber = new DefaultSubscriber(this.webSocket, null, null, null);
        this.replyPublisher = new DefaultPublisher(this.webSocket, this.configuration, this.privateTopic, this.sessionData);
        this.publishers = [this.replyPublisher];
        this.subscribers = [];
        this.privateTopics = [this.privateTopic];
        this.heartbeatIntervalSeconds = 10;
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

    init(openListener: (e: Event) => void, errorListener: (err: Error) => void): void {
        const thisSession = this;

        this.webSocket.onopen = (function (e: Event) {
            this.privateSubscriber.sendSubscribeRequestToTopic(this.privateTopic, Kinds.Private);
            this.heartbeatTimer = this.privateSubscriber.getHeartbeatTimer(this.heartbeatIntervalSeconds);
            openListener(e);
            log.info("connection started on " + this.serverUrl + ".");
        }).bind(this);

        this.webSocket.onerror = function (e: Event) {
            const messageError = "Error on " + thisSession.serverUrl + ".";
            errorListener(new Error(messageError));
        };

        this.webSocket.onclose = function (e: CloseEvent) {
            log.info("connection on " + thisSession.serverUrl + " closed.");
            if (e.wasClean === false) {
                throw new Error("unexpected connection close with code " + e.code);
            }
        };
    };

    createPublisher(): Publisher {
        const publisher = new DefaultPublisher(this.webSocket, this.configuration, this.privateTopic, this.sessionData);
        this.publishers.push(publisher);
        return publisher;
    };

    createSubscriber(): Subscriber {
        const subscriber = new DefaultSubscriber(this.webSocket, this.configuration, this.replyPublisher, this.privateTopics);
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
        this.webSocket.close();
    };

}

export const SessionFactory = function (serverUrl: string, configuration: ApiConfiguration, sessionData: string): Session {
    const WebSocket: any = javascriptHelper().WebSocket;
    const webSocket = new WebSocket(serverUrl);
    const session = new DefaultSession(serverUrl, webSocket, configuration, sessionData);
    return session;
};