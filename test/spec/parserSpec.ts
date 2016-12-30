import Parser from "Parser";

const xml = `<?xml version="1.0" encoding="utf-8"?>
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
              <State name="Start" id="0" />
              <State name="Loop" id="1" />
              <State name="Done" id="2" />
            </states>
          </stateMachine>
        </stateMachines>
      </component>
    </components>
  </codesConverter>
</deployment>`;

const tags = {
    component: "component",
    name: "name",
    id: "id",
    stateMachine: "stateMachine",
    state: "State",
    publish: "publish",
    componentCode: "componentCode",
    stateMachineCode: "stateMachineCode",
    eventCode: "eventCode",
    event: "event",
    topic: "topic",
    subscribe: "subscribe",
    snapshot: "snapshot"
};

let getParser = (xml, tags) => {
    let parser = new Parser();
    parser.parse(xml, tags);
    return parser;
};

test("Test getCodes: it should get the right codes given existing component and statemachine names", () => {
    let parser = getParser(xml, tags);

    let codes, correctCodes;

    codes = parser.getCodes("HelloWorld", "HelloWorldManager");
    correctCodes = { componentCode: "-69981087", stateMachineCode: "-829536631" };
    expect(codes).toEqual(correctCodes);

    codes = parser.getCodes("HelloWorld", "HelloWorldResponse");
    correctCodes = { componentCode: "-69981087", stateMachineCode: "-343862282" };
    expect(codes).toEqual(correctCodes);
});

test("Test getCodes: it should throw an error when using an unkonwn component name", () => {
    let parser = getParser(xml, tags);

    let componentName = "random component";
    let messageError = "Component '" + componentName + "' not found";
    expect(function () {
        parser.getCodes(componentName, null);
    }).toThrowError(messageError);
});

test("Test getCodes: it should throw an error when using an unknown stateMachine name", () => {
    let parser = getParser(xml, tags);

    let stateMachine = "random stateMachine";
    let messageError = "StateMachine '" + stateMachine + "' not found";
    expect(function () {
        parser.getCodes("HelloWorld", stateMachine);
    }).toThrowError(messageError);
});

test("Test getPublisherDetails method: it should get the right publisher details given existing component and stateMachine codes", () => {
    let parser = getParser(xml, tags);

    let correctPublish = {
        eventCode: "9",
        routingKey: "input.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldManager"
    };
    let publish = parser.getPublisherDetails("-69981087", "-829536631", "XComponent.HelloWorld.UserObject.SayHello");
    expect(publish).toEqual(correctPublish);
});

test("Test getPublisherDetails method: it should throw an error when using an unknown stateMachine name", () => {
    let parser = getParser(xml, tags);

    let messageError = "PublisherDetails not found";
    expect(function () {
        parser.getPublisherDetails("random componentCode", "random stateMachineCode", "");
    }).toThrowError(messageError);
});

test("Test getSubscriberTopic method: it should get the right topic given existing component and stateMachine", () => {
    let parser = getParser(xml, tags);

    let correctTopic = "output.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldResponse";
    let topic = parser.getSubscriberTopic("HelloWorld", "HelloWorldResponse");
    expect(topic).toEqual(correctTopic);
});

test("Test getSubscriberTopic method: given a wrong component or/and a stateMachine should throw an exception", () => {
    let parser = getParser(xml, tags);

    let messageError = "SubscriberTopic not found";
    expect(function () {
        parser.getSubscriberTopic("RandomComponent", "RandomStateMachine");
    }).toThrowError(messageError);
});

test("Test getSnapshotTopic method: it should get the right snapshot topic given existing component", () => {
    let parser = getParser(xml, tags);

    let correctTopic = "snapshot.1_0.HelloWorldMicroservice.HelloWorld";
    let topic = parser.getSnapshotTopic("HelloWorld");
    expect(topic).toEqual(correctTopic);
});

test("Test getSnapshotTopic method: it should throw an exeption when using an unknown component name", () => {
    let parser = getParser(xml, tags);

    let componentName = "random component";
    let messageError = "Component '" + componentName + "' not found";
    expect(function () {
        parser.getSnapshotTopic("random component");
    }).toThrowError(messageError);
});

test("Test getStateName method: it should get the right state name given existing componentCode StateMachineCode and stateCode", () => {
    let parser = getParser(xml, tags);

    expect(parser.getStateName("-69981087", "-829536631", "0")).toEqual("EntryPoint");
    expect(parser.getStateName("-69981087", "-343862282", "0")).toEqual("Start");
    expect(parser.getStateName("-69981087", "-343862282", "1")).toEqual("Loop");
    expect(parser.getStateName("-69981087", "-343862282", "2")).toEqual("Done");
});

test("Test getStateName method: it should throw an exeption when using an unknown componentCode", () => {
    let parser = getParser(xml, tags);

    expect(function () {
        parser.getStateName("unknwon", "-343862282", "2");
    }).toThrowError("componentCode not found");
});

test("Test getStateName method: it should throw an exeption when using an unknown stateMachineCode", () => {
    let parser = getParser(xml, tags);

    expect(function () {
        parser.getStateName("-69981087", "unknwon", "2");
    }).toThrowError("stateMachineCode not found");
});

test("Test getStateName method: it should throw an exeption when using an unknown stateCode", () => {
    let parser = getParser(xml, tags);

    expect(function () {
        parser.getStateName("-69981087", "-343862282", "unknwon");
    }).toThrowError("stateCode not found");
});

test("Test codesExist method method: given a componentName and a stateMachineName, should return true if parser get their codes and false otherwise", () => {
    let parser = getParser(xml, tags);

    expect(parser.codesExist("HelloWorld", "HelloWorldManager")).toBe(true);
    expect(parser.codesExist("HelloWorld", "RandomStateMachine")).toBe(false);
    expect(parser.codesExist("RandomComponent", "RandomStateMachine")).toBe(false);
});

test("Test publisherExist method method: given a componentCode, stateMachineCode and a messageType should return true if the publisher exists and false otherwise", () => {
    let parser = getParser(xml, tags);

    expect(parser.publisherExist("-69981087", "-829536631", "XComponent.HelloWorld.UserObject.SayHello")).toBe(true);
    expect(parser.publisherExist("RandomCode", "RandomCode", "XComponent.HelloWorld.UserObject.SayHello")).toBe(false);
});

test("Test subscriberExist method method: given a componentName and a stateMachineName should return true if the susbscriber exists and false otherwise", () => {
    let parser = getParser(xml, tags);

    expect(parser.subscriberExist("RandomComponent", "RandomStateMachine")).toBe(false);
    expect(parser.subscriberExist("HelloWorld", "HelloWorldManager")).toBe(false);
    expect(parser.subscriberExist("HelloWorld", "HelloWorldResponse")).toBe(true);
});