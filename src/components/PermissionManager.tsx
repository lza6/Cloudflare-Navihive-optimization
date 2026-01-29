import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Avatar,
  ListItem,
  ListItemText,
  List,
  ListItemAvatar,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  PersonAdd as InviteIcon,
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { Permission, CollaborationInvite, User } from '../API/permission-api';
import { permissionAPI } from '../API/permission-api';

interface PermissionManagerProps {
  resourceId?: number;
  resourceType?: 'site' | 'group' | 'config' | 'dashboard';
  currentUserRole?: 'admin' | 'editor' | 'viewer';
}

const PermissionManager: React.FC<PermissionManagerProps> = ({
  resourceId,
  resourceType = 'site',
  currentUserRole = 'admin',
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [invites, setInvites] = useState<CollaborationInvite[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [openPermissionDialog, setOpenPermissionDialog] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermission, setInvitePermission] = useState<'read' | 'write' | 'admin'>('read');
  const [permissionResourceType, setPermissionResourceType] = useState<'site' | 'group' | 'config' | 'dashboard'>('site');
  const [permissionResourceId, setPermissionResourceId] = useState(0);
  const [permissionLevel, setPermissionLevel] = useState<'read' | 'write' | 'admin'>('read');
  const [loading, setLoading] = useState(true);

  // 加载权限和邀请数据
  useEffect(() => {
    loadPermissionsAndInvites();
  }, [resourceId, resourceType]);

  const loadPermissionsAndInvites = async () => {
    try {
      setLoading(true);
      
      // 获取当前用户的权限
      if (resourceId && resourceType) {
        // 在实际实现中，这里应该调用API获取特定资源的权限
        // 暂时使用模拟数据
        const mockPermissions: Permission[] = [
          {
            id: 1,
            userId: 1,
            resourceId: resourceId,
            resourceType: resourceType as 'site' | 'group' | 'config' | 'dashboard',
            permission: 'admin',
          },
          {
            id: 2,
            userId: 2,
            resourceId: resourceId,
            resourceType: resourceType as 'site' | 'group' | 'config' | 'dashboard',
            permission: 'write',
          }
        ];
        setPermissions(mockPermissions);
      }
      
      // 获取邀请列表
      const userInfo = await permissionAPI.getUserInfo();
      if (userInfo) {
        const userInvites = await permissionAPI.getUserInvites(userInfo.id!);
        setInvites(userInvites);
      }
    } catch (error) {
      console.error('加载权限数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!resourceId || !resourceType) {
      alert('请先选择资源');
      return;
    }

    try {
      const userInfo = await permissionAPI.getUserInfo();
      if (!userInfo) {
        alert('请先登录');
        return;
      }

      const inviteData: Omit<CollaborationInvite, 'id' | 'status' | 'createdAt' | 'updatedAt'> = {
        inviterId: userInfo.id!,
        inviteeEmail: inviteEmail,
        resourceId: resourceId,
        resourceType: resourceType,
        permission: invitePermission,
      };

      await permissionAPI.sendCollaborationInvite(inviteData);
      setOpenInviteDialog(false);
      setInviteEmail('');
      loadPermissionsAndInvites(); // 重新加载数据
    } catch (error) {
      console.error('发送邀请失败:', error);
      alert('发送邀请失败: ' + (error as Error).message);
    }
  };

  const handleAcceptInvite = async (inviteId: number) => {
    try {
      await permissionAPI.respondToInvite(inviteId, true);
      loadPermissionsAndInvites(); // 重新加载数据
    } catch (error) {
      console.error('接受邀请失败:', error);
      alert('接受邀请失败: ' + (error as Error).message);
    }
  };

  const handleRejectInvite = async (inviteId: number) => {
    try {
      await permissionAPI.respondToInvite(inviteId, false);
      loadPermissionsAndInvites(); // 重新加载数据
    } catch (error) {
      console.error('拒绝邀请失败:', error);
      alert('拒绝邀请失败: ' + (error as Error).message);
    }
  };

  const handleCreatePermission = async () => {
    if (!permissionResourceId || !permissionResourceType) {
      alert('请填写完整信息');
      return;
    }

    try {
      const newPermission: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: 1, // 模拟用户ID
        resourceId: permissionResourceId,
        resourceType: permissionResourceType,
        permission: permissionLevel,
      };

      await permissionAPI.createPermission(newPermission);
      setOpenPermissionDialog(false);
      loadPermissionsAndInvites(); // 重新加载数据
    } catch (error) {
      console.error('创建权限失败:', error);
      alert('创建权限失败: ' + (error as Error).message);
    }
  };

  const handleUpdatePermission = async () => {
    if (!selectedPermission) return;

    try {
      await permissionAPI.updatePermission(selectedPermission.id!, {
        permission: selectedPermission.permission,
      });
      setOpenPermissionDialog(false);
      loadPermissionsAndInvites(); // 重新加载数据
    } catch (error) {
      console.error('更新权限失败:', error);
      alert('更新权限失败: ' + (error as Error).message);
    }
  };

  const handleDeletePermission = async (id: number) => {
    try {
      if (window.confirm('确定要删除这个权限吗？')) {
        await permissionAPI.deletePermission(id);
        loadPermissionsAndInvites(); // 重新加载数据
      }
    } catch (error) {
      console.error('删除权限失败:', error);
      alert('删除权限失败: ' + (error as Error).message);
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'admin': return 'error';
      case 'write': return 'warning';
      case 'read': return 'info';
      default: return 'default';
    }
  };

  const getInviteStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'expired': return 'default';
      default: return 'default';
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <PeopleIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" component="h3">
          权限管理
        </Typography>
      </Box>

      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
        <Tab label="成员权限" />
        <Tab label="邀请管理" />
        <Tab label="添加权限" />
      </Tabs>

      {activeTab === 0 && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedPermission(null);
                setOpenPermissionDialog(true);
              }}
            >
              添加权限
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>用户</TableCell>
                  <TableCell>资源类型</TableCell>
                  <TableCell>资源ID</TableCell>
                  <TableCell>权限等级</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {permissions.map((perm) => (
                  <TableRow key={perm.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: 12 }}>
                          U{perm.userId}
                        </Avatar>
                        <Typography variant="body2">用户 {perm.userId}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={perm.resourceType} size="small" />
                    </TableCell>
                    <TableCell>{perm.resourceId}</TableCell>
                    <TableCell>
                      <Chip
                        label={perm.permission.toUpperCase()}
                        size="small"
                        color={getPermissionColor(perm.permission)}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedPermission(perm);
                          setOpenPermissionDialog(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => perm.id && handleDeletePermission(perm.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {activeTab === 1 && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<InviteIcon />}
              onClick={() => setOpenInviteDialog(true)}
            >
              发送邀请
            </Button>
          </Box>

          <List>
            {invites.map((invite) => (
              <ListItem key={invite.id} divider>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <InviteIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`邀请 ${invite.inviteeEmail}`}
                  secondary={`权限: ${invite.permission} | 状态: ${invite.status}`}
                />
                <Box>
                  {invite.status === 'pending' && (
                    <>
                      <Tooltip title="接受邀请">
                        <IconButton
                          onClick={() => invite.id && handleAcceptInvite(invite.id)}
                          color="success"
                        >
                          <AcceptIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="拒绝邀请">
                        <IconButton
                          onClick={() => invite.id && handleRejectInvite(invite.id)}
                          color="error"
                        >
                          <RejectIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  <Chip
                    label={invite.status.toUpperCase()}
                    size="small"
                    color={getInviteStatusColor(invite.status)}
                  />
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {activeTab === 2 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            批量添加权限
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>资源类型</InputLabel>
              <Select
                value={permissionResourceType}
                label="资源类型"
                onChange={(e) => setPermissionResourceType(e.target.value as 'site' | 'group' | 'config' | 'dashboard')}
              >
                <MenuItem value="site">站点</MenuItem>
                <MenuItem value="group">分组</MenuItem>
                <MenuItem value="config">配置</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="资源ID"
              type="number"
              value={permissionResourceId}
              onChange={(e) => setPermissionResourceId(Number(e.target.value))}
              sx={{ width: 150 }}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>权限等级</InputLabel>
              <Select
                value={permissionLevel}
                label="权限等级"
                onChange={(e) => setPermissionLevel(e.target.value as 'read' | 'write' | 'admin')}
              >
                <MenuItem value="read">只读</MenuItem>
                <MenuItem value="write">读写</MenuItem>
                <MenuItem value="admin">管理员</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleCreatePermission}
              disabled={!permissionResourceId}
            >
              添加权限
            </Button>
          </Box>
        </Box>
      )}

      {/* 邀请对话框 */}
      <Dialog open={openInviteDialog} onClose={() => setOpenInviteDialog(false)}>
        <DialogTitle>发送协作邀请</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            邀请其他用户协作编辑此资源
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="邮箱地址"
            fullWidth
            variant="outlined"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>权限等级</InputLabel>
            <Select
              value={invitePermission}
              label="权限等级"
              onChange={(e) => setInvitePermission(e.target.value as 'read' | 'write' | 'admin')}
            >
              <MenuItem value="read">只读</MenuItem>
              <MenuItem value="write">读写</MenuItem>
              <MenuItem value="admin">管理员</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInviteDialog(false)}>取消</Button>
          <Button onClick={handleSendInvite} variant="contained">发送邀请</Button>
        </DialogActions>
      </Dialog>

      {/* 权限对话框 */}
      <Dialog open={openPermissionDialog} onClose={() => setOpenPermissionDialog(false)}>
        <DialogTitle>
          {selectedPermission ? '编辑权限' : '添加权限'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {selectedPermission 
              ? `编辑用户 ${selectedPermission.userId} 的权限` 
              : '添加新的用户权限'}
          </DialogContentText>
          <TextField
            margin="dense"
            label="用户ID"
            type="number"
            fullWidth
            variant="outlined"
            value={selectedPermission?.userId || ''}
            onChange={(e) => 
              selectedPermission && 
              setSelectedPermission({...selectedPermission, userId: Number(e.target.value)})
            }
            disabled={!!selectedPermission}
          />
          <TextField
            margin="dense"
            label="资源ID"
            type="number"
            fullWidth
            variant="outlined"
            value={selectedPermission?.resourceId || ''}
            onChange={(e) => 
              selectedPermission && 
              setSelectedPermission({...selectedPermission, resourceId: Number(e.target.value)})
            }
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>资源类型</InputLabel>
            <Select
              value={selectedPermission?.resourceType || 'site'}
              label="资源类型"
              onChange={(e) => 
                selectedPermission && 
                setSelectedPermission({...selectedPermission, resourceType: e.target.value as 'site' | 'group' | 'config' | 'dashboard'})
              }
            >
              <MenuItem value="site">站点</MenuItem>
              <MenuItem value="group">分组</MenuItem>
              <MenuItem value="config">配置</MenuItem>
              <MenuItem value="dashboard">仪表板</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>权限等级</InputLabel>
            <Select
              value={selectedPermission?.permission || 'read'}
              label="权限等级"
              onChange={(e) => 
                selectedPermission && 
                setSelectedPermission({...selectedPermission, permission: e.target.value as 'read' | 'write' | 'admin'})
              }
            >
              <MenuItem value="read">只读</MenuItem>
              <MenuItem value="write">读写</MenuItem>
              <MenuItem value="admin">管理员</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPermissionDialog(false)}>取消</Button>
          <Button 
            onClick={selectedPermission ? handleUpdatePermission : handleCreatePermission} 
            variant="contained"
          >
            {selectedPermission ? '更新' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PermissionManager;