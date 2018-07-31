import { mock, when, anyString, anyNumber, instance } from "ts-mockito/lib/ts-mockito";
import { ApiConfiguration, DefaultApiConfiguration } from "../configuration/apiConfiguration";

// Initialisation
let componentCode = -69981087;
let stateMachineCode = -829536631;
let eventCode = 9;
let messageType = "XComponent.HelloWorld.UserObject.SayHello";
let routingKey = "input.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldManager";
let guiExample = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
let sessionData = "sessiondata";

function getHeader(visibility: boolean) {
    let header = {
        "StateMachineCode": stateMachineCode,
        "ComponentCode": componentCode,
        "EventCode": eventCode,
        "IncomingEventType": 0,
        "MessageType": messageType,
        "PublishTopic": (!visibility) ? undefined : guiExample,
        "SessionData": sessionData
    };
    return header;
}

let jsonMessage = { "Name": "MY NAME" };

function getCorrectData(visibility: boolean) {
    return {
        event: {
            "Header": getHeader(visibility),
            "JsonMessage": JSON.stringify(jsonMessage)
        },
        routingKey: routingKey
    };
}

function getCorretWebsocketInputFormat(visibility: boolean) {
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

let apiConfiguration: ApiConfiguration = mock(DefaultApiConfiguration);

when(apiConfiguration.getComponentCode(anyString())).thenCall((componentName: string) => {
    if (!componentName) {
        throw new Error();
    }
    return componentCode;
});

when(apiConfiguration.getStateMachineCode(anyString(), anyString())).thenCall((componentName: string, stateMachineName: string) => {
    if (!componentName || !stateMachineName) {
        throw new Error();
    }
    return stateMachineCode;
});

when(apiConfiguration.getPublisherDetails(anyNumber(), anyNumber(), anyString())).thenCall(() => {
    return {
        eventCode: eventCode,
        routingKey: routingKey
    };
});

when(apiConfiguration.containsStateMachine(anyString(), anyString())).thenCall((componentName: string, stateMachineName: string) => {
    if (!componentName || !stateMachineName) {
        return false;
    } else {
        return true;
    }
});

when(apiConfiguration.containsPublisher(anyNumber(), anyNumber(), anyString())).thenCall((compCode, stmCode) => {
    return compCode === componentCode && stmCode === stateMachineCode;
});

let returnObject = {
    configuration: instance(apiConfiguration),
    jsonMessage: jsonMessage,
    messageType: messageType,
    correctData: getCorrectData(false),
    getCorretWebsocketInputFormat: getCorretWebsocketInputFormat,
    stateMachineRef: stateMachineRef,
    corretWebsocketInputFormatForSendSMRef: corretWebsocketInputFormatForSendSMRef,
    guiExample: guiExample,
    sessionData: sessionData
};

export default returnObject;