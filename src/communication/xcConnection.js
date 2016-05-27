
define(["communication/xcSession"], function (SessionFactory) {
    "use strict";

    var Connection = function (configuration) {
        this.configuration = configuration;
    }


    Connection.prototype.createSession = function (serverUrl, sessionListener, WebSocket) {
        var session = SessionFactory.create(serverUrl, this.configuration, WebSocket);
        session.init(sessionListener);
    }


    return Connection;
});
