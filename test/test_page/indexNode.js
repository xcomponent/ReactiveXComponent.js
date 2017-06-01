var xcomponentapi = require("../../lib/xcomponentapi.js").default;

var serverUrl = "wss://localhost:443";
var xcApiName = "WorldHelloApi.xcApi";

xcomponentapi.createSession(xcApiName, serverUrl, (error, session) => {
    if (error) {
        console.log(error);
        return;
    }
    session.close();
});