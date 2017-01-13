
let kinds = {
    "Snapshot": 1,
    "Private": 2,
    "Public": 3
};

let commands = {
    update: "update",
    snapshot: "snapshot",
    subscribe: "subscribe",
    unsubscribe: "unsubscribe",
    getXcApi: "getXcApi",
    getXcApiList: "getXcApiList",
    getModel: "getModel"
};

let returnObject = {
    kinds: kinds,
    commands: commands
};

export default returnObject;
