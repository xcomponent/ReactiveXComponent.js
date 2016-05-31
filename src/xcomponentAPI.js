
define(["communication/xcConnection", "parser", "configuration/xcConfiguration", "rx"], function (Connection, Parser, Configuration, Rx) {
    "use strict";

    var XComponentAPI = function () {
    }


    XComponentAPI.prototype.createSession = function (serverUrl, sessionListener) {
        var parser = new Parser();
        var configuration = new Configuration(parser);
        configuration.init();
        var connection = new Connection(configuration);
        connection.createSession(serverUrl, sessionListener);
    }


    return XComponentAPI;
});
