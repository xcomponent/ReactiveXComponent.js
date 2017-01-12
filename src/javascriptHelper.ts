
interface JavascriptHelper {
<<<<<<< HEAD
    WebSocket: WebSocket;
    DOMParser: any;
=======
    WebSocket: any;
>>>>>>> master
    atob: any;
}

const javascriptHelper = () : JavascriptHelper => {
<<<<<<< HEAD
    return { WebSocket: <WebSocket>window["WebSocket"], DOMParser: window["DOMParser"], atob: window.atob };
=======
    return { WebSocket: window["WebSocket"], atob: window.atob };
>>>>>>> master
};

export { javascriptHelper };

