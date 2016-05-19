
define(["ObjectsConfig"], function (ObjectsConfig) {
    "use strict";

    var Factory = function () {
        this.createConnection = function (url) {
            var session = new ObjectsConfig.WebSocket(url);
            var connection = new Connection(session);
            return connection;
        }
    }

    var Connection = function(session) {
        var _session = session;

        this.getSession = function () {
            return _session;
        }

        _session.onopen = function (e) {
            console.log("connection on " + session.url + " started.");
        }

        _session.onclose = function (e) {
            console.log("connection on " + session.url + " closed.");
        }

        _session.onerror = function (e) {
            console.error("Error on " + session.url + ".");
        }

    }

    Connection.prototype.send = function (stringToSend) {
        var session = this.getSession();
        var log = "Data send successfully to " + session.url;
        if (session.readyState == ObjectsConfig.WebSocket.OPEN) {
            session.send(stringToSend);
            console.log(log);
        } else {
            session.addEventListener("open", function (event) {
                session.send(stringToSend);
                console.log(log);
            });
        }
    }

    return {
        Factory: Factory,
        Init: Connection
    };
});
