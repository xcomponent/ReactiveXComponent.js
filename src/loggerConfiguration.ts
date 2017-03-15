let log = require("loglevel");

export let isDebugEnabled = (): boolean => {
    return log.getLevel() === log.levels.DEBUG;
};