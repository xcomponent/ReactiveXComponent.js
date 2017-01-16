import { SessionFactory, Session } from "communication/xcSession";
import { ApiConfiguration } from "configuration/apiConfiguration";
import { DefaultApiConfigurationParser } from "configuration/apiConfigurationParser";

export interface Connection {
    getXcApiList(serverUrl: string, getXcApiListListener: (apis: Array<String>) => void): void;
    createSession(xcApiFileName: string, serverUrl: string, sessionListener: (error: any, session: Session) => void): void;
    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string, sessionListener: (error: any, session: Session) => void): void;
}

export class DefaultConnection implements Connection {

    private apis: {
        [xcApiFileName: string]: ApiConfiguration
    };

    constructor() {
        this.apis = {};
    }

    getXcApiList(serverUrl: string, getXcApiListListener: (apis: Array<String>) => void): void {
        let session = SessionFactory(serverUrl, null, null);
        let openListener = function () {
            session.privateSubscriber.getXcApiList(function (apis: Array<String>) {
                getXcApiListListener(apis);
                session.close();
            });
        };
        let errorListener = function (err) {
            console.error(err);
            console.error("Error while getting Apis List");
        };
        session.init(openListener, errorListener);
    };

    createSession(xcApiFileName: string, serverUrl: string, sessionListener: (error: any, session: Session) => void): void {
        this.init(xcApiFileName, serverUrl, null, sessionListener);
    };

    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string, sessionListener: (error: any, session: Session) => void): void {
        this.init(xcApiFileName, serverUrl, sessionData, sessionListener);
    };

    private init(xcApiFileName: string, serverUrl: string, sessionData: string, sessionListener: (error: any, session: Session) => void): void {
        let session = SessionFactory(serverUrl, null, sessionData);
        let thisConnection = this;
        let getXcApiRequest = function (xcApiFileName: string, sessionListener: (error: any, session: Session) => void) {
            if (thisConnection.apis[xcApiFileName] === undefined) {
                session.privateSubscriber.getXcApi(xcApiFileName, function (xcApi: string) {
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
        let openListener = function () {
            getXcApiRequest(xcApiFileName, sessionListener);
        };
        let errorListener = function (err) {
            sessionListener(err, null);
        };
        session.init(openListener, errorListener);
    }
}
