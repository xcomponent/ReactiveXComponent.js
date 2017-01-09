// Initialisation
let componentCode = "-69981087";
let stateMachineCode = "-829536631";
let eventCode = "9";
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
        "StateMachineCode": { "Case": "Some", "Fields": [parseInt(stateMachineCode)] },
        "ComponentCode": { "Case": "Some", "Fields": [parseInt(componentCode)] },
        "EventCode": parseInt(eventCode),
        "IncomingType": 0,
        "MessageType": { "Case": "Some", "Fields": [messageType] },
        "PublishTopic": (!visibility) ? undefined : { "Case": "Some", "Fields": [guid.create()] },
        "SessionData": { "Case": "Some", "Fields": [sessionData] }
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
    let correctWebsocketInputFormat = correctData.routingKey + " " + correctData.event.Header.ComponentCode.Fields[0]
        + " " + JSON.stringify(correctData.event);
    return correctWebsocketInputFormat;
}

let stateMachineRef = {
    "StateMachineId": 1,
    "AgentId": 2,
    "StateMachineCode": parseInt(stateMachineCode),
    "ComponentCode": parseInt(componentCode),
};
let correctDataForSMRef = {
    event: {
        "Header": {
            "StateMachineId": { "Case": "Some", "Fields": [stateMachineRef.StateMachineId] },
            "AgentId": { "Case": "Some", "Fields": [stateMachineRef.AgentId] },
            "StateMachineCode": { "Case": "Some", "Fields": [stateMachineRef.StateMachineCode] },
            "ComponentCode": { "Case": "Some", "Fields": [stateMachineRef.ComponentCode] },
            "EventCode": parseInt(eventCode),
            "IncomingType": 0,
            "MessageType": { "Case": "Some", "Fields": [messageType] },
            "SessionData": { "Case": "Some", "Fields": [sessionData] }
        },
        "JsonMessage": JSON.stringify(jsonMessage)
    },
    routingKey: routingKey
};
let corretWebsocketInputFormatForSendSMRef = correctDataForSMRef.routingKey + " " + correctDataForSMRef.event.Header.ComponentCode.Fields[0]
    + " " + JSON.stringify(correctDataForSMRef.event);


// Mocking configuration
let configuration = jasmine.createSpyObj("configuration", ["getCodes", "getPublisherDetails", "codesExist", "containsPublisher"]);
configuration.getCodes.and.callFake(function (componentName, stateMachineName) {
    if (!componentName || !stateMachineName){
        throw new Error();
    }
    return {
        componentCode: componentCode,
        stateMachineCode: stateMachineCode
    };
});
configuration.getPublisherDetails.and.callFake(function (componentCode, stateMachineCode) {
    return {
        eventCode: eventCode,
        routingKey: routingKey
    };
});
configuration.codesExist.and.callFake(function (componentName, stateMachineName) {
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