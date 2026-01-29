/**
 * 错误处理和性能监控工具
 */

// 错误类型枚举
export enum ErrorTypeEnum {
  SERVER_ERROR = 'SERVER_ERROR',           // 服务器错误
  NETWORK_ERROR = 'NETWORK_ERROR',         // 网络错误
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR', // 认证错误
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR', // 业务逻辑错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',   // 验证错误
  PERMISSION_ERROR = 'PERMISSION_ERROR',   // 权限错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'          // 未知错误
}

// 错误信息接口
export interface ErrorMessage {
  type: ErrorTypeEnum;
  message: string;
  details?: any;
  timestamp: number;
  url?: string;
  stack?: string;
}

// 性能指标接口
export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  details?: any;
}

// 错误处理类
class ErrorHandler {
  private errorQueue: ErrorMessage[] = [];
  private maxErrorQueueSize = 100;
  private performanceMetrics: PerformanceMetric[] = [];
  private maxPerformanceQueueSize = 50;
  private performanceObservers: PerformanceObserver[] = [];

  constructor() {
    this.setupGlobalErrorHandlers();
    this.setupPerformanceMonitoring();
  }

  // 设置全局错误处理器
  private setupGlobalErrorHandlers() {
    // 捕获未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: ErrorTypeEnum.UNKNOWN_ERROR,
        message: `未处理的Promise拒绝: ${event.reason}`,
        details: event.reason,
        timestamp: Date.now(),
        url: window.location.href,
        stack: (event.reason as Error)?.stack
      });
    });

    // 捕获JavaScript运行时错误
    window.addEventListener('error', (event) => {
      this.handleError({
        type: ErrorTypeEnum.UNKNOWN_ERROR,
        message: event.message,
        details: event.error,
        timestamp: Date.now(),
        url: event.filename,
        stack: event.error?.stack
      });
    });
  }

  // 设置性能监控
  private setupPerformanceMonitoring() {
    // 监控长任务
    if ('performance' in window && (window as any).PerformanceObserver) {
      const longTaskObserver = new (window as any).PerformanceObserver((list: PerformanceObserverEntryList) => {
        const entries = list.getEntries() as PerformanceEntry[];
        entries.forEach((entry: PerformanceEntry) => {
          if (entry.duration > 50) { // 超过50ms认为是长任务
            this.recordPerformanceMetric({
              name: 'long-task',
              startTime: entry.startTime,
              endTime: entry.startTime + entry.duration,
              duration: entry.duration,
              details: {
                name: entry.name,
                entryType: entry.entryType
              }
            });
          }
        });
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.performanceObservers.push(longTaskObserver);
    }

    // 监控资源加载性能
    if ('performance' in window) {
      performance.setResourceTimingBufferSize(300); // 增加缓冲区大小
      
      const resourceObserver = new PerformanceObserver((list: PerformanceObserverEntryList) => {
        const entries = list.getEntries() as PerformanceResourceTiming[];
        entries.forEach((entry: PerformanceResourceTiming) => {
          if (entry.entryType === 'resource') {
            this.recordPerformanceMetric({
              name: 'resource-load',
              startTime: entry.startTime,
              endTime: entry.responseEnd,
              duration: entry.responseEnd - entry.startTime,
              details: {
                name: entry.name,
                initiatorType: entry.initiatorType,
                transferSize: entry.transferSize,
                encodedBodySize: entry.encodedBodySize,
                decodedBodySize: entry.decodedBodySize
              }
            });
          }
        });
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.performanceObservers.push(resourceObserver);
    }
  }

  // 处理错误
  handleError(error: any): ErrorMessage {
    let errorMessage: ErrorMessage;

    if (error instanceof Error) {
      // 标准错误对象
      errorMessage = {
        type: ErrorTypeEnum.UNKNOWN_ERROR,
        message: error.message,
        details: error,
        timestamp: Date.now(),
        url: window.location.href,
        stack: error.stack
      };
    } else if (typeof error === 'string') {
      // 简单字符串错误
      errorMessage = {
        type: ErrorTypeEnum.UNKNOWN_ERROR,
        message: error,
        details: null,
        timestamp: Date.now(),
        url: window.location.href
      };
    } else {
      // 其他类型的错误
      errorMessage = {
        type: ErrorTypeEnum.UNKNOWN_ERROR,
        message: '未知错误',
        details: error,
        timestamp: Date.now(),
        url: window.location.href
      };
    }

    // 添加到错误队列
    this.addToErrorQueue(errorMessage);

    // 记录到控制台（仅在开发模式下）
    if (process.env.NODE_ENV === 'development') {
      console.error('捕获到错误:', errorMessage);
    }

    return errorMessage;
  }

  // 创建错误
  createError(message: string, type: ErrorTypeEnum, details?: any): Error {
    const error: any = new Error(message);
    error.type = type;
    error.details = details;
    
    // 添加到错误队列
    this.addToErrorQueue({
      type,
      message,
      details,
      timestamp: Date.now(),
      url: window.location.href
    });
    
    return error;
  }

  // 添加错误到队列
  private addToErrorQueue(error: ErrorMessage) {
    this.errorQueue.push(error);
    
    // 限制队列大小
    if (this.errorQueue.length > this.maxErrorQueueSize) {
      this.errorQueue.shift();
    }
  }

  // 记录性能指标
  recordPerformanceMetric(metric: PerformanceMetric) {
    // 如果没有结束时间，计算持续时间
    if (!metric.endTime) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
    }

    this.performanceMetrics.push(metric);

    // 限制队列大小
    if (this.performanceMetrics.length > this.maxPerformanceQueueSize) {
      this.performanceMetrics.shift();
    }

    // 在开发模式下记录性能指标
    if (process.env.NODE_ENV === 'development') {
      console.log('性能指标:', metric);
    }
  }

  // 开始性能测量
  startPerformanceMeasure(name: string, details?: any): string {
    const measureId = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.recordPerformanceMetric({
      name,
      startTime: performance.now(),
      details
    });

    return measureId;
  }

  // 结束性能测量
  endPerformanceMeasure(measureId: string) {
    const metric = this.performanceMetrics.find(m => m.name === measureId && !m.endTime);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
    }
  }

  // 获取错误统计
  getErrorStats() {
    const stats: Record<ErrorTypeEnum, number> = {
      [ErrorTypeEnum.SERVER_ERROR]: 0,
      [ErrorTypeEnum.NETWORK_ERROR]: 0,
      [ErrorTypeEnum.AUTHENTICATION_ERROR]: 0,
      [ErrorTypeEnum.BUSINESS_LOGIC_ERROR]: 0,
      [ErrorTypeEnum.VALIDATION_ERROR]: 0,
      [ErrorTypeEnum.PERMISSION_ERROR]: 0,
      [ErrorTypeEnum.UNKNOWN_ERROR]: 0
    };

    this.errorQueue.forEach(error => {
      stats[error.type]++;
    });

    return stats;
  }

  // 获取性能统计
  getPerformanceStats() {
    const groupedMetrics: Record<string, PerformanceMetric[]> = {};

    this.performanceMetrics.forEach(metric => {
      if (!groupedMetrics[metric.name]) {
        groupedMetrics[metric.name] = [];
      }
      // 确保groupedMetrics[metric.name]存在后再推送
      const metricsArray = groupedMetrics[metric.name];
      if (metricsArray) {
        metricsArray.push(metric);
      }
    });

    // 计算各种统计信息
    const stats: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    Object.entries(groupedMetrics).forEach(([name, metrics]) => {
      const durations = metrics.map(m => m.duration!).filter(d => d !== undefined) as number[];
      if (durations.length > 0) {
        stats[name] = {
          avg: durations.reduce((a, b) => a + b, 0) / durations.length,
          min: Math.min(...durations),
          max: Math.max(...durations),
          count: durations.length
        };
      }
    });

    return stats;
  }

  // 获取错误队列
  getErrorQueue() {
    return [...this.errorQueue];
  }

  // 获取性能指标队列
  getPerformanceMetrics() {
    return [...this.performanceMetrics];
  }

  // 清空错误队列
  clearErrorQueue() {
    this.errorQueue = [];
  }

  // 清空性能指标队列
  clearPerformanceMetrics() {
    this.performanceMetrics = [];
  }

  // 发送错误报告到服务器
  async sendErrorReport() {
    // 开发环境不发送错误报告
    if (import.meta.env.DEV || this.errorQueue.length === 0) {
      return;
    }

    try {
      // 发送错误报告到服务器
      const response = await fetch('/api/error-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errors: this.getErrorQueue(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: Date.now()
        })
      });

      if (response.ok) {
        // 成功发送后清空队列
        this.clearErrorQueue();
      }
    } catch (error) {
      // 生产环境中静默失败，不打印错误
      // console.error('发送错误报告失败:', error);
    }
  }

  // 发送性能报告到服务器
  async sendPerformanceReport() {
    // 开发环境不发送性能报告
    if (import.meta.env.DEV || this.performanceMetrics.length === 0) {
      return;
    }

    try {
      // 发送性能报告到服务器
      const response = await fetch('/api/performance-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: this.getPerformanceMetrics(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: Date.now()
        })
      });

      if (response.ok) {
        // 成功发送后清空队列
        this.clearPerformanceMetrics();
      }
    } catch (error) {
      // 生产环境中静默失败，不打印错误
      // console.error('发送性能报告失败:', error);
    }
  }

  // 销毁资源
  destroy() {
    // 断开性能观察器
    this.performanceObservers.forEach(observer => {
      observer.disconnect();
    });
    this.performanceObservers = [];
  }
}

// 创建全局错误处理器实例
const errorHandler = new ErrorHandler();

// 页面卸载时发送错误和性能报告
window.addEventListener('beforeunload', () => {
  errorHandler.sendErrorReport();
  errorHandler.sendPerformanceReport();
});

// 定期发送报告（例如每5分钟）
setInterval(() => {
  errorHandler.sendErrorReport();
  errorHandler.sendPerformanceReport();
}, 5 * 60 * 1000); // 5分钟

export { errorHandler };
export default errorHandler;