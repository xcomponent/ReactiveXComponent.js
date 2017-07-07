import { Connection, DefaultConnection } from "./communication/xcConnection";
import { Session } from "./communication/xcSession";
import { CompositionModel } from "./communication/xcomponentMessages";
let log = require("loglevel");

class XComponentAPI {
    private connection: Connection;

    constructor() {
        this.connection = new DefaultConnection();
    }

    getModel(xcApiName: string, serverUrl: string, connectionListener: (error: Error, compositionModel: CompositionModel) => void): void {
        this.connection.getModel(xcApiName, serverUrl, ((error: Error, compositionModel: CompositionModel) => {
            connectionListener(error, compositionModel);
        }).bind(this));
    }

    getXcApiList(serverUrl: string, connectionListener: (error: Error, apis: Array<String>) => void): void {
        log.setDefaultLevel(log.levels.INFO);
        this.connection.getXcApiList(serverUrl, ((error: Error, apis: Array<String>) => {
            connectionListener(error, apis);
        }).bind(this));
    };

    createSession(xcApiFileName: string, serverUrl: string, createSessionListener: (error: Error, session: Session) => void, disconnectionErrorListener?: (closeEvent: CloseEvent) => void): void {
        this.connection.createSession(xcApiFileName, serverUrl, createSessionListener, disconnectionErrorListener);
    };

    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string, createAuthenticatedSessionListener: (error: Error, session: Session) => void, disconnectionErrorListener?: (closeEvent: CloseEvent) => void): void {
        this.connection.createAuthenticatedSession(xcApiFileName, serverUrl, sessionData, createAuthenticatedSessionListener, disconnectionErrorListener);
    };

    setLogLevel(logLevel: number): void {
        log.setLevel(logLevel);
    }

    getLogLevel(): string {
        return Object.keys(log.levels)[log.getLevel()];
    }
}


export default XComponentAPI;
