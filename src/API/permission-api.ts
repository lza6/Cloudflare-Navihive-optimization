import { errorHandler, ErrorTypeEnum } from '../utils/ErrorHandler';
import { navigationCacheManager } from '../utils/CacheManager';

/**
 * 权限类型定义
 */
export interface Permission {
  id?: number;
  userId: number;
  resourceId: number;
  resourceType: 'site' | 'group' | 'config' | 'dashboard';
  permission: 'read' | 'write' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 用户信息接口
 */
export interface User {
  id?: number;
  username: string;
  email?: string;
  role: 'admin' | 'editor' | 'viewer';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 协作邀请接口
 */
export interface CollaborationInvite {
  id?: number;
  inviterId: number;
  inviteeEmail: string;
  resourceId: number;
  resourceType: 'site' | 'group' | 'config' | 'dashboard';
  permission: 'read' | 'write' | 'admin';
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 权限管理API客户端
 */
export class PermissionAPI {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
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
   * 检查当前用户对特定资源的权限
   */
  async checkPermission(resourceId: number, resourceType: 'site' | 'group' | 'config', permission: 'read' | 'write' | 'admin'): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/permissions/check`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify({
          resourceId,
          resourceType,
          permission
        })
      });

      if (!response.ok) {
        throw new Error(`检查权限失败: ${response.statusText}`);
      }

      const result = await response.json();
      return result.hasPermission || false;
    } catch (error) {
      console.error('检查权限失败:', error);
      return false;
    }
  }

  /**
   * 获取用户的权限列表
   */
  async getUserPermissions(userId: number): Promise<Permission[]> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/permissions`, {
        headers: this.defaultHeaders
      });

      if (!response.ok) {
        throw new Error(`获取用户权限失败: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `获取用户权限失败: ${appError.message}`,
        ErrorTypeEnum.AUTHENTICATION_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 创建权限
   */
  async createPermission(permission: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Permission> {
    try {
      const response = await fetch(`${this.baseUrl}/permissions`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(permission)
      });

      if (!response.ok) {
        throw new Error(`创建权限失败: ${response.statusText}`);
      }

      const result = await response.json();
      // 创建后清除相关缓存
      navigationCacheManager.invalidate('all');
      return result;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `创建权限失败: ${appError.message}`,
        ErrorTypeEnum.BUSINESS_LOGIC_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 更新权限
   */
  async updatePermission(id: number, permission: Partial<Permission>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/permissions/${id}`, {
        method: 'PUT',
        headers: this.defaultHeaders,
        body: JSON.stringify(permission)
      });

      if (!response.ok) {
        throw new Error(`更新权限失败: ${response.statusText}`);
      }

      // 更新后清除相关缓存
      navigationCacheManager.invalidate('all');
      return true;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `更新权限失败: ${appError.message}`,
        ErrorTypeEnum.BUSINESS_LOGIC_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 删除权限
   */
  async deletePermission(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/permissions/${id}`, {
        method: 'DELETE',
        headers: this.defaultHeaders
      });

      if (!response.ok) {
        throw new Error(`删除权限失败: ${response.statusText}`);
      }

      // 删除后清除相关缓存
      navigationCacheManager.invalidate('all');
      return true;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `删除权限失败: ${appError.message}`,
        ErrorTypeEnum.BUSINESS_LOGIC_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 发送协作邀请
   */
  async sendCollaborationInvite(invite: Omit<CollaborationInvite, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<CollaborationInvite> {
    try {
      const response = await fetch(`${this.baseUrl}/invites`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(invite)
      });

      if (!response.ok) {
        throw new Error(`发送邀请失败: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `发送邀请失败: ${appError.message}`,
        ErrorTypeEnum.BUSINESS_LOGIC_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 获取用户的邀请列表
   */
  async getUserInvites(userId: number): Promise<CollaborationInvite[]> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/invites`, {
        headers: this.defaultHeaders
      });

      if (!response.ok) {
        throw new Error(`获取邀请失败: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `获取邀请失败: ${appError.message}`,
        ErrorTypeEnum.AUTHENTICATION_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 响应邀请
   */
  async respondToInvite(inviteId: number, accept: boolean): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/invites/${inviteId}/respond`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify({ accept })
      });

      if (!response.ok) {
        throw new Error(`响应邀请失败: ${response.statusText}`);
      }

      // 响应后清除相关缓存
      navigationCacheManager.invalidate('all');
      return true;
    } catch (error) {
      const appError = errorHandler.handleError(error);
      throw errorHandler.createError(
        `响应邀请失败: ${appError.message}`,
        ErrorTypeEnum.BUSINESS_LOGIC_ERROR,
        { details: error }
      );
    }
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me`, {
        headers: this.defaultHeaders
      });

      if (!response.ok) {
        if (response.status === 401) {
          return null; // 未认证用户
        }
        throw new Error(`获取用户信息失败: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }

  /**
   * 获取当前用户的资源访问列表
   */
  async getUserAccessibleResources(): Promise<{ sites: number[]; groups: number[]; configs: number[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me/resources`, {
        headers: this.defaultHeaders
      });

      if (!response.ok) {
        throw new Error(`获取资源列表失败: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取资源列表失败:', error);
      return { sites: [], groups: [], configs: [] };
    }
  }
}

// 创建权限API实例
export const permissionAPI = new PermissionAPI();