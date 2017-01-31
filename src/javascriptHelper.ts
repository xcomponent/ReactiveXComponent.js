import * as definition from "definition";

export interface JavascriptHelper {
    WebSocket: WebSocket;
    atob: any;
}

const javascriptHelper = (): JavascriptHelper => {
    return { WebSocket: window.WebSocket, atob: window.atob };
};

export { javascriptHelper };

