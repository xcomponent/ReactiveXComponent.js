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
        return this.connection.getCompositionModel(xcApiName, serverUrl);
    }

    getXcApiList(serverUrl: string): Promise<Array<String>> {
        return this.connection.getXcApiList(serverUrl);
    }

    createSession(xcApiFileName: string, serverUrl: string): Promise<Session> {
        return this.connection.createSession(xcApiFileName, serverUrl);
    }

    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string): Promise<Session> {
        return this.connection.createAuthenticatedSession(xcApiFileName, serverUrl, sessionData);
    }

    setLogLevel(logLevel: number): void {
        log.setLevel(logLevel);
    }

    getLogLevel(): string {
        return Object.keys(log.levels)[log.getLevel()];
    }
}


export default XComponentAPI;
