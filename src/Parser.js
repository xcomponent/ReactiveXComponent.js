
define(["ObjectsConfig"], function (ObjectsConfig) {
    "use strict";

    var Parser = function (xml) {
        var _xml = xml;

        this.getXml = function () {
            return _xml;
        }

        var _xmlDom = (function (xml) {
            var xmlDom = (new ObjectsConfig.DOMParser).parseFromString(xml, 'text/xml');
            return xmlDom;
        })(xml);

        this.getXmlDom = function () {
            return _xmlDom;
        }

    }

    Parser.prototype.getCodes = function (componentName, stateMachineName) {
        var components = this.getXmlDom().getElementsByTagName("component");
        for (var i = 0; i < components.length; i++) {
            if (componentName == components[i].getAttribute("name")) {
                var componentCode = components[i].getAttribute("id");
                var stateMachines = components[i].getElementsByTagName("stateMachine");
                for (var j = 0; j < stateMachines.length; j++) {
                    if (stateMachineName == stateMachines[j].getAttribute("name")) {
                        return {
                            "componentCode": components[i].getAttribute("id"),
                            "stateMachineCode": stateMachines[j].getAttribute("id")
                        };
                    }
                }
            }
        }
    }


    Parser.prototype.getPublish = function (componentCode, stateMachineCode) {
        var publishs = this.getXmlDom().getElementsByTagName("publish");
        for (var i = 0; i < publishs.length; i++) {
            if (componentCode == publishs[i].getAttribute("componentCode") &&
                stateMachineCode == publishs[i].getAttribute("stateMachineCode")) {
                return {
                    eventCode: publishs[i].getAttribute("eventCode"),
                    messageType: publishs[i].getAttribute("event"),
                    routingKey: publishs[i].getElementsByTagName("topic")[0].textContent
                };
            }
        }
    }


    return Parser;
});
