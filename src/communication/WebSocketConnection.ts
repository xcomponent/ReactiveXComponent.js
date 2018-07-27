import { WebSocketSession } from "./WebSocketSession";
import { WebSocketBridgeCommunication } from "./WebSocketBridgeCommunication";
import { Utils } from "./Utils";
import { DefaultApiConfigurationParser } from "../configuration/apiConfigurationParser";
import { CompositionModel } from "./xcomponentMessages";
import { Kinds } from "../configuration/xcWebSocketBridgeConfiguration";
import { error } from "util";
import { Session } from "../interfaces/Session";
import { Connection } from "../interfaces/Connection";
import { Logger } from "log4ts";
import { WebSocketWrapper } from "./WebSocketWrapper";

export class WebSocketConnection implements Connection {
    private sessions: Array<WebSocketSession> = new Array<WebSocketSession>();
    private logger: Logger = Logger.getLogger("WebSocketConnection");
    public closedByUser: boolean = false;

    constructor(private webSocket: WebSocket, private webSocketBridgeCommunication: WebSocketBridgeCommunication) {
    }

    public getXcApiList(): Promise<Array<string>> {
        return this.webSocketBridgeCommunication.getXcApiList();
    }

    public getCompositionModel(xcApiName: string): Promise<CompositionModel> {
        return this.webSocketBridgeCommunication.getCompositionModel(xcApiName);
    }

    public createSession(apiName: string): Promise<Session> {
        return this.initConnection(apiName, null);
    }

    public createAuthenticatedSession(apiName: string, sessionData: string): Promise<Session> {
        return this.initConnection(apiName, sessionData);
    }

    public dispose(): void {
        this.sessions.forEach((session: WebSocketSession) => {
            Utils.removeElementFromArray(this.sessions, session);
        }, this);
        this.closedByUser = true;
        this.webSocket.close();
    }

    private initConnection(apiName: string, sessionData: string): Promise<Session> {
        return this.webSocketBridgeCommunication.getXcApi(apiName)
            .then((xcApi: string) => {
                if (xcApi === null) {
                    throw new Error(`Unknown Api: ${apiName}`);
                }
                const parser = new DefaultApiConfigurationParser();
                return parser.parse(xcApi);
            })
            .then(configuration => {
                const session = new WebSocketSession(new WebSocketWrapper(this.webSocket), configuration, sessionData);
                this.sessions.push(session);
                return session;
            });
    }
}