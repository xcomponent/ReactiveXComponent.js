
interface JavascriptHelper {
    WebSocket: any;
    DOMParser: any;
    atob: any;
}

const javascriptHelper = () : JavascriptHelper => {
    return { WebSocket: window["WebSocket"], DOMParser: window["DOMParser"], atob: window.atob };
};

export { javascriptHelper };

