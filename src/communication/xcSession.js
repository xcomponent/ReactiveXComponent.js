
define(["javascriptHelper", "communication/xcWebSocketPublisher", "communication/xcWebSocketSubscriber"], function (javascriptHelper, Publisher, Subscriber) {
    "use strict";

    var SessionFactory = function (serverUrl, configuration, WebSocket) {
        var WebSocket = javascriptHelper.getJavascriptHelper().WebSocket;
        var webSocket = new WebSocket(serverUrl);
        var session = new Session(serverUrl, webSocket, configuration);
        return session;
    }


    var Session = function (serverUrl, webSocket, configuration) {
        this.serverUrl = serverUrl;
        this.webSocket = webSocket;
        this.configuration = configuration;
    }


    Session.prototype.init = function (sessionListener) {
        var thisObject = this;

        this.webSocket.onopen = function (e) {
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


    Session.prototype.createPublisher = function() {
        var publisher = new Publisher(this.webSocket, this.configuration);
        return publisher;
    }


    Session.prototype.createSubscriber = function () {
        var subscriber = new Subscriber(this.webSocket, this.configuration);
        return subscriber;
    }


    return {
        create: SessionFactory,
        Session: Session
    };
});
