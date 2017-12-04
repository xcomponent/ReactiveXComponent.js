const serverUrl = "wss://localhost:443";
const xcApiName = "HelloWorldApi.xcApi";

xcomponentapi.default
    .createSession(xcApiName, serverUrl, (err) => {
        console.error("Unexecpected session close");
        console.error(err);
    })
    .then(session => {
        console.log("connected");
    })
    .catch(err => {
        console.error(err);
        console.error("Initial connection Error");
    });
