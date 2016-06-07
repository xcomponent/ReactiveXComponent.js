
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


    // Mocking configuration
    var configuration = jasmine.createSpyObj('configuration', ['getCodes', 'getPublisherDetails', 'getEventWithoutStateMachineRef', 'convertToWebsocketInputFormat']);
    configuration.getCodes.and.callFake(function () {
        return {
            componentCode: componentCode,
            stateMachineCode: stateMachineCode
        };
    });
    configuration.convertToWebsocketInputFormat.and.callFake(function () {
        return corretWebsocketInputFormat;
    });
    configuration.getPublisherDetails.and.callFake(function (componentCode, stateMachineCode) {
        return {
            eventCode: eventCode,
            messageType: messageType,
            routingKey: routingKey
        };
    });
    configuration.getEventWithoutStateMachineRef.and.callFake(function (componentCode, stateMachineCode) {
        return {
            header: header,
            routingKey: routingKey
        }
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
        correctData: correctData,
        corretWebsocketInputFormat: corretWebsocketInputFormat,
    }
});
