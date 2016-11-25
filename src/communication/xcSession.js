
define(["../javascriptHelper", "../guid", "./xcWebSocketPublisher", "./xcWebSocketSubscriber", "../configuration/xcWebSocketBridgeConfiguration"],
    function (javascriptHelper, Guid, Publisher, Subscriber, xcWebSocketBridgeConfiguration) {
        "use strict";

        var SessionFactory = function (serverUrl, configuration) {
            var WebSocket = javascriptHelper.getJavascriptHelper().WebSocket;
            var webSocket = new WebSocket(serverUrl);
            var session = new Session(serverUrl, webSocket, configuration);
            return session;
        }


        var Session = function (serverUrl, webSocket, configuration) {
            this.serverUrl = serverUrl;
            this.webSocket = webSocket;
            this.configuration = configuration;
            this.guid = new Guid();
            this.privateTopic = this.guid.create();
            this.replyPublisher = new Publisher(this.webSocket, this.configuration, this.privateTopic);
            this.privateSubscriber = new Subscriber(this.webSocket, this.configuration, null, null);
            this.publishers = [this.replyPublisher];
            this.subscribers = [];
        }


        Session.prototype.setPrivateTopic = function (privateTopic) {
            var kindPrivate = xcWebSocketBridgeConfiguration.kinds.Private;
            this.privateSubscriber.sendUnsubscribeRequestToTopic(this.privateTopic, kindPrivate);
            this.privateTopic = privateTopic;
            this.privateSubscriber.sendSubscribeRequestToTopic(privateTopic, kindPrivate);
            for (var i = 0; i < this.publishers.length; i++) {
                this.publishers[i].privateTopic = privateTopic;
            }
            for (var j = 0; i < this.subscribers.length; j++) {
                this.subscribers[j].replyPublisher = this.replyPublisher;
            }
        }


        Session.prototype.init = function (sessionListener) {
            var thisObject = this;

            this.webSocket.onopen = function (e) {
                thisObject.privateSubscriber.sendSubscribeRequestToTopic(thisObject.privateTopic, xcWebSocketBridgeConfiguration.kinds.Private);
                console.log("connection started on " + thisObject.serverUrl + ".");
                sessionListener(null, thisObject);
            }

            this.webSocket.onerror = function (e) {
                var messageError = "Error on " + thisObject.serverUrl + ".";
                console.error(messageError);
                sessionListener(messageError, null);
            }

            this.webSocket.onclose = function (e) {
                console.log("connection on " + thisObject.serverUrl + " closed.");
            }
        }


        Session.prototype.createPublisher = function () {
            var publisher = new Publisher(this.webSocket, this.configuration, this.privateTopic);
            this.publishers.push(publisher);
            return publisher;
        }


        Session.prototype.createSubscriber = function () {
            var subscriber = new Subscriber(this.webSocket, this.configuration, this.replyPublisher, this.guid);
            this.subscribers.push(subscriber);
            return subscriber;
        }

        Session.prototype.close = function () {
            this.privateSubscriber.sendUnsubscribeRequestToTopic(this.privateTopic, xcWebSocketBridgeConfiguration.kinds.Private);
            this.webSocket.close();
        }

        return {
            create: SessionFactory,
            Session: Session
        };
    });
