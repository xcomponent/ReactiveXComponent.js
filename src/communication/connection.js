
define(["communication/session"], function (Session) {
    "use strict";

    var Connection = function (serverUrl, callback, callbackError, publisher) {
        this.session = new Session(serverUrl, publisher);
        this.session.init(callback, callbackError);
    }

    return Connection;
});
