var xcomponentapi = require("../../lib/xcomponentapi.node.js");

var xcApiName = "WorldHelloApi.xcApi";
var serverUrl = "wss://localhost:443";
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var sessionListener = function (error, session) {
    if (error) {
        console.log(error);
        return;
    }
    console.log("connected");
    const subscriber = session.createSubscriber();
    subscriber.getSnapshot("WorldHello", "Manager", (items) => {
        console.log(items);
    });

    setTimeout(() => {
        session.close();
    }, 3000);
};
xcomponentapi.default.createSession(xcApiName, serverUrl, sessionListener);

/*const WebSocket = require('ws');

const ws = new WebSocket(serverUrl, [], {
    rejectUnauthorized: false
});

ws.on('open', function open() {
  console.log("OOOOOKKKKKKKKKKK");
  ws.close();
});

ws.on('close', function close(e) {
  console.log("CLOSEEEEEEEEEEEE");
  console.log(e);
});

ws.on('error', function onerror(e) {
  console.log(e);
});


ws.on('message', function incoming(data) {
  console.log(data);
  ws.close();
});*/
