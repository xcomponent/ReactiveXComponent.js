import Configuration from "configuration/xcConfiguration";

describe("Test xcConfiguration module", function () {

    let componentName = "component";
    let stateMachineName = "stateMachine";
    let componentCode = "1";
    let stateMachineCode = "2";
    let stateCode = "0";
    let eventCode = "9";
    let messageType = "XComponent.HelloWorld.UserObject.SayHello";
    let routingKey = "input.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldManager";
    let header = {
        "StateMachineCode": { "Case": "Some", "Fields": [parseInt(stateMachineCode)] },
        "ComponentCode": { "Case": "Some", "Fields": [parseInt(componentCode)] },
        "EventCode": parseInt(eventCode),
        "IncomingType": 0,
        "MessageType": { "Case": "Some", "Fields": [messageType] }
    };
    let correctEvent = {
        header: header,
        routingKey: routingKey
    };
    let parser, configuration;
    beforeEach(function () {
        parser = jasmine.createSpyObj("parser", ["parse", "getCodes", "getPublisherDetails", "getSubscriberTopic", "getSnapshotTopic", "getStateName", "publisherExist", "codesExist", "subscriberExist"]);
        parser.getPublisherDetails.and.callFake(function (componentCode, stateMachineCode) {
            return {
                eventCode: eventCode,
                messageType: messageType,
                routingKey: routingKey
            };
        });
        configuration = new Configuration(parser);
    });


    describe("Test init method", function () {
        it("should instanciate the parser and store xcApi file data", function () {
            configuration.init();
            expect(parser.parse).toHaveBeenCalledTimes(1);
        });
    });

    describe("Test getCodes method", function () {
        it("should call getCodes method of parser with the right component and stateMachine", function () {
            configuration.getCodes(componentName, stateMachineName);
            expect(parser.getCodes).toHaveBeenCalledTimes(1);
            expect(parser.getCodes).toHaveBeenCalledWith(componentName, stateMachineName);
        });
    });

    describe("Test getPublisherDetails method", function () {
        it("should call getPublisherDetails method of parser with the right component and stateMachine", function () {
            configuration.getPublisherDetails(componentCode, stateMachineCode, messageType);
            expect(parser.getPublisherDetails).toHaveBeenCalledTimes(1);
            expect(parser.getPublisherDetails).toHaveBeenCalledWith(componentCode, stateMachineCode, messageType);
        });
    });

    describe("Test getSubscriberTopic method", function () {
        it("should call getSubscriberTopic method of parser with the right component and stateMachine", function () {
            configuration.getSubscriberTopic(componentName, stateMachineName);
            expect(parser.getSubscriberTopic).toHaveBeenCalledTimes(1);
            expect(parser.getSubscriberTopic).toHaveBeenCalledWith(componentName, stateMachineName);
        });
    });

    describe("Test getSnapshotTopic method", function () {
        it("should call getSnapshotTopic method of parser with the right component", function () {
            configuration.getSnapshotTopic(componentName);
            expect(parser.getSnapshotTopic).toHaveBeenCalledTimes(1);
            expect(parser.getSnapshotTopic).toHaveBeenCalledWith(componentName);
        });
    });


    describe("Test getStateName method", function () {
        it("should call getStateName method of parser with the right componentCode, stateMachineCode and stateCode", function () {
            configuration.getStateName(componentCode, stateMachineCode, stateCode);
            expect(parser.getStateName).toHaveBeenCalledTimes(1);
            expect(parser.getStateName).toHaveBeenCalledWith(componentCode, stateMachineCode, stateCode);
        });
    });


    describe("Test publisherExist method", function () {
        it("should call publisherExist method of parser with the right componentCode, stateMachineCode and messageType", function () {
            configuration.publisherExist(componentCode, stateMachineCode, messageType);
            expect(parser.publisherExist).toHaveBeenCalledTimes(1);
            expect(parser.publisherExist).toHaveBeenCalledWith(componentCode, stateMachineCode, messageType);
        });
    });

    describe("Test codesExist method", function () {
        it("should call codesExist method of parser with the right componentName and stateMachineName", function () {
            configuration.codesExist(componentName, stateMachineName);
            expect(parser.codesExist).toHaveBeenCalledTimes(1);
            expect(parser.codesExist).toHaveBeenCalledWith(componentName, stateMachineName);
        });
    });

    describe("Test subscriberExist method", function () {
        it("should call subscriberExist method of parser with the right componentName and stateMachineName", function () {
            configuration.subscriberExist(componentName, stateMachineName);
            expect(parser.subscriberExist).toHaveBeenCalledTimes(1);
            expect(parser.subscriberExist).toHaveBeenCalledWith(componentName, stateMachineName);
        });
    });

});