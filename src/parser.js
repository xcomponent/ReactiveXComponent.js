
define(["javascriptHelper", "configuration/xcomponentConfiguration"], function (javascriptHelper, XComponentConfiguration) {
    "use strict";


    var Parser = function (xml) {
        var xmlDom = (new javascriptHelper.DOMParser()).parseFromString(xml, 'text/xml');
        this.codes = getCodes(xmlDom);
        this.publishsDetails = getPublihsDetails(xmlDom);
    }


    var tags = XComponentConfiguration.tags;

    var getCodes = function(xmlDom) {
        var codes = {}, key, value;
        var componentName, stateMachineName;
        var components = xmlDom.getElementsByTagName(tags.component);
        for (var i = 0; i < components.length; i++) {
            var stateMachines = components[i].getElementsByTagName(tags.stateMachine);
            for (var j = 0; j < stateMachines.length; j++) {
                componentName = components[i].getAttribute(tags.name);
                stateMachineName = stateMachines[j].getAttribute(tags.name);
                key = getKey(componentName, stateMachineName);
                value = {
                    "componentCode": components[i].getAttribute(tags.id),
                    "stateMachineCode": stateMachines[j].getAttribute(tags.id)
                };
                codes[key] = value;
            }
        }
        return codes;
    }


    var getPublihsDetails = function(xmlDom) {
        var publishsDetails = {}, key, value;
        var componentCode, stateMachineCode;
        var publishs = xmlDom.getElementsByTagName(tags.publish);
        for (var i = 0; i < publishs.length; i++) {
            componentCode = publishs[i].getAttribute(tags.componentCode);
            stateMachineCode = publishs[i].getAttribute(tags.stateMachineCode);
            key = getKey(componentCode, stateMachineCode);
            value = {
                "eventCode": publishs[i].getAttribute(tags.eventCode),
                "messageType": publishs[i].getAttribute(tags.event),
                "routingKey": publishs[i].getElementsByTagName(tags.topic)[0].textContent
            };
            publishsDetails[key] = value;
        }
        return publishsDetails;
    }


    Parser.prototype.getCodes = function (componentName, stateMachineName) {
        var codes = this.codes[getKey(componentName, stateMachineName)];
        if (codes == undefined)
            throw new Error("codes not found");
        else
            return codes;
    }


    Parser.prototype.getPublishDetails = function (componentCode, stateMachineCode) {
        var publishesDetails = this.publishsDetails[getKey(componentCode, stateMachineCode)];
        if (publishesDetails == undefined)
            throw new Error("publishDetails not found");
        else
            return publishesDetails;
    }


    function getKey(component, stateMachine) {
        return component + " " + stateMachine;
    }

    var ComponentNotFoundException = function(name) {
        this.name = "ComponentNotFoundException";
    }

    var StateMachineNotFoundException = function (name) {
        this.name = "StateMachineNotFoundException";
    }

    //ComponentNotFoundException and StateMachineNotFoundException

    /*Parser.prototype.getSubscribe = function (componentName, stateMachineName) {
        var codes = this.getCodes(componentName, stateMachineName);
        var subscribes = this.getXmlDom().getElementsByTagName(tags.subscribe);
        for (var i = 0; i < subscribes.length; i++) {
            if (subscribes[i].getAttribute(tags.componentCode) == codes.componentCode &&
                subscribes[i].getAttribute(tags.stateMachineCode) == codes.stateMachineCode) {
                return {
                    "componentCode": codes.componentCode,
                    "stateMachineCode": codes.stateMachineCode,
                    "topic": subscribes[i].getElementsByTagName(tags.topic)[0].textContent
                };
            }
        }
    }*/

    return Parser;
});
