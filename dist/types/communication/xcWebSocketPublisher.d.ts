import { ApiConfiguration } from "../configuration/apiConfiguration";
export interface Publisher {
    webSocket: WebSocket;
    configuration: ApiConfiguration;
    privateTopic: string;
    sessionData: string;
    sendWithStateMachineRef(stateMachineRef: any, messageType: string, jsonMessage: any, visibilityPrivate: boolean, specifiedPrivateTopic: string): void;
    send(componentName: string, stateMachineName: string, messageType: string, jsonMessage: any, visibilityPrivate: boolean, specifiedPrivateTopic: string): void;
    canPublish(componentName: string, stateMachineName: string, messageType: string): boolean;
}
export declare class DefaultPublisher implements Publisher {
    webSocket: WebSocket;
    configuration: ApiConfiguration;
    privateTopic: string;
    sessionData: string;
    constructor(webSocket: WebSocket, configuration: ApiConfiguration, privateTopic: string, sessionData: string);
    send(componentName: string, stateMachineName: string, messageType: string, jsonMessage: any, visibilityPrivate?: boolean, specifiedPrivateTopic?: string): void;
    private getDataToSend(componentName, stateMachineName, messageType, jsonMessage, visibilityPrivate?, specifiedPrivateTopic?);
    private getHeaderConfig(componentCode, stateMachineCode, messageType, visibilityPrivate, specifiedPrivateTopic, stateMachineId?, agentId?);
    private getRoutingKey(componentCode, stateMachineCode, messageType);
    sendWithStateMachineRef(stateMachineRef: any, messageType: string, jsonMessage: any, visibilityPrivate?: boolean, specifiedPrivateTopic?: string): void;
    private getDataToSendWithStateMachineRef(stateMachineRef, messageType, jsonMessage, visibilityPrivate?, specifiedPrivateTopic?);
    canPublish(componentName: string, stateMachineName: string, messageType: string): boolean;
}
