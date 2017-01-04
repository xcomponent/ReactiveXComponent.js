import {javascriptHelper} from "javascriptHelper";
import Guid from "guid";
import Publisher from "communication/xcWebSocketPublisher";
import Subscriber from "communication/xcWebSocketSubscriber";
import xcWebSocketBridgeConfiguration from "configuration/xcWebSocketBridgeConfiguration";
import * as definition from "definition";

class Session {

    public serverUrl : any;
    public webSocket : any;
    public configuration : any;
    public sessionData : any;
    public guid : any;
    public privateTopic : any;
    public privateSubscriber : any;
    public replyPublisher : any;
    public publishers : any;
    public subscribers : any;
    public privateTopics : any;

    constructor(serverUrl, webSocket, configuration, sessionData) {
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

    setPrivateTopic(privateTopic) {
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

    addPrivateTopic(privateTopic) {
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

    removePrivateTopic(privateTopic) {
        let kindPrivate = xcWebSocketBridgeConfiguration.kinds.Private;
        this
            .privateSubscriber
            .sendUnsubscribeRequestToTopic(privateTopic, kindPrivate);
        this.privateTopics = this.removeElement(this.privateTopics, privateTopic, "private topic not found");
        for (let i = 0; i < this.subscribers.length; i++) {
            this.subscribers[i].privateTopics = this.privateTopics;
        }
    };

    init(sessionListener, getXcApiRequest, xcApiFileName) {
        let thisObject = this;

        this.webSocket.onopen = function (e) {
            thisObject
                .privateSubscriber
                .sendSubscribeRequestToTopic(thisObject.privateTopic, xcWebSocketBridgeConfiguration.kinds.Private);
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

    private removeElement(array, e, msg) {
        let index = array.indexOf(e);
        if (index > -1) {
            return array.splice(index, 1);
        } else {
            throw new Error(msg);
        }
    };

    disposePublisher(publisher) {
        this.publishers = this.removeElement(this.publishers, publisher, "Publisher not found");
    };

    disposeSubscriber(subscriber) {
        this.subscribers = this.removeElement(this.subscribers, subscriber, "Subscriber not found");
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

let SessionFactory = function (serverUrl, configuration, sessionData) {
    let WebSocket = javascriptHelper().WebSocket;
    let webSocket = new WebSocket(serverUrl);
    let session = new Session(serverUrl, webSocket, configuration, sessionData);
    return session;
};

let returnObject = {
    create: SessionFactory,
    Session: Session
};

export default returnObject;