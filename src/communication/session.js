
define(["javascriptHelper"], function (javascriptHelper) {
    "use strict";


    var Session = function (serverUrl, publisher) {
        this.serverUrl = serverUrl;
        this.webSocket = new javascriptHelper.WebSocket(serverUrl);
        this.publisher = publisher;
    }


    Session.prototype.init = function (callback, callbackError) {
        var thisObject = this;

        this.webSocket.onopen = function (e) {
            console.log("connection started on " + thisObject.serverUrl + ".");
            callback(thisObject);
        }

        this.webSocket.onerror = function (e) {
            console.error("Error on " + thisObject.serverUrl + ".");
            callbackError(e);
        }

        this.webSocket.onclose = function (e) {
            console.log("connection on " + thisObject.serverUrl + " closed.");
        }
    }


    Session.prototype.send = function (componentName, stateMachineName, jsonMessage) {
        var data = this.publisher.getEventToSend(componentName, stateMachineName, jsonMessage);
        var stringToSend = data.routingKey + " " + data.event.Header.ComponentCode.Fields[0]
                            + " " + JSON.stringify(data.event);
        this.webSocket.send(stringToSend);
    }

    return Session;
});
