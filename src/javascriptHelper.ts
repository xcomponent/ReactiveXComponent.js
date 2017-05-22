import * as definition from "definition";
import xcWebSocket from "./communication/xcWebSocket";

export interface JavascriptHelper {
    WebSocket: WebSocket;
}

const javascriptHelper = (): JavascriptHelper => {
    const isNodeEnvironnement = (typeof process === "object" && process + "" === "[object process]");
    const isTestEnvironnement = typeof window !== "undefined" && (<any>window).isTestEnvironnement;
    return {
        WebSocket: (isNodeEnvironnement) ? ((isTestEnvironnement) ? window.WebSocket : <any>xcWebSocket) : window.WebSocket
    };
};

export default javascriptHelper;