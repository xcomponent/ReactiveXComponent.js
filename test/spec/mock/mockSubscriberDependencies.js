
define(["communication/xcWebSocketSubscriber", "mock-socket", "configuration/xcWebSocketBridgeConfiguration"], function (Susbcriber, MockSocket, webSocketConf) {
    "use strict";

    // Mocking configuration
    var outputTopic = "output.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldResponse";
    var snapshotTopic = "snapshot.1_0.HelloWorldMicroservice.HelloWorld";
    var configuration = jasmine.createSpyObj('configuration', ['getSubscriberTopic', 'getCodes', 'getHeaderConfig', 'convertToWebsocketInputFormat', 'getSnapshotTopic', 'getStateName', 'subscriberExist']);
    
    configuration.getSubscriberTopic.and.callFake(function (componentName, stateMachineName) {
        return outputTopic;
    });
    
    configuration.getSnapshotTopic.and.callFake(function (componentName) {
        return "snapshot.1_0.HelloWorldMicroservice.HelloWorld";
    });

    var stateName = "stateName";
    configuration.getStateName.and.callFake(function () {
        return stateName;
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
    var createWebSocket = function () {
        var webSocket = jasmine.createSpyObj('webSocket', ['send', 'addEventListener']);
        return webSocket;
    }

    //Initilisation of expected data
    var correctData = {
        "Header": { "IncomingType": 0 },
        "JsonMessage": JSON.stringify({ "Topic": { "Key": outputTopic, kind: webSocketConf.kinds.Public } })
    };


    var agentId = 1;
    var stateMachineId = 2;
    var jsonMessage = { key: 'value' };
    var jsonData = {
        Header: {
            StateMachineCode: { "Case": "Some",Fields: [parseInt(stateMachineCode)] },
            ComponentCode: { "Case": "Some", Fields: [parseInt(componentCode)] },
            StateMachineId: { "Case": "Some", Fields: [stateMachineId] },
            AgentId: { "Case": "Some", Fields: [agentId] },
            StateCode: { "Case": "Some", Fields: [0] }
        },
        JsonMessage: JSON.stringify(jsonMessage)
    };

    var correctReceivedData = {
        stateMachineRef: {
            "StateMachineCode": jsonData.Header.StateMachineCode,
            "ComponentCode": jsonData.Header.ComponentCode,
            "AgentId": { "Case": "Some", Fields: [agentId] },
            "StateName": { "Case": "Some", Fields: [stateName] },
            "send": function (jsonMessage) {
            }
        },
        jsonMessage: jsonMessage
    };

    var correctSubscribeRequest = "subscribe " + JSON.stringify(correctData);
    var correctUnsubscribeRequest = "unsubscribe " + JSON.stringify(correctData);

    var createMockServer = function (serverUrl) {
        return new MockServer(serverUrl);
    }

    var createMockWebSocket = function (serverUrl) {
        return new MockWebSocket(serverUrl);
    }


    var guiExample = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";

    var guid = jasmine.createSpyObj('guid', ['create']);
    guid.create.and.callFake(function () {
        return guiExample;
    });

    var jsonMessage = {
        "StateMachineCode": parseInt(stateMachineCode),
        "ComponentCode": parseInt(componentCode),
        "ReplyTopic": { "Case": "Some", "Fields": [guiExample] },
        "PrivateTopic": { "Case": "Some", "Fields": [[null]] }
    };
    var correctDataToSendSnapshot = {
        topic: snapshotTopic,
        componentCode: componentCode,
        data: {
            "Header": { "IncomingType": 0 },
            "JsonMessage": JSON.stringify(jsonMessage)
        }
    };

    var correctSnapshotRequest = correctDataToSendSnapshot.topic + " " + correctDataToSendSnapshot.componentCode
        + " " + JSON.stringify(correctDataToSendSnapshot.data);

    var snapshotResponse = guiExample + " " + '{"Header":{"EventCode":0,"Probes":[],"IsContainsHashCode":false,"IncomingType":0,"MessageType":{"Case":"Some","Fields":["XComponent.Common.Processing.SnapshotResponse"]}},"JsonMessage":"{\\"Items\\":\\"H4sIAAAAAAAEAItmiGUAAKZ0XTIEAAAA\\"}"}';

    var snapshotSubscribeRequest = "subscribe " + JSON.stringify({"Header":{"IncomingType":0},"JsonMessage":JSON.stringify({"Topic":{"Key":guiExample,"kind":1}})});
    var snapshotUnsubscribeRequest = "unsubscribe " + JSON.stringify({"Header":{"IncomingType":0},"JsonMessage":JSON.stringify({"Topic":{"Key":guiExample,"kind":1}})});

    return {
        configuration: configuration,
        createWebSocket: createWebSocket,
        correctData: correctData,
        jsonMessage: jsonMessage,
        jsonData: jsonData,
        correctReceivedData: correctReceivedData,
        correctSubscribeRequest: correctSubscribeRequest,
        correctUnsubscribeRequest: correctUnsubscribeRequest,
        createMockServer: createMockServer,
        createMockWebSocket: createMockWebSocket,
        guid: guid,
        correctDataToSendSnapshot: correctDataToSendSnapshot,
        correctSnapshotRequest: correctSnapshotRequest,
        snapshotResponse: snapshotResponse,
        snapshotSubscribeRequest: snapshotSubscribeRequest,
        snapshotUnsubscribeRequest: snapshotUnsubscribeRequest
    }
});
