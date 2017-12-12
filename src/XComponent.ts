import { WebSocketConnection } from "./communication/WebSocketConnection";
import { Session } from "./interfaces/Session";
import { Connection } from "./interfaces/Connection";
import { ErrorListener } from "./interfaces/ErrorListener";
import { CompositionModel } from "./communication/xcomponentMessages";
import { Logger, LoggerConfig } from "log4ts";
import BasicLayout from "log4ts/build/layouts/BasicLayout";
import ConsoleAppender from "log4ts/build/appenders/ConsoleAppender";
import { LogLevel } from "log4ts/build/LogLevel";
import { HeartbeatManager } from "./communication/HeartbeatManager";

export class XComponent {
    private static logger: Logger = Logger.getLogger("XComponent");
    private static loggerconfig: LoggerConfig;
    private static initialized: boolean = false;

    public static connect(serverUrl: string, errorListener?: ErrorListener, heartbeatIntervalSeconds: number = 10): Promise<Connection> {
        XComponent.tryInitialize();
        return new Promise((resolve, reject): void => {
            let webSocket = new WebSocket(serverUrl);
            let heartbeatManager = new HeartbeatManager(webSocket);
            let connection = new WebSocketConnection(webSocket, heartbeatManager);

            webSocket.onopen = (e: Event) => {
                connection.closedByUser = false;
                heartbeatManager.startToSendHeartbeat(heartbeatIntervalSeconds);
                XComponent.logger.info("connection started on " + serverUrl + ".");
                resolve(connection);
            };

            webSocket.onerror = ((error: Event) => {
                if (errorListener) {
                    errorListener.onError(new Error(error.toString()));
                    reject(error);
                }
                this.logger.error("Error on " + serverUrl + ".", error);
            }).bind(this);

            webSocket.onclose = (closeEvent: CloseEvent) => {
                this.logger.info("connection on " + serverUrl + " closed.", closeEvent);
                if (!connection.closedByUser && errorListener) {
                    errorListener.onError(new Error("Unxecpected connection close on " + serverUrl));
                    reject(closeEvent);
                }
                heartbeatManager.stopToSendHeartbeat();
                connection.dispose();
            };
        });
    }

    public static setLogLevel(logLevel: LogLevel): void {
        XComponent.tryInitialize();
        this.loggerconfig.setLevel(logLevel);
    }

    public static getLogLevel(): LogLevel {
        XComponent.tryInitialize();
        return this.loggerconfig.getLevel();
    }

    private static tryInitialize() {
        if (!XComponent.initialized) {
            let consoleAppender = new ConsoleAppender();
            consoleAppender.setLayout(new BasicLayout());
            this.loggerconfig = new LoggerConfig(consoleAppender, LogLevel.INFO);
            Logger.setConfig(this.loggerconfig);
        }
    }
}