
interface JavascriptHelper {
    WebSocket: WebSocket;
    atob: any;
}

const javascriptHelper = (): JavascriptHelper => {
    return { WebSocket: <WebSocket>window["WebSocket"], atob: window.atob };
};

export { javascriptHelper };

