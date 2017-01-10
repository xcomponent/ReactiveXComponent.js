import {javascriptHelper} from "javascriptHelper";
import Guid from "guid";
import Publisher from "communication/xcWebSocketPublisher";
import Subscriber from "communication/xcWebSocketSubscriber";
import xcWebSocketBridgeConfiguration from "configuration/xcWebSocketBridgeConfiguration";
import * as definition from "definition";

import Configuration from "configuration/xcConfiguration";
import IWebSocket from "communication/IWebSocket";
import WebSocket from "communication/WebSocket";

class Session {

    public serverUrl : string;
    public webSocket : IWebSocket;
    public configuration : Configuration;
    public sessionData : string;
    public guid : any;
    public privateTopic : string;
    public privateSubscriber : Subscriber;
    public replyPublisher : Publisher;
    public publishers : Array<Publisher>;
    public subscribers : Array<Subscriber>;
    public privateTopics : Array<String>;

    constructor(serverUrl : string, webSocket : IWebSocket, configuration : Configuration, sessionData: string) {
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

    setPrivateTopic(privateTopic : string) {
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

    addPrivateTopic(privateTopic : string) {
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

    removePrivateTopic(privateTopic : string) {
        let kindPrivate = xcWebSocketBridgeConfiguration.kinds.Private;
        this
            .privateSubscriber
            .sendUnsubscribeRequestToTopic(privateTopic, kindPrivate);
        this.removeElement(this.privateTopics, privateTopic, "private topic not found");
        for (let i = 0; i < this.subscribers.length; i++) {
            this.subscribers[i].privateTopics = this.privateTopics;
        }
    };

    init(sessionListener, getXcApiRequest, xcApiFileName) {
        let thisObject = this;

        this.webSocket.setEventListener('onopen', function (e) {
            thisObject
                .privateSubscriber
                .sendSubscribeRequestToTopic(thisObject.privateTopic, xcWebSocketBridgeConfiguration.kinds.Private);
            getXcApiRequest(xcApiFileName, sessionListener);
            console.log("connection started on " + thisObject.serverUrl + ".");
        });

        this.webSocket.setEventListener('onerror', function (e) {
            let messageError = "Error on " + thisObject.serverUrl + ".";
            console.error(messageError);
            console.error(e);
            sessionListener(messageError, null);
        });

        this.webSocket.setEventListener('onclose', function (e) {
            console.log("connection on " + thisObject.serverUrl + " closed.");
            console.log(e);
            if (!e.wasClean) {
                throw new Error("unexpected connection close with code " + e.code);
            }
        });
    };

    createPublisher() {
        let publisher = new Publisher(this.webSocket, this.configuration, this.privateTopic, this.sessionData);
        this
            .publishers
            .push(publisher);
        return publisher;
    };

    createSubscriber() {
        let subscriber = new Subscriber(this.webSocket, this.configuration, this.replyPublisher, this.guid, this.privateTopics);
        this
            .subscribers
            .push(subscriber);
        return subscriber;
    };

    private removeElement(array : Array<Object>, e : Object, msg : string) {
        let index = array.indexOf(e);
        if (index > -1) {
            array.splice(index, 1);
        } else {
            throw new Error(msg);
        }
    };

    disposePublisher(publisher : Publisher) {
        this.removeElement(this.publishers, publisher, "Publisher not found");
    };

    disposeSubscriber(subscriber : Subscriber) {
        this.removeElement(this.subscribers, subscriber, "Subscriber not found");
    };

    dispose() {
        for (let i = 0; i < this.publishers.length; i++) {
            this.disposePublisher(this.publishers[i]);
        }
        for (let j = 0; j < this.subscribers.length; j++) {
            this.disposeSubscriber(this.subscribers[j]);
        }
    };

    close() {
        this
            .privateSubscriber
            .sendUnsubscribeRequestToTopic(this.privateTopic, xcWebSocketBridgeConfiguration.kinds.Private);
        this.dispose();
        this
            .webSocket
            .close();
    };

}

let SessionFactory = function (serverUrl : string, configuration : Configuration, sessionData : string) {
    //let WebSocket = javascriptHelper().WebSocket;
    let webSocket = new WebSocket(serverUrl);
    let session = new Session(serverUrl, webSocket, configuration, sessionData);
    return session;
};

let returnObject = {
    create: SessionFactory,
    Session: Session
};

export default returnObject;