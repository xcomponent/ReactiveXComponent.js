import IWebSocket from "./IWebSocket";
import {javascriptHelper} from "javascriptHelper";

class WebSocket implements IWebSocket {

    private ws : any;

    constructor(serverUrl : string) {
        this.ws = new (javascriptHelper().WebSocket)(serverUrl);
    }

    getWS() {
        return this.ws;
    }

    send(message : string) {
        this.ws.send(message);
    }

    close() {
        this.ws.close();
    }

    //event  == onopen onclose onerror onmessage
    setEventListener(event : string, eventListener : (e) => void) {
        this.ws[event] = eventListener;
    }

}

export default WebSocket;