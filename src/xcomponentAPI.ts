import Connection from "communication/xcConnection";

let XComponentAPI = function () {
    this.connection = new Connection();
};

XComponentAPI.prototype.getXcApiList = function (serverUrl, connectionListener) {
    this.connection.getXcApiList(serverUrl, (function (apis) {
        connectionListener(this.connection, apis);
    }).bind(this));
};

XComponentAPI.prototype.createSession = function (xcApiFileName, serverUrl, sessionListener) {
    this.connection.createSession(xcApiFileName, serverUrl, sessionListener);
};

XComponentAPI.prototype.createAuthenticatedSession = function (xcApiFileName, serverUrl, sessionData, sessionListener) {
    this.connection.createAuthenticatedSession(xcApiFileName, serverUrl, sessionData, sessionListener);
};

export default XComponentAPI;