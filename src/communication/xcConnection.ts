import { SessionFactory, Session } from "communication/xcSession";
import { ApiConfiguration } from "configuration/apiConfiguration";
import { DefaultApiConfigurationParser } from "configuration/apiConfigurationParser";

export interface Connection {
    getModel(xcApiName: string, serverUrl: string, getModelListener: (model: any) => void);
    getXcApiList(serverUrl: string, getXcApiListListener: (apis: Array<String>) => void): void;
    createSession(xcApiFileName: string, serverUrl: string, sessionListener: (error: Error, session: Session) => void): void;
    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string, sessionListener: (error: Error, session: Session) => void): void;
}

export class DefaultConnection implements Connection {

    private apis: {
        [xcApiFileName: string]: ApiConfiguration
    };

    constructor() {
        this.apis = {};
    }

    getModel(xcApiName: string, serverUrl: string, getModelListener: (model: any) => void) {
        let session = SessionFactory(serverUrl, null, null);
        let openListener = (_: Event) => {
            session.privateSubscriber.getModel(xcApiName, (model: any) => {
                getModelListener(model);
                session.close();
            });
        };
        let errorListener = (err: Error) => {
            console.error("getModel request failed");
            console.error(err);
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
            console.error("Error while getting Apis List");
            console.error(err);
        };
        session.init(openListener, errorListener);
    };

    createSession(xcApiFileName: string, serverUrl: string, sessionListener: (error: Error, session: Session) => void): void {
        this.init(xcApiFileName, serverUrl, null, sessionListener);
    };

    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string, sessionListener: (error: Error, session: Session) => void): void {
        this.init(xcApiFileName, serverUrl, sessionData, sessionListener);
    };

    private init(xcApiFileName: string, serverUrl: string, sessionData: string, sessionListener: (error: Error, session: Session) => void): void {
        let session = SessionFactory(serverUrl, null, sessionData);
        let thisConnection = this;
        let getXcApiRequest = (xcApiFileName: string, sessionListener: (error: Error, session: Session) => void) => {
            if (thisConnection.apis[xcApiFileName] === undefined) {
                session.privateSubscriber.getXcApi(xcApiFileName, (xcApi: string) => {
                    const parser = new DefaultApiConfigurationParser();
                    const configurationPromise = parser.parse(xcApi);
                    configurationPromise.then(configuration => {
                        thisConnection.apis[xcApiFileName] = configuration;
                        session.configuration = configuration;
                        session.replyPublisher.configuration = configuration;
                        sessionListener(null, session);
                    }).catch(e => sessionListener(e, null));
                });
            } else {
                session.configuration = thisConnection.apis[xcApiFileName];
                session.replyPublisher.configuration = thisConnection.apis[xcApiFileName];
                sessionListener(null, session);
            }
        };
        let openListener = (_: Event) => {
            getXcApiRequest(xcApiFileName, sessionListener);
        };
        let errorListener = (err: Error) => {
            sessionListener(err, null);
        };
        session.init(openListener, errorListener);
    }
}
