import { WebSocketSession } from "./WebSocketSession";
import { ApiConfiguration } from "../configuration/apiConfiguration";
import { DefaultApiConfigurationParser } from "../configuration/apiConfigurationParser";
import { CompositionModel } from "../communication/xcomponentMessages";
import { Kinds } from "../configuration/xcWebSocketBridgeConfiguration";
import { error } from "util";
import { Session } from "../interfaces/Session";
import { Connection } from "../interfaces/Connection";
import { Logger } from "log4ts";

export class WebSocketConnection implements Connection {
    private logger: Logger = Logger.getLogger("WebSocketConnection");

    constructor() {
    }

    getCompositionModel(xcApiName: string, serverUrl: string): Promise<CompositionModel> {
        const session = new WebSocketSession(new WebSocket(serverUrl));
        return this.initSession(serverUrl, session)
            .then(_ => {
                return session.privateSubscriber.getCompositionModel(xcApiName);
            })
            .catch(err => {
                this.logger.debug("getModel request failed", err);
            });
    }

    getXcApiList(serverUrl: string): Promise<Array<String>> {
        const session = new WebSocketSession(new WebSocket(serverUrl));
        return this.initSession(serverUrl, session)
            .then(_ => {
                return session.privateSubscriber.getXcApiList();
            })
            .catch(err => {
                this.logger.debug("getModel request failed", err);
            });
    };

    createSession(xcApiFileName: string, serverUrl: string, errorListener?: (err: Error) => void): Promise<Session> {
        return this.initConnection(xcApiFileName, serverUrl, null, errorListener);
    };

    createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string, errorListener?: (err: Error) => void): Promise<Session> {
        return this.initConnection(xcApiFileName, serverUrl, sessionData, errorListener);
    };

    private initConnection(xcApiFileName: string, serverUrl: string, sessionData: string, errorListener?: (err: Error) => void): Promise<Session> {
        const session = new WebSocketSession(new WebSocket(serverUrl), sessionData);
        return this.initSession(serverUrl, session, errorListener)
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
                session.setConfiguration(configuration);
                return session;
            });
    }

    private initSession(serverUrl: string, session: Session, errorListener?: (err: Error) => void): Promise<Event> {
        return new Promise((resolve, reject) => {
            session.webSocket.onopen = (e: Event) => {
                session.closedByUser = false;
                session.privateSubscriber.sendSubscribeRequestToTopic(session.privateTopic, Kinds.Private);
                session.heartbeatTimer = session.privateSubscriber.getHeartbeatTimer(session.heartbeatIntervalSeconds);
                this.logger.info("connection started on " + serverUrl + ".");
                resolve(e);
            };

            session.webSocket.onerror = ((err: Event) => {
                const messageError = "Error on " + serverUrl + ".";
                reject(new Error(messageError));
                console.error(err);
            }).bind(this);

            session.webSocket.onclose = (closeEvent: CloseEvent) => {
                this.logger.info("connection on " + serverUrl + " closed.", closeEvent);
                if (!session.closedByUser && errorListener) {
                    errorListener(new Error("Unxecpected session close on " + serverUrl));
                }
                clearInterval(session.heartbeatTimer);
                session.dispose();
            };
        });
    }
}
