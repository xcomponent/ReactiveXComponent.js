import { StateMachineRef } from "./StateMachineRef";

export class StateMachineInstance {
    constructor(public stateMachineRef: StateMachineRef, public jsonMessage: any) {
    }

    public send(messageType: string, jsonMessage: any, visibilityPrivate: boolean = false, specifiedPrivateTopic: string = undefined): void {
        this.stateMachineRef.send(messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic);
    }
}