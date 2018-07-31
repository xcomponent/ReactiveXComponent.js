import { CompositionModel } from "../communication/xcomponentMessages";
import { Session } from "./Session";
import { ErrorListener } from "./ErrorListener";

export interface Connection {
    getXcApiList(): Promise<Array<string>>;
    getCompositionModel(xcApiName: string): Promise<CompositionModel | undefined>;
    createSession(xcApiFileName: string, errotListener?: ErrorListener): Promise<Session>;
    createAuthenticatedSession(xcApiFileName: string, sessionData: string, errorListener?: ErrorListener): Promise<Session>;
    dispose(): void;
}