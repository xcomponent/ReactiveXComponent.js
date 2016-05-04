


function getStringXcApi() {
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
}
     

function getXmlDom(xml) {
    if (window.DOMParser) {
        xml = (new DOMParser).parseFromString(xml, 'text/xml');
    } else if (window.ActiveXObject) {
        xml = [new ActiveXObject('Microsoft.XMLDOM'), xml];
        xml[0].async = false;
        xml[0].loadXML(xml[1]);
        xml = xml[0];
    }
    return xml;
}


function getCodes(componentName, stateMachineName, xmlDom) {
    var components = xmlDom.getElementsByTagName("component");
    for (var i = 0; i < components.length; i++) {
        if (componentName.localeCompare(components[i].getAttributeNode("name").value) == 0) {
            var componentCode = components[i].getAttributeNode("id").value;
            var stateMachines = components[i].getElementsByTagName("stateMachine");
            for (var j = 0; j < stateMachines.length; j++) {
                if (stateMachineName.localeCompare(stateMachines[j].getAttribute("name").value == 0)) {
                    return {
                        "componentCode": components[i].getAttributeNode("id").value,
                        "stateMachineCode": stateMachines[j].getAttributeNode("id").value
                    };
                }
            }
            break;
        }
    }
    return null;
}


function getPublish(componentCode, stateMachineCode, xmlDom) {
    var publishs = xmlDom.getElementsByTagName("publish");
    for (var i = 0; i < publishs.length; i++) {
        if (componentCode.localeCompare(publishs[i].getAttribute("componentCode")) == 0 &&
            stateMachineCode.localeCompare(publishs[i].getAttribute("stateMachineCode")) == 0) {
            return publishs[i];
        }
    }
    return null;
}


function getEventToSend(componentName, stateMachineName, jsonMessage, xml) {
    var xmlDom = getXmlDom(xml);
    var codes = getCodes(componentName, stateMachineName, xmlDom);
    var publish = getPublish(codes.componentCode, codes.stateMachineCode, xmlDom);
    var routingKey = publish.getElementsByTagName("topic")[0].textContent;

    var event = {
        "Header": {
            "StateMachineCode": { "Case": "Some", "Fields": [parseInt(codes.stateMachineCode)] },
            "ComponentCode": { "Case": "Some", "Fields": [parseInt(codes.componentCode)] },
            "EventCode": parseInt(publish.getAttribute("eventCode")),
            "IncomingType": 0,
            "MessageType": { "Case": "Some", "Fields": [publish.getAttribute("event")] }
        },
        "JsonMessage": JSON.stringify(jsonMessage)
    };
    return { event: event, routingKey: routingKey }
}


var Api = function(host, port) {

    var _socket = new WebSocket(host + ":" + port);
    this.getSocket = function () {
        return _socket;
    }

    var _contexts = [];
    this.getContexts = function () {
        return _contexts;
    }

 
    this.send = function (componentName, stateMachineName, jsonMessage) {
        var xml = getStringXcApi();
        var data = getEventToSend(componentName, stateMachineName, jsonMessage, xml);
        var stringToSend = data.routingKey + " " + data.event.Header.ComponentCode.Fields[0]
                            + " " + JSON.stringify(data.event);
        tryToDo(function(param) {
            _socket.send(param);
        }, stringToSend);
    }

    //TODO
    this.sendContext = function() {
        
    }

    //Exec callback(param) if connection already established 
    //else wait and retry
    function tryToDo(callback, param) {
        if (_socket.readyState === 1) {
            callback(param);
        } else {
            setTimeout(function () {
                tryToDo(callback, param);
            }, 200);
        }
    }

    _socket.onmessage = function (e) {
        console.log("Message received");
        //var context = JSON.parse(e.data.substring(e.data.indexOf("{"), e.data.lastIndexOf("}") + 1));
        //_contexts.push(context);
        //console.log(_contexts);
        //console.log(e.data);
    }

    _socket.onopen = function (e) {
        console.log("connected to " + host + ":" + port);
    }

    _socket.onclose = function(e) {
        console.log("connection on " + host + ":" + port + " closed.");
    }
}

var jsonMessage = { "Name": "HAZEM LALLALAL !!!!!!!!!!!!!!" };
var componentName = "HelloWorld";
var stateMachineName = "HelloWorldManager";

var host = "wss://localhost";
var port = "443";
var api = new Api(host, port);

api.send(componentName, stateMachineName, jsonMessage);

