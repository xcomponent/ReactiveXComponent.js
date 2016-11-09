
define(function () {
    "use strict";

    //Initialisation
    var componentCode = "-69981087";
    var stateMachineCode = "-829536631";
    var eventCode = "9";
    var messageType = "XComponent.HelloWorld.UserObject.SayHello";
    var routingKey = "input.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldManager";
    var guiExample = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";

    var guid = jasmine.createSpyObj('guid', ['create']);
    guid.create.and.callFake(function () {
        return guiExample;
    });

    function getHeader(visibility) {
        var header = {
            "StateMachineCode": { "Case": "Some", "Fields": [parseInt(stateMachineCode)] },
            "ComponentCode": { "Case": "Some", "Fields": [parseInt(componentCode)] },
            "EventCode": parseInt(eventCode),
            "IncomingType": 0,
            "MessageType": { "Case": "Some", "Fields": [messageType] },
            "PublishTopic": (!visibility) ? undefined : { "Case": "Some", "Fields": [guid.create()] }
        };
        return header;
    }

    var subscriber = jasmine.createSpyObj('subscriber', ['sendSubscribeRequestToTopic']);
    subscriber.sendSubscribeRequestToTopic.and.callFake(function () {
    });


    var jsonMessage = { "Name": "MY NAME" };

    function getCorrectData(visibility) {
        return {
            event: {
                "Header": getHeader(visibility),
                "JsonMessage": JSON.stringify(jsonMessage)
            },
            routingKey: routingKey
        };
    }

    var correctData = getCorrectData();

    function getCorretWebsocketInputFormat(visibility) {
        var correctData = getCorrectData(visibility);
        var correctWebsocketInputFormat = correctData.routingKey + " " + correctData.event.Header.ComponentCode.Fields[0]
            + " " + JSON.stringify(correctData.event);
        return correctWebsocketInputFormat;
    }

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
    var configuration = jasmine.createSpyObj('configuration', ['getCodes', 'getPublisherDetails', 'codesExist', 'publisherExist']);
    configuration.getCodes.and.callFake(function (componentName, stateMachineName) {
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

    configuration.publisherExist.and.callFake(function (componentCode, stateMachineCode) {
        if (!componentCode || !stateMachineCode) {
            return false;
        } else {
            return true;
        }
    });

    // Mocking webSocket
    var createMockWebSocket = function () {
        var webSocket = jasmine.createSpyObj('webSocket', ['send']);
        return webSocket;
    }

    var guiExample = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";

    var guid = jasmine.createSpyObj('guid', ['create']);
    guid.create.and.callFake(function () {
        return guiExample;
    });

    return {
        configuration: configuration,
        createMockWebSocket: createMockWebSocket,
        jsonMessage: jsonMessage,
        messageType: messageType,
        correctData: correctData,
        getCorretWebsocketInputFormat: getCorretWebsocketInputFormat,
        stateMachineRef: stateMachineRef,
        corretWebsocketInputFormatForSendSMRef: corretWebsocketInputFormatForSendSMRef,
        guiExample: guiExample,
        privateteSubscriber: subscriber
    }
});
