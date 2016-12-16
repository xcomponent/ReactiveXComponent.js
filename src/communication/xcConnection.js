
define(["./xcSession", "../parser", "../configuration/xcConfiguration"], function (SessionFactory, Parser, Configuration) {
    "use strict";

    var Connection = function () {
    }


    Connection.prototype.createSession = function (xcApiFileName, serverUrl, sessionData, sessionListener) {
        this.session = SessionFactory.create(serverUrl, null, sessionData);
        this.session.init(sessionListener);
        this.session.privateSubscriber.getXcApi(xcApiFileName, (function (xcApi) {
            var parser = new Parser();
            this.configuration = new Configuration(parser);
            this.configuration.init(xcApi);
            this.session.configuration = this.configuration;
            this.session.replyPublisher.configuration = this.configuration;
            sessionListener(null, this.session);
        }).bind(this));
    }


    return Connection;
});
