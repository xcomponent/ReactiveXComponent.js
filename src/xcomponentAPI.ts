import { WebSocketConnection } from "./communication/WebSocketConnection";
import { Session } from "./interfaces/Session";
import { Connection } from "./interfaces/Connection";
import { CompositionModel } from "./communication/xcomponentMessages";
import { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } from "constants";
import { Logger, LoggerConfig } from "log4ts";
import BasicLayout from "log4ts/build/layouts/BasicLayout";
import ConsoleAppender from "log4ts/build/appenders/ConsoleAppender";
import { LogLevel } from "log4ts/build/LogLevel";

class XComponentAPI {
    private loggerconfig: LoggerConfig;
    private connection: Connection;

    public constructor(logLevel: LogLevel = LogLevel.INFO) {
        let consoleAppender = new ConsoleAppender();
        consoleAppender.setLayout(new BasicLayout());
        this.loggerconfig = new LoggerConfig(consoleAppender, logLevel);
        Logger.setConfig(this.loggerconfig);
        this.connection = new WebSocketConnection();
    }

    public getCompositionModel(xcApiName: string, serverUrl: string): Promise<CompositionModel> {
        return this.connection.getCompositionModel(xcApiName, serverUrl);
    }

    public getXcApiList(serverUrl: string): Promise<Array<String>> {
        return this.connection.getXcApiList(serverUrl);
    }

    public createSession(xcApiFileName: string, serverUrl: string, errorListener?: (err: Error) => void): Promise<Session> {
        return this.connection.createSession(xcApiFileName, serverUrl, errorListener);
    }

    public createAuthenticatedSession(xcApiFileName: string, serverUrl: string, sessionData: string): Promise<Session> {
        return this.connection.createAuthenticatedSession(xcApiFileName, serverUrl, sessionData);
    }

    public setLogLevel(logLevel: LogLevel): void {
        this.loggerconfig.setLevel(logLevel);
    }

    public getLogLevel(): LogLevel {
        return this.loggerconfig.getLevel();
    }
}

export default XComponentAPI;