
define(["./xcSession", "../parser", "../configuration/xcConfiguration"], function (SessionFactory, Parser, Configuration) {
    "use strict";

    var Connection = function () {
    }


    Connection.prototype.createSessionWithAllApis = function (serverUrl, sessionListener) {
    }


    Connection.prototype.createSession = function (xcApiFileName, serverUrl, sessionListener) {
        this.init(xcApiFileName, serverUrl, null, sessionListener);
    }


    Connection.prototype.createAuthenticatedSession = function (xcApiFileName, serverUrl, sessionData, sessionListener) {
        this.init(xcApiFileName, serverUrl, sessionData, sessionListener);
    }


    Connection.prototype.init = function (xcApiFileName, serverUrl, sessionData, sessionListener) {
        this.session = SessionFactory.create(serverUrl, null, sessionData);
        var thisObject = this;
        var getXcApiRequest = function (xcApiFileName, sessionListener) {
            thisObject.session.privateSubscriber.getXcApi(xcApiFileName, function (xcApi) {
                var parser = new Parser();
                thisObject.configuration = new Configuration(parser);
                thisObject.configuration.init(xcApi);
                thisObject.session.configuration = thisObject.configuration;
                thisObject.session.replyPublisher.configuration = thisObject.configuration;
                sessionListener(null, thisObject.session);
            });
        }
        this.session.init(sessionListener, getXcApiRequest, xcApiFileName);
    }


    return Connection;
});
