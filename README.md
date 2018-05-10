[![](http://slack.xcomponent.com/badge.svg)](http://slack.xcomponent.com/)
[![npm](https://img.shields.io/npm/v/reactivexcomponent.js.svg)](https://www.npmjs.com/package/reactivexcomponent.js)
[![npm](https://img.shields.io/npm/dt/reactivexcomponent.js.svg)](https://www.npmjs.com/package/reactivexcomponent.js)
[![Build Status](https://travis-ci.org/xcomponent/ReactiveXComponent.js.svg?branch=master)](https://travis-ci.org/xcomponent/ReactiveXComponent.js)
[![TypeScript](https://badges.frapsoft.com/typescript/love/typescript.png?v=101)](https://github.com/ellerbrock/typescript-badges/)


## Reactive XComponent API
Reactive XComponent is a javaScript client API that allows you to interact with microservices generated with XComponent software.

## Install
install the latest version of the API:

npm :
``` npm i reactivexcomponent.js --save ```

yarn :
``` yarn add reactivexcomponent.js ```

## Usage

Import in JS :
```js
import xcomponent from 'reactivexcomponent.js';
```

Import in TS :
```js
import { XComponent } from 'reactivexcomponent.js';
const xcomponent = new XComponent();
```

Set/Get LogLevel of the API :
```js
import { LogLevel } from 'reactivexcomponent.js';

xcomponent.setLogLevel(LogLevel.DEBUG);
const logLevel = xcomponent.getLogLevel();
```

Connect to XComponent WebSocket Bridge :
```js
const serverUrl = 'ws://localhost:443';

xcomponent.connect(serverUrl)
.then(connection => {
    // Here goes your code that uses the connection
});
```

Get the list of available APIs on the WebSocket Bridge :
```js
connection.getXcApiList().then(apiList => {
    apiList.forEach(api => console.log('Available Api : ' + api));
});
```

Create a Session on a specific API :
```js
const xcApiName = "HelloWorldApi.xcApi"

connection.createSession(xcApiName)
.then(session => {
    // Here goes your code that uses the session
});
```

Variables used in the following examples :
```js
const componentName = "HelloWorld";
const stateMachineName = "HelloWorldManager";
const stateMachineResponse = "HelloWorldResponse";

const jsonMessage = { "Name": "Test" };
const messageType = "XComponent.HelloWorld.UserObject.SayHello";
```

Get the Snapshot using a Session :
```js
session.getSnapshot(componentName, stateMachineName)
.then(snapshot => {
    snapshot.forEach(snapshotElement => console.log('Element : ' + snapshotElement));
});
```

Get StateMachine updates through an Observable using a Session :
```js
const updates$ = session.getStateMachineUpdates(componentName, stateMachineResponse);
```

Send a message to all instances of a state machine using a Session :
```js
// You can use the method canSend to check if the session is alowed the send this event to this state machine.
if (session.canSend(componentName, stateMachineName, messageType)) {
    session.send(componentName, stateMachineName, messageType, jsonMessage);
}
```

Send a message to a specific state machine instance using a StateMachineInstance or StateMachineRef :
```js
stateMachineInstance.send(messageType, jsonMessage);
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

