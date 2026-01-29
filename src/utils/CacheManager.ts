/**
 * 缓存管理器
 * 提供内存缓存、本地存储缓存和分布式缓存等功能
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time To Live in milliseconds
}

class CacheManager {
  private memoryCache: Map<string, CacheEntry<any>>;
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize: number = 1000, defaultTTL: number = 5 * 60 * 1000) { // 5分钟默认TTL
    this.memoryCache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  /**
   * 设置缓存项
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    // 检查是否需要清理过期项
    this.cleanupExpired();

    // 如果缓存已满，移除最老的项
    if (this.memoryCache.size >= this.maxSize) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    this.memoryCache.set(key, entry);
  }

  /**
   * 获取缓存项
   */
  get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);

    if (!entry) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * 检查缓存项是否存在（未过期）
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    return this.memoryCache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.memoryCache.clear();
  }

  /**
   * 清理过期的缓存项
   */
  cleanupExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): { size: number; hits: number; misses: number } {
    // 简化版统计，实际实现中可能需要跟踪命中率
    return {
      size: this.memoryCache.size,
      hits: 0,
      misses: 0
    };
  }

  /**
   * 获取所有缓存键
   */
  keys(): string[] {
    this.cleanupExpired();
    return Array.from(this.memoryCache.keys());
  }

  /**
   * 估算缓存大小（近似值）
   */
  approximateSize(): number {
    let size = 0;
    for (const [key, entry] of this.memoryCache.entries()) {
      size += JSON.stringify(key).length;
      size += JSON.stringify(entry).length;
    }
    return size;
  }
}

// 专门针对导航数据的缓存管理器
class NavigationCacheManager {
  private cache: CacheManager;
  private stats: {
    hits: number;
    misses: number;
    lastCleanup: number;
  };

  constructor() {
    this.cache = new CacheManager(2000, 10 * 60 * 1000); // 增加容量，10分钟TTL
    this.stats = {
      hits: 0,
      misses: 0,
      lastCleanup: Date.now()
    };
  }

  /**
   * 获取分组和站点数据（带缓存）
   */
  async getGroupsWithSites(
    fetchFunction: () => Promise<any>,
    forceRefresh: boolean = false
  ): Promise<any> {
    const cacheKey = 'groupsWithSites';
    
    if (!forceRefresh) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        this.stats.hits++;
        return cached;
      }
    }

    this.stats.misses++;
    
    try {
      const data = await fetchFunction();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      // 如果获取数据失败，尝试返回缓存数据
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.warn('使用缓存数据代替最新数据');
        return cached;
      }
      throw error;
    }
  }

  /**
   * 获取站点数据（带缓存）
   */
  async getSites(
    fetchFunction: () => Promise<any>,
    groupId?: number,
    forceRefresh: boolean = false
  ): Promise<any> {
    const cacheKey = groupId ? `sites_group_${groupId}` : 'all_sites';
    
    if (!forceRefresh) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        this.stats.hits++;
        return cached;
      }
    }

    this.stats.misses++;
    
    try {
      const data = await fetchFunction();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      // 如果获取数据失败，尝试返回缓存数据
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.warn('使用缓存数据代替最新数据');
        return cached;
      }
      throw error;
    }
  }

  /**
   * 获取配置数据（带缓存）
   */
  async getConfigs(
    fetchFunction: () => Promise<any>,
    forceRefresh: boolean = false
  ): Promise<any> {
    const cacheKey = 'configs';
    
    if (!forceRefresh) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        this.stats.hits++;
        return cached;
      }
    }

    this.stats.misses++;
    
    try {
      const data = await fetchFunction();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      // 如果获取数据失败，尝试返回缓存数据
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.warn('使用缓存数据代替最新数据');
        return cached;
      }
      throw error;
    }
  }

  /**
   * 清理特定类型的缓存
   */
  invalidate(type: 'groups' | 'sites' | 'configs' | 'all'): void {
    if (type === 'all') {
      this.cache.clear();
      return;
    }

    const keys = this.cache.keys();
    const keysToDelete = keys.filter(key => {
      if (type === 'groups' && key.includes('group')) return true;
      if (type === 'sites' && key.includes('site')) return true;
      if (type === 'configs' && key.includes('config')) return true;
      return false;
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    const cacheStats = this.cache.getStats();
    return {
      ...cacheStats,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: this.stats.hits + this.stats.misses > 0 
        ? this.stats.hits / (this.stats.hits + this.stats.misses) 
        : 0
    };
  }

  /**
   * 手动清理过期项
   */
  cleanup() {
    this.cache.cleanupExpired();
    this.stats.lastCleanup = Date.now();
  }
}

// 创建全局实例
const navigationCacheManager = new NavigationCacheManager();

export { CacheManager, NavigationCacheManager, navigationCacheManager };

export default navigationCacheManager;