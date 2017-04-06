let log = require("loglevel");

export let isDebugEnabled = (): boolean => {
    return log.getLevel() === log.levels.DEBUG;
};

export interface ILogLevels {
    DEBUG: number;
    INFO: number;
};

export const LogLevels: ILogLevels = {
    DEBUG: log.levels.DEBUG,
    INFO: log.levels.INFO
};