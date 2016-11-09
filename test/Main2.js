requirejs.config({
  urlArgs: 'bustCache=' + (new Date()).getTime(),
  baseUrl: '../src',

  paths: {
    'rx': '../node_modules/rx/dist/rx.all',
    'pako': '../node_modules/pako/dist/pako'
  },

  callback: function () {
    "use strict";

    require(["xcomponentAPI"], function (XComponentAPI) {
      var xml = `<?xml version="1.0" encoding="utf-8"?>
<deployment environment="Dev" xcProjectName="Pricer" deploymentTargetCode="-1705502312" deploymentTargetName="PricerApi" version="1.0" frameworkType="Framework4" xmlns="http://xcomponent.com/DeploymentConfig.xsd">
  <threading />
  <serialization>Json</serialization>
  <communication>
    <websocket name="websocket" host="localhost" port="443" user="" password="" type="Secure" />
  </communication>
  <clientAPICommunication>
    <publish componentCode="1260456174" stateMachineCode="1260456174" eventType="UPDATE" topicType="output" communicationType="WEB_SOCKET" stateCode="1" eventCode="8" event="XComponent.Pricer.UserObject.Calculate" communication="websocket">
      <topic type="STATIC">input.1_0.microservice1.Pricer.Pricer</topic>
    </publish>
    <subscribe componentCode="1260456174" eventType="ERROR" topicType="input" communicationType="WEB_SOCKET" communication="websocket">
      <topic type="STATIC">error.1_0.microservice1.Pricer</topic>
    </subscribe>
    <subscribe componentCode="1260456174" stateMachineCode="1516278384" eventType="UPDATE" topicType="input" communicationType="WEB_SOCKET" stateCode="1" event="XComponent.Pricer.UserObject.PricerResult" communication="websocket" communicationThreadingType="INHERITFROMPARENT">
      <topic type="STATIC">output.1_0.microservice1.Pricer.PricerResult</topic>
    </subscribe>
    <snapshot componentCode="1260456174">
      <topic type="STATIC">snapshot.1_0.microservice1.Pricer</topic>
    </snapshot>
  </clientAPICommunication>
  <codesConverter>
    <components>
      <component name="Pricer" id="1260456174">
        <events>
          <event name="XComponent.Common.Event.ApiProxy.ApiInitError" id="0" />
          <event name="XComponent.Common.Event.ApiProxy.ApiInitSuccessful" id="1" />
          <event name="XComponent.Common.Event.ApiProxy.CancelApiInit" id="2" />
          <event name="XComponent.Common.Event.ApiProxy.InstanceUpdatedSubscription" id="3" />
          <event name="XComponent.Common.Event.ApiProxy.InstanceUpdatedUnsubscription" id="4" />
          <event name="XComponent.Common.Event.ApiProxy.SnapshotOptions" id="5" />
          <event name="XComponent.Common.Event.DefaultEvent" id="6" />
          <event name="XComponent.Common.Event.ExceptionEvent" id="7" />
          <event name="XComponent.Pricer.UserObject.Calculate" id="8" />
          <event name="XComponent.Pricer.UserObject.PricerResult" id="9" />
        </events>
        <stateMachines>
          <stateMachine name="Pricer" id="1260456174">
            <states>
              <State name="EntryPoint" id="0" />
              <State name="Up" id="1" />
            </states>
          </stateMachine>
          <stateMachine name="PricerResult" id="1516278384">
            <states>
              <State name="Result" id="1" />
              <State name="Final" id="0" />
            </states>
          </stateMachine>
        </stateMachines>
      </component>
    </components>
  </codesConverter>
</deployment>`;

      var serverUrl = "wss://localhost:443";

      var componentName = "Pricer";
      var stateMachineName = "Pricer";
      var stateMachineResponse = "PricerResult";
      var messageType = "XComponent.Pricer.UserObject.Calculate";
      var jsonMessage = { "Pricer": 100, "Discount": 5 };

      var sessionListener = function (error, session) {
        if (error) {
          console.log(error);
          return;
        }

        var subscriber = session.createSubscriber();
        var publisher = session.createPublisher();

        subscriber.subscribe(componentName, stateMachineResponse, function (jsonData) {
          console.log("subscribeeeeeeeeeeeee");
          console.log(jsonData);
        });

        /*subscriber.getSnapshot(componentName, stateMachineName, function (items) {
          //console.log("Snapshot1");
          //items[0].send();//todo
          items[0].send(messageType, jsonMessage, true);
        });*/



        publisher.send(componentName, stateMachineName, messageType, jsonMessage, true);

        /*console.log(subscriber.canSubscribe(componentName, stateMachineName));
        console.log(subscriber.canSubscribe(componentName, stateMachineResponse));

        subscriber.subscribe(componentName, stateMachineName, function(jsonData) {
          console.log(jsonData);
        });*/

        /*subscriber.subscribe(componentName, stateMachineResponse, function(jsonData) {
          console.log(jsonData);
        });*/

        /*subscriber.getSnapshot(componentName, stateMachineResponse, function (items) {
          console.log("Snapshot2");          
          console.log(items);
          //items[0].send(messageType, jsonMessage);
        });*/

        /*subscriber.getSnapshot(componentName, stateMachineName, function (items) {
          console.log(items);
          //items[0].send(messageType, jsonMessage);
        });*/

        /*setTimeout(function() {
          session.close();
        },1000);*/
      }

      var api = new XComponentAPI();
      api.createSession(xml, serverUrl, sessionListener);

    });

  }
});

