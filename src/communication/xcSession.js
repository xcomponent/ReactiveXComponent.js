
define(["../javascriptHelper", "../guid", "./xcWebSocketPublisher", "./xcWebSocketSubscriber"], function (javascriptHelper, Guid, Publisher, Subscriber) {
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
        this.replyPublisher = new Publisher(this.webSocket, this.configuration, new Guid());
        this.privateSubscriber = new Subscriber(this.webSocket, this.configuration);
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
        var publisher = new Publisher(this.webSocket, this.configuration, new Guid(), this.privateSubscriber);
        return publisher;
    }


    Session.prototype.createSubscriber = function () {
        var subscriber = new Subscriber(this.webSocket, this.configuration, this.replyPublisher, new Guid());
        return subscriber;
    }

    Session.prototype.close = function() {
        this.webSocket.close();
    }

    return {
        create: SessionFactory,
        Session: Session
    };
});
