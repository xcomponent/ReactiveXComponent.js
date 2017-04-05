import { SessionFactory, Session } from "./xcSession";
import { ApiConfiguration } from "../configuration/apiConfiguration";
import { DefaultApiConfigurationParser } from "../configuration/apiConfigurationParser";
import { CompositionModel } from "../communication/xcomponentMessages";
let log = require("loglevel");
import { isDebugEnabled } from "../loggerConfiguration";

export interface Connection {
    getModel(xcApiName: string, serverUrl: string, getModelListener: (compositionModel: CompositionModel) => void): void;
    getXcApiList(serverUrl: string, getXcApiListListener: (apis: Array<String>) => void): void;
    createSession(xcApiFileName: string, serverUrl: string, createSessionListener: (error: Error, session: Session) => void): void;
    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string, createAuthenticatedSessionListener: (error: Error, session: Session) => void): void;
}

export class DefaultConnection implements Connection {

    private apis: {
        [xcApiFileName: string]: ApiConfiguration
    };

    constructor() {
        this.apis = {};
    }

    getModel(xcApiName: string, serverUrl: string, getModelListener: (compositionModel: CompositionModel) => void) {
        let session = SessionFactory(serverUrl, null, null);
        let openListener = (_: Event) => {
            session.privateSubscriber.getModel(xcApiName, (compositionModel: CompositionModel) => {
                getModelListener(compositionModel);
                session.close();
            });
        };
        let errorListener = (err: Error) => {
            log.debug("getModel request failed");
            log.debug(err);
        };
        session.init(openListener, errorListener);
    }

    getXcApiList(serverUrl: string, getXcApiListListener: (apis: Array<String>) => void): void {
        let session = SessionFactory(serverUrl, null, null);
        let openListener = (_: Event) => {
            session.privateSubscriber.getXcApiList((apis: Array<String>) => {
                getXcApiListListener(apis);
                session.close();
            });
        };
        let errorListener = (err: Error) => {
            log.debug("Error while getting Apis List");
            log.debug(err);
        };
        session.init(openListener, errorListener);
    };

    createSession(xcApiFileName: string, serverUrl: string, createSessionListener: (error: Error, session: Session) => void): void {
        this.init(xcApiFileName, serverUrl, null, createSessionListener);
    };

    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string, createAuthenticatedSessionListener: (error: Error, session: Session) => void): void {
        this.init(xcApiFileName, serverUrl, sessionData, createAuthenticatedSessionListener);
    };

    private init(xcApiFileName: string, serverUrl: string, sessionData: string, createSessionListener: (error: Error, session: Session) => void): void {
        let session = SessionFactory(serverUrl, null, sessionData);
        let thisConnection = this;
        let getXcApiRequest = (xcApiFileName: string, createSessionListener: (error: Error, session: Session) => void) => {
            if (thisConnection.apis[xcApiFileName] === undefined) {
                session.privateSubscriber.getXcApi(xcApiFileName, (xcApi: string) => {
                    if (xcApi != null) {
                        const parser = new DefaultApiConfigurationParser();
                        const configurationPromise = parser.parse(xcApi);
                        configurationPromise.then(configuration => {
                            thisConnection.apis[xcApiFileName] = configuration;
                            session.configuration = configuration;
                            session.replyPublisher.configuration = configuration;
                            createSessionListener(null, session);
                        }).catch(e => createSessionListener(e, null));
                    } else {
                        createSessionListener(new Error(`Unknown Api: ${xcApiFileName}`), null);
                    }
                });
            } else {
                session.configuration = thisConnection.apis[xcApiFileName];
                session.replyPublisher.configuration = thisConnection.apis[xcApiFileName];
                createSessionListener(null, session);
            }
        };
        let openListener = (_: Event) => {
            getXcApiRequest(xcApiFileName, createSessionListener);
        };
        let errorListener = (err: Error) => {
            createSessionListener(err, null);
        };
        session.init(openListener, errorListener);
    }
}
