
export interface StateMachineRef {
    StateMachineId: number;
    AgentId: number;
    StateMachineCode: number;
    ComponentCode: number;
    StateName: string;
    send(messageType: string, jsonMessage: any, visibilityPrivate: boolean, specifiedPrivateTopic: string): void;
};

export interface Packet {
    stateMachineRef: StateMachineRef;
    jsonMessage: any;
}

export interface Component {
    name: string;
    content: string;
}

export interface Model {
    projectName: string;
    components: Array<Component>;
    composition: string;
}

export interface DeserializedData {
    command: string;
    topic: string;
    stringData: string;
}