import * as  WebSocket from "ws";

export default class WebSocketClient implements WebSocket {

    binaryType: string;
    bufferedAmount: number;
    extensions: string;
    protocol: string;
    readyState: number = 3;
    url: string;
    CONNECTING: number = 0;
    OPEN: number = 1;
    CLOSING: number = 2;
    CLOSED: number = 3;

    private client: any;

    constructor(url: string) {
        this.client = new WebSocket(url, [], {
            rejectUnauthorized: false
        });
        this.url = url;
        this.client.on("open", ((event: Event) => {
            this.readyState = this.OPEN;
            this.onopen(event);
        }).bind(this));
        this.client.on("close", ((closeEvent: CloseEvent) => {
            this.readyState = this.CLOSED;
            this.onclose(closeEvent);
        }).bind(this));
        this.client.on("error", ((event: Event) => {
            this.onerror(event);
        }).bind(this));
    }

    onclose: (closeEvent: CloseEvent) => void;
    onerror: (event: Event) => void;
    onmessage: (messageEvent: MessageEvent) => void;
    onopen: (event: Event) => void;

    close(code?: number, reason?: string): void {
        this.client.close();
    }

    send(data: string): void {
        this.client.send(data);
    }

    addEventListener<K extends "close" | "error" | "message" | "open">(type: K, listener: (ev: WebSocketEventMap[K]) => void, useCapture?: boolean): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
    addEventListener(type: any, listener: any, useCapture?: any) {
        this.client.on(type, listener);
    }

    dispatchEvent(evt: Event): boolean {
        return true;
    }

    removeEventListener(type: string, listener?: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void {
    }
}