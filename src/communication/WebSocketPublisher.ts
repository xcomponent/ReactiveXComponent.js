import { ApiConfiguration } from "../configuration/apiConfiguration";
import { Header, Event, Data, Serializer, StateMachineRef } from "./xcomponentMessages";
import { Publisher } from "../interfaces/Publisher";

export class WebSocketPublisher implements Publisher {
    public webSocket: WebSocket;
    public privateTopic: string;
    public sessionData: string;
    private serializer: Serializer;

    constructor(webSocket: WebSocket, public configuration: ApiConfiguration, privateTopic: string, sessionData: string) {
        this.webSocket = webSocket;
        this.privateTopic = privateTopic;
        this.sessionData = sessionData;
        this.serializer = new Serializer();
    }

    public send(componentName: string, stateMachineName: string, messageType: string, jsonMessage: any, visibilityPrivate: boolean = false, specifiedPrivateTopic: string = undefined): void {
        let data = this.getDataToSend(componentName, stateMachineName, messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic);
        let webSocketInput = this.serializer.convertToWebsocketInputFormat(data);
        this.webSocket.send(webSocketInput);
    };

    public sendWithStateMachineRef(stateMachineRef: StateMachineRef, messageType: string, jsonMessage: any, visibilityPrivate: boolean = false, specifiedPrivateTopic: string = undefined): void {
        let data = this.getDataToSendWithStateMachineRef(stateMachineRef, messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic);
        let webSocketInput = this.serializer.convertToWebsocketInputFormat(data);
        this.webSocket.send(webSocketInput);
    };

    public canPublish(componentName: string, stateMachineName: string, messageType: string): boolean {
        if (this.configuration.containsStateMachine(componentName, stateMachineName)) {
            const componentCode = this.configuration.getComponentCode(componentName);
            const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
            return this.configuration.containsPublisher(componentCode, stateMachineCode, messageType);
        }
        return false;
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

    private getHeaderConfig(componentCode: number, stateMachineCode: number, messageType: string, visibilityPrivate: boolean, specifiedPrivateTopic: string, stateMachineId: number = undefined, workerId: number = undefined): Header {
        return {
            "WorkerId": workerId,
            "StateMachineId": stateMachineId,
            "StateMachineCode": stateMachineCode,
            "ComponentCode": componentCode,
            "EventCode": this.configuration.getPublisherDetails(componentCode, stateMachineCode, messageType).eventCode,
            "IncomingEventType": 0,
            "MessageType": messageType,
            "PublishTopic": (!visibilityPrivate) ? undefined : ((specifiedPrivateTopic) ? specifiedPrivateTopic : this.privateTopic),
            "SessionData": this.sessionData
        };
    };

    private getRoutingKey(componentCode: number, stateMachineCode: number, messageType: string): string {
        let publisher = this.configuration.getPublisherDetails(componentCode, stateMachineCode, messageType);
        return publisher.routingKey;
    }

    private getDataToSendWithStateMachineRef(stateMachineRef: any, messageType: string, jsonMessage: any, visibilityPrivate: boolean = false, specifiedPrivateTopic: string = undefined): Data {
        let componentCode = stateMachineRef.ComponentCode;
        let stateMachineCode = stateMachineRef.StateMachineCode;
        let headerConfig = this.getHeaderConfig(componentCode, stateMachineCode, messageType, visibilityPrivate, specifiedPrivateTopic, stateMachineRef.StateMachineId, stateMachineRef.WorkerId);
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
}