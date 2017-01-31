import { Connection, DefaultConnection } from "communication/xcConnection";
import { Session } from "communication/xcSession";
import { Model } from "communication/EventObecjts";

class XComponentAPI {
    private connection: Connection;

    constructor() {
        this.connection = new DefaultConnection();
    }

    getModel(xcApiName: string, serverUrl: string, connectionListener: (connection: Connection, model: Model) => void) {
        this.connection.getModel(xcApiName, serverUrl, ((model: Model) => {
            connectionListener(this.connection, model);
        }).bind(this));
    }

    getXcApiList(serverUrl: string, connectionListener: (connection: Connection, apis: Array<String>) => void) {
        this.connection.getXcApiList(serverUrl, ((apis: Array<String>) => {
            connectionListener(this.connection, apis);
        }).bind(this));
    };

    createSession(xcApiFileName: string, serverUrl: string, createSessionListener: (error: Error, session: Session) => void) {
        this.connection.createSession(xcApiFileName, serverUrl, createSessionListener);
    };

    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string, createAuthenticatedSessionListener: (error: Error, session: Session) => void) {
        this.connection.createAuthenticatedSession(xcApiFileName, serverUrl, sessionData, createAuthenticatedSessionListener);
    };
}


export default XComponentAPI;