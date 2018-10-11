import { JsonMessage } from '../communication/xcomponentMessages';

export interface StateMachineRef {
    WorkerId: number;
    ErrorMessage?: string;
    StateMachineId: string;
    StateMachineCode: number;
    ComponentCode: number;
    StateName: string;
    send(messageType: string, jsonMessage: JsonMessage): void;
    send(messageType: string, jsonMessage: JsonMessage, visibilityPrivate: boolean): void;
    send(
        messageType: string,
        jsonMessage: JsonMessage,
        visibilityPrivate: boolean,
        specifiedPrivateTopic?: string
    ): void;
}
