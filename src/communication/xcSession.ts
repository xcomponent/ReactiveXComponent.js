import { javascriptHelper } from "javascriptHelper";
import Guid from "guid";
import Publisher from "communication/xcWebSocketPublisher";
import Subscriber from "communication/xcWebSocketSubscriber";
import xcWebSocketBridgeConfiguration from "configuration/xcWebSocketBridgeConfiguration";
import * as definition from "definition";
import { ApiConfiguration } from "configuration/apiConfiguration";

export class Session {

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
        this.privateTopic = this
            .guid
            .create();
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
        for (let i = 0; i < this.publishers.length; i++) {
            this.publishers[i].privateTopic = privateTopic;
        }
        for (let j = 0; j < this.subscribers.length; j++) {
            this.subscribers[j].replyPublisher = this.replyPublisher;
        }
    };

    addPrivateTopic(privateTopic: string): void {
        let kindPrivate = xcWebSocketBridgeConfiguration.kinds.Private;
        this
            .privateSubscriber
            .sendSubscribeRequestToTopic(privateTopic, kindPrivate);
        this
            .privateTopics
            .push(privateTopic);
        for (let i = 0; i < this.subscribers.length; i++) {
            this.subscribers[i].privateTopics = this.privateTopics;
        }
    };

    removePrivateTopic(privateTopic: string): void {
        let kindPrivate = xcWebSocketBridgeConfiguration.kinds.Private;
        this
            .privateSubscriber
            .sendUnsubscribeRequestToTopic(privateTopic, kindPrivate);
        this.removeElement(this.privateTopics, privateTopic, "private topic not found");
        for (let i = 0; i < this.subscribers.length; i++) {
            this.subscribers[i].privateTopics = this.privateTopics;
        }
    };

    init(sessionListener: (error: any, session: Session) => void, getXcApiRequest: (xcApiFileName: string, sessionListener: (error: any, session: Session) => void) => void, xcApiFileName: string): void {
        let thisSession = this;

        this.webSocket.onopen = function (e: Event) {
            thisSession
                .privateSubscriber
                .sendSubscribeRequestToTopic(thisSession.privateTopic, xcWebSocketBridgeConfiguration.kinds.Private);
            getXcApiRequest(xcApiFileName, sessionListener);
            console.log("connection started on " + thisSession.serverUrl + ".");
        };

        this.webSocket.onerror = function (e: Event) {
            let messageError = "Error on " + thisSession.serverUrl + ".";
            console.error(messageError);
            console.error(e);
            sessionListener(messageError, null);
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
        this
            .publishers
            .push(publisher);
        return publisher;
    };

    createSubscriber(): Subscriber {
        let subscriber = new Subscriber(this.webSocket, this.configuration, this.replyPublisher, this.guid, this.privateTopics);
        this
            .subscribers
            .push(subscriber);
        return subscriber;
    };

    private removeElement(array: Array<Object>, e: Object, msg: string): void {
        let index = array.indexOf(e);
        if (index > -1) {
            array.splice(index, 1);
        } else {
            throw new Error(msg);
        }
    };

    disposePublisher(publisher: Publisher): void {
        this.removeElement(this.publishers, publisher, "Publisher not found");
    };

    disposeSubscriber(subscriber: Subscriber): void {
        this.removeElement(this.subscribers, subscriber, "Subscriber not found");
    };

    dispose(): void {
        for (let i = 0; i < this.publishers.length; i++) {
            this.disposePublisher(this.publishers[i]);
        }
        for (let j = 0; j < this.subscribers.length; j++) {
            this.disposeSubscriber(this.subscribers[j]);
        }
    };

    close(): void {
        this
            .privateSubscriber
            .sendUnsubscribeRequestToTopic(this.privateTopic, xcWebSocketBridgeConfiguration.kinds.Private);
        this.dispose();
        this
            .webSocket
            .close();
    };

}

export let SessionFactory = function (serverUrl: string, configuration: ApiConfiguration, sessionData: string): Session {
    let webSocket = new WebSocket(serverUrl);
    let session = new Session(serverUrl, webSocket, configuration, sessionData);
    return session;
};
