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

            var jsonMessage = { "Name": "Test1" };
      
            var componentName = "HelloWorld";
            var stateMachineName = "HelloWorldManager";
            var stateMachineResponse = "HelloWorldResponse";

            var sessionListener = function (error, session) {
                if (error) {
                    console.log(error);
                    return;
                }
                var publisher = session.createPublisher();
                publisher.send(componentName, stateMachineName, jsonMessage);


                var subscriber = session.createSubscriber();
                var stateMachineUpdateListener = function (jsonData) {
                    console.log(jsonData);
                    publisher.sendContext(jsonData.stateMachineRef, jsonMessage);
                        
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

