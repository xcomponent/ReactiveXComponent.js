import { WebSocketConnection } from "./communication/WebSocketConnection";
import { Session } from "./interfaces/Session";
import { Connection } from "./interfaces/Connection";
import { ErrorListener } from "./interfaces/ErrorListener";
import { CompositionModel } from "./communication/xcomponentMessages";
import { Logger, LoggerConfig } from "log4ts";
import BasicLayout from "log4ts/build/layouts/BasicLayout";
import ConsoleAppender from "log4ts/build/appenders/ConsoleAppender";
import { LogLevel } from "log4ts/build/LogLevel";
import { WebSocketBridgeCommunication } from "./communication/WebSocketBridgeCommunication";
import { w3cwebsocket as WebSocketLib } from "websocket";

export class XComponent {
    private logger: Logger = Logger.getLogger("XComponent");
    private loggerconfig: LoggerConfig;
    private initialized: boolean = false;

    public connect(serverUrl: string, errorListener?: ErrorListener, heartbeatIntervalSeconds: number = 10): Promise<Connection> {
        this.ensureInitialized();
        return new Promise((resolve, reject): void => {
            let webSocket;
            if (this.isNodeApplication()) {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                webSocket = new WebSocketLib(serverUrl);
            } else {
                webSocket = new WebSocket(serverUrl);
            }
            let webSocketBridgeCommunication = new WebSocketBridgeCommunication(webSocket);
            let connection = new WebSocketConnection(webSocket, webSocketBridgeCommunication);

            webSocket.onopen = ((e: Event) => {
                connection.closedByUser = false;
                webSocketBridgeCommunication.startHeartbeat(heartbeatIntervalSeconds);
                this.logger.info("connection started on " + serverUrl + ".");
                resolve(connection);
            }).bind(this);

            webSocket.onerror = ((error: Event) => {
                if (errorListener) {
                    errorListener.onError(new Error(error.toString()));
                    reject(error);
                }
                this.logger.error("Error on " + serverUrl + ".", error);
            }).bind(this);

            webSocket.onclose = ((closeEvent: CloseEvent) => {
                this.logger.info("connection on " + serverUrl + " closed.", closeEvent);
                if (!connection.closedByUser && errorListener) {
                    errorListener.onError(new Error("Unxecpected connection close on " + serverUrl));
                    reject(closeEvent);
                }
                webSocketBridgeCommunication.dispose();
                connection.dispose();
            }).bind(this);
        });
    }

    public setLogLevel(logLevel: LogLevel): void {
        this.ensureInitialized();
        this.loggerconfig.setLevel(logLevel);
    }

    public getLogLevel(): LogLevel {
        this.ensureInitialized();
        return this.loggerconfig.getLevel();
    }

    private ensureInitialized() {
        if (!this.initialized) {
            let consoleAppender = new ConsoleAppender();
            consoleAppender.setLayout(new BasicLayout());
            this.loggerconfig = new LoggerConfig(consoleAppender, LogLevel.INFO);
            Logger.setConfig(this.loggerconfig);
            this.initialized = true;
        }
    }

    private isNodeApplication() {
        return typeof process === "object" &&
            process + "" === "[object process]" && typeof window === "undefined";
    }
}