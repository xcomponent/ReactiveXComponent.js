import { Connection } from "./communication/xcConnection";
import { Session } from "./communication/xcSession";
import { CompositionModel } from "./communication/xcomponentMessages";
declare class XComponentAPI {
    private connection;
    constructor();
    getModel(xcApiName: string, serverUrl: string, connectionListener: (connection: Connection, compositionModel: CompositionModel) => void): void;
    getXcApiList(serverUrl: string, connectionListener: (connection: Connection, apis: Array<String>) => void): void;
    createSession(xcApiFileName: string, serverUrl: string, createSessionListener: (error: Error, session: Session) => void): void;
    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string, createAuthenticatedSessionListener: (error: Error, session: Session) => void): void;
    setLogLevel(logLevel: number): void;
    getLogLevel(): string;
}
export default XComponentAPI;
