
define(function () {
    "use strict";

    //Initialisation
    var componentCode = "-69981087";
    var stateMachineCode = "-829536631";
    var eventCode = "9";
    var messageType = "XComponent.HelloWorld.UserObject.SayHello";
    var routingKey = "input.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldManager";
    var header = {
        "StateMachineCode": { "Case": "Some", "Fields": [parseInt(stateMachineCode)] },
        "ComponentCode": { "Case": "Some", "Fields": [parseInt(componentCode)] },
        "EventCode": parseInt(eventCode),
        "IncomingType": 0,
        "MessageType": { "Case": "Some", "Fields": [messageType] }
    };
    var jsonMessage = { "Name": "MY NAME" };
    var correctData = {
        event: {
            "Header": header,
            "JsonMessage": JSON.stringify(jsonMessage)
        },
        routingKey: routingKey
    };
    var corretWebsocketInputFormat = correctData.routingKey + " " + correctData.event.Header.ComponentCode.Fields[0]
     + " " + JSON.stringify(correctData.event);

    var stateMachineRef = {
        "StateMachineId": { "Case": "Some", "Fields": [1] },
        "AgentId": { "Case": "Some", "Fields": [2] },
        "StateMachineCode": { "Case": "Some", "Fields": [parseInt(stateMachineCode)] },
        "ComponentCode": { "Case": "Some", "Fields": [parseInt(componentCode)] },
    };
    var correctDataForSMRef = {
        event: {
            "Header": {
                "StateMachineId": stateMachineRef.StateMachineId,
                "AgentId": stateMachineRef.AgentId,
                "StateMachineCode": stateMachineRef.StateMachineCode,
                "ComponentCode": stateMachineRef.ComponentCode,
                "EventCode": parseInt(eventCode),
                "IncomingType": 0,
                "MessageType": { "Case": "Some", "Fields": [messageType] }
            },
            "JsonMessage": JSON.stringify(jsonMessage)
        },
        routingKey: routingKey
    }
    var corretWebsocketInputFormatForSendSMRef = correctDataForSMRef.routingKey + " " + correctDataForSMRef.event.Header.ComponentCode.Fields[0]
     + " " + JSON.stringify(correctDataForSMRef.event);


    // Mocking configuration
    var configuration = jasmine.createSpyObj('configuration', ['getCodes', 'getPublisherDetails']);
    configuration.getCodes.and.callFake(function () {
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
    

    // Mocking webSocket
    var createMockWebSocket = function () {
        var webSocket = jasmine.createSpyObj('webSocket', ['send']);
        return webSocket;
    }


    return {
        configuration: configuration,
        createMockWebSocket: createMockWebSocket,
        jsonMessage: jsonMessage,
        messageType:messageType,
        correctData: correctData,
        corretWebsocketInputFormat: corretWebsocketInputFormat,
        stateMachineRef: stateMachineRef,
        corretWebsocketInputFormatForSendSMRef: corretWebsocketInputFormatForSendSMRef
    }
});
