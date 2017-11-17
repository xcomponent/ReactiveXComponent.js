import { Connection, DefaultConnection } from "./communication/xcConnection";
import { Session } from "./communication/xcSession";
import { CompositionModel } from "./communication/xcomponentMessages";
import { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } from "constants";
let log = require("loglevel");

class XComponentAPI {
    private connection: Connection;

    constructor() {
        this.setLogLevel(log.levels.INFO);
        this.connection = new DefaultConnection();
    }

    getCompositionModel(xcApiName: string, serverUrl: string): Promise<CompositionModel> {
        return new Promise((resolve, reject) => {
            this.connection.getCompositionModel(xcApiName, serverUrl, ((error: Error, compositionModel: CompositionModel) => {
                (error) ? reject(error) : resolve(compositionModel);
            }).bind(this));
        });
    }

    getXcApiList(serverUrl: string): Promise<Array<String>> {
        return new Promise((resolve, reject) => {
            this.connection.getXcApiList(serverUrl, ((error: Error, apis: Array<String>) => {
                return (error) ? reject(error) : resolve(apis);
            }).bind(this));
        });
    }

    closeSessionError(serverUrl: string): Promise<CloseEvent> {
        return new Promise((resolve, reject) => {
            this.connection.closeSessionError(
                serverUrl,
                (closeEvent: CloseEvent) => resolve(closeEvent),
                (error: Error) => reject(error));
        });
    }

    createSession(xcApiFileName: string, serverUrl: string): Promise<Session> {
        return new Promise((resolve, reject) => {
            this.connection.createSession(
                xcApiFileName,
                serverUrl,
                (error: Error, session: Session) =>
                    (error) ? reject(error) : resolve(session));
        });
    }

    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string): Promise<Session> {
        return new Promise((resolve, reject) => {
            this.connection.createAuthenticatedSession(
                xcApiFileName,
                serverUrl,
                sessionData,
                (error: Error, session: Session) =>
                    (error) ? reject(error) : resolve(session));
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
