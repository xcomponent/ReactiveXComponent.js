import { Utils } from "../communication/Utils";
import * as uuid from "uuid/v4";

export class PrivateTopics {
    private defaultPublisherTopic: string;
    private subscriberTopics: Array<string>;

    constructor() {
        this.defaultPublisherTopic = uuid();
        this.subscriberTopics = [this.defaultPublisherTopic];
    }

    public setDefaultPublisherTopic(newDefaultPublisherTopic: string): void {
        if (newDefaultPublisherTopic) {
            this.addSubscriberTopic(newDefaultPublisherTopic);
            this.removeSubscriberTopic(this.defaultPublisherTopic);
            this.defaultPublisherTopic = newDefaultPublisherTopic;
        }
    }

    public getDefaultPublisherTopic(): string {
        return this.defaultPublisherTopic;
    }

    public addSubscriberTopic(privateTopic: string): void {
        if (privateTopic && this.subscriberTopics.indexOf(privateTopic) === -1) {
            this.subscriberTopics.push(privateTopic);
        }
    }

    public removeSubscriberTopic(privateTopic: string): void {
        Utils.removeElementFromArray(this.subscriberTopics, privateTopic);
    }

    public getSubscriberTopics(): Array<string> {
        return this.subscriberTopics;
    }
}