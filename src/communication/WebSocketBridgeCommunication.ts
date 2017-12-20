import { Commands } from "../configuration/xcWebSocketBridgeConfiguration";
import { CompositionModel, DeserializedData, Serializer, Deserializer } from "./xcomponentMessages";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/takeWhile";
import "rxjs/add/observable/fromEvent";
import { Logger } from "log4ts";

export class WebSocketBridgeCommunication {
    private logger: Logger = Logger.getLogger("HeartbeatManager");
    private observable: Observable<DeserializedData>;
    private deserializer: Deserializer;
    private serializer: Serializer;
    private heartbeatTimer: number;
    private runnning: boolean = true;

    constructor(private webSocket: WebSocket) {
        this.deserializer = new Deserializer();
        this.serializer = new Serializer();
        let thisWebSocketBridgeCommunication = this;
        this.observable = Observable.fromEvent(this.webSocket, "message")
            .takeWhile((rawMessage: MessageEvent) => this.runnning)
            .map((rawMessage: MessageEvent) => thisWebSocketBridgeCommunication.deserializer.deserializeWithoutTopic(rawMessage.data || rawMessage));
    }

    public startHeartbeat(heartbeatIntervalSeconds: number): void {
        let thisWebSocketBridgeCommunication = this;
        let command = Commands[Commands.hb];
        this.observable
            .filter((data: DeserializedData) => data.command === command)
            .subscribe((data: DeserializedData) => {
                this.logger.trace("Heartbeat received successfully");
            });
        let commandData = {
            Command: command,
            Data: {}
        };
        let input = thisWebSocketBridgeCommunication.serializer.convertCommandDataToWebsocketInputFormat(commandData);
        this.heartbeatTimer = window.setInterval(() => {
            thisWebSocketBridgeCommunication.webSocket.send(input);
            this.logger.trace("Heartbeat sent");
        }, heartbeatIntervalSeconds * 1000);
    }

    public getCompositionModel(xcApiName: string): Promise<CompositionModel> {
        const thisWebSocketBridgeCommunication = this;
        const command = Commands[Commands.getModel];
        const promise = this.observable
            .filter((data: DeserializedData) => data.command === command)
            .first()
            .map((data: DeserializedData) => {
                this.logger.info("Model " + xcApiName + " received successfully");
                return thisWebSocketBridgeCommunication.deserializer.getJsonDataFromGetModelRequest(data.stringData);
            })
            .toPromise();
        const commandData = {
            Command: command,
            Data: { "Name": xcApiName }
        };
        const input = thisWebSocketBridgeCommunication.serializer.convertCommandDataToWebsocketInputFormat(commandData);
        this.webSocket.send(input);
        return promise;
    }

    public getXcApiList(): Promise<Array<string>> {
        const thisWebSocketBridgeCommunication = this;
        const command = Commands[Commands.getXcApiList];
        const promise = this.observable
            .filter((data: DeserializedData) => data.command === command)
            .first()
            .map((data: DeserializedData) => {
                this.logger.info("ApiList received successfully");
                return thisWebSocketBridgeCommunication.deserializer.getJsonDataFromGetXcApiListRequest(data.stringData);
            })
            .toPromise();
        const commandData = {
            Command: command,
            Data: {}
        };
        this.webSocket.send(thisWebSocketBridgeCommunication.serializer.convertCommandDataToWebsocketInputFormat(commandData));
        return promise;
    };

    public getXcApi(xcApiFileName: string): Promise<string> {
        const thisWebSocketBridgeCommunication = this;
        const command = Commands[Commands.getXcApi];
        const promise = this.observable
            .filter((data: DeserializedData) => data.command === command)
            .first()
            .map((data: DeserializedData) => {
                this.logger.info(xcApiFileName + " " + "received successfully");
                return thisWebSocketBridgeCommunication.deserializer.getJsonDataFromXcApiRequest(data.stringData);
            })
            .toPromise();
        const commandData = {
            Command: command,
            Data: { Name: xcApiFileName }
        };
        this.webSocket.send(thisWebSocketBridgeCommunication.serializer.convertCommandDataToWebsocketInputFormat(commandData));
        return promise;
    };

    public dispose(): void {
        window.clearInterval(this.heartbeatTimer);
        this.runnning = false;
    }
}