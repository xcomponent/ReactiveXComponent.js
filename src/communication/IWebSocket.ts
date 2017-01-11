interface IWebSocket
{

    send(message : string) : void;
    close() : void;
    setEventListener(event : string, eventListener : (e) => void) : void;
    getWS() : any;
}

export default IWebSocket;