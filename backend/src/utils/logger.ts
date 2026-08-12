export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

class Logger {
  private level: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'INFO';

  private levels: Record<LogLevel, number> = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.level];
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const isProd = process.env.NODE_ENV === 'production';

    if (isProd) {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...(meta ? { meta } : {}),
      });
    }

    const emoji = {
      DEBUG: '🐛',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌',
    }[level];

    return `[${timestamp}] ${emoji} [${level}]: ${message} ${meta ? JSON.stringify(meta) : ''}`;
  }

  debug(message: string, meta?: any) {
    if (this.shouldLog('DEBUG')) console.debug(this.formatMessage('DEBUG', message, meta));
  }

  info(message: string, meta?: any) {
    if (this.shouldLog('INFO')) console.log(this.formatMessage('INFO', message, meta));
  }

  warn(message: string, meta?: any) {
    if (this.shouldLog('WARN')) console.warn(this.formatMessage('WARN', message, meta));
  }

  error(message: string, error?: any, meta?: any) {
    if (this.shouldLog('ERROR')) {
      console.error(
        this.formatMessage('ERROR', message, {
          ...(error instanceof Error ? { errorMessage: error.message, stack: error.stack } : { error }),
          ...meta,
        })
      );
    }
  }
}

export const logger = new Logger();
