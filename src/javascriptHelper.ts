
interface JavascriptHelper {
    WebSocket: any;
    atob: any;
}

const javascriptHelper = () : JavascriptHelper => {
    return { WebSocket: window["WebSocket"], atob: window.atob };
};

export { javascriptHelper };

