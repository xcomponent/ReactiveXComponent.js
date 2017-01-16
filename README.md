## Reactive XComponent API
Reactive XComponent is a javaScript client API that allows you to interact with microservices generated with XComponent software.

## Install
Use npm to install the latest version of the API:
``` npm i reactivexcomponent.js --save ```

## Usage
Import *xcomponentapi.js* module:
```html
import xcomponentapi from 'reactivexcomponent.js';
```

Example of XComponent API usage
```js
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

        var visibility = true;

        //sessionListener : callback executed when a session is open
        var sessionListener = function (error, session) {
            //check if session is initialized
            if (error) {
                console.log(error);
                return;
            }

            //create a subscriber to subscribe
            var subscriber = session.createSubscriber();
            
            //check if subscriber stateMachineResponse of is exposed by xcApi
            if (subscriber.canSubscribe(componentName, stateMachineResponse)) {
                //stateMachineUpdateListener : callback executed when a message is received by the subscribed stateMachine
                var stateMachineUpdateListener = function (jsonData) {
                    //jsonMessage property is the public member
                    console.log(jsonData.jsonMessage);
                    //send context using directly stateMachineRef
                    jsonData.stateMachineRef.send(messageType3, jsonMessage3);
                }       
                subscriber.subscribe(componentName, stateMachineResponse, stateMachineUpdateListener);         
            }

                
            //Snapshot is used as follow
            subscriber.getSnapshot(componentName, stateMachineResponse, function (items) {
                //items is an array of instances of stateMachineResponse
                console.log(items[0].PublicMember);
                //each item contains a send method to send an event with a context
                items[0].send(messageType, jsonMessage);
            });

            //create a publisher to send an event
            var publisher = session.createPublisher(); 

            //check if publisher of stateMachineName is exposed by xcApi
            if (publisher.canPublish(componentName, stateMachineName)) {
                //visibility parameter is optional. It is false by default.
                publisher.send(componentName, stateMachineName, messageType1, jsonMessage1, visibility);
            } 

        }

        var xcApiName = "HelloWorldApi.xcApi"            
        xcomponentapi.createSession(xcApiName, serverUrl, sessionListener);

```

## Build from source
Download the source code and execute the following commands:
``` 
npm install
npm run build    
```
*xcomponentapi.js* is built in the *dist* folder. 

## Run unit tests
Execute the following command:
``` 
npm test        
```

## Contributing
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## License
Apache License V2

