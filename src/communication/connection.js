
define(["communication/session"], function (SessionFactory) {
    "use strict";

    var Connection = function () {
        this.sessions = [];
    }

    Connection.prototype.createSession = function (serverUrl, callback) {
        var session = SessionFactory.create(serverUrl);
        session.init(callback);
        this.sessions.push(session);
        return session;
    }

    return Connection;
});
