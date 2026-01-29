import React, { useState, memo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Typography,
  IconButton,
  Button,
  Chip,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Fade,
  Collapse,
  Link,
} from '@mui/material';
import {
  OpenInNew as OpenInNewIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  Launch as LaunchExternalIcon,
} from '@mui/icons-material';
import { Site } from '../API/http';
import LazyImage from './LazyImage';

interface ModernSiteCardProps {
  site: Site;
  onEdit?: (site: Site) => void;
  onDelete?: (id: number) => void;
  onToggleVisibility?: (id: number, isPublic: number) => void;
  onOpen?: (url: string) => void;
}

const ModernSiteCard: React.FC<ModernSiteCardProps> = ({
  site,
  onEdit,
  onDelete,
  onToggleVisibility,
  onOpen,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpen = useCallback(() => {
    if (onOpen) {
      onOpen(site.url);
    } else {
      window.open(site.url, '_blank', 'noopener,noreferrer');
    }
  }, [site.url, onOpen]);

  const handleEdit = () => {
    onEdit?.(site);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete?.(site.id!);
    handleMenuClose();
  };

  const handleToggleVisibility = () => {
    onToggleVisibility?.(site.id!, site.is_public === 1 ? 0 : 1);
    handleMenuClose();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: site.name,
          text: site.description || `Check out ${site.name}`,
          url: site.url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(site.url);
        // Show notification if possible
        if (Notification.permission === 'granted') {
          new Notification('链接已复制到剪贴板');
        }
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
    handleMenuClose();
  };

  const handleFavorite = () => {
    // 添加收藏功能
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const exists = favorites.some((fav: Site) => fav.id === site.id);
    
    if (!exists) {
      favorites.push(site);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    handleMenuClose();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Fade in timeout={300}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: hovered ? 8 : 2,
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          '&:hover': {
            boxShadow: 8,
            transform: 'translateY(-4px)',
          },
          borderRadius: 2,
          overflow: 'visible',
          position: 'relative',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* 卡片媒体区域 */}
        <Box
          sx={{
            position: 'relative',
            height: 160,
            overflow: 'hidden',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            mb: 1,
          }}
        >
          {site.icon ? (
            <LazyImage
              src={site.icon}
              alt={site.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
              }}
            >
              <Typography variant="h4" sx={{ opacity: 0.8 }}>
                {site.name.charAt(0).toUpperCase()}
              </Typography>
            </Box>
          )}
          
          {/* 可见性标签 */}
          {site.is_public === 0 && (
            <Chip
              label="私密"
              size="small"
              color="error"
              icon={<VisibilityOffIcon />}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backdropFilter: 'blur(4px)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              }}
            />
          )}
          
          {/* 操作菜单 */}
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backdropFilter: 'blur(4px)',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            <MoreIcon />
          </IconButton>
          
          {/* 右下角链接按钮 */}
          <Tooltip title="在新标签页中打开">
            <IconButton
              onClick={handleOpen}
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                backdropFilter: 'blur(4px)',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              <LaunchExternalIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* 卡片内容 */}
        <CardContent sx={{ flexGrow: 1, pb: 1, pt: 0 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 600,
              mb: 0.5,
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {site.name}
          </Typography>
          
          <Link
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            color="text.secondary"
            variant="body2"
            sx={{
              display: 'block',
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {site.url.replace(/^https?:\/\//, '')}
          </Link>
          
          {site.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              onClick={() => setExpanded(!expanded)}
            >
              {site.description}
            </Typography>
          )}
          
          {site.notes && (
            <Collapse in={expanded}>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {site.notes}
              </Typography>
            </Collapse>
          )}
        </CardContent>

        {/* 卡片操作 */}
        <CardActions sx={{ p: 1.5, pt: 0 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<OpenInNewIcon />}
            onClick={handleOpen}
            fullWidth
          >
            访问网站
          </Button>
        </CardActions>

        {/* 操作菜单 */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          TransitionComponent={Fade}
          slotProps={{
            paper: {
              sx: {
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              }
            }
          }}
        >
          <MenuItem onClick={handleOpen}>
            <ListItemIcon>
              <OpenInNewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>在新标签页打开</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={handleFavorite}>
            <ListItemIcon>
              <BookmarkIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>收藏</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={handleShare}>
            <ListItemIcon>
              <ShareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>分享</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={handleToggleVisibility}>
            <ListItemIcon>
              {site.is_public === 1 ? (
                <VisibilityOffIcon fontSize="small" color="error" />
              ) : (
                <VisibilityIcon fontSize="small" color="success" />
              )}
            </ListItemIcon>
            <ListItemText>
              {site.is_public === 1 ? '设为私密' : '设为公开'}
            </ListItemText>
          </MenuItem>
          
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>编辑</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>删除</ListItemText>
          </MenuItem>
        </Menu>
      </Card>
    </Fade>
  );
};

export default memo(ModernSiteCard);