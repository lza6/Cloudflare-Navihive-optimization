/**
 * 统一日志记录工具
 */

export interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

export class Logger {
  private static instance: Logger;
  private enabled: boolean = true;
  private minLevel: 'debug' | 'info' | 'warn' | 'error' = 'info';
  
  private constructor() {}
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  
  enable(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  setMinLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    this.minLevel = level;
  }
  
  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    if (!this.enabled) return false;
    
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.minLevel];
  }
  
  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    const message = entry.message;
    
    let formatted = `[${timestamp}] ${level}: ${message}`;
    
    if (entry.context) {
      formatted += ` | Context: ${JSON.stringify(entry.context)}`;
    }
    
    if (entry.error) {
      formatted += ` | Error: ${entry.error.stack || entry.error.message}`;
    }
    
    return formatted;
  }
  
  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;
    
    const formattedMessage = this.formatMessage(entry);
    
    switch (entry.level) {
      case 'debug':
        console.debug(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        break;
    }
  }
  
  debug(message: string, context?: Record<string, unknown>): void {
    this.log({ timestamp: new Date(), level: 'debug', message, context });
  }
  
  info(message: string, context?: Record<string, unknown>): void {
    this.log({ timestamp: new Date(), level: 'info', message, context });
  }
  
  warn(message: string, context?: Record<string, unknown>): void {
    this.log({ timestamp: new Date(), level: 'warn', message, context });
  }
  
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log({ timestamp: new Date(), level: 'error', message, error, context });
  }
}

export const logger = Logger.getInstance();