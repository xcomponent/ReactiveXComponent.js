
define(["configuration/xcConfiguration"], function (Configuration) {

    describe("Test xcConfiguration module", function () {


        var parser, configuration;

        beforeEach(function () {
            parser = jasmine.createSpyObj('parser', ['parse', 'getCodes', 'getPublisherDetails', 'getSubscriberTopic']);
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
                var componentName = "component";
                var stateMachineName = "stateMachine";
                configuration.getCodes(componentName, stateMachineName);
                expect(parser.getCodes).toHaveBeenCalledTimes(1);
                expect(parser.getCodes).toHaveBeenCalledWith(componentName, stateMachineName);
            });
         });

        describe("Test getPublisherDetails method", function () {
            it("should call getPublisherDetails method of parser with the right component and stateMachine", function () {
                var componentCode = "componentCode";
                var stateMachineCode = "stateMachineCode";
                configuration.getPublisherDetails(componentCode, stateMachineCode);
                expect(parser.getPublisherDetails).toHaveBeenCalledTimes(1);
                expect(parser.getPublisherDetails).toHaveBeenCalledWith(componentCode, stateMachineCode);
            });
        });

        describe("Test getSubscriberTopic method", function () {
            it("should call getSubscriberTopic method of parser with the right component and stateMachine", function () {
                var componentCode = "componentCode";
                var stateMachineCode = "stateMachineCode";
                configuration.getSubscriberTopic(componentCode, stateMachineCode);
                expect(parser.getSubscriberTopic).toHaveBeenCalledTimes(1);
                expect(parser.getSubscriberTopic).toHaveBeenCalledWith(componentCode, stateMachineCode);
            });
        });
    });

});
