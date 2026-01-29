import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { VariableSizeGrid } from 'react-window';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Typography,
  useTheme,
  alpha,
  Paper,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  OpenInNew as OpenInNewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Site } from '../API/http';
import LazyImage from './LazyImage';

// 自定义防抖 Hook
function useDebounce(callback: () => void, delay: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const debouncedCallback = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback();
    }, delay);
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

interface EnhancedVirtualizedListProps {
  sites: Site[];
  groups: { id: number; name: string }[];
  onEdit?: (site: Site) => void;
  onDelete?: (id: number) => void;
  onOpen?: (url: string) => void;
  itemHeight?: number;
  containerHeight?: number;
  itemsPerRow?: number;
  enableDynamicSizing?: boolean;
  overscanRowCount?: number;
}

// Memoized site card component for better performance
const MemoizedSiteCard = memo(({ site, group, onEdit, onDelete, onOpen }: { 
  site: Site; 
  group: { id: number; name: string } | undefined; 
  onEdit?: (site: Site) => void; 
  onDelete?: (id: number) => void; 
  onOpen?: (url: string) => void; 
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        boxShadow: 2,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.default, 0.9)})`,
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {site.icon ? (
            <LazyImage
              src={site.icon}
              alt={site.name}
              width={24}
              height={24}
              style={{ borderRadius: '4px', marginRight: 1 }}
            />
          ) : (
            <Box
              sx={{
                width: 24,
                height: 24,
                bgcolor: 'primary.main',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1,
              }}
            >
              <Typography variant="caption" sx={{ color: 'white', fontSize: '0.75rem' }}>
                {site.name.charAt(0).toUpperCase()}
              </Typography>
            </Box>
          )}
          <Tooltip title={site.name}>
            <Typography
              variant="subtitle2"
              noWrap
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                maxWidth: 'calc(100% - 32px)',
              }}
            >
              {site.name}
            </Typography>
          </Tooltip>
        </Box>
        
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ 
            mb: 1, 
            minHeight: 40,
            maxHeight: 60,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {site.description || site.notes || '暂无描述'}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 'auto' }}>
          <Chip
            label={group?.name || '未知分组'}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.6rem', height: '20px' }}
          />
          <Chip
            label={site.is_public ? '公开' : '私密'}
            size="small"
            color={site.is_public ? 'success' : 'warning'}
            variant="outlined"
            sx={{ fontSize: '0.6rem', height: '20px' }}
          />
        </Box>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
        <Tooltip title="在新标签页中打开">
          <IconButton
            size="small"
            onClick={() => onOpen && onOpen(site.url)}
            sx={{ color: 'primary.main' }}
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="编辑">
          <IconButton
            size="small"
            onClick={() => onEdit && onEdit(site)}
            sx={{ color: 'info.main' }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="删除">
          <IconButton
            size="small"
            onClick={() => onDelete && onDelete(site.id!)}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
});

const EnhancedVirtualizedList: React.FC<EnhancedVirtualizedListProps> = ({
  sites,
  groups,
  onEdit,
  onDelete,
  onOpen,
  itemHeight = 220,
  containerHeight = 600,
  itemsPerRow = 4,
  enableDynamicSizing = false,
  overscanRowCount = 2,
}) => {
  const theme = useTheme();
  const [containerWidth, setContainerWidth] = useState<number>(window.innerWidth * 0.8);
  const [rowHeights, setRowHeights] = useState<number[]>([]);

  // 使用自定义防抖 Hook
  const debouncedResizeHandler = useDebounce(() => {
    setContainerWidth(window.innerWidth * 0.8);
  }, 150);

  // 监听窗口大小变化
  useEffect(() => {
    window.addEventListener('resize', debouncedResizeHandler);
    return () => window.removeEventListener('resize', debouncedResizeHandler);
  }, [debouncedResizeHandler]);

  // 计算列宽
  const columnWidth = Math.floor((containerWidth - 32) / itemsPerRow);

  // 初始化行高
  useEffect(() => {
    if (enableDynamicSizing) {
      // 为每一行设置默认高度
      const initialHeights = Array(Math.ceil(sites.length / itemsPerRow))
        .fill(itemHeight);
      setRowHeights(initialHeights);
    }
  }, [sites, itemsPerRow, itemHeight, enableDynamicSizing]);

  // 获取行高的函数
  const getRowHeight = useCallback((index: number) => {
    if (enableDynamicSizing && rowHeights[index]) {
      return rowHeights[index];
    }
    return itemHeight;
  }, [rowHeights, itemHeight, enableDynamicSizing]);

  // 设置行高的函数
  const setRowHeight = useCallback((index: number, size: number) => {
    setRowHeights(prev => {
      const newRowHeights = [...prev];
      newRowHeights[index] = size;
      return newRowHeights;
    });
  }, []);

  // Memoized cell renderer
  const Cell = useCallback(({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * itemsPerRow + columnIndex;
    const site = sites[index];

    if (!site) {
      return <div style={{ ...style, visibility: 'hidden' }} />;
    }

    const group = groups.find(g => g.id === site.group_id);

    return (
      <div style={{ ...style, padding: '8px' }}>
        <MemoizedSiteCard
          site={site}
          group={group}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpen={onOpen}
        />
      </div>
    );
  }, [sites, groups, itemsPerRow, onEdit, onDelete, onOpen]);

  // 计算行数
  const rowCount = Math.ceil(sites.length / itemsPerRow);

  // Memoized grid component
  const GridComponent = useMemo(() => {
    if (sites.length === 0) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: containerHeight,
          p: 4 
        }}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              暂无站点数据
            </Typography>
            <Typography variant="body2" color="text.secondary">
              添加一些站点来开始使用
            </Typography>
          </Paper>
        </Box>
      );
    }

    return (
      <VariableSizeGrid
        columnCount={itemsPerRow}
        columnWidth={() => columnWidth}
        height={containerHeight}
        rowCount={rowCount}
        rowHeight={getRowHeight}
        width={containerWidth}
        overscanRowCount={overscanRowCount}
        itemData={{ sites, groups, onEdit, onDelete, onOpen, itemsPerRow }}
      >
        {Cell}
      </VariableSizeGrid>
    );
  }, [
    sites, 
    groups, 
    itemsPerRow, 
    columnWidth, 
    containerHeight, 
    rowCount, 
    getRowHeight, 
    containerWidth, 
    overscanRowCount, 
    Cell,
    theme.palette.primary.main,
    theme.palette.secondary.main
  ]);

  return (
    <Box sx={{ 
      width: '100%', 
      overflowX: 'auto',
      background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.9)}, ${alpha(theme.palette.background.paper, 0.9)})`,
      borderRadius: 2,
      p: 1
    }}>
      {GridComponent}
    </Box>
  );
};

export default EnhancedVirtualizedList;