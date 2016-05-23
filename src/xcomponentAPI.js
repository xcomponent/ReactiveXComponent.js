
define(["communication/connection", "parser", "configuration/xcomponentConfiguration", "communication/xcomponentPublisher", "rx"], function (Connection, Parser, XComponentConfiguration, Publisher, Rx) {
    "use strict";

    var Factory = function () {
        this.createXComponentApi = function (serverUrl, callback, callbackError) {
            var xcApiString = XComponentConfiguration.getXcApi();
            var parser = new Parser(xcApiString);
            var publisher = new Publisher(parser);
            var connection = new Connection(serverUrl, callback, callbackError, publisher);
            var api = new XComponentAPI(connection);
            return api;
        }
    }

    var XComponentAPI = function(connection) {
        this.connection = connection;
        this.observableMsg = Rx.Observable.fromEvent(connection.session.webSocket, 'message');
    }

    var instanceFactory = new Factory();

    return {
        create: instanceFactory.createXComponentApi
    }
});
