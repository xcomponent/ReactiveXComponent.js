import { SessionFactory, Session } from "./xcSession";
import { ApiConfiguration } from "../configuration/apiConfiguration";
import { DefaultApiConfigurationParser } from "../configuration/apiConfigurationParser";
import { CompositionModel } from "../communication/xcomponentMessages";
let log = require("loglevel");
import { isDebugEnabled } from "../loggerConfiguration";
import { Kinds } from "../configuration/xcWebSocketBridgeConfiguration";

export interface Connection {
    getCompositionModel(xcApiName: string, serverUrl: string): Promise<CompositionModel>;
    getXcApiList(serverUrl: string): Promise<Array<String>>;
    createSession(xcApiFileName: string, serverUrl: string): Promise<Session>;
    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string): Promise<Session>;
}

export class DefaultConnection implements Connection {

    constructor() {
    }

    getCompositionModel(xcApiName: string, serverUrl: string): Promise<CompositionModel> {
        const session = SessionFactory(serverUrl, null, null);
        return this.initSession(session)
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
        return this.initSession(session)
            .then(_ => {
                return session.privateSubscriber.getXcApiList();
            })
            .catch(err => {
                log.debug("getModel request failed");
                log.debug(err);
            });
    };

    createSession(xcApiFileName: string, serverUrl: string): Promise<Session> {
        return this.initConnection(xcApiFileName, serverUrl, null);
    };

    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string): Promise<Session> {
        return this.initConnection(xcApiFileName, serverUrl, sessionData);
    };

    private initSession(session: Session): Promise<Event> {
        return new Promise((resolve, reject) => {
            session.webSocket.onopen = (e: Event) => {
                session.closedByUser = false;
                session.privateSubscriber.sendSubscribeRequestToTopic(session.privateTopic, Kinds.Private);
                session.heartbeatTimer = session.privateSubscriber.getHeartbeatTimer(session.heartbeatIntervalSeconds);
                log.info("connection started on " + session.serverUrl + ".");
                resolve(e);
            };

            session.webSocket.onerror = ((err: Event) => {
                const messageError = "Error on " + session.serverUrl + ".";
                reject(new Error(messageError));
                console.error(err);
            }).bind(this);

            session.webSocket.onclose = (closeEvent: CloseEvent) => {
                log.info("connection on " + session.serverUrl + " closed.");
                log.info(closeEvent);
                clearInterval(session.heartbeatTimer);
                session.dispose();
            };
        });
    }

    private initConnection(xcApiFileName: string, serverUrl: string, sessionData: string): Promise<Session> {
        const session = SessionFactory(serverUrl, null, sessionData);
        return this.initSession(session)
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
