
define(["communication/connection", "parser", "configuration/xcomponentConfiguration", "rx"], function (Connection, Parser, XComponentConfiguration, Rx) {
    "use strict";


    var createApi = function (serverUrl, callback) {
        var xcApiString = XComponentConfiguration.getXcApi();
        var parser = new Parser(xcApiString);
        XComponentConfiguration.setParser(parser);
        var connection = new Connection();
        var session = connection.createSession(serverUrl, callback);
        var api = new XComponentAPI(connection);
        return api;
    }
  

    var XComponentAPI = function(connection) {
        this.connection = connection;
        //this.observableMsg = Rx.Observable.fromEvent(connection.session.webSocket, 'message');
    }


    return {
        createApi: createApi
    }
});
