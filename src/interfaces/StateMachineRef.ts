export interface StateMachineRef {
    WorkerId: number;
    ErrorMessage?: string;
    StateMachineId: number;
    StateMachineCode: number;
    ComponentCode: number;
    StateName: string;
    send(messageType: string, jsonMessage: any, visibilityPrivate: boolean, specifiedPrivateTopic: string): void;
};