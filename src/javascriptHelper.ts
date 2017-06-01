import * as definition from "definition";
const W3CWebSocket = require("websocket").w3cwebsocket;

export interface JavascriptHelper {
    WebSocket: WebSocket;
}

const javascriptHelper = (): JavascriptHelper => {
    const isNodeEnvironnement = (typeof process === "object" && process + "" === "[object process]");
    const isTestEnvironnement = typeof window !== "undefined" && (<any>window).isTestEnvironnement;
    if (isTestEnvironnement || !isNodeEnvironnement) {
        return {
            WebSocket: window.WebSocket
        };
    } else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        return {
            WebSocket: W3CWebSocket
        };
    }
};

export default javascriptHelper;