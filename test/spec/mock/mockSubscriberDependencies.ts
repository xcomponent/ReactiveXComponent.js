import { WebSocket, Server, SocketIO } from "mock-socket";
import Subscriber from "communication/xcWebSocketSubscriber";
import webSocketConf from "configuration/xcWebSocketBridgeConfiguration";


// Mocking configuration
let outputTopic = "output.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldResponse";
let snapshotTopic = "snapshot.1_0.HelloWorldMicroservice.HelloWorld";
let configuration = jasmine.createSpyObj("configuration", ["getSubscriberTopic", "getComponentCode", "getStateMachineCode", "getHeaderConfig", "convertToWebsocketInputFormat", "getSnapshotTopic", "getStateName", "containsSubscriber"]);

configuration.getSubscriberTopic.and.callFake(function (componentCode, stateMachineCode, type) {
    return outputTopic;
});

configuration.getSnapshotTopic.and.callFake(function (componentCode) {
    return "snapshot.1_0.HelloWorldMicroservice.HelloWorld";
});

let stateName = "stateName";
configuration.getStateName.and.callFake(function () {
    return stateName;
});
let componentCode = -69981087;
let stateMachineCode = -829536631;
configuration.getComponentCode.and.callFake(function (componentName, stateMachineName) {
    return componentCode;
});
configuration.getStateMachineCode.and.callFake(function (componentName, stateMachineName) {
    return stateMachineCode;
});


// Mocking webSocket
let createWebSocket = function () {
    let webSocket = jasmine.createSpyObj("webSocket", ["send", "addEventListener", "getWebSocketCore", "close"]);
    webSocket.getWebSocketCore.and.callFake(function (componentName, stateMachineName) {
    return {};
});

    return webSocket;
};

// Initilisation of expected data
let correctData = {
    "Header": { "IncomingType": 0 },
    "JsonMessage": JSON.stringify({ "Topic": { "Key": outputTopic, kind: webSocketConf.kinds.Public } })
};


let agentId = 1;
let stateMachineId = 2;
let jsonMessage:any = { key: "value" };
let jsonData = {
    Header: {
        StateMachineCode: { "Case": "Some", Fields: [stateMachineCode] },
        ComponentCode: { "Case": "Some", Fields: [componentCode] },
        StateMachineId: { "Case": "Some", Fields: [stateMachineId] },
        AgentId: { "Case": "Some", Fields: [agentId] },
        StateCode: { "Case": "Some", Fields: [0] }
    },
    JsonMessage: JSON.stringify(jsonMessage)
};

let correctReceivedData = {
    stateMachineRef: {
        "StateMachineCode": jsonData.Header.StateMachineCode.Fields[0],
        "ComponentCode": jsonData.Header.ComponentCode.Fields[0],
        "AgentId": agentId,
        "StateName": stateName,
        "send": function (jsonMessage) { }
    },
    jsonMessage: jsonMessage
};

let correctSubscribeRequest = "subscribe " + JSON.stringify(correctData);
let correctUnsubscribeRequest = "unsubscribe " + JSON.stringify(correctData);

let createMockServer = function (serverUrl) {
    return new Server(serverUrl);
};

let createMockWebSocket = function (serverUrl) {
    //window["WebSocket"] = WebSocket;
    let mockWebSocket = new WebSocket(serverUrl);            
    return mockWebSocket;
};


let guiExample = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
let privateTopics = [guiExample];

let guid = jasmine.createSpyObj("guid", ["create"]);
guid.create.and.callFake(function () {
    return guiExample;
});

jsonMessage = {
    "StateMachineCode": stateMachineCode,
    "ComponentCode": componentCode,
    "ReplyTopic": { "Case": "Some", "Fields": [guiExample] },
    "PrivateTopic": {
        "Case": "Some",
        "Fields": [
            privateTopics
        ]
    }
};
let correctDataToSendSnapshot = {
    topic: snapshotTopic,
    componentCode: componentCode,
    data: {
        "Header": { "IncomingType": 0 },
        "JsonMessage": JSON.stringify(jsonMessage)
    }
};

let correctSnapshotRequest = correctDataToSendSnapshot.topic + " " + correctDataToSendSnapshot.componentCode +
    " " + JSON.stringify(correctDataToSendSnapshot.data);

let snapshotResponse = guiExample + " " + "{\"Header\":{\"EventCode\":0,\"Probes\":[],\"IsContainsHashCode\":false,\"IncomingType\":0,\"MessageType\":{\"Case\":\"Some\",\"Fields\":[\"XComponent.Common.Processing.SnapshotResponse\"]}},\"JsonMessage\":\"{\\\"Items\\\":\\\"H4sIAAAAAAAEAItmiGUAAKZ0XTIEAAAA\\\"}\"}";

let snapshotSubscribeRequest = "subscribe " + JSON.stringify({ "Header": { "IncomingType": 0 }, "JsonMessage": JSON.stringify({ "Topic": { "Key": guiExample, "kind": 1 } }) });
let snapshotUnsubscribeRequest = "unsubscribe " + JSON.stringify({ "Header": { "IncomingType": 0 }, "JsonMessage": JSON.stringify({ "Topic": { "Key": guiExample, "kind": 1 } }) });

let returnObj = {
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
    snapshotUnsubscribeRequest: snapshotUnsubscribeRequest,
    privateTopics: privateTopics
};

export default returnObj;