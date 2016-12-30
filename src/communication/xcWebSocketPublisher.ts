import xcWebSocketBridgeConfiguration from "configuration/xcWebSocketBridgeConfiguration";

let Publisher = function (webSocket, configuration, privateTopic, sessionData) {
    this.webSocket = webSocket;
    this.configuration = configuration;
    this.privateTopic = privateTopic;
    this.sessionData = sessionData;
};


Publisher.prototype.getEventToSend = function (componentName, stateMachineName, messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic) {
    let codes = this.configuration.getCodes(componentName, stateMachineName);
    let headerConfig = this.getHeaderConfig(codes.componentCode, codes.stateMachineCode, messageType, visibilityPrivate, specifiedPrivateTopic);
    let event = {
        "Header": headerConfig.header,
        "JsonMessage": JSON.stringify(jsonMessage)
    };
    return {
        event: event,
        routingKey: headerConfig.routingKey
    };
};


Publisher.prototype.canPublish = function (componentName, stateMachineName, messageType) {
    if (this.configuration.codesExist(componentName, stateMachineName)) {
        let codes = this.configuration.getCodes(componentName, stateMachineName);
        if (this.configuration.publisherExist(codes.componentCode, codes.stateMachineCode, messageType)) {
            return true;
        }
    }
    return false;
};


Publisher.prototype.send = function (componentName, stateMachineName, messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic) {
    let data = this.getEventToSend(componentName, stateMachineName, messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic);
    this.webSocket.send(convertToWebsocketInputFormat(data));
};


Publisher.prototype.sendWithStateMachineRef = function (stateMachineRef, messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic) {
    let componentCode = stateMachineRef.ComponentCode;
    let stateMachineCode = stateMachineRef.StateMachineCode;
    let headerConfig = this.getHeaderConfig(componentCode, stateMachineCode, messageType, visibilityPrivate, specifiedPrivateTopic);
    let headerStateMachineRef = {
        "StateMachineId": { "Case": "Some", "Fields": [stateMachineRef.StateMachineId] },
        "AgentId": { "Case": "Some", "Fields": [stateMachineRef.AgentId] }
    };
    let event = {
        "Header": mergeJsonObjects(headerStateMachineRef, headerConfig.header),
        "JsonMessage": JSON.stringify(jsonMessage)
    };
    let dataToSend = {
        event: event,
        routingKey: headerConfig.routingKey
    };
    let webSocketInputFormat = convertToWebsocketInputFormat(dataToSend);
    this.webSocket.send(webSocketInputFormat);
};


Publisher.prototype.getHeaderConfig = function (componentCode, stateMachineCode, messageType, visibilityPrivate, specifiedPrivateTopic) {
    let publisher = this.configuration.getPublisherDetails(componentCode, stateMachineCode, messageType);
    let thisObject = this;
    let publishTopic = undefined;
    let header = {
        "StateMachineCode": { "Case": "Some", "Fields": [parseInt(stateMachineCode)] },
        "ComponentCode": { "Case": "Some", "Fields": [parseInt(componentCode)] },
        "EventCode": parseInt(publisher.eventCode),
        "IncomingType": 0,
        "MessageType": { "Case": "Some", "Fields": [messageType] },
        "PublishTopic": (!visibilityPrivate) ? undefined : { "Case": "Some", "Fields": [(specifiedPrivateTopic) ? specifiedPrivateTopic : thisObject.privateTopic] },
        "SessionData": (!this.sessionData) ? undefined : { "Case": "Some", "Fields": [this.sessionData] }
    };
    return {
        header: header,
        routingKey: publisher.routingKey
    };
};


let convertToWebsocketInputFormat = function (data) {
    let input = data.routingKey + " " + data.event.Header.ComponentCode.Fields[0] +
        " " + JSON.stringify(data.event);
    return input;
};


let mergeJsonObjects = function (obj1, obj2) {
    let merged = {};
    for (let key in obj1)
        merged[key] = obj1[key];
    for (let key in obj2)
        merged[key] = obj2[key];
    return merged;
};


export default Publisher;