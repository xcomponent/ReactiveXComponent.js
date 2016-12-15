
define(["./communication/xcConnection"], function (Connection) {
    "use strict";

    var XComponentAPI = function () {
        this.connection = new Connection();
    }


    XComponentAPI.prototype.createSession = function (xcApiFileName, serverUrl, sessionListener) {
        this.connection.init(xcApiFileName, serverUrl, null, sessionListener);
        this.connection.createSession();
    }

    XComponentAPI.prototype.createAuthenticatedSession = function (xcApiFileName, serverUrl, sessionData, sessionListener) {
        this.connection.init(xcApiFileName, serverUrl, sessionData, sessionListener);        
        this.connection.createSession();
    }

    return XComponentAPI;
});
