
define(["communication/xcConnection", "parser", "configuration/xcConfiguration"], function (Connection, Parser, Configuration) {
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
