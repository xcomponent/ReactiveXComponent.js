import { Connection, DefaultConnection } from "./communication/xcConnection";
import { Session } from "./communication/xcSession";
import { CompositionModel } from "./communication/xcomponentMessages";
let log = require("loglevel");
// import * as promisify from "es6-promisify";

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

    getModelPromise(xcApiName: string, serverUrl: string): Promise<CompositionModel> {
        return new Promise((resolve, reject) => {
            this.getModel(xcApiName, serverUrl, (error: Error, compositionModel: CompositionModel) => {
                return (error) ? reject(error) : resolve(compositionModel);
            });
        });
    }

    getXcApiList(serverUrl: string, connectionListener: (error: Error, apis: Array<String>) => void): void {
        log.setDefaultLevel(log.levels.INFO);
        this.connection.getXcApiList(serverUrl, ((error: Error, apis: Array<String>) => {
            connectionListener(error, apis);
        }).bind(this));
    }

    getXcApiListPromise(serverUrl: string): Promise<Array<String>> {
        return new Promise((resolve, reject) => {
            this.getXcApiList(serverUrl, (error: Error, apis: Array<String>) => {
                return (error) ? reject(error) : resolve(apis);
            });
        });
    }

    createSession(xcApiFileName: string, serverUrl: string, createSessionListener: (error: Error, session: Session) => void, disconnectionErrorListener?: (closeEvent: CloseEvent) => void): void {
        this.connection.createSession(xcApiFileName, serverUrl, createSessionListener, disconnectionErrorListener);
    }

    createSessionPromise(xcApiFileName: string, serverUrl: string): Promise<Session> {
        return new Promise((resolve, reject) => {
            this.createSession(xcApiFileName, serverUrl, (error: Error, session: Session) => {
                return (error) ? reject(error) : resolve(session);
            }, (closeEvent: CloseEvent) => {
                reject(closeEvent);
            });
        });
    }

    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string, createAuthenticatedSessionListener: (error: Error, session: Session) => void, disconnectionErrorListener?: (closeEvent: CloseEvent) => void): void {
        this.connection.createAuthenticatedSession(xcApiFileName, serverUrl, sessionData, createAuthenticatedSessionListener, disconnectionErrorListener);
    }

    createAuthenticatedSessionPromise(xcApiFileName: string, serverUrl: string, sessionData: string): Promise<Session> {
        return new Promise((resolve, reject) => {
            this.createAuthenticatedSession(xcApiFileName, serverUrl, sessionData, (error: Error, session: Session) => {
                return (error) ? reject(error) : resolve(session);
            }, (closeEvent: CloseEvent) => {
                reject(closeEvent);
            });
        });
    }

    setLogLevel(logLevel: number): void {
        log.setLevel(logLevel);
    }

    getLogLevel(): string {
        return Object.keys(log.levels)[log.getLevel()];
    }
}


export default XComponentAPI;
