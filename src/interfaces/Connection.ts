import { CompositionModel } from '../communication/xcomponentMessages';
import { Session } from './Session';

export interface Connection {
    getXcApiList(): Promise<Array<string>>;
    getCompositionModel(xcApiName: string): Promise<CompositionModel | undefined>;
    createSession(xcApiFileName: string): Promise<Session>;
    createAuthenticatedSession(xcApiFileName: string, sessionData: string): Promise<Session>;
    dispose(): void;
}
