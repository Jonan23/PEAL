export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error,
  ) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error: error?.stack || error?.message,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    const color = this.getColor(level);
    const reset = "\x1b[0m";
    console.log(
      `${color}[${level.toUpperCase()}]${reset} ${entry.timestamp} - ${message}`,
      context || "",
    );

    if (error) {
      console.error(error.stack);
    }
  }

  private getColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return "\x1b[36m";
      case LogLevel.INFO:
        return "\x1b[32m";
      case LogLevel.WARN:
        return "\x1b[33m";
      case LogLevel.ERROR:
        return "\x1b[31m";
      default:
        return "";
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  getLogs(level?: LogLevel, limit = 100): LogEntry[] {
    let filtered = this.logs;
    if (level) {
      filtered = this.logs.filter((l) => l.level === level);
    }
    return filtered.slice(-limit);
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();
