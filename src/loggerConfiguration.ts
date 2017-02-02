let log = require("loglevel");

export enum LogLevel {
    INFO,
    SILENT,
    DEBUG
};

export let isDebugEnabled = (): boolean => {
    return log.getLevel() === log.levels.DEBUG;
};

/*export let logDebug = (s: string | Error): void => {
    if (isDebugEnabled()) {
        log.debug(s);
    }
};*/