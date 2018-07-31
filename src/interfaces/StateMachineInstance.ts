import { StateMachineRef } from "./StateMachineRef";
import { JsonMessage } from "../communication/xcomponentMessages";

export class StateMachineInstance {
    constructor(public stateMachineRef: StateMachineRef, public jsonMessage: JsonMessage) {
    }

    public send(messageType: string, jsonMessage: JsonMessage, visibilityPrivate: boolean = false, specifiedPrivateTopic?: string): void {
        this.stateMachineRef.send(messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic);
    }
}