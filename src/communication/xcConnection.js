
define(["./xcSession", "../parser", "../configuration/xcConfiguration"], function (SessionFactory, Parser, Configuration) {
    "use strict";

    var Connection = function () {
    }


    Connection.prototype.getXcApiList = function (serverUrl, getXcApiListListener) {
        var session = SessionFactory.create(serverUrl, null, null);
        session.webSocket.addEventListener('open', function(e) {
            session.privateSubscriber.getXcApiList(function(apis) {
                getXcApiListListener(apis);
                session.close();
            });
        });
    }


    Connection.prototype.createSession = function (xcApiFileName, serverUrl, sessionListener) {
        this.init(xcApiFileName, serverUrl, null, sessionListener);
    }


    Connection.prototype.createAuthenticatedSession = function (xcApiFileName, serverUrl, sessionData, sessionListener) {
        this.init(xcApiFileName, serverUrl, sessionData, sessionListener);
    }


    Connection.prototype.init = function (xcApiFileName, serverUrl, sessionData, sessionListener) {
        var session = SessionFactory.create(serverUrl, null, sessionData);
        var getXcApiRequest = function (xcApiFileName, sessionListener) {
            session.privateSubscriber.getXcApi(xcApiFileName, function (xcApi) {
                var parser = new Parser();
                var configuration = new Configuration(parser);
                configuration.init(xcApi);
                session.configuration = configuration;
                session.replyPublisher.configuration = configuration;
                sessionListener(null, session);
            });
        }
        session.init(sessionListener, getXcApiRequest, xcApiFileName);
    }


    return Connection;
});
