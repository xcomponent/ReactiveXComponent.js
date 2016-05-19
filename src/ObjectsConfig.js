
define(function () {
    "use strict";

    var WebSocket, DOMParser;
    if (typeof process === 'object' && process + '' === '[object process]') {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        WebSocket = require('websocket').w3cwebsocket;
        DOMParser = require('xmldom').DOMParser;
    } else {
        WebSocket = window.WebSocket;
        DOMParser = window.DOMParser;
    }


    return {
        WebSocket: WebSocket,
        DOMParser: DOMParser
    };
});
