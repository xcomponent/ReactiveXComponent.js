var xml;
var serverUrl = "wss://10.211.55.3:443";

var jsonMessage1 = {};
var messageType1 = "XComponent.comp1.UserObject.Transition1";

var jsonMessage2 = { "Name": "Test2" };
var messageType2 = messageType1;

var jsonMessage3 = { "Name": "Test3" };
var messageType3 = "XComponent.HelloWorld.UserObject.SayGoodBye";

var componentName = "comp1";
var stateMachineName = "StateMachine1";
var stateMachineResponse = "StateMachine2";

var sessionListener = function (error, session) {
    if (error) {
        console.log(error);
        return;
    }

    var subscriber = session.createSubscriber();
    var i = 0;
    var stateMachineUpdateListener = function (jsonData) {
        console.log(jsonData.jsonMessage);
    }
    subscriber.subscribe(componentName, stateMachineResponse, stateMachineUpdateListener);

    var publisher = session.createPublisher();
    publisher.send(componentName, stateMachineName, messageType1, jsonMessage1);
    publisher.send(componentName, stateMachineName, messageType1, jsonMessage1);
}

var fileInput = document.getElementById('fileInput');
var fileDisplayArea = document.getElementById('fileDisplayArea');

fileInput.addEventListener('change', function (e) {
    var file = fileInput.files[0];
    var textType = /text.*/;

    var reader = new FileReader();

    reader.onload = function (e) {
        fileDisplayArea.innerText = reader.result;
        xml = reader.result;
        xcomponentapi.createSession(xml, serverUrl, sessionListener);
    }

    reader.readAsText(file);
});