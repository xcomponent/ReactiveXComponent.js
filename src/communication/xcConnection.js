
define(["./xcSession", "../parser", "../configuration/xcConfiguration"], function (SessionFactory, Parser, Configuration) {
    "use strict";

    var Connection = function () {
    }

    Connection.prototype.init = function(xcApiFileName, serverUrl, sessionData) {
        this.session = SessionFactory.create(serverUrl, null, sessionData);
        this.session.privateSubscriber.getXcApi(xcApiFileName, (function (xcApi) {
            var parser = new Parser();
            this.configuration = new Configuration(parser);
            configuration.init(xcApi);
        }).bind(this));
    }


    Connection.prototype.createSession = function (sessionListener) {
        this.session.configuration = this.configuration;
        this.session.replyPublisher.configuration = this.configuration;
        this.session.init(sessionListener);        
    }


    return Connection;
});
