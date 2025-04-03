import { Utils } from '../communication/Utils';
import { WebSocketSubscriber } from '../communication/WebSocketSubscriber';
import { Kinds } from '../configuration/xcWebSocketBridgeConfiguration';
import { generateUUID } from '../utils/uuid';
export class PrivateTopics {
    private defaultPublisherTopic: string = generateUUID();
    private subscriberTopics: Array<string> = [];

    constructor(private subscriber: WebSocketSubscriber) {
        this.addSubscriberTopic(this.defaultPublisherTopic);
    }

    public setDefaultPublisherTopic(newDefaultPublisherTopic: string | undefined): void {
        if (newDefaultPublisherTopic) {
            this.addSubscriberTopic(newDefaultPublisherTopic);
            this.removeSubscriberTopic(this.defaultPublisherTopic);
            this.defaultPublisherTopic = newDefaultPublisherTopic;
        }
    }

    public getDefaultPublisherTopic(): string {
        return this.defaultPublisherTopic;
    }

    public addSubscriberTopic(privateTopic: string | undefined): void {
        if (privateTopic && this.subscriberTopics.indexOf(privateTopic) === -1) {
            this.subscriber.sendSubscribeRequestToTopic(privateTopic, Kinds.Private);
            this.subscriberTopics.push(privateTopic);
        }
    }

    public removeSubscriberTopic(privateTopic: string): void {
        if (privateTopic && this.subscriberTopics.indexOf(privateTopic) !== -1) {
            this.subscriber.sendUnsubscribeRequestToTopic(privateTopic, Kinds.Private);
            Utils.removeElementFromArray(this.subscriberTopics, privateTopic);
        }
    }

    public getSubscriberTopics(): Array<string> {
        return this.subscriberTopics;
    }

    public dispose(): void {
        this.subscriberTopics.forEach((subscriberTopic: string) => {
            this.subscriber.sendUnsubscribeRequestToTopic(subscriberTopic, Kinds.Private);
        }, this);
    }
}
