var serverUrl = "wss://localhost:443";
var xcApiName = "WorldHelloApi.xcApi";
var sessionListener = (error, session) => {
    if (error) {
        console.log(error);
        return;
    }
    session.close();
};
var timeBeforeReconnection = 20;
var deconnectionErrorListener = (e) => {
    // Application can handle deconnectionErrors as follow
    setTimeout(() => {
        xcomponentapi.default.createSession(xcApiName, serverUrl, sessionListener);
    }, timeBeforeReconnection * 1000)
};
xcomponentapi.default.createSession(xcApiName, serverUrl, sessionListener, deconnectionErrorListener);
