/**
 * 统一错误处理工具
 */

import { logger } from './logger';

export interface AppErrorOptions {
  cause?: Error;
  context?: Record<string, unknown>;
  showToUser?: boolean;
}

export class AppError extends Error {
  public readonly cause?: Error;
  public readonly context?: Record<string, unknown>;
  public readonly showToUser: boolean;
  public readonly timestamp: Date;
  public readonly stackTrace?: string;

  constructor(
    message: string,
    options: AppErrorOptions = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.cause = options.cause;
    this.context = options.context;
    this.showToUser = options.showToUser ?? true;
    this.timestamp = new Date();
    
    // Capture stack trace
    this.stackTrace = new Error().stack;
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause ? {
        name: this.cause.name,
        message: this.cause.message
      } : undefined,
      context: this.context,
      showToUser: this.showToUser,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, { ...options, showToUser: true });
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, { ...options, showToUser: true });
    this.name = 'NetworkError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, { ...options, showToUser: true });
    this.name = 'AuthError';
  }
}

export class DataError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, { ...options, showToUser: true });
    this.name = 'DataError';
  }
}

/**
 * 错误处理工具类
 */
export class ErrorHandler {
  /**
   * 处理错误并记录日志
   */
  static handle(error: unknown, context?: string): AppError {
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
    } else if (error instanceof Error) {
      appError = new AppError(
        error.message || '未知错误',
        { 
          cause: error, 
          context: { originalError: error.message },
          showToUser: false 
        }
      );
    } else if (typeof error === 'string') {
      appError = new AppError(error, { showToUser: true });
    } else {
      appError = new AppError(
        '未知错误',
        { 
          context: { originalError: error },
          showToUser: false 
        }
      );
    }

    // 记录错误日志
    logger.error(
      `${context ? `${context}: ` : ''}${appError.message}`,
      appError.cause,
      { ...appError.context, errorType: appError.name }
    );

    return appError;
  }

  /**
   * 格式化错误消息供用户显示
   */
  static formatUserMessage(error: AppError): string {
    if (!error.showToUser) {
      return '发生了一个错误，请稍后重试';
    }

    // 根据错误类型提供不同的用户友好消息
    switch (error.name) {
      case 'ValidationError':
        return `输入验证失败: ${error.message}`;
      case 'NetworkError':
        return '网络连接失败，请检查网络后重试';
      case 'AuthError':
        return '认证失败，请重新登录';
      case 'DataError':
        return `数据错误: ${error.message}`;
      default:
        return error.message || '发生了一个错误';
    }
  }

  /**
   * 检查错误是否应该显示给用户
   */
  static shouldShowToUser(error: unknown): boolean {
    if (error instanceof AppError) {
      return error.showToUser;
    }
    return false;
  }

  /**
   * 从错误中提取用户消息
   */
  static getUserMessage(error: unknown): string {
    if (error instanceof AppError) {
      return this.formatUserMessage(error);
    }
    
    if (error instanceof Error) {
      return error.message || '发生了一个错误';
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return '发生了一个错误';
  }
}

/**
 * 异步错误处理装饰器
 */
export function handleAsyncError<T extends (...args: any[]) => any>(
  fn: T,
  context?: string
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    try {
      return await fn(...args);
    } catch (error) {
      const handledError = ErrorHandler.handle(error, context);
      throw handledError;
    }
  };
}

/**
 * 重试机制
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000,
  context?: string
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      logger.warn(
        `${context ? `${context}: ` : ''}尝试 ${i + 1}/${retries} 失败`,
        { attempt: i + 1, error: (error as Error).message }
      );

      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i))); // 指数退避
      }
    }
  }

  throw ErrorHandler.handle(lastError, `${context} (经过 ${retries} 次重试)`);
}