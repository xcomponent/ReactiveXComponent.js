## Reactive XComponent API
Reactive XComponent is a javaScript client API that allows you to interact with microservices generated with XComponent software.

## Build
Download the source code and execute the following command:
``` npm install .```

## Usage
Example of XComponent API usage
```js
        require(["xcomponentAPI"], function (XComponentAPI) {
            
            var serverUrl = "wss://localhost:443";

            var jsonMessage1 = { "Name": "Test1" };
            var messageType1 = "XComponent.HelloWorld.UserObject.SayHello";

            var jsonMessage2 = { "Name": "Test2" };
            var messageType2 = messageType1;

            var jsonMessage3 = { "Name": "Test3" };
            var messageType3 = "XComponent.HelloWorld.UserObject.SayGoodBye";

            var componentName = "HelloWorld";
            var stateMachineName = "HelloWorldManager";
            var stateMachineResponse = "HelloWorldResponse";

            var sessionListener = function (error, session) {
                if (error) {
                    console.log(error);
                    return;
                }

                var subscriber = session.createSubscriber();
                var i = 0;
                var stateMachineUpdateListener = function (jsonData) {
                    console.log(jsonData.jsonMessage);
                    if (i == 0) {
                        jsonData.stateMachineRef.send(messageType2, jsonMessage2);
                        jsonData.stateMachineRef.send(messageType2, jsonMessage2);
                        setTimeout(function () {
                            jsonData.stateMachineRef.send(messageType3, jsonMessage3);
                        }, 1000);
                        i++;
                    }
                }
                subscriber.subscribe(componentName, stateMachineResponse, stateMachineUpdateListener);

                var publisher = session.createPublisher();
                publisher.send(componentName, stateMachineName, messageType1, jsonMessage1);
            }

            var xml = ...; //get your xcApi file configuration
            var api = new XComponentAPI();
            api.createSession(xml, serverUrl, sessionListener);
        });

```

## Contributing
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## License
Apache License V2

