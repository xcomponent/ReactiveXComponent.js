import Connection from "communication/xcConnection";
import {Session} from "communication/xcSession";

class XComponentAPI {
    private connection : Connection;

    constructor() {
        this.connection = new Connection();
    }

    getXcApiList(serverUrl : string, connectionListener : (connection : Connection, apis : Array < Object >) => void) {
        this.connection.getXcApiList(serverUrl, (function (apis : Array < Object >) {
            connectionListener(this.connection, apis);
        }).bind(this));
    };

    createSession(xcApiFileName : string, serverUrl : string, sessionListener : (error : any, session : Session) => void) {
        this.connection.createSession(xcApiFileName, serverUrl, sessionListener);
    };

    createAuthenticatedSession(xcApiFileName : string, serverUrl : string, sessionData : string, sessionListener : (error : any, session : Session) => void) {
        this.connection.createAuthenticatedSession(xcApiFileName, serverUrl, sessionData, sessionListener);
    };
}


export default XComponentAPI;