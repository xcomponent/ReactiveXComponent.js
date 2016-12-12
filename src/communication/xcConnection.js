
define(["./xcSession"], function (SessionFactory) {
    "use strict";

    var Connection = function (configuration) {
        this.configuration = configuration;
    }


    Connection.prototype.createSession = function (serverUrl, sessionListener) {
        var session = SessionFactory.create(serverUrl, this.configuration);
        session.init(sessionListener);
    }

    Connection.prototype.createAuthenticatedSession = function (serverUrl, sessionData, sessionListener) {
        var session = SessionFactory.create(serverUrl, this.configuration, sessionData);
        session.init(sessionListener);
    }


    return Connection;
});
