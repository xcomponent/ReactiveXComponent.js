[![](http://slack.xcomponent.com/badge.svg)](http://slack.xcomponent.com/)
[![npm](https://img.shields.io/npm/v/reactivexcomponent.js.svg)](https://www.npmjs.com/package/reactivexcomponent.js)
[![npm](https://img.shields.io/npm/dt/reactivexcomponent.js.svg)](https://www.npmjs.com/package/reactivexcomponent.js)
[![Build Status](https://travis-ci.org/xcomponent/ReactiveXComponent.js.svg?branch=master)](https://travis-ci.org/xcomponent/ReactiveXComponent.js)

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
        const serverUrl = "wss://localhost:443";
        const xcApiName = "HelloWorldApi.xcApi"

        const jsonMessage = { "Name": "Test" };
        const messageType = "XComponent.HelloWorld.UserObject.SayHello";

        const componentName = "HelloWorld";
        const stateMachineName = "HelloWorldManager";
        const stateMachineResponse = "HelloWorldResponse";

        const visibilityPrivate = true;

        const sessionListener = (session) => {

            //Create a subscriber to receive updates and snapshots
            const subscriber = session.createSubscriber();
            
            //Check if subscriber stateMachineResponse of is exposed by xcApi
            if (subscriber.canSubscribe(componentName, stateMachineResponse)) {
                //stateMachineUpdateListener : callback executed when a message is received by the subscribed stateMachine
                const stateMachineUpdateListener = (jsonData) => {
                    //jsonMessage property is the public member
                    console.log(jsonData.jsonMessage);
                    //send context using directly stateMachineRef
                    jsonData.stateMachineRef.send(messageType, jsonMessage);
                }       
                // subscribe using a callback                
                subscriber.subscribe(componentName, stateMachineResponse, stateMachineUpdateListener);  
            }

            //Snapshot using with a Promise
            subscriber.getSnapshot(componentName, stateMachineResponse).then(items => {
                items.forEach(item => {
                    console.log(item.jsonMessage);
                    //each item contains stateMachineRef with a send method to publish an event to an instance                    
                    item.stateMachineRef.send(messageType, jsonMessage);
                })
            });

            //Create a publisher to send an event
            const publisher = session.createPublisher(); 

            //Check if publisher of stateMachineName is exposed by xcApi
            if (publisher.canPublish(componentName, stateMachineName, messageType1)) {
                //visibility parameter is optional. It is false by default.
                publisher.send(componentName, stateMachineName, messageType1, jsonMessage, visibilityPrivate);
            } 

        }

        const errorListener = (err) => {
            console.error("Unexpected session close");
            console.error(err);
        }
        // create a session using a Promise
        // errorListener is an optional parameter. it handles imprevisible session close
        xcomponentapi.createSession(xcApiName, serverUrl, errorListener)
            .then(session => {
                console.log("Session created successfully");
                sessionListener(session);
            })
            .catch(err => {
                console.error(err);
                console.error("Initial connection Error");
            });
        });        

```

## Build from source
Download the source code and execute the following commands:
``` 
yarn install
yarn build    
```
*xcomponentapi.js* is built in the *lib* folder. 

## Run unit tests
Execute the following command:
``` 
yarn test        
```

## Contributing
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## License
Apache License V2

