import { Session } from "./xcSession";
import { CompositionModel } from "../communication/xcomponentMessages";
export interface Connection {
    getModel(xcApiName: string, serverUrl: string, getModelListener: (compositionModel: CompositionModel) => void): void;
    getXcApiList(serverUrl: string, getXcApiListListener: (apis: Array<String>) => void): void;
    createSession(xcApiFileName: string, serverUrl: string, createSessionListener: (error: Error, session: Session) => void): void;
    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string, createAuthenticatedSessionListener: (error: Error, session: Session) => void): void;
}
export declare class DefaultConnection implements Connection {
    private apis;
    constructor();
    getModel(xcApiName: string, serverUrl: string, getModelListener: (compositionModel: CompositionModel) => void): void;
    getXcApiList(serverUrl: string, getXcApiListListener: (apis: Array<String>) => void): void;
    createSession(xcApiFileName: string, serverUrl: string, createSessionListener: (error: Error, session: Session) => void): void;
    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string, createAuthenticatedSessionListener: (error: Error, session: Session) => void): void;
    private init(xcApiFileName, serverUrl, sessionData, createSessionListener);
}
