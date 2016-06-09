
var xml = (function() {
    return `<?xml version="1.0" encoding="utf-8"?>
<deployment environment="Dev" xcProjectName="HelloWorld" deploymentTargetCode="-487384339" deploymentTargetName="HelloWorldApi" version="1.0" frameworkType="Framework4" xmlns="http://xcomponent.com/DeploymentConfig.xsd">
  <threading />
  <serialization>Json</serialization>
  <communication>
    <websocket name="websocket" host="localhost" port="443" user="" password="" type="Secure" />
  </communication>
  <clientAPICommunication>
    <publish componentCode="-69981087" stateMachineCode="-829536631" eventType="UPDATE" topicType="output" communicationType="WEB_SOCKET" stateCode="0" eventCode="9" event="XComponent.HelloWorld.UserObject.SayHello" communication="websocket">
      <topic type="STATIC">input.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldManager</topic>
    </publish>
    <subscribe componentCode="-69981087" eventType="ERROR" topicType="input" communicationType="WEB_SOCKET" communication="websocket">
      <topic type="STATIC">error.1_0.HelloWorldMicroservice.HelloWorld</topic>
    </subscribe>
    <subscribe componentCode="-69981087" stateMachineCode="-343862282" eventType="UPDATE" topicType="input" communicationType="WEB_SOCKET" event="XComponent.HelloWorld.UserObject.HelloWorldResponse" communication="websocket" communicationThreadingType="INHERITFROMPARENT">
      <topic type="STATIC">output.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldResponse</topic>
    </subscribe>
    <snapshot componentCode="-69981087">
      <topic type="STATIC">snapshot.1_0.HelloWorldMicroservice.HelloWorld</topic>
    </snapshot>
  </clientAPICommunication>
  <codesConverter>
    <components>
      <component name="HelloWorld" id="-69981087">
        <events>
          <event name="XComponent.Common.Event.ApiProxy.ApiInitError" id="0" />
          <event name="XComponent.Common.Event.ApiProxy.ApiInitSuccessful" id="1" />
          <event name="XComponent.Common.Event.ApiProxy.CancelApiInit" id="2" />
          <event name="XComponent.Common.Event.ApiProxy.InstanceUpdatedSubscription" id="3" />
          <event name="XComponent.Common.Event.ApiProxy.InstanceUpdatedUnsubscription" id="4" />
          <event name="XComponent.Common.Event.ApiProxy.SnapshotOptions" id="5" />
          <event name="XComponent.Common.Event.DefaultEvent" id="6" />
          <event name="XComponent.Common.Event.ExceptionEvent" id="7" />
          <event name="XComponent.HelloWorld.UserObject.HelloWorldResponse" id="8" />
          <event name="XComponent.HelloWorld.UserObject.SayHello" id="9" />
        </events>
        <stateMachines>
          <stateMachine name="HelloWorldManager" id="-829536631">
            <states>
              <State name="EntryPoint" id="0" />
            </states>
          </stateMachine>
          <stateMachine name="HelloWorldResponse" id="-343862282">
            <states>
              <State name="Done" id="0" />
            </states>
          </stateMachine>
        </stateMachines>
      </component>
    </components>
  </codesConverter>
</deployment>`;
})();

var tags = (function() {
    var tags = {};
    tags.component = "component";
    tags.name = "name";
    tags.id = "id";
    tags.stateMachine = "stateMachine";
    tags.publish = "publish";
    tags.componentCode = "componentCode";
    tags.stateMachineCode = "stateMachineCode";
    tags.eventCode = "eventCode";
    tags.event = "event";
    tags.topic = "topic";
    tags.eventCode = "eventCode";
    tags.subscribe = "subscribe";
    return tags;
})();    



define(["parser"], function (Parser) {
    
    describe("Test Parser module", function () {

        var parser;

        beforeEach(function() {
            parser = new Parser();
            parser.parse(xml, tags);
        });


        describe("Test getCodes method", function() {
            it("should get the right codes given existing component and statemachine names", function () {
                var codes, correctCodes;

                codes = parser.getCodes("HelloWorld", "HelloWorldManager");
                correctCodes = {componentCode : "-69981087", stateMachineCode : "-829536631"};
                expect(codes).toEqual(correctCodes);

                codes = parser.getCodes("HelloWorld", "HelloWorldResponse");
                correctCodes = {componentCode : "-69981087", stateMachineCode : "-343862282"};
                expect(codes).toEqual(correctCodes);
            });
            
            it("should throw an error when using an unkonwn component name", function() {
                var componentName = "random component";
                var messageError = "Component '" + componentName + "' not found";
                expect(function() {
                    parser.getCodes(componentName, null);
                }).toThrowError(messageError);
            });

            it("should throw an error when using an unknown stateMachine name", function() {
                var stateMachine = "random stateMachine";
                var messageError = "StateMachine '" + stateMachine + "' not found"
                expect(function() {
                    parser.getCodes("HelloWorld", stateMachine);
                }).toThrowError(messageError);
            });
        });


        describe("Test getPublisherDetails method", function() {
            it("should get the right publisher details given existing component and stateMachine codes", function() {
                    var correctPublish = {
                        eventCode: "9",
                        routingKey: "input.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldManager"
                    };
                    var publish = parser.getPublisherDetails("-69981087", "-829536631", "XComponent.HelloWorld.UserObject.SayHello");
                    expect(publish).toEqual(correctPublish);
                });

            it("should throw an error when using an unknown stateMachine name", function() {
                var messageError = "PublisherDetails not found";
                expect(function() {
                    parser.getPublisherDetails("random componentCode", "random stateMachineCode", "");
                }).toThrowError(messageError);
            });
        });


        describe("Test getSubscriberTopic method", function () {
            it("should get the right topic given existing component and stateMachine", function () {
                var correctTopic = "output.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldResponse";
                var topic = parser.getSubscriberTopic("HelloWorld", "HelloWorldResponse");
                expect(topic).toEqual(correctTopic);
            });
        });

    });

});


