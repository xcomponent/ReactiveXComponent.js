
define(function () {
    "use strict";

    var javascriptHelper = {};

    if (isNodeApplication()) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        javascriptHelper.WebSocket = require('websocket').w3cwebsocket;
        javascriptHelper.DOMParser = require('xmldom').DOMParser;
    } else {
        javascriptHelper.WebSocket = window.WebSocket;
        javascriptHelper.DOMParser = window.DOMParser;
    }

    function isNodeApplication() {
        return typeof process === 'object' &&
            process + '' === '[object process]';
    }

    return javascriptHelper;
});
