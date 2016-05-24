
define(["javascriptHelper", "communication/xcomponentWebSocketPublisher"], function (javascriptHelper, Publisher) {
    "use strict";


    var SessionFactory = function (serverUrl) {
        var webSocket = new javascriptHelper.WebSocket(serverUrl);
        var session = new Session(serverUrl, webSocket);
        return session;
    }


    var Session = function (serverUrl, webSocket) {
        this.serverUrl = serverUrl;
        this.webSocket = webSocket;
        this.publishers = [];
    }


    Session.prototype.init = function (callback) {
        var thisObject = this;

        this.webSocket.onopen = function (e) {
            console.log("connection started on " + thisObject.serverUrl + ".");
            callback(null, thisObject);
        }

        this.webSocket.onerror = function (e) {
            console.error("Error on " + thisObject.serverUrl + ".");
            callback(e, null);
        }

        this.webSocket.onclose = function (e) {
            console.log("connection on " + thisObject.serverUrl + " closed.");
        }
    }


    Session.prototype.createPublisher = function() {
        var publisher = new Publisher(this.webSocket);
        this.publishers.push(publisher);
        return publisher;
    }


    return {
        create : SessionFactory
    };
});
