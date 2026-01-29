/**
 * 离线缓存管理器
 * 用于管理PWA的离线数据缓存
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time To Live in milliseconds
}

class OfflineCacheManager {
  private cache: Map<string, CacheEntry<any>>;
  private storageKey: string;
  private maxSize: number;
  private defaultTTL: number;

  constructor(storageKey: string = 'offline-cache', maxSize: number = 1000, defaultTTL: number = 24 * 60 * 60 * 1000) { // 24小时默认TTL
    this.storageKey = storageKey;
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.cache = new Map();

    // 从localStorage恢复缓存
    this.restoreFromStorage();
  }

  /**
   * 设置缓存项
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    // 检查是否需要清理过期项
    this.cleanupExpired();

    // 如果缓存已满，移除最老的项
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    this.cache.set(key, entry);
    this.saveToStorage();
  }

  /**
   * 获取缓存项
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.saveToStorage();
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
    const result = this.cache.delete(key);
    this.saveToStorage();
    return result;
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.saveToStorage();
  }

  /**
   * 清理过期的缓存项
   */
  cleanupExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
    this.saveToStorage();
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): { size: number; totalItems: number; expiredItems: number } {
    const now = Date.now();
    let expiredItems = 0;
    
    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredItems++;
      }
    }
    
    return {
      size: this.getSize(),
      totalItems: this.cache.size,
      expiredItems
    };
  }

  /**
   * 估算缓存大小（近似值，单位：字节）
   */
  getSize(): number {
    let size = 0;
    for (const [key, entry] of this.cache.entries()) {
      size += new Blob([JSON.stringify(key)]).size;
      size += new Blob([JSON.stringify(entry)]).size;
    }
    return size;
  }

  /**
   * 保存到localStorage
   */
  private saveToStorage(): void {
    try {
      const serializableCache = Array.from(this.cache.entries()).map(([key, value]) => [key, value]);
      localStorage.setItem(this.storageKey, JSON.stringify(serializableCache));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
      // 如果存储失败，尝试清理一些缓存后再试
      this.cleanupExpired();
      try {
        const serializableCache = Array.from(this.cache.entries()).map(([key, value]) => [key, value]);
        localStorage.setItem(this.storageKey, JSON.stringify(serializableCache));
      } catch (retryError) {
        console.error('Failed to save cache after cleanup:', retryError);
      }
    }
  }

  /**
   * 从localStorage恢复缓存
   */
  private restoreFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as [string, CacheEntry<any>][];
        this.cache = new Map(parsed);
        
        // 清理已过期的项
        this.cleanupExpired();
      }
    } catch (error) {
      console.warn('Failed to restore cache from storage:', error);
      this.cache = new Map();
    }
  }

  /**
   * 同步缓存到云端（如果用户已登录）
   */
  async syncToCloud(): Promise<boolean> {
    try {
      // 检查用户是否已登录
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('User not logged in, skipping cloud sync');
        return false;
      }

      // 获取所有缓存数据
      const allData: Record<string, any> = {};
      for (const [key, entry] of this.cache.entries()) {
        // 只同步非过期的数据
        if (Date.now() - entry.timestamp <= entry.ttl) {
          allData[key] = entry.data;
        }
      }

      // 发送到云端
      const response = await fetch('/api/offline-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data: allData,
          timestamp: Date.now()
        })
      });

      if (response.ok) {
        console.log('Offline cache synced to cloud successfully');
        return true;
      } else {
        console.error('Failed to sync offline cache to cloud:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error syncing offline cache to cloud:', error);
      return false;
    }
  }

  /**
   * 从云端同步缓存（如果用户已登录）
   */
  async syncFromCloud(): Promise<boolean> {
    try {
      // 检查用户是否已登录
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('User not logged in, skipping cloud sync');
        return false;
      }

      // 从云端获取数据
      const response = await fetch('/api/offline-sync', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          // 合并云端数据到本地缓存
          for (const [key, value] of Object.entries(result.data as Record<string, any>)) {
            this.set(key, value);
          }
          
          console.log('Offline cache synced from cloud successfully');
          return true;
        }
      } else {
        console.error('Failed to sync offline cache from cloud:', response.statusText);
      }
    } catch (error) {
      console.error('Error syncing offline cache from cloud:', error);
    }
    
    return false;
  }
}

// 创建全局实例
const offlineCacheManager = new OfflineCacheManager('navihive-offline-cache');

export { OfflineCacheManager, offlineCacheManager };
export default offlineCacheManager;