export interface LogMethod {
    (...args: unknown[]): void;
}

export interface LoggerInstance {
    debug: LogMethod;
    info: LogMethod;
    warn: LogMethod;
    error: LogMethod;
}

export class Logger {
    static getLogger(name: string): LoggerInstance {
        const wrap = (fn: (...args: unknown[]) => void): LogMethod => {
            return (...args: unknown[]) => fn(`[${name}]`, ...args);
        };

        return {
            debug: wrap(console.debug),
            info: wrap(console.info),
            warn: wrap(console.warn),
            error: wrap(console.error),
        };
    }
}
