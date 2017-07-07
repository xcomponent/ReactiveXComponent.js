import { SessionFactory, Session } from "./xcSession";
import { ApiConfiguration } from "../configuration/apiConfiguration";
import { DefaultApiConfigurationParser } from "../configuration/apiConfigurationParser";
import { CompositionModel } from "../communication/xcomponentMessages";
let log = require("loglevel");
import { isDebugEnabled } from "../loggerConfiguration";

export interface Connection {
    getModel(xcApiName: string, serverUrl: string, getModelListener: (error: Error, compositionModel: CompositionModel) => void): void;
    getXcApiList(serverUrl: string, getXcApiListListener: (error: Error, apis: Array<String>) => void): void;
    createSession(xcApiFileName: string, serverUrl: string, createSessionListener: (error: Error, session: Session) => void, disconnectionErrorListener: (closeEvent: CloseEvent) => void): void;
    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string, createAuthenticatedSessionListener: (error: Error, session: Session) => void, disconnectionErrorListener: (closeEvent: CloseEvent) => void): void;
}

export class DefaultConnection implements Connection {

    constructor() {
    }

    getModel(xcApiName: string, serverUrl: string, getModelListener: (error: Error, compositionModel: CompositionModel) => void) {
        let session = SessionFactory(serverUrl, null, null);
        let openListener = (_: Event) => {
            session.privateSubscriber.getModel(xcApiName, (compositionModel: CompositionModel) => {
                getModelListener(null, compositionModel);
                session.close();
            });
        };
        let errorListener = (err: Error) => {
            getModelListener(err, null);
            log.debug("getModel request failed");
            log.debug(err);
        };
        let closeListener = (_: CloseEvent) => {
        };
        session.init(openListener, errorListener, closeListener);
    }

    getXcApiList(serverUrl: string, getXcApiListListener: (error: Error, apis: Array<String>) => void): void {
        let session = SessionFactory(serverUrl, null, null);
        let openListener = (_: Event) => {
            session.privateSubscriber.getXcApiList((apis: Array<String>) => {
                getXcApiListListener(null, apis);
                session.close();
            });
        };
        let errorListener = (err: Error) => {
            getXcApiListListener(err, null);
            log.debug("Error while getting Apis List");
            log.debug(err);
        };
        let closeListener = (_: CloseEvent) => {
        };
        session.init(openListener, errorListener, closeListener);
    };

    createSession(xcApiFileName: string, serverUrl: string, createSessionListener: (error: Error, session: Session) => void, disconnectionErrorListener: (closeEvent: CloseEvent) => void): void {
        this.init(xcApiFileName, serverUrl, null, createSessionListener, disconnectionErrorListener);
    };

    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string, createAuthenticatedSessionListener: (error: Error, session: Session) => void, disconnectionErrorListener: (closeEvent: CloseEvent) => void): void {
        this.init(xcApiFileName, serverUrl, sessionData, createAuthenticatedSessionListener, disconnectionErrorListener);
    };

    private init(xcApiFileName: string, serverUrl: string, sessionData: string, createSessionListener: (error: Error, session: Session) => void, disconnectionErrorListener: (closeEvent: CloseEvent) => void): void {
        let session = SessionFactory(serverUrl, null, sessionData);
        let thisConnection = this;
        let getXcApiRequest = (xcApiFileName: string, createSessionListener: (error: Error, session: Session) => void) => {
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
        };
        let openListener = (_: Event) => {
            getXcApiRequest(xcApiFileName, createSessionListener);
        };
        let errorListener = (err: Error) => {
            createSessionListener(err, null);
        };
        let closeListener = (closeEvent: CloseEvent) => {
            if (session.closedByUser === false && disconnectionErrorListener) {
                disconnectionErrorListener(closeEvent);
            }
        };
        session.init(openListener, errorListener, closeListener);
    }
}
