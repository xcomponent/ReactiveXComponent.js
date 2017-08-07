// Initialisation
let componentCode = -69981087;
let stateMachineCode = -829536631;
let eventCode = 9;
let messageType = "XComponent.HelloWorld.UserObject.SayHello";
let routingKey = "input.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldManager";
let guiExample = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
let sessionData = "sessiondata";

let guid = jasmine.createSpyObj("guid", ["create"]);
guid.create.and.callFake(function () {
    return guiExample;
});

function getHeader(visibility) {
    let header = {
        "StateMachineCode": stateMachineCode,
        "ComponentCode": componentCode,
        "EventCode": eventCode,
        "IncomingEventType": 0,
        "MessageType": messageType,
        "PublishTopic": (!visibility) ? undefined : guid.create(),
        "SessionData": sessionData
    };
    return header;
}


let jsonMessage = { "Name": "MY NAME" };

function getCorrectData(visibility) {
    return {
        event: {
            "Header": getHeader(visibility),
            "JsonMessage": JSON.stringify(jsonMessage)
        },
        routingKey: routingKey
    };
}

let correctData = getCorrectData(false);

function getCorretWebsocketInputFormat(visibility) {
    let correctData = getCorrectData(visibility);
    let correctWebsocketInputFormat = correctData.routingKey + " " + correctData.event.Header.ComponentCode
        + " " + JSON.stringify(correctData.event);
    return correctWebsocketInputFormat;
}

let stateMachineRef = {
    "StateMachineId": 1,
    "StateMachineCode": stateMachineCode,
    "ComponentCode": componentCode,
};
let correctDataForSMRef = {
    event: {
        "Header": {
            "StateMachineId": stateMachineRef.StateMachineId,
            "StateMachineCode": stateMachineRef.StateMachineCode,
            "ComponentCode": stateMachineRef.ComponentCode,
            "EventCode": eventCode,
            "IncomingEventType": 0,
            "MessageType": messageType,
            "SessionData": sessionData
        },
        "JsonMessage": JSON.stringify(jsonMessage)
    },
    routingKey: routingKey
};
let corretWebsocketInputFormatForSendSMRef = correctDataForSMRef.routingKey + " " + correctDataForSMRef.event.Header.ComponentCode
    + " " + JSON.stringify(correctDataForSMRef.event);


// Mocking configuration
let configuration = jasmine.createSpyObj("configuration", ["getComponentCode", "getStateMachineCode", "getPublisherDetails", "containsStateMachine", "containsPublisher"]);
configuration.getComponentCode.and.callFake(function (componentName) {
    if (!componentName){
        throw new Error();
    }
    return componentCode;
});
configuration.getStateMachineCode.and.callFake(function (componentName, stateMachineName) {
    if (!componentName || !stateMachineName){
        throw new Error();
    }
    return stateMachineCode;
});
configuration.getPublisherDetails.and.callFake(function (componentCode, stateMachineCode) {
    return {
        eventCode: eventCode,
        routingKey: routingKey
    };
});
configuration.containsStateMachine.and.callFake(function (componentName, stateMachineName) {
    if (!componentName || !stateMachineName) {
        return false;
    } else {
        return true;
    }
});

configuration.containsPublisher.and.callFake(function (compCode, stmCode, messageType) {
    return compCode === componentCode && stmCode === stateMachineCode;
});

// Mocking webSocket
let createMockWebSocket = function () {
    let webSocket = jasmine.createSpyObj("webSocket", ["send"]);
    return webSocket;
};

guiExample = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";

let returnObject = {
    configuration: configuration,
    createMockWebSocket: createMockWebSocket,
    jsonMessage: jsonMessage,
    messageType: messageType,
    correctData: correctData,
    getCorretWebsocketInputFormat: getCorretWebsocketInputFormat,
    stateMachineRef: stateMachineRef,
    corretWebsocketInputFormatForSendSMRef: corretWebsocketInputFormatForSendSMRef,
    guiExample: guiExample,
    sessionData: sessionData
};

export default returnObject;