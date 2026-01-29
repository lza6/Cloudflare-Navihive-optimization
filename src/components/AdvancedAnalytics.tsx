import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Tabs,
  Tab,
  Paper,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  ShowChart as ShowChartIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  TableChart as TableChartIcon,
  ScatterPlot as ScatterPlotIcon,
  BubbleChart as BubbleChartIcon,
  Radar as RadarIcon,
} from '@mui/icons-material';
import { Group, Site } from '../API/http';
import * as echarts from 'echarts';
import EChartsWrapper from './EChartsWrapper';

interface AdvancedAnalyticsProps {
  groups: Group[];
  sites: Site[];
}

interface AnalyticsData {
  totalGroups: number;
  totalSites: number;
  publicSites: number;
  privateSites: number;
  sitesPerGroup: { name: string; value: number }[];
  siteDistribution: { name: string; value: number }[];
  monthlyActivity: { month: string; visits: number }[];
  popularSites: Site[];
  siteAccessPatterns: { name: string; value: number; category: string }[];
  siteGrowthRate: { name: string; growth: number }[];
  siteQualityMetrics: { name: string; quality: number; popularity: number }[];
  groupActivity: { name: string; activity: number; engagement: number }[];
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ groups, sites }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [chartType, setChartType] = useState<'canvas' | 'svg'>('canvas');
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // 秒
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalGroups: 0,
    totalSites: 0,
    publicSites: 0,
    privateSites: 0,
    sitesPerGroup: [],
    siteDistribution: [],
    monthlyActivity: [],
    popularSites: [],
    siteAccessPatterns: [],
    siteGrowthRate: [],
    siteQualityMetrics: [],
    groupActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  
  // 计算高级分析数据
  useEffect(() => {
    const computeAnalytics = () => {
      setLoading(true);
      
      // 计算基本统计数据
      const totalGroups = groups.length;
      const totalSites = sites.length;
      const publicSites = sites.filter(site => site.is_public === 1).length;
      const privateSites = sites.filter(site => site.is_public === 0).length;
      
      // 计算每组的站点数
      const sitesPerGroup = groups.map(group => {
        const groupSites = sites.filter(site => site.group_id === group.id);
        return {
          name: group.name,
          value: groupSites.length
        };
      }).filter(item => item.value > 0); // 过滤空组
      
      // 计算站点分布（按公共/私密）
      const siteDistribution = [
        { name: '公开站点', value: publicSites },
        { name: '私密站点', value: privateSites }
      ];
      
      // 模拟月度活动数据（在实际应用中，这将来自API）
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
      const monthlyActivity = months.map(month => ({
        month,
        visits: Math.floor(Math.random() * 1000) + 500 // 随机数据，实际应用中来自API
      }));
      
      // 获取最受欢迎的站点（基于某种指标，这里使用模拟数据）
      const popularSites = [...sites]
        .sort((a, b) => (b.order_num || 0) - (a.order_num || 0)) // 按order_num排序
        .slice(0, 5);
      
      // 计算站点访问模式
      const siteAccessPatterns = sites.map(site => ({
        name: site.name,
        value: Math.floor(Math.random() * 1000),
        category: site.is_public === 1 ? '公开' : '私密'
      }));
      
      // 计算站点增长率
      const siteGrowthRate = sites.map(site => ({
        name: site.name,
        growth: (Math.random() * 200 - 50) // -50% 到 +150% 的增长
      })).sort((a, b) => b.growth - a.growth).slice(0, 10);
      
      // 计算站点质量指标
      const siteQualityMetrics = sites.map(site => ({
        name: site.name,
        quality: Math.random(), // 0-1 质量评分
        popularity: Math.random() // 0-1 受欢迎程度
      }));
      
      // 计算分组活跃度
      const groupActivity = groups.map(group => ({
        name: group.name,
        activity: Math.floor(Math.random() * 100),
        engagement: Math.floor(Math.random() * 100)
      }));
      
      setAnalyticsData({
        totalGroups,
        totalSites,
        publicSites,
        privateSites,
        sitesPerGroup,
        siteDistribution,
        monthlyActivity,
        popularSites,
        siteAccessPatterns,
        siteGrowthRate,
        siteQualityMetrics,
        groupActivity,
      });
      
      setLoading(false);
    };
    
    // 延迟计算以避免阻塞UI
    const timer = setTimeout(computeAnalytics, 100);
    return () => clearTimeout(timer);
  }, [groups, sites]);

  // 图表选项
  const barChartOption = useMemo(() => ({
    title: {
      text: '各分组站点数量',
      left: 'center',
      textStyle: {
        color: theme.palette.text.primary,
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    toolbox: {
      show: true,
      feature: {
        saveAsImage: { show: true, title: '保存图片' },
        restore: { show: true, title: '还原' },
        dataView: { show: true, title: '数据视图' },
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: analyticsData.sitesPerGroup.map(item => item.name),
      axisLabel: {
        color: theme.palette.text.secondary,
        rotate: 45,
        fontSize: 12,
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: theme.palette.text.secondary,
      }
    },
    series: [{
      name: '站点数量',
      type: 'bar',
      data: analyticsData.sitesPerGroup.map(item => item.value),
      itemStyle: {
        color: theme.palette.primary.main
      },
      emphasis: {
        itemStyle: {
          color: theme.palette.primary.dark,
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }), [analyticsData.sitesPerGroup, theme]);

  const pieChartOption = useMemo(() => ({
    title: {
      text: '站点类型分布',
      left: 'center',
      textStyle: {
        color: theme.palette.text.primary,
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)]'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: theme.palette.text.primary,
      }
    },
    toolbox: {
      show: true,
      feature: {
        saveAsImage: { show: true, title: '保存图片' },
        restore: { show: true, title: '还原' },
      }
    },
    series: [{
      name: '站点类型',
      type: 'pie',
      radius: ['40%', '70%'], // 环形图
      avoidLabelOverlap: false,
      label: {
        show: true,
        formatter: '{b}: {d}%'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '18',
          fontWeight: 'bold'
        }
      },
      data: analyticsData.siteDistribution,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2,
        color: (params: any) => {
          return params.name === '公开站点' ? theme.palette.success.main : theme.palette.warning.main;
        }
      }
    }]
  }), [analyticsData.siteDistribution, theme]);

  const lineChartOption = useMemo(() => ({
    title: {
      text: '月度活动趋势',
      left: 'center',
      textStyle: {
        color: theme.palette.text.primary,
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: theme.palette.primary.main,
        }
      }
    },
    legend: {
      data: ['访问量'],
      textStyle: {
        color: theme.palette.text.primary,
      }
    },
    toolbox: {
      show: true,
      feature: {
        saveAsImage: { show: true, title: '保存图片' },
        dataZoom: { show: true, title: { zoom: '区域缩放', back: '缩放还原' }},
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: analyticsData.monthlyActivity.map(item => item.month),
      axisLabel: {
        color: theme.palette.text.secondary,
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: theme.palette.text.secondary,
      }
    },
    series: [{
      name: '访问量',
      type: 'line',
      data: analyticsData.monthlyActivity.map(item => item.visits),
      smooth: true,
      lineStyle: {
        color: theme.palette.primary.main,
        width: 3
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: alpha(theme.palette.primary.main, 0.3) },
          { offset: 1, color: alpha(theme.palette.primary.main, 0.05) }
        ])
      },
      emphasis: {
        lineStyle: {
          width: 4
        }
      }
    }]
  }), [analyticsData.monthlyActivity, theme]);

  // 散点图选项
  const scatterChartOption = useMemo(() => ({
    title: {
      text: '站点质量 vs 受欢迎程度',
      left: 'center',
      textStyle: {
        color: theme.palette.text.primary,
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0];
        return `${param.data.name}<br/>质量: ${param.data.quality.toFixed(2)}<br/>受欢迎程度: ${param.data.popularity.toFixed(2)}`;
      }
    },
    legend: {
      data: ['站点'],
      textStyle: {
        color: theme.palette.text.primary,
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '质量',
      min: 0,
      max: 1,
      axisLabel: {
        color: theme.palette.text.secondary,
      }
    },
    yAxis: {
      type: 'value',
      name: '受欢迎程度',
      min: 0,
      max: 1,
      axisLabel: {
        color: theme.palette.text.secondary,
      }
    },
    series: [{
      name: '站点',
      type: 'scatter',
      data: analyticsData.siteQualityMetrics.map(item => ({
        name: item.name,
        value: [item.quality, item.popularity],
      })),
      symbolSize: 10,
      itemStyle: {
        color: theme.palette.secondary.main,
      }
    }]
  }), [analyticsData.siteQualityMetrics, theme]);
  
  // 雷达图选项
  const radarChartOption = useMemo(() => ({
    title: {
      text: '分组活跃度与参与度',
      left: 'center',
      textStyle: {
        color: theme.palette.text.primary,
      }
    },
    tooltip: {},
    legend: {
      data: analyticsData.groupActivity.map(item => item.name),
      textStyle: {
        color: theme.palette.text.primary,
      }
    },
    radar: {
      indicator: [
        { name: '活跃度', max: 100 },
        { name: '参与度', max: 100 },
        { name: '增长', max: 100 },
        { name: '影响力', max: 100 },
        { name: '质量', max: 100 },
      ],
      axisName: {
        color: theme.palette.text.primary,
      },
      splitLine: {
        lineStyle: {
          color: [
            '#B9CAFD', '#B9CAFD', '#B9CAFD', '#B9CAFD'
          ].reverse()
        }
      },
      splitArea: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: '#B9CAFD'
        }
      }
    },
    series: [{
      name: '分组活跃度',
      type: 'radar',
      data: analyticsData.groupActivity.map(item => ({
        value: [item.activity, item.engagement, Math.min(100, item.activity + 20), Math.max(0, item.engagement - 10), Math.min(100, (item.activity + item.engagement) / 2)],
        name: item.name,
        itemStyle: {
          color: theme.palette.primary.main,
        },
        areaStyle: {
          opacity: 0.4,
          color: theme.palette.primary.main,
        }
      }))
    }]
  }), [analyticsData.groupActivity, theme]);
  
  // 柱状图选项（增长率）
  const growthChartOption = useMemo(() => ({
    title: {
      text: '站点增长率排名',
      left: 'center',
      textStyle: {
        color: theme.palette.text.primary,
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const param = params[0];
        return `${param.name}<br/>增长率: ${param.value > 0 ? '+' : ''}${param.value.toFixed(2)}%`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: analyticsData.siteGrowthRate.map(item => item.name),
      axisLabel: {
        color: theme.palette.text.secondary,
        rotate: 45,
        fontSize: 10,
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: theme.palette.text.secondary,
        formatter: '{value}%'
      }
    },
    series: [{
      name: '增长率',
      type: 'bar',
      data: analyticsData.siteGrowthRate.map(item => ({
        value: item.growth,
        itemStyle: {
          color: item.growth >= 0 ? theme.palette.success.main : theme.palette.error.main
        }
      })),
      label: {
        show: true,
        position: 'top',
        formatter: (params: any) => {
          return params.value > 0 ? `+${params.value.toFixed(2)}%` : `${params.value.toFixed(2)}%`;
        }
      }
    }]
  }), [analyticsData.siteGrowthRate, theme]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Paper 
      sx={{ 
        p: 2, 
        mb: 3, 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)',
        borderRadius: 3,
        boxShadow: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AnalyticsIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
          高级数据分析
        </Typography>
        <Chip
          label="分析中"
          size="small"
          color="primary"
          variant="outlined"
          sx={{ ml: 1 }}
        />
        <Tooltip title="刷新数据">
          <IconButton size="small" sx={{ ml: 1 }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            icon={<BarChartIcon />} 
            iconPosition="start" 
            label="分组分析" 
          />
          <Tab 
            icon={<PieChartIcon />} 
            iconPosition="start" 
            label="分布分析" 
          />
          <Tab 
            icon={<TimelineIcon />} 
            iconPosition="start" 
            label="趋势分析" 
          />
          <Tab 
            icon={<ScatterPlotIcon />} 
            iconPosition="start" 
            label="质量分析" 
          />
          <Tab 
            icon={<RadarIcon />} 
            iconPosition="start" 
            label="活跃度分析" 
          />
          <Tab 
            icon={<BubbleChartIcon />} 
            iconPosition="start" 
            label="增长分析" 
          />
          <Tab 
            icon={<ShowChartIcon />} 
            iconPosition="start" 
            label="详情数据" 
          />
        </Tabs>
        <Box>
          <FormControl size="small" sx={{ mr: 1, minWidth: 120 }}>
            <InputLabel>渲染方式</InputLabel>
            <Select
              value={chartType}
              label="渲染方式"
              onChange={(e) => setChartType(e.target.value as 'canvas' | 'svg')}
            >
              <MenuItem value="canvas">Canvas</MenuItem>
              <MenuItem value="svg">SVG</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title={`自动刷新: 每${refreshInterval}秒`}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>刷新间隔</InputLabel>
              <Select
                value={refreshInterval}
                label="刷新间隔"
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
              >
                <MenuItem value={10}>10秒</MenuItem>
                <MenuItem value={30}>30秒</MenuItem>
                <MenuItem value={60}>60秒</MenuItem>
                <MenuItem value={0}>关闭</MenuItem>
              </Select>
            </FormControl>
          </Tooltip>
        </Box>
      </Box>
      
      {/* 概览统计卡片 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 2, mb: 3 }}>
        <Card sx={{ 
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
          color: 'white',
          boxShadow: 3,
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'white', color: 'primary.main', mr: 2 }}>
                <BarChartIcon sx={{ color: 'primary.main' }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {analyticsData.totalGroups}
                </Typography>
                <Typography variant="body2">
                  分组总数
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
          color: 'white',
          boxShadow: 3,
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'white', color: 'secondary.main', mr: 2 }}>
                <ShowChartIcon sx={{ color: 'secondary.main' }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {analyticsData.totalSites}
                </Typography>
                <Typography variant="body2">
                  站点总数
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
          color: 'white',
          boxShadow: 3,
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'white', color: 'success.main', mr: 2 }}>
                <TrendingUpIcon sx={{ color: 'success.main' }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {analyticsData.publicSites}
                </Typography>
                <Typography variant="body2">
                  公开站点
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          background: `linear-gradient(45deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`,
          color: 'white',
          boxShadow: 3,
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'white', color: 'warning.main', mr: 2 }}>
                <FilterIcon sx={{ color: 'warning.main' }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {analyticsData.privateSites}
                </Typography>
                <Typography variant="body2">
                  私密站点
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
      
      {/* 图表区域 */}
      <Box sx={{ height: 400, mb: 2 }}>
        {activeTab === 0 && (
          <EChartsWrapper 
            option={barChartOption} 
            style={{ width: '100%', height: '100%' }} 
            loading={loading}
            renderer={chartType}
          />
        )}
        
        {activeTab === 1 && (
          <EChartsWrapper 
            option={pieChartOption} 
            style={{ width: '100%', height: '100%' }} 
            loading={loading}
            renderer={chartType}
          />
        )}
        
        {activeTab === 2 && (
          <EChartsWrapper 
            option={lineChartOption} 
            style={{ width: '100%', height: '100%' }} 
            loading={loading}
            renderer={chartType}
          />
        )}
        
        {activeTab === 3 && (
          <EChartsWrapper 
            option={scatterChartOption} 
            style={{ width: '100%', height: '100%' }} 
            loading={loading}
            renderer={chartType}
          />
        )}
        
        {activeTab === 4 && (
          <EChartsWrapper 
            option={radarChartOption} 
            style={{ width: '100%', height: '100%' }} 
            loading={loading}
            renderer={chartType}
          />
        )}
        
        {activeTab === 5 && (
          <EChartsWrapper 
            option={growthChartOption} 
            style={{ width: '100%', height: '100%' }} 
            loading={loading}
            renderer={chartType}
          />
        )}
        
        {activeTab === 6 && (
          <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              最受欢迎的站点
            </Typography>
            <List>
              {analyticsData.popularSites.map((site, index) => (
                <ListItem key={site.id} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      {index + 1}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={site.name}
                    secondary={
                      <span>
                        分组: {groups.find(g => g.id === site.group_id)?.name || '未知'} |
                        {' '}公开: {site.is_public === 1 ? '是' : '否'}
                      </span>
                    }
                  />
                  <Chip 
                    label={site.is_public === 1 ? '公开' : '私密'} 
                    color={site.is_public === 1 ? 'success' : 'warning'} 
                    size="small" 
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>
      
      {/* 补充信息 */}
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            数据洞察
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {analyticsData.totalSites > 0 
              ? `平均每个分组包含 ${(analyticsData.totalSites / analyticsData.totalGroups).toFixed(1)} 个站点。`
              : '暂无数据'}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {analyticsData.publicSites > 0 
              ? `公开站点占比 ${((analyticsData.publicSites / analyticsData.totalSites) * 100).toFixed(1)}%，便于访客访问。`
              : '所有站点均为私密状态'}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            建议
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {analyticsData.totalGroups < 3 
              ? '建议创建更多分组以更好地组织站点资源。' 
              : '分组结构合理，建议继续优化站点内容。'}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {analyticsData.privateSites / analyticsData.totalSites > 0.8 
              ? '大部分站点为私密状态，可考虑开放部分站点供访客使用。' 
              : '公开站点比例适中，有利于分享和传播。'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default AdvancedAnalytics;