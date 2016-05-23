define(function () {
	"use strict"

	var Publisher = function(parser) {
		this.parser = parser;
	}


    Publisher.prototype.getEventToSend = function (componentName, stateMachineName, jsonMessage) {
        var codes = this.parser.getCodes(componentName, stateMachineName);
        var publish = this.parser.getPublishDetails(codes.componentCode, codes.stateMachineCode);

        var event = {
            "Header": {
                "StateMachineCode": { "Case": "Some", "Fields": [parseInt(codes.stateMachineCode)] },
                "ComponentCode": { "Case": "Some", "Fields": [parseInt(codes.componentCode)] },
                "EventCode": parseInt(publish.eventCode),
                "IncomingType": 0,
                "MessageType": { "Case": "Some", "Fields": [publish.messageType] }
            },
            "JsonMessage": JSON.stringify(jsonMessage)
        };
        return { event: event, routingKey: publish.routingKey }
    }


	return Publisher;
});
