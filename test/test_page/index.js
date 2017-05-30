var serverUrl = "wss://localhost:443";
var xcApiName = "WorldHelloApi.xcApi";

xcomponentapi.default.createSession(xcApiName, serverUrl, (error, session) => {
    if (error) {
        console.log(error);
        return;
    }
    session.close();
});
