import * as definition from "definition";
import WebSocketClient from "./communication/xcWebSocket";

export interface JavascriptHelper {
    WebSocket: WebSocket;
}

const javascriptHelper = (): JavascriptHelper => {
    const isNodeEnvironnement = (typeof process === "object" && process + "" === "[object process]");
    const isTestEnvironnement = typeof window !== "undefined" && (<any>window).isTestEnvironnement;
    return {
        WebSocket: (isNodeEnvironnement) ? ((isTestEnvironnement) ? window.WebSocket : <any>WebSocketClient) : window.WebSocket
    };
};

export default javascriptHelper;