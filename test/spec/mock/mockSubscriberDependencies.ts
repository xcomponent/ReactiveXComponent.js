import { WebSocket, Server, SocketIO } from "mock-socket";
import { Subscriber } from "../../../src/communication/xcWebSocketSubscriber";
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

let guid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
let privateTopic = guid;

jsonMessage = {
    "StateMachineCode": stateMachineCode,
    "ComponentCode": componentCode,
    "ReplyTopic": { "Case": "Some", "Fields": [guid] },
    "PrivateTopic": {
        "Case": "Some",
        "Fields": [
            [privateTopic]
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

let snapshotResponseData = { "Header": { "EventCode": 0, "Probes": [], "IsContainsHashCode": false, "IncomingType": 0, "MessageType": { "Case": "Some", "Fields": ["XComponent.Common.Processing.SnapshotResponse"] } }, "JsonMessage": "{\"Items\":\"H4sIAAAAAAAEAItmiGUAAKZ0XTIEAAAA\"}" };
let getModelResponseData = { "ModelFound": true, "ApiName": "xcApi", "ModelContent": { "ProjectName": "HelloWorld", "Composition": "H4sIAAAAAAAEAMVVXU+DMBR9N/E/NH0HNvZiFthiUKPJNh82I68InVShJbSO7d9bikAL0xk39YXknvt17unNxZlu0wRsUM4wJS4cmgMIEAlphMmzC9/42riA08n5mTPD5FVgyzBGaQBEEmHjLYtcGHOejS2rKAqzGJk0f7bswWBo+fNZFQubYHw42MCE8YCECALMvAQjwi8zvIxpIcitg4RJR81Fg0mQIhfeoiShjzRPIihYAyB5o8ijaUaJqMYk2sc/SZehvreivlcmMGDpsCAn8QbVcSCG4WgehDEm6C66yWnqQhtWcG0bQwgSEVxZCgOJrqiKibpQ5WDtIeFYndkqIboo0/Sppe7qU+M9fUomLQ9hNRqpWij43hnlPP0xYUe40jtsZKsspU3ZSKQWKFrlAWGYi11mmv9joHJpcJolqI0DOGprf9lQ0b2S+UDPmtP1Rtm7Lh3pBKj8rnYZWkiV/eaRzFYT84Gh/P7pBYXcXAY76TiG9h5azoLy/lDdAm1QVULzi/Ltk//SJtjahMZpV8E+3NHuanqg5OgHJf9zu66E8ygVTr/U31XrL5daQ3vHtz6c+vFVz2wFNv/UyTvq1DYQiwcAAA==", "Components": [{ "Name": "HelloWorld", "Graphical": "H4sIAAAAAAAEAM1WTU/bQBC9V+p/iNwz6/2aj0VOOIBaIQFCoqrgaCUGrCZ2FBtC/30HSEJAS02tRqoPEbvs7JuZ92Zms4OH2XRwXyyasq6GiVE6GRTVuJ6U1c0wuWuv9zg5GH3+lB3Ws3ldFVX7oyyWp/WkmH5b5PPbcpxPj/I2H8g1VbP/0EyGyW3bzvfTdLlcqqVT9eImtVqb9PL05GJ8W8zyZHO47D68V1ZNm1fjIhEvBoPsos3bonn6e7167cixeGCSwaG4Wiwuh4mzm9XVMAkuGaQd1nbLGshvWRuw3eZuy5zcNjjy2jpLt+LIvi/yqilbYeA8b+Vo9fzP9dmTsvq5ifjlbDzsu8V9WRVNM0zO8jNZ19N6MUy+aP316UtW98hN53VZtc1mvd7Z2pCtyxGEoDSz0QQ+BAyIWXr5+tDVyBAoIA6OnAMbmLP0avvm9O3VcSz0WjF6SToZJz9gY1jeK3EE0fvg2GroicWgUOw9IBkwZE0My0pFeMMOiYw3NmA/MHJeWbQGSWJjzRBiYNopC6wBwVlk4+2fwVbrFwqz4+YsnxVHZTOf5r+Kyahd3BVZ+nZ3paT0HSl9RGl2F0pzEBQJG4wBwDzyGuEDFCEjM0mOHNrQjw//yIcOBnTwGjW4KJhDJWxZBO05GNMPCjQqDaQ9kuMAgXwMCsSfYIKWmECLYx3UvwtGpEwwOoAT6Vqp2WixslSZsZ7Im8Ce6b/VmdtNRwNlpZetPuZoRwtOEUsape2R0456MoKaREQdYNaA8iJ/sCiMGN9ByPvsa2kgevO5mNT+FRZbKdYOrL9N4i6VlqUvc/RZc4+vnnz64em6Iy2S8layZ60FQhctV0mijA6ZwNoZ6RA9hSi8g5HZwh7ZUYgTJn1IIAyyliHkgXs2PZTWGSwL8YEksGhYMus9eJlyVl4N0rN8Tyh0Sp4CKNkTRbvgonPcgdJkZKqiRpYq7Hg0dAvxOp82vZUYkV+WdrywR78Bz7tDUKsLAAA=", "Model": "H4sIAAAAAAAEANWWXW+bMBSG7yftPyDfF/JxM1XQqmqyLVroqpJ1uXXgJPFm7Mg2TbJfX4MBk4+SLWor7Q5jn3NeP359wL/epNR5AiEJZwHquh3kAIt5QtgiQJmaX3xC11cfP/i3PF1xBkw9EliHPAE6wAo7OprJy41MArRUanXpeev12l33XS4WXq/T6XrTcBzFS0gxqheT04svCJMKsxiQc4dTCNBPLmjyFSjlyHms5Pa6SGtzHD9SWEGI4yVhIItXey8LsSOtslslDDHDCxDIuc9mlMQhpDMQAUKO1xrfq+IfQPOQsB8/rUG5VrL7Q4L4PvsFsXLrOFPH9w61m8q7+zjcwJApsb3nhCnkjKQdBUiJTOePstkXgVfLb7ANULNICa3IPRFkoSlAEoJa8kTa3Xt12eM6ahBjzlf7CuaYyjYJvRYJ9czhnCku77T9Rowogin5k0Mvy41kBFQzhqRiMBGYSb2QM6M1wtvSQ2VmbfPhE+SSTx6cjfXOkGj0NBWWovcl2qimsY4IPk/HX6Myx/o6mHzvhUM+6bJ+5bKBrvm/uMxobUOnn1LO3GLCHcAcZ1QVg7OoleOyeVg191gpEMxMVv1mTNjvOpFde9hfzC4+C55asPrST7gd6tOZbFdQjFiCRYKc4QbirEgIFOt1+nsSgbrNpOLphKTAM9Ww/lmEcrNFK4jJnMQPGYUqnwUXYpUbYJHPNlva7nZbINTNzbp5F0R3F0SvAjF9PQKnrtc7YOjv9vhWL/TezgvvSsL37A0xTPK/I0wP741534btKLLykpkmckMbCWTdUAqQJRI8o82tVM2nEdbsZYfThax/h7rvf+8Nqxh7NTvfy7ssD+0Y/PL8jh6ab76mN1Lq7yklth8ON3mPxHRvxveO//FePQOeABKzMgsAAA==" }] } };
let getModelResponse = "getModel " + JSON.stringify(getModelResponseData);

let getXcApiNotFoundResponseData = { "ApiFound": false, "ApiName": "unknownApi" };
let getXcApiNotFoundResponse = "getXcApi " + JSON.stringify(getXcApiNotFoundResponseData);

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
    correctDataToSendSnapshot: correctDataToSendSnapshot,
    correctSnapshotRequest: correctSnapshotRequest,
    snapshotResponseData: snapshotResponseData,
    privateTopic: privateTopic,
    getModelResponse: getModelResponse,
    getXcApiNotFoundResponse: getXcApiNotFoundResponse,
    snapshotTopic: snapshotTopic,
    componentCode: componentCode,
    stateMachineCode: stateMachineCode
};

export default returnObj;
