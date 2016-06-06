
define(function () {
    "use strict";

    // Mocking configuration
    var configuration = jasmine.createSpyObj('configuration', ['getCodes', 'getPublisherDetails']);
    configuration.getCodes.and.callFake(function (componentName, stateMachineName) {
        return {
            componentCode: "-69981087",
            stateMachineCode: "-829536631"
        };
    });

    configuration.getPublisherDetails.and.callFake(function (componentCode, stateMachineCode) {
        return {
            eventCode: "9",
            messageType: "XComponent.HelloWorld.UserObject.SayHello",
            routingKey: "input.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldManager"
        };
    });

    // Mocking webSocket
    var createMockWebSocket = function () {
        var webSocket = jasmine.createSpyObj('webSocket', ['send']);
        return webSocket;
    }

    var jsonMessage = { "Name": "MY NAME" };

    //Initilisation of expected data
    var correctData = {
        event: {
            "Header": {
                "StateMachineCode": { "Case": "Some", "Fields": [-829536631] },
                "ComponentCode": { "Case": "Some", "Fields": [-69981087] },
                "EventCode": 9,
                "IncomingType": 0,
                "MessageType": { "Case": "Some", "Fields": ["XComponent.HelloWorld.UserObject.SayHello"] }
            },
            "JsonMessage": JSON.stringify(jsonMessage)
        },
        routingKey: "input.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldManager"
    };

    var corretWebsocketInputFormat = correctData.routingKey + " " + correctData.event.Header.ComponentCode.Fields[0]
         + " " + JSON.stringify(correctData.event);

    var stateMachineRef = {
        "AgentId": { "Case": "Some", "Fields": [0] },
        "StateMachineId": { "Case": "Some", "Fields": [0] },
        "StateMachineCode": { "Case": "Some", "Fields": [-829536631] },
        "ComponentCode": { "Case": "Some", "Fields": [-69981087] },
    };

    var correctDataForSendStateMachineRef = {
        event: {
            "Header": {
                "AgentId": stateMachineRef.AgentId,
                "StateMachineId": stateMachineRef.StateMachineId,
                "StateMachineCode": stateMachineRef.StateMachineCode,
                "ComponentCode": stateMachineRef.ComponentCode,
                "EventCode": 9,
                "IncomingType": 0,
                "MessageType": { "Case": "Some", "Fields": ["XComponent.HelloWorld.UserObject.SayHello"] }
            },
            "JsonMessage": JSON.stringify(jsonMessage)
        },
        routingKey: "input.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldManager"
    };

    var corretWebsocketInputFormatForStateMachineRef = correctDataForSendStateMachineRef.routingKey + " "
        + correctDataForSendStateMachineRef.event.Header.ComponentCode.Fields[0]
         + " " + JSON.stringify(correctDataForSendStateMachineRef.event);


    return {
        configuration: configuration,
        createMockWebSocket:createMockWebSocket,
        jsonMessage: jsonMessage,
        correctData: correctData,
        corretWebsocketInputFormat: corretWebsocketInputFormat,
        stateMachineRef: stateMachineRef,
        correctDataForSendStateMachineRef: correctDataForSendStateMachineRef,
        corretWebsocketInputFormatForStateMachineRef: corretWebsocketInputFormatForStateMachineRef
    }
});
