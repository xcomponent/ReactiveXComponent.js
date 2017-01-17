import { WebSocket, Server, SocketIO } from "mock-socket";
import Subscriber from "../../../src/communication/xcWebSocketSubscriber";
import { Kinds } from "../../../src/configuration/xcWebSocketBridgeConfiguration";


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
    "JsonMessage": JSON.stringify({ "Topic": { "Key": outputTopic, kind: Kinds.Public } })
};


let agentId = 1;
let stateMachineId = 2;
let jsonMessage: any = { key: "value" };
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

let updateResponse = "update " + "topic " + JSON.stringify(jsonData);

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

let snapshotResponse = "snapshot " + guiExample + " " + "{\"Header\":{\"EventCode\":0,\"Probes\":[],\"IsContainsHashCode\":false,\"IncomingType\":0,\"MessageType\":{\"Case\":\"Some\",\"Fields\":[\"XComponent.Common.Processing.SnapshotResponse\"]}},\"JsonMessage\":\"{\\\"Items\\\":\\\"H4sIAAAAAAAEAItmiGUAAKZ0XTIEAAAA\\\"}\"}";

let snapshotSubscribeRequest = "subscribe " + JSON.stringify({ "Header": { "IncomingType": 0 }, "JsonMessage": JSON.stringify({ "Topic": { "Key": guiExample, "kind": 1 } }) });
let snapshotUnsubscribeRequest = "unsubscribe " + JSON.stringify({ "Header": { "IncomingType": 0 }, "JsonMessage": JSON.stringify({ "Topic": { "Key": guiExample, "kind": 1 } }) });

let getModelResponseData = { "ModelFound": true, "ApiName": "xcApi", "ModelContent": { "ProjectName": "HelloWorld", "Composition": "H4sIAAAAAAAEAMVVXU+DMBR9N/E/NH0HNvZiFthiUKPJNh82I68InVShJbSO7d9bikAL0xk39YXknvt17unNxZlu0wRsUM4wJS4cmgMIEAlphMmzC9/42riA08n5mTPD5FVgyzBGaQBEEmHjLYtcGHOejS2rKAqzGJk0f7bswWBo+fNZFQubYHw42MCE8YCECALMvAQjwi8zvIxpIcitg4RJR81Fg0mQIhfeoiShjzRPIihYAyB5o8ijaUaJqMYk2sc/SZehvreivlcmMGDpsCAn8QbVcSCG4WgehDEm6C66yWnqQhtWcG0bQwgSEVxZCgOJrqiKibpQ5WDtIeFYndkqIboo0/Sppe7qU+M9fUomLQ9hNRqpWij43hnlPP0xYUe40jtsZKsspU3ZSKQWKFrlAWGYi11mmv9joHJpcJolqI0DOGprf9lQ0b2S+UDPmtP1Rtm7Lh3pBKj8rnYZWkiV/eaRzFYT84Gh/P7pBYXcXAY76TiG9h5azoLy/lDdAm1QVULzi/Ltk//SJtjahMZpV8E+3NHuanqg5OgHJf9zu66E8ygVTr/U31XrL5daQ3vHtz6c+vFVz2wFNv/UyTvq1DYQiwcAAA==", "Components": [{ "Name": "HelloWorld", "Content": "H4sIAAAAAAAEAN1Y33PaRhB+70z/B436nJPu911GkOlgp/XUpJ5AU/woozNWKyRGJ4zpX9+VBEiADAkzSabVk7R3t/vd3vftHgTvXuaJ82xyG2dpz8XIdx2TTrMoTmc9d1k8vlHuu/6PPwSDbL7IUpMWn2KzGmaRSa7CInRgdWrfvtio5z4VxeKt561WK7SiKMtnHvF97E2Gt6Ppk5mH7m5yfH7ymzi1RZhOjet8COem5/5qkiT7M8uTyHU+beEq4QI2xwlus9lvZm0dr/4cFWFhhuH0KU6NrUwHxgr7DYDGx/6HYRrOTO46A9itySc919++31fv3kmP5NjjR2Mhd9a87vJu+ZDE06GZP5i85052yUaNE/SHNfnvD3+ZadvauN5s3Tvee41zPw/HCbhOi3x9l8Vp0YJJKEEaHsUkwwT7mrVwCwmLb2yzsOcW+RKgjJYPv+Th4gmOpOe28WB3AwJgwB7n4GmXTTCN83gGmTfR0BRPWWSbTHs70N272CX9NssWLfwAETEqeRs19TemfeiPYWJPYSdfhn03cjxWo7YfQEQ3aVzEYRL/Ux77BsGNHZkETtlE23yO8zC1MDFL602OwnXFgHKk8gxivX425S7OUqdZ631NiPU5fGt4NZY2ug3gQ3jNqrby2kED75UTPctFuuXiFWy0xUUl6REXpfqvc7He5JcfdL3ugnxvvjelrYFzFxaQ1LQe3FbD2zj9e+eomXtc/Rrevc+zeZNwmDDOmk+oM4Nl/lyWVgtVByr3eL2A5RPXuX4x02Xl3CThuqrqI1MMlrbI5uN4brJl0aLj5boojaOFmcaP8fTjMjE7p4MsyeDkfvL999XT4khFqz0aVJaWAUyTPhEKaaaBlZpzQqUKvMn+nPu+0BhJSjnjWFF4oTTw7tuevUPX3bGYD50FOorQAjo/o1x2BRM+IhzwUIl9TnyqLgvGqURlGMGlZFopTbqCMYmYIIJhyohSSsjLggnJAbTyuSRKYk6w6ArGYfvSx1xripmGfJ8OtvluzjAYhkVZC2YlB2xbSKBmoPRVbBfAQxP1S90G3qF1K659UZyQykGL3ZcJ+TyZwGAahXn0v1ALMBcJnwhKtYSTxF2nDNcPnwDVFcdUg7zOnPJroSTGZ0NpiUBHUvuCSCYupK7AiEhCQXeEgE787gqwF4nhS2UiPiPWXgLpmVDfXyQHvf+kSOh3FkkN8asKRCKJldRQ3KHG8U7acorKJgC/MFRZC9mFRVcKiqBxcY2JEoxSxTqDAb0V5Zop6CpciAvbiSIUScbKOBBNad3ZujhiwGpWBoRMXBxLMvCjsdg+na1LUySkr3yYxiXH/EywbymUwGsuYbVkyn8bwqSybu9p9S38Z2vhHp7Ezf3t+qW804XJwUjgdf8d0f8XjgF/O88QAAA=" }] } };
let getModelResponse = "getModel " + JSON.stringify(getModelResponseData);

let returnObj = {
    configuration: configuration,
    createWebSocket: createWebSocket,
    correctData: correctData,
    jsonMessage: jsonMessage,
    jsonData: jsonData,
    updateResponse: updateResponse,
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
    privateTopics: privateTopics,
    getModelResponse: getModelResponse
};

export default returnObj;