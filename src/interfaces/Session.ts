import { Publisher } from "../interfaces/Publisher";
import { Subscriber } from "../interfaces/Subscriber";
import { ApiConfiguration } from "../configuration/apiConfiguration";

export interface Session {
    serverUrl: string;
    privateTopic: string;
    heartbeatIntervalSeconds: number;
    closedByUser: boolean;
    privateSubscriber: Subscriber;
    replyPublisher: Publisher;
    configuration: ApiConfiguration;
    webSocket: WebSocket;
    heartbeatTimer: NodeJS.Timer;
    getDefaultPrivateTopic(): string;
    getPrivateTopics(): string[];
    setPrivateTopic(privateTopic: string): void;
    addPrivateTopic(privateTopic: string): void;
    removePrivateTopic(privateTopic: string): void;
    createPublisher(): Publisher;
    createSubscriber(): Subscriber;
    disposePublisher(publisher: Publisher): void;
    disposeSubscriber(subscriber: Subscriber): void;
    dispose(): void;
    close(): void;
}