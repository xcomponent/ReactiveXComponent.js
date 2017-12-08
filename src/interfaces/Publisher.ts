import { ApiConfiguration } from "../configuration/apiConfiguration";
import { StateMachineRef } from "../communication/xcomponentMessages";

export interface Publisher {
    privateTopic: string;
    sendWithStateMachineRef(stateMachineRef: StateMachineRef, messageType: string, jsonMessage: any, visibilityPrivate: boolean, specifiedPrivateTopic: string): void;
    send(componentName: string, stateMachineName: string, messageType: string, jsonMessage: any, visibilityPrivate: boolean, specifiedPrivateTopic: string): void;
    canPublish(componentName: string, stateMachineName: string, messageType: string): boolean;
}