
define(["./communication/xcConnection"], function (Connection) {
    "use strict";

    var XComponentAPI = function () {
        this.connection = new Connection();
    }


    XComponentAPI.prototype.createSession = function (xcApiFileName, serverUrl, sessionListener) {
        this.connection.init(xcApiFileName, serverUrl);
        this.connection.createSession(sessionListener);
    }

    XComponentAPI.prototype.createAuthenticatedSession = function (xcApiFileName, serverUrl, sessionData, sessionListener) {
        this.connection.init(xcApiFileName, serverUrl, sessionData);        
        this.connection.createSession(sessionListener);
    }

    return XComponentAPI;
});
