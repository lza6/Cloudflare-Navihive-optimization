/**
 * 数据统计面板组件
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Tooltip,
  Paper,
  Tab,
  Tabs,
  IconButton,
  Collapse,
} from '@mui/material';
import { 
  ShowChart as StatsIcon, 
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  BarChart as BarIcon,
  PieChart as PieIcon,
  TableChart as TableIcon,
} from '@mui/icons-material';
import { Group, Site } from '../API/http';

interface StatsPanelProps {
  groups: Group[];
  sites: Site[];
}

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  icon?: React.ReactNode;
  trend?: number; // 百分比变化
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  color = 'primary', 
  icon,
  trend 
}) => {
  return (
    <Card sx={{ height: '100%', boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
              <Typography variant="h4" component="div">
                {value}
              </Typography>
            </Box>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {trend !== undefined && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(Math.abs(trend), 100)} 
              color={trend >= 0 ? 'success' : 'error'}
            />
            <Typography variant="caption" color={trend >= 0 ? 'success' : 'error'}>
              {trend >= 0 ? '+' : ''}{trend}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const StatsPanel: React.FC<StatsPanelProps> = ({ groups, sites }) => {
  const [expanded, setExpanded] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalSites: 0,
    publicGroups: 0,
    publicSites: 0,
    privateGroups: 0,
    privateSites: 0,
    avgSitesPerGroup: 0,
  });

  useEffect(() => {
    const totalGroups = groups.length;
    const totalSites = sites.length;
    
    const publicGroups = groups.filter(g => g.is_public === 1).length;
    const publicSites = sites.filter(s => s.is_public === 1).length;
    const privateGroups = totalGroups - publicGroups;
    const privateSites = totalSites - publicSites;
    
    const avgSitesPerGroup = totalGroups > 0 ? (totalSites / totalGroups).toFixed(1) : 0;

    setStats({
      totalGroups,
      totalSites,
      publicGroups,
      publicSites,
      privateGroups,
      privateSites,
      avgSitesPerGroup: parseFloat(avgSitesPerGroup.toString()),
    });
  }, [groups, sites]);

  const groupDistribution = groups.map(group => ({
    name: group.name,
    count: sites.filter(s => s.group_id === group.id).length,
  }));

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Paper elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2,
        bgcolor: 'background.paper',
        borderBottom: expanded ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StatsIcon color="primary" />
          <Typography variant="h6">数据统计</Typography>
          <Chip 
            label={`${stats.totalGroups} 分组`} 
            size="small" 
            color="primary" 
            sx={{ ml: 1 }} 
          />
          <Chip 
            label={`${stats.totalSites} 站点`} 
            size="small" 
            color="secondary" 
            sx={{ ml: 1 }} 
          />
        </Box>
        <IconButton onClick={toggleExpanded}>
          {expanded ? <CollapseIcon /> : <ExpandIcon />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          <Tabs 
            value={tabIndex} 
            onChange={handleChangeTab} 
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<BarIcon />} label="概览" iconPosition="start" />
            <Tab icon={<PieIcon />} label="分布" iconPosition="start" />
            <Tab icon={<TableIcon />} label="详情" iconPosition="start" />
          </Tabs>
          
          <Box sx={{ pt: 2 }}>
            {tabIndex === 0 && (
              <>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                      title="总分组数"
                      value={stats.totalGroups}
                      subtitle="包含公开和私密分组"
                      color="primary"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                      title="总站点数"
                      value={stats.totalSites}
                      subtitle="所有分组中的站点总数"
                      color="secondary"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                      title="平均分组站点数"
                      value={stats.avgSitesPerGroup}
                      subtitle="每个分组平均包含站点数"
                      color="success"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                      title="公开内容比例"
                      value={`${stats.totalSites ? ((stats.publicSites + stats.publicGroups) / (stats.totalSites + stats.totalGroups) * 100).toFixed(1) : 0}%`}
                      subtitle="公开站点和分组占比"
                      color="info"
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                      title="公开分组"
                      value={stats.publicGroups}
                      subtitle="访客可见的分组"
                      color="success"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                      title="私密分组"
                      value={stats.privateGroups}
                      subtitle="仅管理员可见"
                      color="error"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                      title="公开站点"
                      value={stats.publicSites}
                      subtitle="访客可见的站点"
                      color="success"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                      title="私密站点"
                      value={stats.privateSites}
                      subtitle="仅管理员可见"
                      color="error"
                    />
                  </Grid>
                </Grid>
              </>
            )}
            
            {tabIndex === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  分组站点分布
                </Typography>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {groupDistribution.map((item, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Tooltip title={item.name}>
                          <Typography variant="body2" noWrap sx={{ flex: 1, mr: 2 }}>
                            {item.name}
                          </Typography>
                        </Tooltip>
                        <Typography variant="body2" color="primary">
                          {item.count} 个站点
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={stats.totalSites > 0 ? (item.count / stats.totalSites) * 100 : 0}
                        sx={{ mb: 1 }}
                      />
                    </Box>
                  ))}
                  
                  {groupDistribution.length === 0 && (
                    <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                      暂无数据
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
            
            {tabIndex === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  详细统计信息
                </Typography>
                <>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          分组统计
                        </Typography>
                        <Typography variant="body2">
                          总数: {stats.totalGroups}
                        </Typography>
                        <Typography variant="body2">
                          公开: {stats.publicGroups} ({stats.totalGroups ? ((stats.publicGroups / stats.totalGroups) * 100).toFixed(1) : 0}%)
                        </Typography>
                        <Typography variant="body2">
                          私密: {stats.privateGroups} ({stats.totalGroups ? ((stats.privateGroups / stats.totalGroups) * 100).toFixed(1) : 0}%)
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          站点统计
                        </Typography>
                        <Typography variant="body2">
                          总数: {stats.totalSites}
                        </Typography>
                        <Typography variant="body2">
                          公开: {stats.publicSites} ({stats.totalSites ? ((stats.publicSites / stats.totalSites) * 100).toFixed(1) : 0}%)
                        </Typography>
                        <Typography variant="body2">
                          私密: {stats.privateSites} ({stats.totalSites ? ((stats.privateSites / stats.totalSites) * 100).toFixed(1) : 0}%)
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </>
              </Box>
            )}
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default StatsPanel;