import { CompositionModel } from "../communication/xcomponentMessages";
import { Session } from "../interfaces/Session";
import { ErrorListener } from "./ErrorListener";

export interface Connection {
    getXcApiList(): Promise<Array<String>>;
    getCompositionModel(xcApiName: string): Promise<CompositionModel>;
    createSession(xcApiFileName: string, errotListener?: ErrorListener): Promise<Session>;
    createAuthenticatedSession(xcApiFileName: string, sessionData: string, errorListener?: ErrorListener): Promise<Session>;
    dispose(): void;
}