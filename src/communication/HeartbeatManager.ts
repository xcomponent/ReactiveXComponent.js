import { Commands } from "../configuration/xcWebSocketBridgeConfiguration";
import {
    StateMachineInstance, StateMachineRef, Component,
    CompositionModel, DeserializedData, CommandData, Header,
    Event, Data, getHeaderWithIncomingType,
    Serializer, Deserializer, fatalErrorState } from "./xcomponentMessages";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/filter";
import "rxjs/add/observable/fromEvent";
import { Logger } from "log4ts";

export class HeartbeatManager {
    private logger: Logger = Logger.getLogger("HeartbeatManager");
    private observableMsg: Observable<MessageEvent>;
    private deserializer: Deserializer;
    private serializer: Serializer;
    private heartbeatTimer: number;

    constructor(private webSocket: WebSocket) {
        this.observableMsg = Observable.fromEvent(this.webSocket, "message");
        this.deserializer = new Deserializer();
        this.serializer = new Serializer();
    }

    public start(heartbeatIntervalSeconds: number): void {
        let thisHeartbeatManager = this;
        let command = Commands[Commands.hb];
        this.observableMsg
            .map((rawMessage: MessageEvent) => thisHeartbeatManager.deserializer.deserializeWithoutTopic(rawMessage.data || rawMessage))
            .filter((data: DeserializedData) => data.command === command)
            .subscribe((data: DeserializedData) => {
                this.logger.trace("Heartbeat received successfully");
            });
        let commandData = {
            Command: command,
            Data: {}
        };
        let input = thisHeartbeatManager.serializer.convertCommandDataToWebsocketInputFormat(commandData);
        this.heartbeatTimer = window.setInterval(() => {
            thisHeartbeatManager.webSocket.send(input);
            this.logger.trace("Heartbeat sent");
        }, heartbeatIntervalSeconds * 1000);
    }

    public stop(): void {
        window.clearInterval(this.heartbeatTimer);
    }
}