
define(["configuration/xcConfiguration"], function (Configuration) {

    describe("Test xcConfiguration module", function () {

        var parser = jasmine.createSpyObj('parser', ['parse', 'getCodes', 'getPublisherDetails']);
        var configuration = new Configuration(parser);

        it("Test init method", function () {
            configuration.init();
            expect(parser.parse).toHaveBeenCalledTimes(1);
        });


        it("Test getCodes method", function () {
            var componentName = "component";
            var stateMachineName = "stateMachine";
            configuration.getCodes(componentName, stateMachineName);
            expect(parser.getCodes).toHaveBeenCalledTimes(1);
            expect(parser.getCodes).toHaveBeenCalledWith(componentName, stateMachineName);
        });


        it("Test getPublisherDetails method", function () {
            var componentCode = "componentCode";
            var stateMachineCode = "stateMachineCode";
            configuration.getPublisherDetails(componentCode, stateMachineCode);
            expect(parser.getPublisherDetails).toHaveBeenCalledTimes(1);
            expect(parser.getPublisherDetails).toHaveBeenCalledWith(componentCode, stateMachineCode);
        });
    });

});
