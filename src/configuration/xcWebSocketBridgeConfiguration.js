
define(function () {
    "use strict";

    var kinds = {
        "Snapshot": 1,
        "Private": 2,
        "Public": 3
    };

    var commands = {
        subscribe: "subscribe",
        unsubscribe: "unsubscribe",
        getXcApi: "getXcApi",
        getXcApiList: "getXcApiList",
        getModel: "getModel"
    }

    return {
        kinds: kinds,
        commands: commands
    };
});
