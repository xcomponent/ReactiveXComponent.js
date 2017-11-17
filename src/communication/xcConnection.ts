import { SessionFactory, Session } from "./xcSession";
import { ApiConfiguration } from "../configuration/apiConfiguration";
import { DefaultApiConfigurationParser } from "../configuration/apiConfigurationParser";
import { CompositionModel } from "../communication/xcomponentMessages";
let log = require("loglevel");
import { isDebugEnabled } from "../loggerConfiguration";

export interface Connection {
    getCompositionModel(xcApiName: string, serverUrl: string, getModelListener: (error: Error, compositionModel: CompositionModel) => void): void;
    getXcApiList(serverUrl: string, getXcApiListListener: (error: Error, apis: Array<String>) => void): void;
    createSession(xcApiFileName: string, serverUrl: string, createSessionListener: (error: Error, session: Session) => void): void;
    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string, createAuthenticatedSessionListener: (error: Error, session: Session) => void): void;
    closeSessionError(serverUrl: string, closeSessionErrorListener: (closeEvent: CloseEvent) => void, errorListener: (err: Error) => void);
}

export class DefaultConnection implements Connection {

    constructor() {
    }

    getCompositionModel(xcApiName: string, serverUrl: string, getModelListener: (error: Error, compositionModel: CompositionModel) => void) {
        const session = SessionFactory(serverUrl, null, null);
        const openListener = (_: Event) => {
            session.privateSubscriber.getCompositionModel(xcApiName)
                .then(compositionModel => {
                    getModelListener(null, compositionModel);
                    session.close();
                });
        };
        const errorListener = (err: Error) => {
            getModelListener(err, null);
            log.debug("getModel request failed");
            log.debug(err);
        };
        const closeListener = (_: CloseEvent) => {
        };
        session.init(openListener, errorListener, closeListener);
    }

    getXcApiList(serverUrl: string, getXcApiListListener: (error: Error, apis: Array<String>) => void): void {
        const session = SessionFactory(serverUrl, null, null);
        const openListener = (_: Event) => {
            session.privateSubscriber.getXcApiList().then((apis) => {
                getXcApiListListener(null, apis);
                session.close();
            });
        };
        const errorListener = (err: Error) => {
            getXcApiListListener(err, null);
            log.debug("Error while getting Apis List");
            log.debug(err);
        };
        const closeListener = (_: CloseEvent) => {
        };
        session.init(openListener, errorListener, closeListener);
    };

    createSession(xcApiFileName: string, serverUrl: string, createSessionListener: (error: Error, session: Session) => void): void {
        this.init(xcApiFileName, serverUrl, null, createSessionListener);
    };

    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string, createAuthenticatedSessionListener: (error: Error, session: Session) => void): void {
        this.init(xcApiFileName, serverUrl, sessionData, createAuthenticatedSessionListener);
    };

    closeSessionError(serverUrl: string, closeSessionErrorListener: (closeEvent: CloseEvent) => void, errorListener: (err: Error) => void) {
        const session = SessionFactory(serverUrl, null, null);
        const thisConnection = this;
        const openListener = (_: Event) => {
        };
        const closeListener = (closeEvent: CloseEvent) => {
            if (session.closedByUser === false) {
                closeSessionErrorListener(closeEvent);
            }
        };
        session.init(openListener, errorListener, closeListener);
    };

    private init(xcApiFileName: string, serverUrl: string, sessionData: string, createSessionListener: (error: Error, session: Session) => void): void {
        const session = SessionFactory(serverUrl, null, sessionData);
        const thisConnection = this;
        const openListener = (_: Event) => {
            if (createSessionListener) {
                thisConnection.getXcApiRequest(session, xcApiFileName, createSessionListener);
            }
        };
        const errorListener = (err: Error) => {
            if (createSessionListener) {
                createSessionListener(err, null);
            }
        };
        const closeListener = (_: CloseEvent) => {
        };
        session.init(openListener, errorListener, closeListener);
    }

    private getXcApiRequest = (session: Session, xcApiFileName: string, createSessionListener: (error: Error, session: Session) => void) => {
        session.privateSubscriber.getXcApi(xcApiFileName, (xcApi: string) => {
            if (xcApi != null) {
                const parser = new DefaultApiConfigurationParser();
                const configurationPromise = parser.parse(xcApi);
                configurationPromise.then(configuration => {
                    session.configuration = configuration;
                    session.replyPublisher.configuration = configuration;
                    createSessionListener(null, session);
                }).catch(e => createSessionListener(e, null));
            } else {
                createSessionListener(new Error(`Unknown Api: ${xcApiFileName}`), null);
            }
        });
    }
}
