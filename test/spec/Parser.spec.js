
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
    
define(["Parser"], function (Parser) {

    describe("Test Parser module", function () {
        var parser = new Parser(xml);

        it("Test getters", function() {
            expect(parser.getXml()).toEqual(xml);
        });


        it("Test getCodes", function () {
            var codes, correctCodes;

            codes = parser.getCodes("HelloWorld", "HelloWorldManager");
            correctCodes = {componentCode : "-69981087", stateMachineCode : "-829536631"};
            expect(codes).toEqual(correctCodes);

            codes = parser.getCodes("HelloWorld", "HelloWorldResponse");
            correctCodes = {componentCode : "-69981087", stateMachineCode : "-343862282"};
            expect(codes).toEqual(correctCodes);
        });


        it("Test getPublish", function() {
            var correctPublish = {
                eventCode: "9",
                messageType: "XComponent.HelloWorld.UserObject.SayHello",
                routingKey: "input.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldManager"
            };
            var publish = parser.getPublish("-69981087", "-829536631");
            expect(publish).toEqual(correctPublish);
        });


    });

});


