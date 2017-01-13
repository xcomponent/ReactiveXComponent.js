import xcWebSocketBridgeConfiguration from "configuration/xcWebSocketBridgeConfiguration";
import { ApiConfiguration } from "configuration/apiConfiguration";

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

    getEventToSend(componentName: string, stateMachineName: string, messageType: string, jsonMessage: any, visibilityPrivate: boolean, specifiedPrivateTopic: string) {
        const componentCode = this.configuration.getComponentCode(componentName);
        const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
        let headerConfig = this.getHeaderConfig(componentCode, stateMachineCode, messageType, visibilityPrivate, specifiedPrivateTopic);
        let event = {
            "Header": headerConfig.header,
            "JsonMessage": JSON.stringify(jsonMessage)
        };
        return {
            event: event,
            routingKey: headerConfig.routingKey
        };
    };

    canPublish(componentName: string, stateMachineName: string, messageType: string) {
        if (this.configuration.containsStateMachine(componentName, stateMachineName)) {
            const componentCode = this.configuration.getComponentCode(componentName);
            const stateMachineCode = this.configuration.getStateMachineCode(componentName, stateMachineName);
            return this.configuration.containsPublisher(componentCode, stateMachineCode, messageType);
        }

        return false;
    };

    send(componentName: string, stateMachineName: string, messageType: string, jsonMessage: any, visibilityPrivate: boolean = false, specifiedPrivateTopic: string = undefined) {
        let data = this.getEventToSend(componentName, stateMachineName, messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic);
        this
            .webSocket
            .send(this.convertToWebsocketInputFormat(data));
    };

    sendWithStateMachineRef(stateMachineRef: any, messageType: string, jsonMessage: any, visibilityPrivate: boolean = false, specifiedPrivateTopic: string = undefined) {
        let componentCode = stateMachineRef.ComponentCode;
        let stateMachineCode = stateMachineRef.StateMachineCode;
        let headerConfig = this.getHeaderConfig(componentCode, stateMachineCode, messageType, visibilityPrivate, specifiedPrivateTopic);
        let headerStateMachineRef = {
            "StateMachineId": {
                "Case": "Some",
                "Fields": [stateMachineRef.StateMachineId]
            },
            "AgentId": {
                "Case": "Some",
                "Fields": [stateMachineRef.AgentId]
            }
        };
        let event = {
            "Header": this.mergeJsonObjects(headerStateMachineRef, headerConfig.header),
            "JsonMessage": JSON.stringify(jsonMessage)
        };
        let dataToSend = {
            event: event,
            routingKey: headerConfig.routingKey
        };
        let webSocketInputFormat = this.convertToWebsocketInputFormat(dataToSend);
        this
            .webSocket
            .send(webSocketInputFormat);
    };

    getHeaderConfig(componentCode: number, stateMachineCode: number, messageType: string, visibilityPrivate: boolean, specifiedPrivateTopic: string) {
        let publisher = this
            .configuration
            .getPublisherDetails(componentCode, stateMachineCode, messageType);
        let thisObject = this;
        let publishTopic = undefined;
        let header = {
            "StateMachineCode": {
                "Case": "Some",
                "Fields": [stateMachineCode]
            },
            "ComponentCode": {
                "Case": "Some",
                "Fields": [componentCode]
            },
            "EventCode": publisher.eventCode,
            "IncomingType": 0,
            "MessageType": {
                "Case": "Some",
                "Fields": [messageType]
            },
            "PublishTopic": (!visibilityPrivate)
                ? undefined
                : {
                    "Case": "Some",
                    "Fields": [(specifiedPrivateTopic)
                        ? specifiedPrivateTopic
                        : thisObject.privateTopic]
                },
            "SessionData": (!this.sessionData)
                ? undefined
                : {
                    "Case": "Some",
                    "Fields": [this.sessionData]
                }
        };
        return { header: header, routingKey: publisher.routingKey };
    };

    private convertToWebsocketInputFormat(data) {
        let input = data.routingKey + " " + data.event.Header.ComponentCode.Fields[0] + " " + JSON.stringify(data.event);
        return input;
    };

    private mergeJsonObjects(obj1, obj2) {
        let merged = {};
        for (let key in obj1)
            merged[key] = obj1[key];
        for (let key in obj2)
            merged[key] = obj2[key];
        return merged;
    };

}

export default Publisher;