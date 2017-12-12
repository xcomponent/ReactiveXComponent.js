import { Publisher } from "../interfaces/Publisher";
import { Subscriber } from "../interfaces/Subscriber";
import { ApiConfiguration } from "../configuration/apiConfiguration";

export interface Session {
    privateTopic: string;
    privateSubscriber: Subscriber;
    webSocket: WebSocket;
    getDefaultPrivateTopic(): string;
    getPrivateTopics(): string[];
    setPrivateTopic(privateTopic: string): void;
    addPrivateTopic(privateTopic: string): void;
    removePrivateTopic(privateTopic: string): void;
    createPublisher(): Publisher;
    createSubscriber(): Subscriber;
    dispose(): void;
}