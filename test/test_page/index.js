var serverUrl = "wss://localhost:443";
var xcApiName = "WorldHelloApi.xcApi";

var sessionListener = (error, session) => {
    if (error) {
        console.log(error);
        reconnect();
        return;
    }
};

var reconnect = () => {
    var timeBeforeReconnection = 2;
    setTimeout(() => {
        xcomponentapi.default.createSession(xcApiName, serverUrl, sessionListener, deconnectionErrorListener);
    }, timeBeforeReconnection * 1000);
};

var deconnectionErrorListener = () => {
    reconnect();
};

xcomponentapi.default.createSession(xcApiName, serverUrl, sessionListener, deconnectionErrorListener);
