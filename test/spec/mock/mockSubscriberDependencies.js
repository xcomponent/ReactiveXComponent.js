
define(["communication/xcWebSocketSubscriber", "mock-socket"], function (Susbcriber, MockSocket) {
    "use strict";

    // Mocking configuration
    var configuration = jasmine.createSpyObj('configuration', ['getSubscriberTopic', 'getCodes', 'getEventWithoutStateMachineRef', 'convertToWebsocketInputFormat']);
    configuration.getSubscriberTopic.and.callFake(function (componentName, stateMachineName) {
        return "output.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldResponse";
    });
    var componentCode = "-69981087";
    var stateMachineCode = "-829536631";
    configuration.getCodes.and.callFake(function (componentName, stateMachineName) {
        return {
            componentCode: componentCode,
            stateMachineCode: stateMachineCode
        };
    });
    var eventCode = "9";
    var messageType = "XComponent.HelloWorld.UserObject.SayHello";
    var routingKey = "input.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldManager";
    configuration.getEventWithoutStateMachineRef.and.callFake(function () {
        var header = {
            "StateMachineCode": {"Fields": [parseInt(stateMachineCode)] },
            "ComponentCode": { "Fields": [parseInt(componentCode)] },
            "EventCode": parseInt(eventCode),
            "IncomingType": 0,
            "MessageType": { "Fields": [messageType] }
        };
        return {
            header: header,
            routingKey: routingKey
        }
    });


    configuration.convertToWebsocketInputFormat.and.callFake(function (data) {
        var input = data.routingKey + " " + data.event.Header.ComponentCode.Fields[0]
               + " " + JSON.stringify(data.event);
        return input;
    });

    // Mocking webSocket
    var createWebSocket = function () {
        var webSocket = jasmine.createSpyObj('webSocket', ['send', 'addEventListener']);
        return webSocket;
    }

    //Initilisation of expected data
    var correctData = {
        "Header": { "IncomingType": 0 },
        "JsonMessage": JSON.stringify({ "Topic": { "Key": "output.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldResponse" } })
    };

    var corretWebsocketInputFormat = "subscribe " + JSON.stringify(correctData);

    var agentId = 1;
    var stateMachineId = 2;
    var jsonMessage = { "key": "value" };
    var jsonData = {
        Header: {
            StateMachineCode: { Fields: [parseInt(stateMachineCode)] },
            ComponentCode: { Fields: [parseInt(componentCode)] },
            StateMachineId: { Fields: [stateMachineId] },
            AgentId: { Fields: [agentId] }
        },
        JsonMessage: jsonMessage
    };

    var correctReceivedData = {
        stateMachineRef: {
            "StateMachineCode": jsonData.Header.StateMachineCode,
            "ComponentCode": jsonData.Header.ComponentCode,
            "send": function (jsonMessage) {
            }
        },
        jsonMessage: jsonData.JsonMessage
    };

    var correctSubscribeRequest = "subscribe " + JSON.stringify(correctData);

    var eventToSendStateMachineRef = {
        "Header": {
            "StateMachineId": { Fields: [stateMachineId] },
            "AgentId": { Fields: [agentId] },
            "StateMachineCode": { Fields: [parseInt(stateMachineCode)] },
            "ComponentCode": { Fields: [parseInt(componentCode)] },
            "EventCode": parseInt(eventCode),
            "IncomingType": 0,
            "MessageType": {Fields: [messageType] }
        },
        "JsonMessage": JSON.stringify(jsonMessage)
    };

    var correctInputToWebSocket = routingKey + " " + eventToSendStateMachineRef.Header.ComponentCode.Fields[0]
       + " " + JSON.stringify(eventToSendStateMachineRef);

    var createMockServer = function (serverUrl) {
        return new MockServer(serverUrl);
    }

    var createMockWebSocket = function (serverUrl) {
        return new MockWebSocket(serverUrl);
    }

    return {
        configuration: configuration,
        createWebSocket: createWebSocket,
        correctData: correctData,
        jsonMessage: jsonMessage,
        corretWebsocketInputFormat: corretWebsocketInputFormat,
        jsonData: jsonData,
        correctReceivedData: correctReceivedData,
        correctSubscribeRequest: correctSubscribeRequest,
        createMockServer: createMockServer,
        createMockWebSocket: createMockWebSocket,
        correctInputToWebSocket: correctInputToWebSocket
    }
});
