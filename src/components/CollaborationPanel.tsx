import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Alert,
  LinearProgress,
  Fab,
} from '@mui/material';
import {
  People as PeopleIcon,
  ExpandMore as ExpandIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  PersonAdd as AddPersonIcon,
  Chat as ChatIcon,
  EmojiObjects as IdeasIcon,
  Assignment as TasksIcon,
} from '@mui/icons-material';
import PermissionManager from './PermissionManager';

interface ActivityLog {
  id: number;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  avatarColor: string;
}

interface CollaborationPanelProps {
  resourceType: 'group' | 'site' | 'config' | 'user';
  resourceId: number;
  currentUser: {
    id: number;
    name: string;
    role: string;
  };
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  resourceType,
  resourceId,
  currentUser
}) => {
  const [expanded, setExpanded] = useState(true);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    // 模拟加载活动日志
    const mockActivities: ActivityLog[] = [
      { id: 1, user: '张三', action: '编辑了', resource: '首页布局', timestamp: '2分钟前', avatarColor: '#FF6B6B' },
      { id: 2, user: '李四', action: '添加了', resource: '新书签', timestamp: '5分钟前', avatarColor: '#4ECDC4' },
      { id: 3, user: '王五', action: '评论了', resource: '设计稿', timestamp: '10分钟前', avatarColor: '#45B7D1' },
      { id: 4, user: '赵六', action: '批准了', resource: '修改建议', timestamp: '15分钟前', avatarColor: '#96CEB4' },
      { id: 5, user: '钱七', action: '上传了', resource: '参考资料', timestamp: '20分钟前', avatarColor: '#FFEAA7' },
    ];
    setActivities(mockActivities);
    setNotifications(3);
    setOnlineUsers(4);
  }, []);

  const handleShare = () => {
    // 模拟分享功能
    alert('分享功能将在后续版本中实现');
  };

  const handleChat = () => {
    // 模拟聊天功能
    alert('实时聊天功能将在后续版本中实现');
  };

  return (
    <Paper elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
      <Accordion
        expanded={expanded}
        onChange={() => setExpanded(!expanded)}
        sx={{
          boxShadow: 'none',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandIcon />}
          sx={{
            bgcolor: 'background.paper',
            borderBottom: expanded ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon color="primary" />
            <Typography variant="h6">协作中心</Typography>
            <Chip
              icon={<NotificationsIcon />}
              label={notifications}
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ ml: 1 }}
            />
            <Chip
              label={`${onlineUsers} 人在线`}
              size="small"
              color="success"
              variant="outlined"
              sx={{ ml: 1 }}
            />
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">协作控制台</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="分享链接">
                  <IconButton onClick={handleShare}>
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="实时聊天">
                  <IconButton onClick={handleChat}>
                    <ChatIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<AddPersonIcon />}
                  size="small"
                >
                  邀请
                </Button>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                sx={{ flex: 1, minWidth: 120 }}
              >
                共同编辑
              </Button>
              <Button
                variant="outlined"
                startIcon={<IdeasIcon />}
                sx={{ flex: 1, minWidth: 120 }}
              >
                提出建议
              </Button>
              <Button
                variant="outlined"
                startIcon={<TasksIcon />}
                sx={{ flex: 1, minWidth: 120 }}
              >
                分配任务
              </Button>
              <Button
                variant="outlined"
                startIcon={<HistoryIcon />}
                sx={{ flex: 1, minWidth: 120 }}
              >
                版本历史
              </Button>
            </Box>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              活动日志
            </Typography>

            <List dense>
              {activities.map(activity => (
                <React.Fragment key={activity.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{
                        backgroundColor: activity.avatarColor,
                        color: 'white',
                        width: 32,
                        height: 32,
                        fontSize: 14
                      }}>
                        {activity.user.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${activity.user} ${activity.action} ${activity.resource}`}
                      secondary={activity.timestamp}
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                权限管理
              </Typography>
              <PermissionManager
                resourceType={resourceType as any}
                resourceId={resourceId}
              />
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              当前用户: {currentUser.name} - {currentUser.role} |
              此资源支持多人协作，您可以邀请团队成员共同管理。
            </Alert>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* 快速操作浮动按钮 */}
      <Fab
        color="primary"
        aria-label="chat"
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          zIndex: 1000
        }}
        onClick={handleChat}
      >
        <ChatIcon />
      </Fab>
    </Paper>
  );
};

export default CollaborationPanel;