
define(["configuration/xcConfiguration"], function (Configuration) {

    describe("Test xcConfiguration module", function () {


        var componentName = "component";
        var stateMachineName = "stateMachine";
        var componentCode = "1";
        var stateMachineCode = "2";
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
            parser = jasmine.createSpyObj('parser', ['parse', 'getCodes', 'getPublisherDetails', 'getSubscriberTopic']);
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
                configuration.getPublisherDetails(componentCode, stateMachineCode);
                expect(parser.getPublisherDetails).toHaveBeenCalledTimes(1);
                expect(parser.getPublisherDetails).toHaveBeenCalledWith(componentCode, stateMachineCode);
            });
        });

        describe("Test getSubscriberTopic method", function () {
            it("should call getSubscriberTopic method of parser with the right component and stateMachine", function () {
                configuration.getSubscriberTopic(componentCode, stateMachineCode);
                expect(parser.getSubscriberTopic).toHaveBeenCalledTimes(1);
                expect(parser.getSubscriberTopic).toHaveBeenCalledWith(componentCode, stateMachineCode);
            });
        });

    });

});
