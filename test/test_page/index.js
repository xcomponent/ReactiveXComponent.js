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

    xcomponentapi.default
    .getUnexpectedCloseSessionError(serverUrl)
    .then(err => {
        console.log("Imprevisible session close");        
        console.error(err);
    })
    .catch(err => {
        console.error("Initial connection Error");        
        console.error(err);
    });
