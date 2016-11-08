define(["../configuration/xcWebSocketBridgeConfiguration"], function (xcWebSocketBridgeConfiguration) {
    "use strict"

    var Publisher = function (webSocket, configuration, guid, privateSubscriber) {
        this.webSocket = webSocket;
        this.configuration = configuration;
        this.guid = guid;
        this.privateSubscriber = privateSubscriber;
        this.privateTopic = guid.create();
    }


    Publisher.prototype.getEventToSend = function (componentName, stateMachineName, messageType, jsonMessage, visibilityPrivate) {
        var codes = this.configuration.getCodes(componentName, stateMachineName);
        var headerConfig = this.getHeaderConfig(codes.componentCode, codes.stateMachineCode, messageType, visibilityPrivate);
        var event = {
            "Header": headerConfig.header,
            "JsonMessage": JSON.stringify(jsonMessage)
        };
        return {
            event: event,
            routingKey: headerConfig.routingKey
        };
    }


    Publisher.prototype.canPublish = function (componentName, stateMachineName, messageType) {
        if (this.configuration.codesExist(componentName, stateMachineName)) {
            var codes = this.configuration.getCodes(componentName, stateMachineName);
            if (this.configuration.publisherExist(codes.componentCode, codes.stateMachineCode, messageType)) {
                return true;
            }
        }
        return false;
    }


    Publisher.prototype.send = function (componentName, stateMachineName, messageType, jsonMessage, visibilityPrivate) {
        if (visibilityPrivate) {
            var topic = this.privateTopic;
            var kind = xcWebSocketBridgeConfiguration.kinds.Private;
            this.privateSubscriber.sendSubscribeRequestToPrivateTopic(topic, kind);
        }
        var data = this.getEventToSend(componentName, stateMachineName, messageType, jsonMessage, visibilityPrivate);
        this.webSocket.send(convertToWebsocketInputFormat(data));
    }


    Publisher.prototype.sendWithStateMachineRef = function (stateMachineRef, messageType, jsonMessage) {
        var componentCode = stateMachineRef.ComponentCode.Fields[0];
        var stateMachineCode = stateMachineRef.StateMachineCode.Fields[0];
        var headerConfig = this.getHeaderConfig(componentCode, stateMachineCode, messageType);
        var headerStateMachineRef = {
            "StateMachineId": stateMachineRef.StateMachineId,
            "AgentId": stateMachineRef.AgentId
        };
        var event = {
            "Header": mergeJsonObjects(headerStateMachineRef, headerConfig.header),
            "JsonMessage": JSON.stringify(jsonMessage)
        };
        var dataToSend = {
            event: event,
            routingKey: headerConfig.routingKey
        };
        var webSocketInputFormat = convertToWebsocketInputFormat(dataToSend);
        this.webSocket.send(webSocketInputFormat);
    }


    Publisher.prototype.getHeaderConfig = function (componentCode, stateMachineCode, messageType, visibilityPrivate) {
        var publisher = this.configuration.getPublisherDetails(componentCode, stateMachineCode, messageType);
        var thisObject = this;
        var header = {
            "StateMachineCode": { "Case": "Some", "Fields": [parseInt(stateMachineCode)] },
            "ComponentCode": { "Case": "Some", "Fields": [parseInt(componentCode)] },
            "EventCode": parseInt(publisher.eventCode),
            "IncomingType": 0,
            "MessageType": { "Case": "Some", "Fields": [messageType] },
            "PublishTopic": (!visibilityPrivate) ? undefined : { "Case": "Some", "Fields": [thisObject.privateTopic] }
        };
        return {
            header: header,
            routingKey: publisher.routingKey
        }
    }


    var convertToWebsocketInputFormat = function (data) {
        var input = data.routingKey + " " + data.event.Header.ComponentCode.Fields[0]
            + " " + JSON.stringify(data.event);
        return input;
    }


    var mergeJsonObjects = function (obj1, obj2) {
        var merged = {};
        for (var key in obj1)
            merged[key] = obj1[key];
        for (var key in obj2)
            merged[key] = obj2[key];
        return merged;
    }


    return Publisher;
});
