import xcWebSocketBridgeConfiguration from "configuration/xcWebSocketBridgeConfiguration";
import Configuration from "configuration/xcConfiguration";

class Publisher {

    public webSocket : WebSocket;
    public configuration : Configuration;
    public privateTopic : string;
    public sessionData : string;

    constructor(webSocket : WebSocket, configuration : Configuration, privateTopic : string, sessionData : string) {
        this.webSocket = webSocket;
        this.configuration = configuration;
        this.privateTopic = privateTopic;
        this.sessionData = sessionData;
    }

    getEventToSend(componentName : string, stateMachineName : string, messageType : string, jsonMessage : any, visibilityPrivate : boolean, specifiedPrivateTopic : string) {
        let codes = this
            .configuration
            .getCodes(componentName, stateMachineName);
        let headerConfig = this.getHeaderConfig(codes.componentCode, codes.stateMachineCode, messageType, visibilityPrivate, specifiedPrivateTopic);
        let event = {
            "Header": headerConfig.header,
            "JsonMessage": JSON.stringify(jsonMessage)
        };
        return {event: event, routingKey: headerConfig.routingKey};
    };

    canPublish(componentName : string, stateMachineName : string, messageType : string) {
        if (this.configuration.codesExist(componentName, stateMachineName)) {
            let codes = this
                .configuration
                .getCodes(componentName, stateMachineName);
            if (this.configuration.publisherExist(codes.componentCode, codes.stateMachineCode, messageType)) {
                return true;
            }
        }
        return false;
    };

    send(componentName : string, stateMachineName : string, messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic) {
        let data = this.getEventToSend(componentName, stateMachineName, messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic);
        this
            .webSocket
            .send(this.convertToWebsocketInputFormat(data));
    };

    sendWithStateMachineRef(stateMachineRef, messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic) {
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

    getHeaderConfig(componentCode, stateMachineCode, messageType, visibilityPrivate, specifiedPrivateTopic) {
        let publisher = this
            .configuration
            .getPublisherDetails(componentCode, stateMachineCode, messageType);
        let thisObject = this;
        let publishTopic = undefined;
        let header = {
            "StateMachineCode": {
                "Case": "Some",
                "Fields": [parseInt(stateMachineCode)]
            },
            "ComponentCode": {
                "Case": "Some",
                "Fields": [parseInt(componentCode)]
            },
            "EventCode": parseInt(publisher.eventCode),
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
        return {header: header, routingKey: publisher.routingKey};
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