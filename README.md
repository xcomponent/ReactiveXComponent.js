<snippet>
  <content><![CDATA[
# ${1:Reactive XComponent API}
${1:Reactive XComponent is a javaScript client API that allows you to interact with microservices generated with XComponent software.
## Installation
Download the project and execute the command 
```js npm install .```
## Usage
TODO: Write usage instructions
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
5. Submit a pull request :D
## History
TODO: Write history
## Credits
TODO: Write credits
## License
Apache License V2
]]></content>
  <tabTrigger>readme</tabTrigger>
</snippet>