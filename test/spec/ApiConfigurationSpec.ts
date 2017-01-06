import { DefaultApiConfigurationParser } from "configuration/ApiConfigurationParser";
import { SubscriberEventType } from "configuration/ApiConfiguration";

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

const parse = (xml: string) => {
  const parser = new DefaultApiConfigurationParser();
  return parser.parse(xml);
};



test("Test basic config parsing", () => {
  return parse(xml)
    .then(config => expect(config).toBeDefined());
});

test("Test parsing wrong xml format", () => {
  return parse("wrong format")
    .then(_ => fail())
    .catch(e => { });
});

test("Test getCodes: it should get the right codes given existing component and statemachine names", () => {
  return parse(xml)
    .then(config => {
      let codes, correctCodes;

      codes = config.getCodes("HelloWorld", "HelloWorldManager");
      correctCodes = { componentCode: "-69981087", stateMachineCode: "-829536631" };
      expect(codes).toEqual(correctCodes);

      codes = config.getCodes("HelloWorld", "HelloWorldResponse");
      correctCodes = { componentCode: "-69981087", stateMachineCode: "-343862282" };
      expect(codes).toEqual(correctCodes);
    });
});

test("Test getCodes: it should throw an error when using an unkonwn component name", () => {
  const componentName = "random component";
  const messageError = "Component '" + componentName + "' not found";
  return parse(xml)
    .then(config => {
      config.getCodes(componentName, null);
      fail();
    })
    .catch(e => expect(e.message).toBe(messageError));
});

test("Test getCodes: it should throw an error when using an unknown stateMachine name", () => {
  const stateMachine = "random stateMachine";
  const messageError = "StateMachine '" + stateMachine + "' not found";
  return parse(xml)
    .then(config => {
      config.getCodes("HelloWorld", stateMachine);
      fail();
    })
    .catch(e => expect(e.message).toBe(messageError));
});

test("Test getPublisherDetails method: it should get the right publisher details given existing component and stateMachine codes", () => {
  return parse(xml)
    .then(config => {
      let correctPublish = {
        eventCode: "9",
        routingKey: "input.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldManager"
      };
      let publish = config.getPublisherDetails("-69981087", "-829536631", "XComponent.HelloWorld.UserObject.SayHello");
      expect(publish).toEqual(correctPublish);
    });
});

test("Test getPublisherDetails method: it should throw an error when using an unknown stateMachine name", () => {
  const componentCode = "random componentCode";
  const stateMachineCode = "random stateMachineCode";
  const messageType = "type";
  let messageError = `publisher not found - component code: ${componentCode} - statemachine code: ${stateMachineCode} - message type: ${messageType} `;

  return parse(xml)
    .then(config => {
      config.getPublisherDetails(componentCode, stateMachineCode, messageType);
      fail();
    })
    .catch(e => expect(e.message).toBe(messageError));
});

test("Test getSubscriberTopic method: it should get the right topic given existing component and stateMachine", () => {
  let correctTopic = "output.1_0.HelloWorldMicroservice.HelloWorld.HelloWorldResponse";
  return parse(xml)
    .then(config => {
      let topic = config.getSubscriberTopic("-69981087", "-343862282", SubscriberEventType.Update);
      expect(topic).toEqual(correctTopic);
    });
});

test("Test getSubscriberTopic method: given a wrong component or/and a stateMachine should throw an exception", () => {
  const componentCode = "random componentCode";
  const stateMachineCode = "random stateMachineCode";
  const messageError = `Subscriber not found - component code: ${componentCode} - statemachine code: ${stateMachineCode}`;

  return parse(xml)
    .then(config => {
      config.getSubscriberTopic(componentCode, stateMachineCode, SubscriberEventType.Update);
      fail();
    })
    .catch(e => expect(e.message).toBe(messageError));
});

test("Test getSnapshotTopic method: it should get the right snapshot topic given existing component", () => {
  let correctTopic = "snapshot.1_0.HelloWorldMicroservice.HelloWorld";
  return parse(xml)
    .then(config => {
      let topic = config.getSnapshotTopic("-69981087");
      expect(topic).toEqual(correctTopic);
    });
});

test("Test getSnapshotTopic method: it should throw an exeption when using an unknown component code", () => {
  const componentCode = "random componentCode";
  const messageError = `Snapshot topic not found - component code: ${componentCode}`;

  return parse(xml)
    .then(config => {
      config.getSnapshotTopic(componentCode);
      fail();
    })
    .catch(e => expect(e.message).toBe(messageError));
});

test("Test getStateName method: it should get the right state name given existing componentCode StateMachineCode and stateCode", () => {
  return parse(xml)
    .then(config => {
      expect(config.getStateName("-69981087", "-829536631", "0")).toEqual("EntryPoint");
      expect(config.getStateName("-69981087", "-343862282", "0")).toEqual("Start");
      expect(config.getStateName("-69981087", "-343862282", "1")).toEqual("Loop");
      expect(config.getStateName("-69981087", "-343862282", "2")).toEqual("Done");
    });
});

test("Test getStateName method: it should throw an exeption when using an unknown componentCode", () => {
  const componentCode = "unknown";
  const messageError = `Component '${componentCode}' not found`;

  return parse(xml)
    .then(config => {
      config.getStateName(componentCode, "-343862282", "2");
      fail();
    })
    .catch(e => expect(e.message).toBe(messageError));
});

test("Test getStateName method: it should throw an exeption when using an unknown stateMachineCode", () => {
  const stateMachineCode = "unknown";
  const messageError = `StateMachine '${stateMachineCode}' not found`;

  return parse(xml)
    .then(config => {
      config.getStateName("-69981087", stateMachineCode, "2");
      fail();
    })
    .catch(e => expect(e.message).toBe(messageError));
});

test("Test getStateName method: it should throw an exeption when using an unknown stateCode", () => {
  const stateCode = "unknown";
  const messageError = `State '${stateCode}' not found`;

  return parse(xml)
    .then(config => {
      config.getStateName("-69981087", "-343862282", stateCode);
      fail();
    })
    .catch(e => expect(e.message).toBe(messageError));
});

test("Test codesExist method method: given a componentName and a stateMachineName, should return true if parser get their codes and false otherwise", () => {
  return parse(xml)
    .then(config => {
      expect(config.codesExist("HelloWorld", "HelloWorldManager")).toBe(true);
      expect(config.codesExist("HelloWorld", "RandomStateMachine")).toBe(false);
      expect(config.codesExist("RandomComponent", "RandomStateMachine")).toBe(false);
    });
});

test("Test publisherExist method method: given a componentCode, stateMachineCode and a messageType should return true if the publisher exists and false otherwise", () => {
  return parse(xml)
    .then(config => {
      expect(config.publisherExist("-69981087", "-829536631", "XComponent.HelloWorld.UserObject.SayHello")).toBe(true);
      expect(config.publisherExist("RandomCode", "RandomCode", "XComponent.HelloWorld.UserObject.SayHello")).toBe(false);
    });
});

test("Test subscriberExist method method: given a componentName and a stateMachineName should return true if the susbscriber exists and false otherwise", () => {
  return parse(xml)
    .then(config => {
      expect(config.subscriberExist("RandomComponent", "RandomStateMachine", SubscriberEventType.Update)).toBe(false);
      expect(config.subscriberExist("-69981087", "RandomStateMachine", SubscriberEventType.Update)).toBe(false);
      expect(config.subscriberExist("-69981087", "-343862282", SubscriberEventType.Update)).toBe(true);
    });
});