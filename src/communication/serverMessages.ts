import { FSharpFormat } from "../configuration/FSharpConfiguration";

export interface Header {
    StateMachineCode: FSharpFormat<Number>;
    ComponentCode: FSharpFormat<Number>;
    MessageType: FSharpFormat<String>;
    PublishTopic: FSharpFormat<String>;
    SessionData: FSharpFormat<String>;
    StateMachineId: FSharpFormat<Number>;
    AgentId: FSharpFormat<Number>;
    EventCode: number;
    IncomingType: number;
}

export interface Event {
    Header: Header;
    JsonMessage: string;
}

export interface Data {
    RoutingKey: string;
    ComponentCode: number;
    Event: Event;
}

export interface CommandData {
    Command: string;
    Data: any;
}

export let convertToWebsocketInputFormat = (data: Data): string => {
    let input = data.RoutingKey + " " + data.ComponentCode + " " + JSON.stringify(data.Event);
    return input;
};

export let convertCommandDataToWebsocketInputFormat = (commandData: CommandData): string => {
    let input = commandData.Command + " " + JSON.stringify(commandData.Data);
    return input;
};

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