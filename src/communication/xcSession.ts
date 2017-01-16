import { javascriptHelper } from "javascriptHelper";
import Guid from "guid";
import Publisher from "communication/xcWebSocketPublisher";
import Subscriber from "communication/xcWebSocketSubscriber";
import xcWebSocketBridgeConfiguration from "configuration/xcWebSocketBridgeConfiguration";
import * as definition from "definition";
import { ApiConfiguration } from "configuration/apiConfiguration";

export interface Session {
    privateSubscriber: Subscriber;
    replyPublisher: Publisher;
    configuration: ApiConfiguration;
    webSocket: WebSocket;
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
    private guid: Guid;
    private privateTopic: string;
    private publishers: Array<Publisher>;
    private subscribers: Array<Subscriber>;
    private privateTopics: Array<String>;

    public privateSubscriber: Subscriber;
    public replyPublisher: Publisher;
    public configuration: ApiConfiguration;
    public webSocket: WebSocket;

    constructor(serverUrl: string, webSocket: WebSocket, configuration: ApiConfiguration, sessionData: string) {
        this.serverUrl = serverUrl;
        this.webSocket = webSocket;
        this.configuration = configuration;
        this.guid = new Guid();
        this.privateTopic = this.guid.create();
        this.sessionData = sessionData;
        this.privateSubscriber = new Subscriber(this.webSocket, null, null, null, null);
        this.replyPublisher = new Publisher(this.webSocket, this.configuration, this.privateTopic, this.sessionData);
        this.publishers = [this.replyPublisher];
        this.subscribers = [];
        this.privateTopics = [this.privateTopic];
    }

    setPrivateTopic(privateTopic: string): void {
        this.addPrivateTopic(privateTopic);
        this.removePrivateTopic(this.privateTopic);
        this.privateTopic = privateTopic;
        this.publishers.forEach(function (publisher) {
            publisher.privateTopic = privateTopic;
        });
        this.subscribers.forEach(function (subscriber) {
            subscriber.replyPublisher = this.replyPublisher;
        }, this);
    };

    addPrivateTopic(privateTopic: string): void {
        let kindPrivate = xcWebSocketBridgeConfiguration.kinds.Private;
        this.privateSubscriber.sendSubscribeRequestToTopic(privateTopic, kindPrivate);
        this.privateTopics.push(privateTopic);
        this.subscribers.forEach(function (subscriber) {
            subscriber.privateTopics = this.privateTopics;
        }, this);
    };

    removePrivateTopic(privateTopic: string): void {
        let kindPrivate = xcWebSocketBridgeConfiguration.kinds.Private;
        this.privateSubscriber.sendUnsubscribeRequestToTopic(privateTopic, kindPrivate);
        this.removeElement(this.privateTopics, privateTopic);
        this.subscribers.forEach(function (subscriber) {
            subscriber.privateTopics = this.privateTopics;
        }, this);
    };

    init(openListener: (e: Event) => void, errorListener: (err: Error) => void): void {
        let thisSession = this;

        this.webSocket.onopen = function (e: Event) {
            thisSession.privateSubscriber.sendSubscribeRequestToTopic(thisSession.privateTopic, xcWebSocketBridgeConfiguration.kinds.Private);
            openListener(e);
            console.log("connection started on " + thisSession.serverUrl + ".");
        };

        this.webSocket.onerror = function (e: Event) {
            let messageError = "Error on " + thisSession.serverUrl + ".";
            console.error(messageError);
            console.error(e);
            errorListener(new Error(messageError));
        };

        this.webSocket.onclose = function (e: CloseEvent) {
            console.log("connection on " + thisSession.serverUrl + " closed.");
            console.log(e);
            if (!e.wasClean) {
                throw new Error("unexpected connection close with code " + e.code);
            }
        };
    };

    createPublisher(): Publisher {
        let publisher = new Publisher(this.webSocket, this.configuration, this.privateTopic, this.sessionData);
        this.publishers.push(publisher);
        return publisher;
    };

    createSubscriber(): Subscriber {
        let subscriber = new Subscriber(this.webSocket, this.configuration, this.replyPublisher, this.guid, this.privateTopics);
        this.subscribers.push(subscriber);
        return subscriber;
    };

    private removeElement<T>(array: Array<T>, e: T): void {
        let index = array.indexOf(e);
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
        this.publishers.forEach(function (publisher) {
            this.disposePublisher(publisher);
        }, this);
        this.subscribers.forEach(function (subscriber) {
            this.disposeSubscriber(subscriber);
        }, this);
    };

    close(): void {
        this.privateTopics.forEach(function (privateTopic) {
            this.privateSubscriber.sendUnsubscribeRequestToTopic(privateTopic, xcWebSocketBridgeConfiguration.kinds.Private);
        }, this);
        this.dispose();
        this.webSocket.close();
    };

}

export let SessionFactory = function (serverUrl: string, configuration: ApiConfiguration, sessionData: string): Session {
    let webSocket = new WebSocket(serverUrl);
    let session = new DefaultSession(serverUrl, webSocket, configuration, sessionData);
    return session;
};
