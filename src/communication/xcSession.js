
define(["communication/xcWebSocketPublisher"], function (Publisher) {
    "use strict";

    var SessionFactory = function (serverUrl, configuration, WebSocket) {
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


    return {
        create: SessionFactory,
        Session: Session
    };
});
