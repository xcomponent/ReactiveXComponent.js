
console.log(xcomponentapi);
var serverUrl = "wss://localhost:443";

var component = {
    GoodByeWorld: "GoodByeWorld",
    HelloWorld : "HelloWorld"
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

xcomponentapi.getXcApiList(serverUrl, function (connection, apis) {
    connection.createSession(apis[0], serverUrl, function (err, session) {
        if (err) return;
        var publisher = session.createPublisher();
        var subcriber = session.createSubscriber();
        publisher.send(component.HelloWorld, stateMachine.HelloWorldManager, MessageType.SayHello, jsonMessage);
        subscriber.getSnapshot(component.HelloWorld, stateMachine.HelloWorldManager, function(items) {
            console.log(items);
        });
    });
})