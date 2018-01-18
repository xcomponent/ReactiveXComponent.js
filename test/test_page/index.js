const serverUrl = "wss://localhost:443";
const xcApiName = "HelloWorldApi.xcApi";

xcomponentapi.default
    .connect(serverUrl)
    .then(connection => {
        return connection.createSession(xcApiName);
    })
    .then(session => {
        return session.getSnapshot(componentName, stateMachineName);
    })
    .then(snapshot => {
        snapshot.forEach(snapshotElement => console.log('Element : ' + snapshotElement.stateMachineRef.StateMachineCode));
    })
    .catch(err => {
        console.log(err);
    });