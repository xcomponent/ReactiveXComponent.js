
define(["javascriptHelper"], function (javascriptHelper) {
    "use strict";

    var Parser = function() {
    }


    Parser.prototype.parse = function (xml, tags) {
        var xmlDom = (new javascriptHelper.DOMParser()).parseFromString(xml, 'text/xml');
        this.codes = getCodes(xmlDom, tags);
        this.publishersDetails = getPublihersDetails(xmlDom, tags);
    }


    var getCodes = function (xmlDom, tags) {
        var codes = {}, key, value;
        var componentName, stateMachineName, stateMachines;
        var components = xmlDom.getElementsByTagName(tags.component);
        for (var i = 0; i < components.length; i++) {
            componentName = components[i].getAttribute(tags.name);
            stateMachines = components[i].getElementsByTagName(tags.stateMachine);
            codes[componentName] = {
                "componentCode": components[i].getAttribute(tags.id),
                "stateMachineCodes": getStateMachineCodes(stateMachines, tags)
            };
        }
        return codes;
    }


    var getStateMachineCodes = function (stateMachines, tags) {
        var stateMachineCodes = {};
        var stateMachineName, stateMachineCode;
        for (var j = 0; j < stateMachines.length; j++) {
            stateMachineName = stateMachines[j].getAttribute(tags.name);
            stateMachineCode = stateMachines[j].getAttribute(tags.id);
            stateMachineCodes[stateMachineName] = stateMachineCode;
        }
        return stateMachineCodes;
    }


    var getPublihersDetails = function (xmlDom, tags) {
        var publishersDetails = {}, key, value;
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
            publishersDetails[key] = value;
        }
        return publishersDetails;
    }


    Parser.prototype.getCodes = function (componentName, stateMachineName) {
        var componentCode, stateMachineCode;
        if (this.codes[componentName] == undefined) {
            throw new Error("Component '" + componentName + "' not found");
        } else {
            componentCode = this.codes[componentName].componentCode;
        }

        var stateMachineCodes = this.codes[componentName].stateMachineCodes;
        if (stateMachineCodes[stateMachineName] == undefined) {
            throw new Error("StateMachine '" + stateMachineName + "' not found");
        } else {
            stateMachineCode = stateMachineCodes[stateMachineName];
        }
        return {
            "componentCode": componentCode,
            "stateMachineCode": stateMachineCode
        }
    }


    Parser.prototype.getPublisherDetails = function (componentCode, stateMachineCode) {
        var publisherDetails = this.publishersDetails[getKey(componentCode, stateMachineCode)];
        if (publisherDetails == undefined) {
            throw new Error("PublisherDetails not found");
        } else {
            return publisherDetails;
        }
    }


    function getKey(component, stateMachine) {
        return component + " " + stateMachine;
    }

    


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
