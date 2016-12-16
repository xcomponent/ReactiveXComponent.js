
define(["./communication/xcConnection"], function (Connection) {
    "use strict";

    var XComponentAPI = function () {
        this.connection = new Connection();
    }


    XComponentAPI.prototype.createSession = function (xcApiFileName, serverUrl, sessionListener) {
        this.connection.createSession(xcApiFileName, serverUrl, sessionListener);
    }

    XComponentAPI.prototype.createAuthenticatedSession = function (xcApiFileName, serverUrl, sessionData, sessionListener) {
        this.connection.createAuthenticatedSession(xcApiFileName, serverUrl, sessionData, sessionListener);        
    }

    return XComponentAPI;
});
