import { fromEvent as observableFromEvent, Observable } from 'rxjs';
import { filter, first, map, takeWhile } from 'rxjs/operators';
import { Commands } from '../configuration/xcWebSocketBridgeConfiguration';
import { CompositionModel, DeserializedData, Serializer, Deserializer } from './xcomponentMessages';
import 'rxjs/add/observable/fromEvent';
import { Logger } from '../utils/Logger';
import { DefaultApiConfigurationParser } from '../configuration/apiConfigurationParser';
import { ApiConfiguration } from '../configuration/apiConfiguration';

export class WebSocketBridgeCommunication {
    private logger = Logger.getLogger('HeartbeatManager');
    private updates$: Observable<DeserializedData>;
    private deserializer: Deserializer;
    private serializer: Serializer;
    private heartbeatTimer: NodeJS.Timer;
    private runnning: boolean = true;

    constructor(private webSocket: WebSocket) {
        this.deserializer = new Deserializer();
        this.serializer = new Serializer();
        let thisWebSocketBridgeCommunication = this;
        this.updates$ = observableFromEvent(this.webSocket, 'message').pipe(
            takeWhile((rawMessage: MessageEvent) => this.runnning),
            map((rawMessage: MessageEvent) =>
                thisWebSocketBridgeCommunication.deserializer.deserializeWithoutTopic(rawMessage.data || rawMessage)
            )
        );
    }

    public startHeartbeat(heartbeatIntervalSeconds: number): void {
        let thisWebSocketBridgeCommunication = this;
        let command = Commands[Commands.hb];
        this.updates$
            .pipe(filter((data: DeserializedData) => data.command === command))
            .subscribe((data: DeserializedData) => {
                this.logger.debug('Heartbeat received successfully');
            });
        let commandData = {
            Command: command,
            Data: {},
        };
        let input = thisWebSocketBridgeCommunication.serializer.convertCommandDataToWebsocketInputFormat(commandData);
        this.heartbeatTimer = setInterval(() => {
            thisWebSocketBridgeCommunication.webSocket.send(input);
            this.logger.debug('Heartbeat sent');
        }, heartbeatIntervalSeconds * 1000);
    }

    public getCompositionModel(apiName: string): Promise<CompositionModel> {
        const thisWebSocketBridgeCommunication = this;
        const command = Commands[Commands.getModel];
        const promise = this.updates$
            .pipe(
                filter((data: DeserializedData) => data.command === command),
                first(),
                map((data: DeserializedData) => {
                    return thisWebSocketBridgeCommunication.deserializer.getJsonDataFromGetModelRequest(
                        data.stringData
                    );
                })
            )
            .toPromise()
            .then((compositionModel: CompositionModel | undefined) => {
                if (!compositionModel) {
                    const errorMessage = 'Model ' + apiName + ' not found';
                    this.logger.error(errorMessage);
                    throw new Error(errorMessage);
                }
                this.logger.info('Model ' + apiName + ' received successfully');
                return compositionModel;
            });
        const commandData = {
            Command: command,
            Data: { Name: apiName },
        };
        const input = thisWebSocketBridgeCommunication.serializer.convertCommandDataToWebsocketInputFormat(commandData);
        this.webSocket.send(input);
        return promise;
    }

    public getXcApiList(): Promise<Array<string>> {
        const thisWebSocketBridgeCommunication = this;
        const command = Commands[Commands.getXcApiList];
        const promise = this.updates$
            .pipe(
                filter((data: DeserializedData) => data.command === command),
                first(),
                map((data: DeserializedData) => {
                    this.logger.info('ApiList received successfully : ' + JSON.stringify(data));
                    return thisWebSocketBridgeCommunication.deserializer.getJsonDataFromGetXcApiListRequest(
                        data.stringData
                    );
                })
            )
            .toPromise();
        const commandData = {
            Command: command,
            Data: {},
        };
        this.webSocket.send(
            thisWebSocketBridgeCommunication.serializer.convertCommandDataToWebsocketInputFormat(commandData)
        );
        return promise;
    }

    public getXcApiConfiguration(apiName: string): Promise<ApiConfiguration> {
        const thisWebSocketBridgeCommunication = this;
        const command = Commands[Commands.getXcApi];
        const promise = this.updates$
            .pipe(
                filter((data: DeserializedData) => data.command === command),
                first(),
                map((data: DeserializedData) => {
                    this.logger.info(apiName + ' ' + 'received successfully');
                    return thisWebSocketBridgeCommunication.deserializer.getJsonDataFromXcApiRequest(data.stringData);
                })
            )
            .toPromise()
            .then((xcApi: string | undefined) => {
                if (!xcApi) {
                    const errorMessage = `Unknown Api: ${apiName}`;
                    this.logger.error(errorMessage);
                    throw new Error(errorMessage);
                }
                const parser = new DefaultApiConfigurationParser();
                return parser.parse(xcApi);
            });
        const commandData = {
            Command: command,
            Data: { Name: apiName },
        };
        this.webSocket.send(
            thisWebSocketBridgeCommunication.serializer.convertCommandDataToWebsocketInputFormat(commandData)
        );
        return promise;
    }

    public dispose(): void {
        clearInterval(this.heartbeatTimer);
        this.runnning = false;
    }
}
