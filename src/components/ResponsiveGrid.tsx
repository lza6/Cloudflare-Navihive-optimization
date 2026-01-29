import React from 'react';
import { Grid, GridProps } from '@mui/material';

interface ResponsiveGridProps extends Omit<GridProps, 'size'> {
  size?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

/**
 * 响应式网格组件
 * 自动根据屏幕尺寸调整列数
 */
const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ size, ...props }) => {
  // 默认响应式尺寸
  const defaultSize = {
    xs: 12,    // 手机: 1列
    sm: 6,     // 平板: 2列
    md: 4,     // 桌面: 3列
    lg: 3,     // 大屏: 4列
    xl: 2,     // 超大屏: 6列
    ...size,   // 允许覆盖默认值
  };

  return (
    <Grid
      size={{
        xs: defaultSize.xs,
        sm: defaultSize.sm,
        md: defaultSize.md,
        lg: defaultSize.lg,
        xl: defaultSize.xl,
      }}
      {...props}
    />
  );
};

export default ResponsiveGrid;