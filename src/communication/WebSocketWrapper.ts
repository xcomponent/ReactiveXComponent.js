import { fromEvent as observableFromEvent, Observable } from 'rxjs';

export class WebSocketWrapper {
    constructor(private webSocket: WebSocket) {}

    public send(data: string | ArrayBuffer | Blob | ArrayBufferView) {
        this.webSocket.send(data);
    }

    public getObservable(): Observable<Event> {
        return observableFromEvent(this.webSocket, 'message');
    }
}
