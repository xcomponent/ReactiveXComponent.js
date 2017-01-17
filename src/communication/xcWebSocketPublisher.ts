import { ApiConfiguration } from "configuration/apiConfiguration";
import { FSharpFormat, getFSharpFormat } from "configuration/FSharpConfiguration";

interface Header {
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

interface Event {
    Header: Header;
    JsonMessage: string;
}

interface Data {
    RoutingKey: string;
    ComponentCode: number;
    Event: Event;
}

class Publisher {

    public webSocket: WebSocket;
    public configuration: ApiConfiguration;
    public privateTopic: string;
    public sessionData: string;

    constructor(webSocket: WebSocket, configuration: ApiConfiguration, privateTopic: string, sessionData: string) {
        this.webSocket = webSocket;
        this.configuration = configuration;
        this.privateTopic = privateTopic;
        this.sessionData = sessionData;
    }

    send(componentName: string, stateMachineName: string, messageType: string, jsonMessage: any, visibilityPrivate: boolean = false, specifiedPrivateTopic: string = undefined): void {
        let data = this.getDataToSend(componentName, stateMachineName, messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic);
        let webSocketInput = this.convertToWebsocketInputFormat(data);
        this.webSocket.send(webSocketInput);
    };

    private getDataToSend(componentName: string, stateMachineName: string, messageType: string, jsonMessage: any, visibilityPrivate: boolean = false, specifiedPrivateTopic: string = undefined): Data {
        const componentCode = this.configuration.getComponentCode(componentName);
        const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
        let headerConfig = this.getHeaderConfig(componentCode, stateMachineCode, messageType, visibilityPrivate, specifiedPrivateTopic);
        const routingKey = this.getRoutingKey(componentCode, stateMachineCode, messageType);
        return {
            "RoutingKey": routingKey,
            "ComponentCode": componentCode,
            "Event": {
                "Header": headerConfig,
                "JsonMessage": JSON.stringify(jsonMessage)
            }
        };
    }

    private getHeaderConfig(componentCode: number, stateMachineCode: number, messageType: string, visibilityPrivate: boolean, specifiedPrivateTopic: string, stateMachineId: number = undefined, agentId: number = undefined): Header {
        return {
            "StateMachineId": getFSharpFormat(stateMachineId),
            "AgentId": getFSharpFormat(agentId),
            "StateMachineCode": getFSharpFormat(stateMachineCode),
            "ComponentCode": getFSharpFormat(componentCode),
            "EventCode": this.configuration.getPublisherDetails(componentCode, stateMachineCode, messageType).eventCode,
            "IncomingType": 0,
            "MessageType": getFSharpFormat(messageType),
            "PublishTopic": (!visibilityPrivate) ? undefined : getFSharpFormat((specifiedPrivateTopic) ? specifiedPrivateTopic : this.privateTopic),
            "SessionData": getFSharpFormat(this.sessionData)
        };
    };

    private getRoutingKey(componentCode, stateMachineCode, messageType): string {
        let publisher = this.configuration.getPublisherDetails(componentCode, stateMachineCode, messageType);
        return publisher.routingKey;
    }

    sendWithStateMachineRef(stateMachineRef: any, messageType: string, jsonMessage: any, visibilityPrivate: boolean = false, specifiedPrivateTopic: string = undefined): void {
        let data = this.getDataToSendWithStateMachineRef(stateMachineRef, messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic);
        let webSocketInput = this.convertToWebsocketInputFormat(data);
        this.webSocket.send(webSocketInput);
    };


    private getDataToSendWithStateMachineRef(stateMachineRef: any, messageType: string, jsonMessage: any, visibilityPrivate: boolean = false, specifiedPrivateTopic: string = undefined): Data {
        let componentCode = stateMachineRef.ComponentCode;
        let stateMachineCode = stateMachineRef.StateMachineCode;
        let headerConfig = this.getHeaderConfig(componentCode, stateMachineCode, messageType, visibilityPrivate, specifiedPrivateTopic, stateMachineRef.StateMachineId, stateMachineRef.AgentId);
        let routingKey = this.getRoutingKey(componentCode, stateMachineCode, messageType);
        return {
            "RoutingKey": routingKey,
            "ComponentCode": componentCode,
            "Event": {
                "Header": headerConfig,
                "JsonMessage": JSON.stringify(jsonMessage)
            }
        };
    }

    canPublish(componentName: string, stateMachineName: string, messageType: string): boolean {
        if (this.configuration.containsStateMachine(componentName, stateMachineName)) {
            const componentCode = this.configuration.getComponentCode(componentName);
            const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
            return this.configuration.containsPublisher(componentCode, stateMachineCode, messageType);
        }
        return false;
    };

    private convertToWebsocketInputFormat(data: Data): string {
        let input = data.RoutingKey + " " + data.ComponentCode + " " + JSON.stringify(data.Event);
        return input;
    };

}

export default Publisher;