import { 
  NavigationAPI, 
  Group, 
  Site, 
  LoginRequest, 
  LoginResponse, 
  ExportData,
  Config
} from './http';
import { errorHandler, ErrorTypeEnum } from '../utils/ErrorHandler';
import { navigationCacheManager } from '../utils/CacheManager';

/**
 * API响应的包装类型
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * 导入数据的响应类型
 */
interface ImportResponse {
  success: boolean;
  error?: string;
  stats?: any;
}

/**
 * 增强的导航API客户端
 * 提供错误处理、缓存和重试机制
 */
export class EnhancedNavigationClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(baseUrl: string = '/api', retryAttempts: number = 3, retryDelay: number = 1000) {
    this.baseUrl = baseUrl;
    this.retryAttempts = retryAttempts;
    this.retryDelay = retryDelay;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // 从localStorage获取token并添加到默认头部
    const token = this.getToken();
    if (token) {
      this.defaultHeaders = {
        ...this.defaultHeaders,
        'Authorization': `Bearer ${token}`,
      };
    }
  }

  /**
   * 获取认证token
   */
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  /**
   * 设置认证token
   */
  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  /**
   * 清除认证token
   */
  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * 发送HTTP请求的通用方法
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options,
    };

    let lastError: Error | null = null;

    // 重试机制
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, config);

        // 检查响应状态
        if (!response.ok) {
          const errorData = await response.text();
          let errorMessage = errorData;

          try {
            // 尝试解析JSON错误响应
            const jsonError = JSON.parse(errorData);
            errorMessage = jsonError.message || jsonError.error || errorData;
          } catch (e) {
            // 如果不是JSON格式，使用原始文本
          }

          throw new Error(`HTTP ${response.status}: ${errorMessage}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        } else {
          // 对于非JSON响应，返回文本
          return response.text() as unknown as T;
        }
      } catch (error) {
        lastError = error as Error;
        
        // 如果是最后一次尝试，抛出错误
        if (attempt === this.retryAttempts - 1) {
          break;
        }

        // 等待一段时间后重试
        await this.delay(this.retryDelay * Math.pow(2, attempt)); // 指数退避
      }
    }

    // 如果所有重试都失败，抛出最后一个错误
    if (lastError) {
      throw lastError;
    }

    throw new Error('Unknown error occurred');
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 检查认证状态
   */
  async checkAuthStatus(): Promise<boolean> {
    try {
      const response: { authenticated: boolean } = await this.request('/auth/status', {
        method: 'GET',
      });
      return response.authenticated;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  }

  /**
   * 登录
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response: LoginResponse = await this.request('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success && response.token) {
        this.setToken(response.token);
        // 登录成功后清除相关缓存
        navigationCacheManager.invalidate('all');
      }

      return response;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `登录失败: ${appError.message}`,
        ErrorTypeEnum.AUTHENTICATION_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 登出
   */
  async logout(): Promise<boolean> {
    try {
      await this.request('/logout', {
        method: 'POST',
      });
      this.clearToken();
      // 登出后清除所有缓存
      navigationCacheManager.invalidate('all');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  /**
   * 获取所有分组（带缓存）
   */
  async getGroups(): Promise<Group[]> {
    try {
      return await navigationCacheManager.getGroupsWithSites(async () => {
        const response: Group[] = await this.request('/groups');
        return response;
      });
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `获取分组失败: ${appError.message}`,
        ErrorTypeEnum.SERVER_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 获取单个分组
   */
  async getGroup(id: number): Promise<Group> {
    try {
      const response: Group = await this.request(`/groups/${id}`);
      return response;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `获取分组失败 (ID: ${id}): ${appError.message}`,
        ErrorTypeEnum.SERVER_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 创建分组
   */
  async createGroup(group: Group): Promise<Group> {
    try {
      const response: Group = await this.request('/groups', {
        method: 'POST',
        body: JSON.stringify(group),
      });
      // 创建后清除相关缓存
      navigationCacheManager.invalidate('groups');
      return response;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `创建分组失败: ${appError.message}`,
        ErrorTypeEnum.BUSINESS_LOGIC_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 更新分组
   */
  async updateGroup(id: number, group: Partial<Group>): Promise<boolean> {
    try {
      await this.request(`/groups/${id}`, {
        method: 'PUT',
        body: JSON.stringify(group),
      });
      // 更新后清除相关缓存
      navigationCacheManager.invalidate('groups');
      return true;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `更新分组失败 (ID: ${id}): ${appError.message}`,
        ErrorTypeEnum.BUSINESS_LOGIC_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 删除分组
   */
  async deleteGroup(id: number): Promise<boolean> {
    try {
      await this.request(`/groups/${id}`, {
        method: 'DELETE',
      });
      // 删除后清除相关缓存
      navigationCacheManager.invalidate('groups');
      return true;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `删除分组失败 (ID: ${id}): ${appError.message}`,
        ErrorTypeEnum.BUSINESS_LOGIC_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 获取所有站点（带缓存）
   */
  async getSites(groupId?: number): Promise<Site[]> {
    try {
      return await navigationCacheManager.getSites(async () => {
        const url = groupId ? `/sites?groupId=${groupId}` : '/sites';
        const response: Site[] = await this.request(url);
        return response;
      }, groupId);
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `获取站点失败${groupId ? ` (分组ID: ${groupId})` : ''}: ${appError.message}`,
        ErrorTypeEnum.SERVER_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 获取单个站点
   */
  async getSite(id: number): Promise<Site> {
    try {
      const response: Site = await this.request(`/sites/${id}`);
      return response;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `获取站点失败 (ID: ${id}): ${appError.message}`,
        ErrorTypeEnum.SERVER_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 创建站点
   */
  async createSite(site: Site): Promise<Site> {
    try {
      const response: Site = await this.request('/sites', {
        method: 'POST',
        body: JSON.stringify(site),
      });
      // 创建后清除相关缓存
      navigationCacheManager.invalidate('sites');
      return response;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `创建站点失败: ${appError.message}`,
        ErrorTypeEnum.BUSINESS_LOGIC_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 更新站点
   */
  async updateSite(id: number, site: Partial<Site>): Promise<boolean> {
    try {
      await this.request(`/sites/${id}`, {
        method: 'PUT',
        body: JSON.stringify(site),
      });
      // 更新后清除相关缓存
      navigationCacheManager.invalidate('sites');
      return true;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `更新站点失败 (ID: ${id}): ${appError.message}`,
        ErrorTypeEnum.BUSINESS_LOGIC_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 删除站点
   */
  async deleteSite(id: number): Promise<boolean> {
    try {
      await this.request(`/sites/${id}`, {
        method: 'DELETE',
      });
      // 删除后清除相关缓存
      navigationCacheManager.invalidate('sites');
      return true;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `删除站点失败 (ID: ${id}): ${appError.message}`,
        ErrorTypeEnum.BUSINESS_LOGIC_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 批量更新分组排序
   */
  async updateGroupOrder(groupOrders: Array<{ id: number; order_num: number }>): Promise<boolean> {
    try {
      await this.request('/group-orders', {
        method: 'PUT',
        body: JSON.stringify(groupOrders),
      });
      // 更新排序后清除相关缓存
      navigationCacheManager.invalidate('groups');
      return true;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `更新分组排序失败: ${appError.message}`,
        ErrorTypeEnum.BUSINESS_LOGIC_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 批量更新站点排序
   */
  async updateSiteOrder(siteOrders: Array<{ id: number; order_num: number }>): Promise<boolean> {
    try {
      await this.request('/site-orders', {
        method: 'PUT',
        body: JSON.stringify(siteOrders),
      });
      // 更新排序后清除相关缓存
      navigationCacheManager.invalidate('sites');
      return true;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `更新站点排序失败: ${appError.message}`,
        ErrorTypeEnum.BUSINESS_LOGIC_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 获取所有配置（带缓存）
   */
  async getConfigs(): Promise<Record<string, string>> {
    try {
      return await navigationCacheManager.getConfigs(async () => {
        const response: Config[] = await this.request('/configs');
        // 将配置数组转换为键值对对象
        const configs: Record<string, string> = {};
        response.forEach(config => {
          configs[config.key] = config.value;
        });
        return configs;
      });
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `获取配置失败: ${appError.message}`,
        ErrorTypeEnum.SERVER_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 获取单个配置
   */
  async getConfig(key: string): Promise<string | null> {
    try {
      const response: { key: string; value: string } = await this.request(`/configs/${key}`);
      return response.value || null;
    } catch (error) {
      console.error(`获取配置失败 (KEY: ${key}):`, error);
      return null;
    }
  }

  /**
   * 设置配置
   */
  async setConfig(key: string, value: string): Promise<boolean> {
    try {
      await this.request(`/configs/${encodeURIComponent(key)}`, {
        method: 'PUT',
        body: JSON.stringify({ value }),
      });
      // 设置配置后清除相关缓存
      navigationCacheManager.invalidate('configs');
      return true;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `设置配置失败 (KEY: ${key}): ${appError.message}`,
        ErrorTypeEnum.BUSINESS_LOGIC_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 删除配置
   */
  async deleteConfig(key: string): Promise<boolean> {
    try {
      await this.request(`/configs/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      // 删除配置后清除相关缓存
      navigationCacheManager.invalidate('configs');
      return true;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `删除配置失败 (KEY: ${key}): ${appError.message}`,
        ErrorTypeEnum.BUSINESS_LOGIC_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 导出数据
   */
  async exportData(): Promise<ExportData> {
    try {
      const response: ExportData = await this.request('/export');
      return response;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `导出数据失败: ${appError.message}`,
        ErrorTypeEnum.SERVER_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 导入数据
   */
  async importData(data: ExportData): Promise<ImportResponse> {
    try {
      const response: ImportResponse = await this.request('/import', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      // 导入数据后清除所有缓存
      navigationCacheManager.invalidate('all');
      return response;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `导入数据失败: ${appError.message}`,
        ErrorTypeEnum.BUSINESS_LOGIC_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 获取分组和站点（优化N+1查询问题）
   */
  async getGroupsWithSites(): Promise<Array<Group & { sites: Site[] }>> {
    try {
      return await navigationCacheManager.getGroupsWithSites(async () => {
        const response: Array<Group & { sites: Site[] }> = await this.request('/groups-with-sites');
        return response;
      });
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `获取分组和站点失败: ${appError.message}`,
        ErrorTypeEnum.SERVER_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 检查是否已登录
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }
}

// 创建默认实例
const enhancedNavigationClient = new EnhancedNavigationClient();

export default enhancedNavigationClient;