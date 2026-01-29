// 权限管理类型定义

export enum PermissionLevel {
  OWNER = 'owner',       // 所有者 - 完全访问权限
  ADMIN = 'admin',       // 管理员 - 管理权限
  EDITOR = 'editor',     // 编辑者 - 编辑权限
  VIEWER = 'viewer',     // 查看者 - 只读权限
  GUEST = 'guest',       // 访客 - 有限访问权限
}

export enum ResourcePermission {
  READ = 'read',           // 读取权限
  WRITE = 'write',         // 写入权限
  DELETE = 'delete',       // 删除权限
  SHARE = 'share',         // 分享权限
  MANAGE = 'manage',       // 管理权限
  EXPORT = 'export',       // 导出权限
  IMPORT = 'import',       // 导入权限
}

export interface UserPermissions {
  userId: number;
  username: string;
  permissionLevel: PermissionLevel;
  resourcePermissions: ResourcePermission[];
  createdAt: string;
  expiresAt?: string; // 可选的过期时间
}

export interface Collaborator {
  id: number;
  userId: number;
  username: string;
  email: string;
  permissionLevel: PermissionLevel;
  joinedAt: string;
  lastAccessedAt?: string;
  isActive: boolean;
}

export interface PermissionRule {
  resourceType: 'group' | 'site' | 'config' | 'user' | 'all';
  resourceId?: number;
  permission: ResourcePermission;
  allowedRoles: PermissionLevel[];
  condition?: string; // 可选的条件表达式
}

export interface CollaborationSettings {
  enableCollaboration: boolean;
  defaultPermission: PermissionLevel;
  allowInvites: boolean;
  maxCollaborators: number;
  requireApproval: boolean;
  permissions: PermissionRule[];
}