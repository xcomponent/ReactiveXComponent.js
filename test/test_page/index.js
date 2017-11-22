const serverUrl = "wss://localhost:443";
const xcApiName = "HelloWorldApi.xcApi";

xcomponentapi.default
    .createSession(xcApiName, serverUrl)
    .then(session => {
        console.log("connected");
    })
    .catch(err => {
        console.error(err);        
        console.error("Initial connection Error");
    });
