var xcomponentapi = require("../../lib/xcomponentapi.node.js");

var serverUrl = "wss://localhost:443";

xcomponentapi.default.getXcApiList(serverUrl, function (connection, apis) {
	console.log(apis);
});