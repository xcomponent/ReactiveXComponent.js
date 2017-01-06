import { javascriptHelper } from "javascriptHelper";
import Guid from "guid";
import Publisher from "communication/xcWebSocketPublisher";
import Subscriber from "communication/xcWebSocketSubscriber";
import xcWebSocketBridgeConfiguration from "configuration/xcWebSocketBridgeConfiguration";
import * as definition from "definition";
import { ApiConfiguration } from "configuration/ApiConfiguration";

let SessionFactory = function (serverUrl, configuration: ApiConfiguration, sessionData) {
    let WebSocket = javascriptHelper().WebSocket;
    let webSocket = new WebSocket(serverUrl);
    let session = new Session(serverUrl, webSocket, configuration, sessionData);
    return session;
};


let Session = function (serverUrl, webSocket, configuration: ApiConfiguration, sessionData) {
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
};


Session.prototype.setPrivateTopic = function (privateTopic) {
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


Session.prototype.addPrivateTopic = function (privateTopic) {
    let kindPrivate = xcWebSocketBridgeConfiguration.kinds.Private;
    this.privateSubscriber.sendSubscribeRequestToTopic(privateTopic, kindPrivate);
    this.privateTopics.push(privateTopic);
    for (let i = 0; i < this.subscribers.length; i++) {
        this.subscribers[i].privateTopics = this.privateTopics;
    }
};

Session.prototype.removePrivateTopic = function (privateTopic) {
    let kindPrivate = xcWebSocketBridgeConfiguration.kinds.Private;
    this.privateSubscriber.sendUnsubscribeRequestToTopic(privateTopic, kindPrivate);
    this.privateTopics.removeElement(privateTopic, "private topic not found");
    for (let i = 0; i < this.subscribers.length; i++) {
        this.subscribers[i].privateTopics = this.privateTopics;
    }
};


Session.prototype.init = function (sessionListener, getXcApiRequest, xcApiFileName) {
    let thisObject = this;

    this.webSocket.onopen = function (e) {
        thisObject.privateSubscriber.sendSubscribeRequestToTopic(thisObject.privateTopic, xcWebSocketBridgeConfiguration.kinds.Private);
        getXcApiRequest(xcApiFileName, sessionListener);
        console.log("connection started on " + thisObject.serverUrl + ".");
    };

    this.webSocket.onerror = function (e) {
        let messageError = "Error on " + thisObject.serverUrl + ".";
        console.error(messageError);
        console.error(e);
        sessionListener(messageError, null);
    };

    this.webSocket.onclose = function (e) {
        console.log("connection on " + thisObject.serverUrl + " closed.");
        console.log(e);
        if (!e.wasClean) {
            throw new Error("unexpected connection close with code " + e.code);
        }
    };
};


Session.prototype.createPublisher = function () {
    let publisher = new Publisher(this.webSocket, this.configuration, this.privateTopic, this.sessionData);
    this.publishers.push(publisher);
    return publisher;
};


Session.prototype.createSubscriber = function () {
    let subscriber = new Subscriber(this.webSocket, this.configuration, this.replyPublisher, this.guid, this.privateTopics);
    this.subscribers.push(subscriber);
    return subscriber;
};

Array.prototype.removeElement = function (e, msg) {
    let index = this.indexOf(e);
    if (index > -1) {
        return this.splice(index, 1);
    } else {
        throw new Error(msg);
    }
};


Session.prototype.disposePublisher = function (publisher) {
    this.publishers.removeElement(publisher, "Publisher not found");
};


Session.prototype.disposeSubscriber = function (subscriber) {
    this.subscribers.removeElement(subscriber, "Subscriber not found");
};


Session.prototype.dispose = function () {
    for (let i = 0; i < this.publishers.length; i++) {
        this.disposePublisher(this.publishers[i]);
    }
    for (let j = 0; j < this.subscribers.length; j++) {
        this.disposeSubscriber(this.subscribers[j]);
    }
};


Session.prototype.close = function () {
    this.privateSubscriber.sendUnsubscribeRequestToTopic(this.privateTopic, xcWebSocketBridgeConfiguration.kinds.Private);
    this.dispose();
    this.webSocket.close();
};


let returnObject = {
    create: SessionFactory,
    Session: Session
};

export default returnObject;