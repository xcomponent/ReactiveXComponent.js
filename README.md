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
            var jsonMessage2 = { "Name": "Test2" };
            var jsonMessage3 = { "Name": "Test3" };

            var componentName = "HelloWorld";
            var stateMachineName = "HelloWorldManager";
            var stateMachineResponse = "HelloWorldResponse";

            var sessionListener = function (error, session) {
                if (error) {
                    console.log(error);
                    return;
                }
                var publisher = session.createPublisher();
                publisher.send(componentName, stateMachineName, jsonMessage1);

                var subscriber = session.createSubscriber();
                var i = 0;
                var stateMachineUpdateListener = function (jsonData) {
                    console.log(jsonData.jsonMessage);
                    if (i == 0) {
                        jsonData.stateMachineRef.send(jsonMessage2);
                        publisher.sendWithStateMachineRef(jsonData.stateMachineRef, jsonMessage3);
                        i++;
                    }
                }
                subscriber.subscribe(componentName, stateMachineResponse, stateMachineUpdateListener);
            }

            var api = new XComponentAPI();
            api.createSession(serverUrl, sessionListener);

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

