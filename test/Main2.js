requirejs.config({
    urlArgs: 'bustCache=' + (new Date()).getTime(),
    baseUrl: '../src',

    paths: {
        'rx': '../node_modules/rx/dist/rx.all',
        'pako': '../node_modules/pako/dist/pako'
    },

    callback: function() {
        "use strict";

        require(["xcomponentAPI"], function(XComponentAPI) {
            var xml = `<?xml version="1.0" encoding="utf-8"?>
<deployment environment="Dev" xcProjectName="MyPricer" deploymentTargetCode="-1984047567" deploymentTargetName="MyPricerApi" version="1.0" frameworkType="Framework45" xmlns="http://xcomponent.com/DeploymentConfig.xsd">
  <threading />
  <serialization>Json</serialization>
  <communication>
    <websocket name="websocket" host="localhost" port="443" user="" password="" type="Secure" />
  </communication>
  <clientAPICommunication>
    <publish componentCode="1260456174" stateMachineCode="1260456174" eventType="UPDATE" topicType="output" communicationType="WEB_SOCKET" stateCode="1" eventCode="8" event="XComponent.Pricer.UserObject.Pricer" communication="websocket">
      <topic type="STATIC">input.1_0.microservice1.Pricer.Pricer</topic>
    </publish>
    <subscribe componentCode="1260456174" eventType="ERROR" topicType="input" communicationType="WEB_SOCKET" communication="websocket">
      <topic type="STATIC">error.1_0.microservice1.Pricer</topic>
    </subscribe>
    <subscribe componentCode="1260456174" stateMachineCode="1516278384" eventType="UPDATE" topicType="input" communicationType="WEB_SOCKET" event="XComponent.Pricer.UserObject.PricerResult" communication="websocket" communicationThreadingType="INHERITFROMPARENT">
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
          <event name="XComponent.Pricer.UserObject.Pricer" id="8" />
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
              <State name="Result" id="0" />
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
            var messageType = "XComponent.Pricer.UserObject.Pricer";
            var jsonMessage = { "Price": 100, "Discount": 5 };

            var sessionListener = function(error, session) {
                if (error) {
                    console.log("Connection lost !!!!!!!");
                    console.log(error);
                    return;
                }

                var subscriber1 = session.createSubscriber();
                var subscriber2 = session.createSubscriber();
                var publisher = session.createPublisher();

                /*subscriber.subscribe(componentName, stateMachineResponse, function (jsonData) {
                  console.log("subscribeeeeeeeeeeeee");
                  console.log(jsonData);
                });*/

                subscriber1.subscribe(componentName, stateMachineResponse, function(jsonData) {
                    console.log("subscribe 1");
                    console.log(jsonData.jsonMessage);
                    //items[0].send();//todo
                    //items[0].send(messageType, jsonMessage, true);
                    //subscriber.dispose();
                });
                /*subscriber2.subscribe(componentName, stateMachineResponse, function(jsonData) {
                    console.log("subscribe 2");
                    console.log(jsonData.jsonMessage);
                    //items[0].send();//todo
                    //items[0].send(messageType, jsonMessage, true);
                    //subscriber2.dispose();
                    //session.dispose(subscriber2);*/
                subscriber2.getSnapshot(componentName, stateMachineName, function(items) {
                    console.log(items);
                    //items[0].send();//todo
                    //items[0].send(messageType, jsonMessage, true);
                });

                /*});*/

                session.setPrivateTopic("TEST0");
                session.addPrivateTopic("TEST1");
                session.addPrivateTopic("TEST2");

                publisher.send(componentName, stateMachineName, messageType, jsonMessage, true);
                publisher.send(componentName, stateMachineName, messageType, jsonMessage, true, "TEST1");
                publisher.send(componentName, stateMachineName, messageType, jsonMessage, true, "TEST2");

            }

            var api = new XComponentAPI();
            api.createSession(xml, serverUrl, sessionListener);


        });

    }
});