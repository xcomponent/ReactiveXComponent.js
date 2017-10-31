let log = require("loglevel");
import { isDebugEnabled } from "../loggerConfiguration";
import { FSharpFormat } from "../configuration/FSharpConfiguration";
import * as pako from "pako";
import * as atob from "atob";

export const fatalErrorState = "FatalError";

export interface Header {
    StateMachineCode: number;
    ComponentCode: number;
    MessageType: string;
    PublishTopic: string;
    SessionData: string;
    StateMachineId: number;
    WorkerId: number;
    EventCode: number;
    IncomingEventType: number;
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

export interface StateMachineRef {
    ErrorMessage?: string;
    StateMachineId: number;
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

export let getHeaderWithIncomingType = (): Header => {
    return {
        StateMachineCode: undefined,
        ComponentCode: undefined,
        MessageType: undefined,
        PublishTopic: undefined,
        SessionData: undefined,
        StateMachineId: undefined,
        WorkerId: undefined,
        EventCode: undefined,
        IncomingEventType: 0
    };
};

export class Serializer {
    public convertToWebsocketInputFormat(data: Data): string {
        let input = `${data.RoutingKey} ${data.ComponentCode} ${JSON.stringify(data.Event)}`;
        if (isDebugEnabled()) {
            log.debug(`Message send: ${input}`);
        }
        return input;
    };

    public convertCommandDataToWebsocketInputFormat(commandData: CommandData): string {
        let input = `${commandData.Command} ${JSON.stringify(commandData.Data)}`;
        if (isDebugEnabled()) {
            log.debug(`Message send: ${input}`);
        }
        return input;
    };

}

export class Deserializer {
    public getJsonDataFromGetModelRequest(stringData: string): CompositionModel {
        let jsonData = this.getJsonData(stringData);
        let components = [];
        let componentGraphical = jsonData.ModelContent.Components;
        for (let i = 0; i < jsonData.ModelContent.Components.length; i++) {
            let component = jsonData.ModelContent.Components[i];
            components.push({
                name: component.Name,
                model: this.decodeServerMessage(component.Model),
                graphical: this.decodeServerMessage(component.Graphical)
            });
        }
        return {
            projectName: jsonData.ModelContent.ProjectName,
            components: components,
            composition: this.decodeServerMessage(jsonData.ModelContent.Composition)
        };
    }

    public decodeServerMessage(b64Data: string): string {
        let charData = atob(b64Data).split("").map((x: string) => {
            return x.charCodeAt(0);
        });
        let binData = new Uint8Array(charData);
        let data = pako.inflate(binData).filter((x) => {
            return x !== 0;
        });
        let finalData = new Uint16Array(data);
        let strData = "";
        for (let i = 0; i < finalData.length; i++) {
            strData += String.fromCharCode(finalData[i]);
        }
        return strData;
    };

    public getJsonDataFromXcApiRequest(data: string): string {
        let jsonData = this.getJsonData(data);
        return jsonData.ApiFound ? this.decodeServerMessage(jsonData.Content) : null;
    };

    public getJsonDataFromGetXcApiListRequest(data: string): Array<String> {
        let jsonData = this.getJsonData(data);
        return jsonData.Apis;
    };

    public getJsonData(data: string): any {
        return JSON.parse(data.substring(data.indexOf("{"), data.lastIndexOf("}") + 1));
    }

    public getPosition(str: string, subString: string, index: number): number {
        return str.split(subString, index).join(subString).length;
    }

    public deserialize(data: string): DeserializedData {
        let s = data.split(" ");
        let command = s.splice(0, 1)[0];
        let topic = s.splice(0, 1)[0];
        let stringData = s.join(" ");
        return {
            command: command,
            topic: topic,
            stringData: stringData
        };
    }

    public deserializeWithoutTopic(data: string): DeserializedData {
        let s = data.split(" ");
        let command = s.splice(0, 1)[0];
        let stringData = s.join(" ");
        return {
            command: command,
            topic: undefined,
            stringData: stringData
        };
    }
}
