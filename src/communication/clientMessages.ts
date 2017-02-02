let log = require("loglevel");
import { LogLevel, logDebug } from "../loggerConfiguration";
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
    logDebug(`Message send: ${input}`);
    return input;
};

export let convertCommandDataToWebsocketInputFormat = (commandData: CommandData): string => {
    let input = `${commandData.Command} ${JSON.stringify(commandData.Data)}`;
    logDebug(`Message send: ${input}`);
    return input;
};
