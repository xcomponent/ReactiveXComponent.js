
define(["./xcSession", "../parser", "../configuration/xcConfiguration"], function (SessionFactory, Parser, Configuration) {
    "use strict";

    var Connection = function () {
    }


    Connection.prototype.getXcApiList = function (serverUrl, getXcApiListListener) {
        this.session = SessionFactory.create(serverUrl, null, null);
        this.session.webSocket.addEventListener('open', (function(e) {
            this.session.privateSubscriber.getXcApiList(getXcApiListListener);
        }).bind(this));
    }


    Connection.prototype.createSession = function (xcApiFileName, serverUrl, sessionListener) {
        this.init(xcApiFileName, serverUrl, null, sessionListener);
    }


    Connection.prototype.createAuthenticatedSession = function (xcApiFileName, serverUrl, sessionData, sessionListener) {
        this.init(xcApiFileName, serverUrl, sessionData, sessionListener);
    }


    Connection.prototype.init = function (xcApiFileName, serverUrl, sessionData, sessionListener) {
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
        if (!this.session) {
            this.session = SessionFactory.create(serverUrl, null, sessionData);
            this.session.init(sessionListener, getXcApiRequest, xcApiFileName);
        } else {
            this.session.sessionData = sessionData;
            this.session.replyPublisher.sessionData = sessionData;
            getXcApiRequest(xcApiFileName, sessionListener);
        }
    }


    return Connection;
});
