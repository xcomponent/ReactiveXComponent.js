import * as definition from "definition";
const W3CWebSocket = require("websocket").w3cwebsocket;

export interface JavascriptHelper {
    WebSocket: WebSocket;
}

const javascriptHelper = (): JavascriptHelper => {
    const isTestEnvironnement = typeof window !== "undefined" && (<any>window).isTestEnvironnement;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    if (isTestEnvironnement) {
        return {
            WebSocket: window.WebSocket
        };
    } else {
        return {
            WebSocket: W3CWebSocket
        };
    }
};

export default javascriptHelper;