import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Paper,
} from '@mui/material';
import {
  OpenInNew as OpenInNewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { FixedSizeGrid } from 'react-window';
import { Site } from '../API/http';
import LazyImage from './LazyImage';
import ModernSiteCard from './ModernSiteCard';

interface VirtualizedSiteGridProps {
  sites: Site[];
  groups: { id: number; name: string }[];
  onEdit?: (site: Site) => void;
  onDelete?: (id: number) => void;
  onToggleVisibility?: (id: number, isPublic: number) => void;
  onOpen?: (url: string) => void;
  itemsPerRow?: number;
  itemHeight?: number;
  containerHeight?: number;
}

const VirtualizedSiteGrid: React.FC<VirtualizedSiteGridProps> = ({
  sites,
  groups,
  onEdit,
  onDelete,
  onToggleVisibility,
  onOpen,
  itemsPerRow = 4,
  itemHeight = 250,
  containerHeight = 600,
}) => {
  const theme = useTheme();
  const [containerWidth, setContainerWidth] = useState(window.innerWidth * 0.8); // 默认使用80%宽度

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setContainerWidth(window.innerWidth * 0.8);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 计算每行项目数量和列宽
  const columnCount = itemsPerRow;
  const columnWidth = Math.floor((containerWidth - 32) / columnCount); // 减去一些边距

  // 优化的Cell渲染器
  const Cell = memo(({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * columnCount + columnIndex;
    const site = sites[index];

    if (!site) {
      return <div style={style} />;
    }

    const groupName = groups.find(g => g.id === site.group_id)?.name || '未知分组';

    return (
      <div style={{ ...style, padding: '8px' }}>
        <ModernSiteCard
          site={site}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleVisibility={onToggleVisibility}
          onOpen={onOpen}
        />
      </div>
    );
  });

  // 计算行数
  const rowCount = Math.ceil(sites.length / columnCount);

  // 使用react-window的FixedSizeGrid渲染虚拟滚动网格
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
      <FixedSizeGrid
        columnCount={columnCount}
        columnWidth={columnWidth}
        height={containerHeight}
        rowCount={rowCount}
        rowHeight={itemHeight}
        width={containerWidth}
        itemData={{ sites, groups, onEdit, onDelete, onToggleVisibility, onOpen }}
      >
        {Cell}
      </FixedSizeGrid>
    );
  }, [sites, groups, onEdit, onDelete, onToggleVisibility, onOpen, columnCount, columnWidth, containerHeight, rowCount, itemHeight, containerWidth]);

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

export default VirtualizedSiteGrid;