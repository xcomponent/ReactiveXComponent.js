import { WebSocketSession } from "./WebSocketSession";
import { HeartbeatManager } from "./HeartbeatManager";
import { DefaultApiConfigurationParser } from "../configuration/apiConfigurationParser";
import { CompositionModel } from "../communication/xcomponentMessages";
import { Kinds } from "../configuration/xcWebSocketBridgeConfiguration";
import { error } from "util";
import { Session } from "../interfaces/Session";
import { Connection } from "../interfaces/Connection";
import { Logger } from "log4ts";

export class WebSocketConnection implements Connection {
    private sessions: Array<WebSocketSession> = new Array<WebSocketSession>();
    private logger: Logger = Logger.getLogger("WebSocketConnection");
    public closedByUser: boolean = false;

    constructor(private webSocket: WebSocket, private heartbeatManager: HeartbeatManager) {
    }

    public getXcApiList(): Promise<Array<String>> {
        const session = new WebSocketSession(this.webSocket);
        return session.privateSubscriber.getXcApiList()
            .catch(err => {
                this.logger.debug("getModel request failed", err);
            });
    };

    public getCompositionModel(xcApiName: string): Promise<CompositionModel> {
        const session = new WebSocketSession(this.webSocket);
        return session.privateSubscriber.getCompositionModel(xcApiName)
            .catch(err => {
                this.logger.debug("getModel request failed", err);
            });
    }

    public createSession(xcApiFileName: string): Promise<Session> {
        return this.initConnection(xcApiFileName, null);
    };

    public createAuthenticatedSession(xcApiFileName: string, sessionData: string): Promise<Session> {
        return this.initConnection(xcApiFileName, sessionData);
    };

    public dispose(): void {
        this.sessions.forEach((session: WebSocketSession) => {
            this.disposeSession(session);
        }, this);
        this.closedByUser = true;
        this.webSocket.close();
    }

    public disposeSession(session: WebSocketSession): void {
        WebSocketSession.removeElement(this.sessions, session);
    };

    private initConnection(xcApiFileName: string, sessionData: string): Promise<Session> {
        const session = new WebSocketSession(this.webSocket, sessionData);
        return session.privateSubscriber.getXcApi(xcApiFileName)
            .then((xcApi: string) => {
                if (xcApi === null) {
                    throw new Error(`Unknown Api: ${xcApiFileName}`);
                }
                const parser = new DefaultApiConfigurationParser();
                return parser.parse(xcApi);
            })
            .then(configuration => {
                session.setConfiguration(configuration);
                this.sessions.push(session);
                return session;
            });
    }
}