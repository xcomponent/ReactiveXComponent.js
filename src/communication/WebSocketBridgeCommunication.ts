import { Commands } from "../configuration/xcWebSocketBridgeConfiguration";
import {
    StateMachineInstance, StateMachineRef, Component,
    CompositionModel, DeserializedData, CommandData, Header,
    Event, Data, getHeaderWithIncomingType,
    Serializer, Deserializer, fatalErrorState } from "./xcomponentMessages";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/takeWhile";
import "rxjs/add/observable/fromEvent";
import { Logger } from "log4ts";

export class WebSocketBridgeCommunication {
    private logger: Logger = Logger.getLogger("HeartbeatManager");
    private observableMsg: Observable<MessageEvent>;
    private deserializer: Deserializer;
    private serializer: Serializer;
    private heartbeatTimer: number;
    private runnning: boolean = true;

    constructor(private webSocket: WebSocket) {
        this.observableMsg = Observable.fromEvent(this.webSocket, "message");
        this.deserializer = new Deserializer();
        this.serializer = new Serializer();
    }

    public startHeartbeat(heartbeatIntervalSeconds: number): void {
        let thisWebSocketBridgeCommunication = this;
        let command = Commands[Commands.hb];
        this.observableMsg
            .map((rawMessage: MessageEvent) => thisWebSocketBridgeCommunication.deserializer.deserializeWithoutTopic(rawMessage.data || rawMessage))
            .filter((data: DeserializedData) => data.command === command)
            .takeWhile((data: DeserializedData) => this.runnning)
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
        const promise = this.observableMsg
            .map((rawMessage: MessageEvent) => thisWebSocketBridgeCommunication.deserializer.deserializeWithoutTopic(rawMessage.data || rawMessage))
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
        const promise = this.observableMsg
            .map((rawMessage: MessageEvent) => thisWebSocketBridgeCommunication.deserializer.deserializeWithoutTopic(rawMessage.data || rawMessage))
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
        const promise = this.observableMsg
            .map((rawMessage: MessageEvent) => thisWebSocketBridgeCommunication.deserializer.deserializeWithoutTopic(rawMessage.data || rawMessage))
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