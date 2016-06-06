
define(["communication/xcWebSocketSubscriber", "mock-socket"], function (Susbcriber, MockSocket) {
    "use strict";

    // Mocking configuration
    var configuration = jasmine.createSpyObj('configuration', ['getSubscriberTopic', 'getCodes']);
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

    // Mocking webSocket
    var webSocket = jasmine.createSpyObj('webSocket', ['send', 'addEventListener']);

    //Initilisation of expected data
    var correctData = {
        "Header": { "IncomingType": 0 },
        "JsonMessage": JSON.stringify({ "Topic": { "Key": "output.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldResponse" } })
    };

    var corretWebsocketInputFormat = "subscribe " + JSON.stringify(correctData);

    var jsonMessage = "JsonMessage";
    var jsonData = {
        Header: {
            ComponentCode: { Fields: [componentCode] },
            StateMachineCode: { Fields: [stateMachineCode] },
            StateMachineId: "",
            AgentId: "",
            JsonMessage: jsonMessage
        }
    };
    var correctReceivedData = {
        stateMachineRef: {
            "StateMachineId": jsonData.Header.StateMachineId,
            "AgentId": jsonData.Header.AgentId,
            "StateMachineCode": jsonData.Header.StateMachineCode,
            "ComponentCode": jsonData.Header.ComponentCode
        },
        JsonMessage: jsonData.JsonMessage
    };

    var correctSubscribeRequest = "subscribe " + JSON.stringify(correctData);

    var createMockServer = function (serverUrl) {
        return new MockServer(serverUrl);
    }

    var createMockWebSocket = function (serverUrl) {
        return new MockWebSocket(serverUrl);
    }

    return {
        configuration: configuration,
        webSocket: webSocket,
        correctData: correctData,
        corretWebsocketInputFormat: corretWebsocketInputFormat,
        jsonData: jsonData,
        correctReceivedData: correctReceivedData,
        correctSubscribeRequest: correctSubscribeRequest,
        createMockServer: createMockServer,
        createMockWebSocket: createMockWebSocket
    }
});
