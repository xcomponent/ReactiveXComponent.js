import { WebSocketConnection } from './communication/WebSocketConnection';
import { Connection } from './interfaces/Connection';
import { ErrorListener } from './interfaces/ErrorListener';
import { Logger } from './utils/Logger';
import { WebSocketBridgeCommunication } from './communication/WebSocketBridgeCommunication';

export class XComponent {
    private logger = Logger.getLogger('XComponent');
    private initialized: boolean = false;

    public connect(
        serverUrl: string,
        errorListener?: ErrorListener,
        heartbeatIntervalSeconds: number = 10
    ): Promise<Connection> {
        this.ensureInitialized();
        return new Promise(
            (resolve, reject): void => {
                let webSocket;
                if (this.isNodeApplication()) {
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
                    webSocket = new WebSocket(serverUrl);
                } else {
                    webSocket = new WebSocket(serverUrl);
                }
                let webSocketBridgeCommunication = new WebSocketBridgeCommunication(webSocket);
                let connection = new WebSocketConnection(webSocket, webSocketBridgeCommunication);

                webSocket.onopen = ((e: Event) => {
                    connection.closedByUser = false;
                    webSocketBridgeCommunication.startHeartbeat(heartbeatIntervalSeconds);
                    this.logger.info('connection started on ' + serverUrl + '.');
                    resolve(connection);
                }).bind(this);

                webSocket.onerror = ((error: Event) => {
                    if (errorListener) {
                        errorListener.onError(new Error(error.toString()));
                        reject(error);
                    }
                    this.logger.error('Error on ' + serverUrl + '.', error);
                }).bind(this);

                webSocket.onclose = ((closeEvent: CloseEvent) => {
                    this.logger.info('connection on ' + serverUrl + ' closed.', closeEvent);
                    if (!connection.closedByUser && errorListener) {
                        errorListener.onError(new Error('Unxecpected connection close on ' + serverUrl));
                        reject(closeEvent);
                    }
                    webSocketBridgeCommunication.dispose();
                    connection.dispose();
                }).bind(this);
            }
        );
    }

    private ensureInitialized() {
        if (!this.initialized) {
            this.initialized = true;
        }
    }

    private isNodeApplication() {
        return typeof process === 'object' && process + '' === '[object process]' && typeof window === 'undefined';
    }
}
