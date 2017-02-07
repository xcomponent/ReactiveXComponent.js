let log = require("loglevel");
import { isDebugEnabled } from "../loggerConfiguration";
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
};

export interface Event {
    Header: Header;
    JsonMessage: string;
};

export interface Data {
    RoutingKey: string;
    ComponentCode: number;
    Event: Event;
};

export interface NameData {
    Name: string;
};

export interface EmptyData { }

export interface TopicData {
    Header: Header;
    JsonMessage: string;
};

export interface CommandData {
    Command: string;
    Data: NameData | EmptyData | TopicData;
};


export let convertToWebsocketInputFormat = (data: Data): string => {
    let input = `${data.RoutingKey} ${data.ComponentCode} ${JSON.stringify(data.Event)}`;
    if (isDebugEnabled()) {
        log.debug(`Message send: ${input}`);
    }
    return input;
};

export let convertCommandDataToWebsocketInputFormat = (commandData: CommandData): string => {
    let input = `${commandData.Command} ${JSON.stringify(commandData.Data)}`;
    if (isDebugEnabled()) {
        log.debug(`Message send: ${input}`);
    }
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
    model: string;
    graphical: string;
}

export interface CompositionModel {
    projectName: string;
    components: Array<Component>;
    composition: string;
}

export interface DeserializedData {
    command: string;
    topic: string;
    stringData: string;
}