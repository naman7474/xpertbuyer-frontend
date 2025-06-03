import config from '../config';

type LogLevel = 'log' | 'warn' | 'error' | 'debug';

interface Logger {
  log: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

const createLogger = (): Logger => {
  const shouldLog = config.ENABLE_LOGGING;

  const logMethod = (level: LogLevel) => (message: string, ...args: any[]) => {
    if (shouldLog) {
      console[level](message, ...args);
    }
  };

  return {
    log: logMethod('log'),
    warn: logMethod('warn'),
    error: logMethod('error'),
    debug: logMethod('debug')
  };
};

export const logger = createLogger(); 