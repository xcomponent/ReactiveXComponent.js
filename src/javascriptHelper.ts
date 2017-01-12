
interface JavascriptHelper {
    WebSocket: WebSocket;
    DOMParser: any;
    atob: any;
}

const javascriptHelper = () : JavascriptHelper => {
    return { WebSocket: <WebSocket>window["WebSocket"], DOMParser: window["DOMParser"], atob: window.atob };
};

export { javascriptHelper };

