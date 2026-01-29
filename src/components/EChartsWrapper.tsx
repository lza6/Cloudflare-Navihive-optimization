import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import {
  BarChart,
  PieChart,
  LineChart,
  ScatterChart,
  FunnelChart,
  GaugeChart,
  EffectScatterChart,
  RadarChart,
  TreeChart,
  TreemapChart,
  SankeyChart,
  BoxplotChart,
  CandlestickChart,
  HeatmapChart,
  MapChart,
  ParallelChart,
  LinesChart,
  GraphChart
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  DataZoomComponent,
  VisualMapComponent,
  ToolboxComponent,
  AxisPointerComponent,
  BrushComponent,
  GeoComponent,
  TimelineComponent,
  MarkLineComponent,
  MarkPointComponent,
  MarkAreaComponent,
  AriaComponent,
  CalendarComponent,
  GraphicComponent,

} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';
import { EChartsType, ECBasicOption } from 'echarts/types/dist/shared';
import { Box, Card, CardContent, CardHeader, Grid, Paper, Typography } from '@mui/material';

// 注册ECharts模块
echarts.use([
  BarChart,
  PieChart,
  LineChart,
  ScatterChart,
  EffectScatterChart,
  RadarChart,
  TreeChart,
  TreemapChart,
  SankeyChart,
  BoxplotChart,
  CandlestickChart,
  HeatmapChart,
  MapChart,
  ParallelChart,
  LinesChart,
  GraphChart,
  FunnelChart,
  GaugeChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  DataZoomComponent,
  VisualMapComponent,
  ToolboxComponent,
  AxisPointerComponent,
  BrushComponent,
  GeoComponent,
  TimelineComponent,
  MarkLineComponent,
  MarkPointComponent,
  MarkAreaComponent,
  AriaComponent,
  CalendarComponent,
  GraphicComponent,

  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  SVGRenderer
]);

interface EChartsWrapperProps {
  option: ECBasicOption;
  style?: React.CSSProperties;
  loading?: boolean;
  theme?: 'light' | 'dark';
  renderer?: 'canvas' | 'svg';
  onChartReady?: (chart: EChartsType) => void;
  onEvents?: Record<string, (params: any) => void>;
}

const EChartsWrapper: React.FC<EChartsWrapperProps> = ({ 
  option, 
  style = { width: '100%', height: '400px' }, 
  loading = false,
  theme = 'light',
  renderer = 'canvas',
  onChartReady,
  onEvents = {}
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<EChartsType | null>(null);
  const [resizeObserver, setResizeObserver] = useState<ResizeObserver | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // 初始化图表实例
      chartInstance.current = echarts.init(
        chartRef.current, 
        theme, 
        { renderer: renderer === 'svg' ? 'svg' : 'canvas' }
      );
      
      // 注册事件监听器
      Object.entries(onEvents).forEach(([eventName, handler]) => {
        chartInstance.current?.on(eventName, handler);
      });
      
      // 应用配置
      chartInstance.current.setOption(option, true);
      
      // 设置加载状态
      if (loading) {
        chartInstance.current.showLoading();
      } else {
        chartInstance.current.hideLoading();
      }
      
      // 调用图表准备完成回调
      if (onChartReady && chartInstance.current) {
        onChartReady(chartInstance.current);
      }
      
      // 创建ResizeObserver以响应容器大小变化
      const observer = new ResizeObserver(() => {
        if (chartInstance.current) {
          chartInstance.current.resize();
        }
      });
      
      observer.observe(chartRef.current);
      setResizeObserver(observer);
    }

    return () => {
      // 清理事件监听器
      if (chartInstance.current) {
        Object.keys(onEvents).forEach(eventName => {
          chartInstance.current?.off(eventName);
        });
      }
      
      // 清理资源
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, [theme, renderer]);

  useEffect(() => {
    // 更新配置
    if (chartInstance.current) {
      chartInstance.current.setOption(option, true);
      
      // 更新加载状态
      if (loading) {
        chartInstance.current.showLoading();
      } else {
        chartInstance.current.hideLoading();
      }
    }
  }, [option, loading]);
  
  // 监听事件属性的变化，动态注册/注销事件
  useEffect(() => {
    if (!chartInstance.current) return;
    
    // 注销旧事件
    Object.keys(onEvents).forEach(eventName => {
      chartInstance.current?.off(eventName);
    });
    
    // 注册新事件
    Object.entries(onEvents).forEach(([eventName, handler]) => {
      chartInstance.current?.on(eventName, handler);
    });
    
    // 重新应用配置
    chartInstance.current.setOption(option, true);
  }, [onEvents, option]);

  return <div ref={chartRef} style={style} />;
};

export default EChartsWrapper;