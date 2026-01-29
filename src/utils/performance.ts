/**
 * 性能监控工具
 */

import { logger } from './logger';

export interface PerformanceMetric {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  context?: Record<string, unknown>;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private enabled: boolean = true;
  
  private constructor() {}
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  enable(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  /**
   * 测量函数执行时间
   */
  async measureFunction<T>(
    name: string,
    fn: () => Promise<T> | T,
    context?: Record<string, unknown>
  ): Promise<T> {
    if (!this.enabled) {
      return fn();
    }
    
    const startTime = performance.now();
    try {
      const result = await fn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const metric: PerformanceMetric = {
        name,
        duration,
        startTime,
        endTime,
        context
      };
      
      this.metrics.push(metric);
      logger.info(`Performance: ${name} took ${duration.toFixed(2)}ms`, context);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      logger.error(`Performance: ${name} failed after ${duration.toFixed(2)}ms`, error as Error, context);
      throw error;
    }
  }
  
  /**
   * 测量异步操作
   */
  async measureAsync<T>(
    name: string,
    operation: Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    if (!this.enabled) {
      return operation;
    }
    
    const startTime = performance.now();
    try {
      const result = await operation;
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const metric: PerformanceMetric = {
        name,
        duration,
        startTime,
        endTime,
        context
      };
      
      this.metrics.push(metric);
      logger.info(`Performance: ${name} took ${duration.toFixed(2)}ms`, context);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      logger.error(`Performance: ${name} failed after ${duration.toFixed(2)}ms`, error as Error, context);
      throw error;
    }
  }
  
  /**
   * 手动测量时间段
   */
  startMeasure(name: string, context?: Record<string, unknown>): () => number {
    if (!this.enabled) {
      return () => 0;
    }
    
    const startTime = performance.now();
    
    return (): number => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const metric: PerformanceMetric = {
        name,
        duration,
        startTime,
        endTime,
        context
      };
      
      this.metrics.push(metric);
      logger.info(`Performance: ${name} took ${duration.toFixed(2)}ms`, context);
      
      return duration;
    };
  }
  
  /**
   * 获取性能指标摘要
   */
  getMetricsSummary(): {
    total: number;
    average: number;
    fastest: number | null;
    slowest: number | null;
    metrics: PerformanceMetric[];
  } {
    if (this.metrics.length === 0) {
      return {
        total: 0,
        average: 0,
        fastest: null,
        slowest: null,
        metrics: []
      };
    }
    
    const durations = this.metrics.map(m => m.duration);
    const total = durations.reduce((sum, dur) => sum + dur, 0);
    const average = total / durations.length;
    const fastest = Math.min(...durations);
    const slowest = Math.max(...durations);
    
    return {
      total: parseFloat(total.toFixed(2)),
      average: parseFloat(average.toFixed(2)),
      fastest,
      slowest,
      metrics: [...this.metrics]
    };
  }
  
  /**
   * 清除所有指标
   */
  clearMetrics(): void {
    this.metrics = [];
  }
  
  /**
   * 获取特定名称的指标
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * 性能监控装饰器
 */
export function measurePerformance(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function (...args: any[]) {
    return await performanceMonitor.measureFunction(
      `${target.constructor.name}.${propertyKey}`,
      () => originalMethod.apply(this, args)
    );
  };
  
  return descriptor;
}

/**
 * 组件渲染性能监控Hook
 */
export function usePerformanceMark(markName: string): void {
  // 在浏览器环境中使用Performance API
  if (typeof performance !== 'undefined') {
    performance.mark(`${markName}-start`);
    
    // 注册清理函数，在组件卸载时计算耗时
    const cleanup = () => {
      performance.mark(`${markName}-end`);
      performance.measure(markName, `${markName}-start`, `${markName}-end`);
      
      const measures = performance.getEntriesByName(markName);
      const measure = measures[measures.length - 1];
      
      if (measure) {
        logger.info(`Render Performance: ${markName} took ${measure.duration.toFixed(2)}ms`);
      }
    };
    
    // 如果在React组件中，可以返回cleanup函数
    // 但这里我们只是简单地注册性能标记
  }
}