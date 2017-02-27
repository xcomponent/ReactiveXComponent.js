import { Publisher } from "./xcWebSocketPublisher";
import { Subscriber } from "./xcWebSocketSubscriber";
import { ApiConfiguration } from "../configuration/apiConfiguration";
export interface Session {
    privateSubscriber: Subscriber;
    replyPublisher: Publisher;
    configuration: ApiConfiguration;
    webSocket: WebSocket;
    setPrivateTopic(privateTopic: string): void;
    addPrivateTopic(privateTopic: string): void;
    removePrivateTopic(privateTopic: string): void;
    init(openListener: (e: Event) => void, errorListener: (err: Error) => void): void;
    createPublisher(): Publisher;
    createSubscriber(): Subscriber;
    disposePublisher(publisher: Publisher): void;
    disposeSubscriber(subscriber: Subscriber): void;
    dispose(): void;
    close(): void;
}
export declare class DefaultSession implements Session {
    private serverUrl;
    private sessionData;
    private guid;
    private privateTopic;
    private publishers;
    private subscribers;
    private privateTopics;
    private heartbeatTimer;
    private heartbeatIntervalSeconds;
    privateSubscriber: Subscriber;
    replyPublisher: Publisher;
    configuration: ApiConfiguration;
    webSocket: WebSocket;
    constructor(serverUrl: string, webSocket: WebSocket, configuration: ApiConfiguration, sessionData: string);
    setPrivateTopic(privateTopic: string): void;
    addPrivateTopic(privateTopic: string): void;
    removePrivateTopic(privateTopic: string): void;
    init(openListener: (e: Event) => void, errorListener: (err: Error) => void): void;
    createPublisher(): Publisher;
    createSubscriber(): Subscriber;
    private removeElement<T>(array, e);
    disposePublisher(publisher: Publisher): void;
    disposeSubscriber(subscriber: Subscriber): void;
    dispose(): void;
    close(): void;
}
export declare const SessionFactory: (serverUrl: string, configuration: ApiConfiguration, sessionData: string) => Session;
