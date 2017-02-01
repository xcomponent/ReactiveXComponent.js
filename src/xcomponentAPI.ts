import { Connection, DefaultConnection } from "./communication/xcConnection";
import { Session } from "./communication/xcSession";
import { Model } from "./communication/serverMessages";
let log = require("loglevel");

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
        log.setDefaultLevel(log.levels.INFO);
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

    setSilentLogLevel() {
        log.setLevel(log.levels.SILENT);
    }

    setDebugLogLevel() {
        log.setLevel(log.levels.DEBUG);
    }

    setInfoLogLevel() {
        log.setLevel(log.levels.INFO);
    }

}


export default XComponentAPI;
