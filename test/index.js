
console.log(xcomponentapi);
var serverUrl = "wss://localhost:443";

var component = {
    GoodByeWorld: "GoodByeWorld",
    HelloWorld: "HelloWorld"
};

var stateMachine = {
    HelloWorldManager: "HelloWorldManager",
    HelloWorldResponse: "HelloWorldResponse"
}

var MessageType = {
    SayHello: "XComponent.HelloWorld.UserObject.SayHello"
}

var jsonMessage = {
    "Name": "Hazem"
};

var privateTopic = "xxxxxxxxxxxxxxxxxxxxx";

xcomponentapi.getXcApiList(serverUrl, function (connection, apis) {
    connection.createSession(apis[0], serverUrl, function (err, session) {
        if (err) return;
        var publisher = session.createPublisher();
        var subscriber = session.createSubscriber();
        subscriber.getSnapshot(component.HelloWorld, stateMachine.HelloWorldManager, function (items) {
            console.log(items);
            items[0].stateMachineRef.send(MessageType.SayHello, jsonMessage);
            publisher.sendWithStateMachineRef(items[0].stateMachineRef, MessageType.SayHello, jsonMessage);
        });
        subscriber.subscribe(component.HelloWorld, stateMachine.HelloWorldResponse, function (jsonData) {
            console.log(jsonData);
        });
        publisher.send(component.HelloWorld, stateMachine.HelloWorldManager, MessageType.SayHello, jsonMessage, true);
        session.addPrivateTopic(privateTopic);
        publisher.send(component.HelloWorld, stateMachine.HelloWorldManager, MessageType.SayHello, jsonMessage, true, privateTopic);   

        setTimeout(function() {
            session.close();
        },5000)     
    });

    /*connection.getModel(apis[0], serverUrl, function (model) {
        console.log(model);
    });*/

})

