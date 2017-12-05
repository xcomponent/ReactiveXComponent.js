import { CompositionModel } from "../communication/xcomponentMessages";
import { Session } from "../interfaces/Session";

export interface Connection {
    getCompositionModel(xcApiName: string, serverUrl: string): Promise<CompositionModel>;
    getXcApiList(serverUrl: string): Promise<Array<String>>;
    createSession(xcApiFileName: string, serverUrl: string, errotListener?: (err: Error) => void): Promise<Session>;
    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string, errorListener?: (err: Error) => void): Promise<Session>;
}