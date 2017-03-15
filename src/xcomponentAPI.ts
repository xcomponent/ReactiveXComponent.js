import { Connection, DefaultConnection } from "./communication/xcConnection";
import { Session } from "./communication/xcSession";
import { CompositionModel } from "./communication/xcomponentMessages";
let log = require("loglevel");

class XComponentAPI {
    private connection: Connection;

    constructor() {
        this.connection = new DefaultConnection();
    }

    getModel(xcApiName: string, serverUrl: string, connectionListener: (connection: Connection, compositionModel: CompositionModel) => void): void {
        this.connection.getModel(xcApiName, serverUrl, ((compositionModel: CompositionModel) => {
            connectionListener(this.connection, compositionModel);
        }).bind(this));
    }

    getXcApiList(serverUrl: string, connectionListener: (connection: Connection, apis: Array<String>) => void): void {
        log.setDefaultLevel(log.levels.INFO);
        this.connection.getXcApiList(serverUrl, ((apis: Array<String>) => {
            connectionListener(this.connection, apis);
        }).bind(this));
    };

    createSession(xcApiFileName: string, serverUrl: string, createSessionListener: (error: Error, session: Session) => void): void {
        this.connection.createSession(xcApiFileName, serverUrl, createSessionListener);
    };

    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string, createAuthenticatedSessionListener: (error: Error, session: Session) => void): void {
        this.connection.createAuthenticatedSession(xcApiFileName, serverUrl, sessionData, createAuthenticatedSessionListener);
    };

    setLogLevel(logLevel: number): void {
        log.setLevel(logLevel);
    }

    getLogLevel(): string {
        return Object.keys(log.levels)[log.getLevel()];
    }
}


export default XComponentAPI;
