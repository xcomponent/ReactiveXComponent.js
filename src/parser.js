
define(["./javascriptHelper"], function (javascriptHelper) {
    "use strict";

    var Parser = function () {
    }


    Parser.prototype.parse = function (xml, tags) {
        var DOMParser = javascriptHelper.getJavascriptHelper().DOMParser;
        var xmlDom = (new DOMParser()).parseFromString(xml, 'text/xml');
        this.codes = getCodes(xmlDom, tags);
        this.publishersDetails = getPublihersDetails(xmlDom, tags);
        this.subscribersTopics = getSubscribersTopics(xmlDom, tags);
        this.snapshotTopics = getSnapshotTopics(xmlDom, tags);
    }


    var getSnapshotTopics = function (xmlDom, tags) {
        var snapshots = xmlDom.getElementsByTagName(tags.snapshot);
        var snapshotTopics = {};
        var componentCode, topic;
        for (var i = 0; i < snapshots.length; i++) {
            componentCode = snapshots[i].getAttribute(tags.componentCode);
            topic = snapshots[i].getElementsByTagName(tags.topic)[0].textContent;
            snapshotTopics[componentCode] = topic;
        }
        return snapshotTopics;
    }


    var getSubscribersTopics = function (xmlDom, tags) {
        var subscribersTopics = {};
        var subscribers = xmlDom.getElementsByTagName(tags.subscribe);
        var componentCode, stateMachineCode, topic;
        for (var i = 0; i < subscribers.length; i++) {
            componentCode = subscribers[i].getAttribute(tags.componentCode);
            stateMachineCode = subscribers[i].getAttribute(tags.stateMachineCode);
            topic = subscribers[i].getElementsByTagName(tags.topic)[0].textContent;
            subscribersTopics[getKey([componentCode, stateMachineCode])] = topic;
        }
        return subscribersTopics;
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
        var componentCode, stateMachineCode, messageType;
        var publishs = xmlDom.getElementsByTagName(tags.publish);
        for (var i = 0; i < publishs.length; i++) {
            componentCode = publishs[i].getAttribute(tags.componentCode);
            stateMachineCode = publishs[i].getAttribute(tags.stateMachineCode);
            messageType = publishs[i].getAttribute(tags.event);
            key = getKey([componentCode, stateMachineCode, messageType]);
            value = {
                "eventCode": publishs[i].getAttribute(tags.eventCode),
                "routingKey": publishs[i].getElementsByTagName(tags.topic)[0].textContent
            };
            publishersDetails[key] = value;
        }
        return publishersDetails;
    }


    var getComponentCode = function (codes, componentName) {
        var componentCode;
        if (codes[componentName] == undefined) {
            throw new Error("Component '" + componentName + "' not found");
        } else {
            componentCode = codes[componentName].componentCode;
        }
        return componentCode;
    }


    var getStateMachineCode = function (codes, componentName, stateMachineName) {
        var stateMachineCode;
        var stateMachineCodes = codes[componentName].stateMachineCodes;
        if (stateMachineCodes[stateMachineName] == undefined) {
            throw new Error("StateMachine '" + stateMachineName + "' not found");
        } else {
            stateMachineCode = stateMachineCodes[stateMachineName];
        }
        return stateMachineCode;
    }


    Parser.prototype.getCodes = function (componentName, stateMachineName) {
        var componentCode = getComponentCode(this.codes, componentName);
        var stateMachineCode = getStateMachineCode(this.codes, componentName, stateMachineName);
        return {
            "componentCode": componentCode,
            "stateMachineCode": stateMachineCode
        }
    }


    Parser.prototype.getPublisherDetails = function (componentCode, stateMachineCode, messageType) {
        var publisherDetails = this.publishersDetails[getKey([componentCode, stateMachineCode, messageType])];
        if (publisherDetails == undefined) {
            throw new Error("PublisherDetails not found");
        } else {
            return publisherDetails;
        }
    }


    Parser.prototype.getSubscriberTopic = function (componentName, stateMachineName) {
        var codes = this.getCodes(componentName, stateMachineName);
        var key = getKey([codes.componentCode, codes.stateMachineCode]);
        var topic = this.subscribersTopics[key];
        return topic;
    }


    Parser.prototype.getSnapshotTopic = function (componentName) {
        var componentCode = getComponentCode(this.codes, componentName);
        return this.snapshotTopics[componentCode];
    }


    var getKey = function (array) {
        var key = "";
        for (var i = 0; i < array.length; i++)
            key += array[i];
        return key;
    }


    return Parser;
});
