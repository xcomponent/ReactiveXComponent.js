
define(["configuration/xcConfiguration"], function (Configuration) {

    describe("Test xcConfiguration module", function () {


        var componentName = "component";
        var stateMachineName = "stateMachine";
        var componentCode = "1";
        var stateMachineCode = "2";
        var stateCode = "0";
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
        var correctEvent = {
            header: header,
            routingKey: routingKey
        }
        var parser, configuration;
        beforeEach(function () {
<<<<<<< HEAD
            parser = jasmine.createSpyObj('parser', ['parse', 'getCodes', 'getPublisherDetails', 'getSubscriberTopic', 'getSnapshotTopic', 'getStateName']);
=======
            parser = jasmine.createSpyObj('parser', ['parse', 'getCodes', 'getPublisherDetails', 'getSubscriberTopic', 'getSnapshotTopic']);
>>>>>>> 79046ef5bf75fb1b74a5e7d8af45a9c00c03e594
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
    });

});
