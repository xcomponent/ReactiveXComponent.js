
export const Kinds = {
    "Snapshot": 1,
    "Private": 2,
    "Public": 3
};


export enum Commands {
    update,
    snapshot,
    subscribe,
    unsubscribe,
    getXcApi,
    getXcApiList,
    getModel
}