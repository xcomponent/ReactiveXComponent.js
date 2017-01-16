import { Connection, DefaultConnection } from "communication/xcConnection";
import { Session } from "communication/xcSession";

class XComponentAPI {
    private connection: Connection;

    constructor() {
        this.connection = new DefaultConnection();
    }

    getXcApiList(serverUrl: string, connectionListener: (connection: Connection, apis: Array<String>) => void) {
        this.connection.getXcApiList(serverUrl, (function (apis: Array<String>) {
            connectionListener(this.connection, apis);
        }).bind(this));
    };

    createSession(xcApiFileName: string, serverUrl: string, sessionListener: (error: Error, session: Session) => void) {
        this.connection.createSession(xcApiFileName, serverUrl, sessionListener);
    };

    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string, sessionListener: (error: Error, session: Session) => void) {
        this.connection.createAuthenticatedSession(xcApiFileName, serverUrl, sessionData, sessionListener);
    };
}


export default XComponentAPI;