
define(["./communication/xcConnection", "./parser", "./configuration/xcConfiguration"], function (Connection, Parser, Configuration) {
    "use strict";

    var XComponentAPI = function () {
    }


    XComponentAPI.prototype.createSession = function (xml, serverUrl, sessionListener) {
        var parser = new Parser();
        var configuration = new Configuration(parser);
        configuration.init(xml);
        var connection = new Connection(configuration);
        connection.createSession(serverUrl, sessionListener);
    }


    return XComponentAPI;
});
