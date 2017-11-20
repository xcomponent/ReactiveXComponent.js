import { SessionFactory, Session } from "./xcSession";
import { ApiConfiguration } from "../configuration/apiConfiguration";
import { DefaultApiConfigurationParser } from "../configuration/apiConfigurationParser";
import { CompositionModel } from "../communication/xcomponentMessages";
let log = require("loglevel");
import { isDebugEnabled } from "../loggerConfiguration";

export interface Connection {
    getCompositionModel(xcApiName: string, serverUrl: string): Promise<CompositionModel>;
    getXcApiList(serverUrl: string): Promise<Array<String>>;
    createSession(xcApiFileName: string, serverUrl: string): Promise<Session>;
    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string): Promise<Session>;
    getUnexpectedCloseSessionError(serverUrl: string): Promise<Error>;
}

export class DefaultConnection implements Connection {

    constructor() {
    }

    getCompositionModel(xcApiName: string, serverUrl: string): Promise<CompositionModel> {
        const session = SessionFactory(serverUrl, null, null);
        return session.init()
            .then(_ => {
                return session.privateSubscriber.getCompositionModel(xcApiName);
            })
            .catch(err => {
                log.debug("getModel request failed");
                log.debug(err);
            });
    }

    getXcApiList(serverUrl: string): Promise<Array<String>> {
        const session = SessionFactory(serverUrl, null, null);
        return session.init()
            .then(_ => {
                return session.privateSubscriber.getXcApiList();
            })
            .catch(err => {
                log.debug("getModel request failed");
                log.debug(err);
            });
    };

    createSession(xcApiFileName: string, serverUrl: string): Promise<Session> {
        return this.init(xcApiFileName, serverUrl, null);
    };

    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string): Promise<Session> {
        return this.init(xcApiFileName, serverUrl, sessionData);
    };

    getUnexpectedCloseSessionError(serverUrl: string): Promise<Error> {
        const session = SessionFactory(serverUrl, null, null);
        return session.getUnexpectedCloseSessionError();
    };

    private init(xcApiFileName: string, serverUrl: string, sessionData: string): Promise<Session> {
        const session = SessionFactory(serverUrl, null, sessionData);
        return session.init()
            .then(_ => {
                return session.privateSubscriber.getXcApi(xcApiFileName);
            })
            .then((xcApi: string) => {
                if (xcApi === null) {
                    throw new Error(`Unknown Api: ${xcApiFileName}`);
                }
                const parser = new DefaultApiConfigurationParser();
                return parser.parse(xcApi);
            })
            .then(configuration => {
                session.configuration = configuration;
                session.replyPublisher.configuration = configuration;
                return session;
            });
    }
}
