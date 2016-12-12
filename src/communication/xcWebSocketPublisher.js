define(["../configuration/xcWebSocketBridgeConfiguration"], function(xcWebSocketBridgeConfiguration) {
    "use strict"

    var Publisher = function(webSocket, configuration, privateTopic, sessionData) {
        this.webSocket = webSocket;
        this.configuration = configuration;
        this.privateTopic = privateTopic;
        this.sessionData = sessionData;        
    }


    Publisher.prototype.getEventToSend = function(componentName, stateMachineName, messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic) {
        var codes = this.configuration.getCodes(componentName, stateMachineName);
        var headerConfig = this.getHeaderConfig(codes.componentCode, codes.stateMachineCode, messageType, visibilityPrivate, specifiedPrivateTopic);        
        var event = {
            "Header": headerConfig.header,
            "JsonMessage": JSON.stringify(jsonMessage)
        };
        return {
            event: event,
            routingKey: headerConfig.routingKey
        };
    }


    Publisher.prototype.canPublish = function(componentName, stateMachineName, messageType) {
        if (this.configuration.codesExist(componentName, stateMachineName)) {
            var codes = this.configuration.getCodes(componentName, stateMachineName);
            if (this.configuration.publisherExist(codes.componentCode, codes.stateMachineCode, messageType)) {
                return true;
            }
        }
        return false;
    }


    Publisher.prototype.send = function(componentName, stateMachineName, messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic) {
        var data = this.getEventToSend(componentName, stateMachineName, messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic);
        this.webSocket.send(convertToWebsocketInputFormat(data));
    }


    Publisher.prototype.sendWithStateMachineRef = function(stateMachineRef, messageType, jsonMessage, visibilityPrivate, specifiedPrivateTopic) {
        var componentCode = stateMachineRef.ComponentCode;
        var stateMachineCode = stateMachineRef.StateMachineCode;
        var headerConfig = this.getHeaderConfig(componentCode, stateMachineCode, messageType, visibilityPrivate, specifiedPrivateTopic);
        var headerStateMachineRef = {
            "StateMachineId": { "Case": "Some", "Fields": [stateMachineRef.StateMachineId] },
            "AgentId": { "Case": "Some", "Fields": [stateMachineRef.AgentId] }
        };
        var event = {
            "Header": mergeJsonObjects(headerStateMachineRef, headerConfig.header),
            "JsonMessage": JSON.stringify(jsonMessage)
        };
        var dataToSend = {
            event: event,
            routingKey: headerConfig.routingKey
        };
        console.error(this.sessionData);
        console.error(headerConfig.header);
        var webSocketInputFormat = convertToWebsocketInputFormat(dataToSend);        
        this.webSocket.send(webSocketInputFormat);
    }


    Publisher.prototype.getHeaderConfig = function(componentCode, stateMachineCode, messageType, visibilityPrivate, specifiedPrivateTopic) {
        var publisher = this.configuration.getPublisherDetails(componentCode, stateMachineCode, messageType);
        var thisObject = this;
        var publishTopic = undefined;
        var header = {
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
        }
    }


    var convertToWebsocketInputFormat = function(data) {
        var input = data.routingKey + " " + data.event.Header.ComponentCode.Fields[0] +
            " " + JSON.stringify(data.event);
        return input;
    }


    var mergeJsonObjects = function(obj1, obj2) {
        var merged = {};
        for (var key in obj1)
            merged[key] = obj1[key];
        for (var key in obj2)
            merged[key] = obj2[key];
        return merged;
    }


    return Publisher;
});