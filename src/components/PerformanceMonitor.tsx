import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Timelapse as TimelapseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { errorHandler } from '../utils/ErrorHandler';

interface PerformanceData {
  memory: {
    used: number;
    total: number;
    jsHeapSizeLimit: number;
  };
  timing: {
    dnsLookup: number;
    tcpConnection: number;
    requestResponse: number;
    domProcessing: number;
    pageLoad: number;
  };
  resourceTimings: PerformanceResourceTiming[];
  longTasks: PerformanceEntry[];
}

const PerformanceMonitor: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // 获取性能数据
  useEffect(() => {
    if (!open) return;

    const getPerformanceData = () => {
      const data: PerformanceData = {
        memory: {
          used: 0,
          total: 0,
          jsHeapSizeLimit: 0,
        },
        timing: {
          dnsLookup: 0,
          tcpConnection: 0,
          requestResponse: 0,
          domProcessing: 0,
          pageLoad: 0,
        },
        resourceTimings: [],
        longTasks: [],
      };

      // 获取内存信息（如果支持）
      if (performance && (performance as any).memory) {
        const mem = (performance as any).memory;
        data.memory = {
          used: mem.usedJSHeapSize,
          total: mem.totalJSHeapSize,
          jsHeapSizeLimit: mem.jsHeapSizeLimit,
        };
      }

      // 获取导航时间信息
      if (performance && performance.timing) {
        const timing = performance.timing;
        data.timing = {
          dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
          tcpConnection: timing.connectEnd - timing.connectStart,
          requestResponse: timing.responseEnd - timing.requestStart,
          domProcessing: timing.domContentLoadedEventEnd - timing.domLoading,
          pageLoad: timing.loadEventEnd - timing.navigationStart,
        };
      }

      // 获取资源加载时间
      if (performance && performance.getEntriesByType) {
        data.resourceTimings = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        data.longTasks = performance.getEntriesByType('longtask');
      }

      setPerformanceData(data);
    };

    getPerformanceData();
  }, [open]);

  // 计算性能分数
  const calculatePerformanceScore = () => {
    if (!performanceData) return 0;
    
    let score = 100;
    
    // 根据页面加载时间扣分
    if (performanceData.timing.pageLoad > 3000) score -= 30;
    else if (performanceData.timing.pageLoad > 2000) score -= 20;
    else if (performanceData.timing.pageLoad > 1000) score -= 10;
    
    // 根据长任务数量扣分
    if (performanceData.longTasks.length > 5) score -= 20;
    else if (performanceData.longTasks.length > 2) score -= 10;
    
    // 根据内存使用情况扣分
    if (performanceData.memory.jsHeapSizeLimit > 0) {
      const memoryUsage = (performanceData.memory.used / performanceData.memory.jsHeapSizeLimit) * 100;
      if (memoryUsage > 80) score -= 20;
      else if (memoryUsage > 60) score -= 10;
    }
    
    return Math.max(0, score);
  };

  const performanceScore = calculatePerformanceScore();

  return (
    <>
      <Tooltip title="性能监控">
        <IconButton onClick={handleOpen} size="small">
          <SpeedIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">性能监控仪表板</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="概览" />
            <Tab label="资源加载" />
            <Tab label="错误报告" />
          </Tabs>
          
          {activeTab === 0 && performanceData && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ mr: 2 }}>
                          性能分数: {performanceScore}/100
                        </Typography>
                        <Chip
                          label={performanceScore >= 80 ? '优秀' : performanceScore >= 60 ? '良好' : '需改进'}
                          color={performanceScore >= 80 ? 'success' : performanceScore >= 60 ? 'warning' : 'error'}
                        />
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={performanceScore} 
                        sx={{ 
                          height: 10, 
                          borderRadius: 5,
                          mb: 2,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: 
                              performanceScore >= 80 ? theme.palette.success.main :
                              performanceScore >= 60 ? theme.palette.warning.main : 
                              theme.palette.error.main
                          }
                        }} 
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TimelapseIcon sx={{ mr: 1 }} />
                        页面加载时间
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2">DNS查询: {performanceData.timing.dnsLookup}ms</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(100, performanceData.timing.dnsLookup / 500 * 100)} 
                          sx={{ height: 4, borderRadius: 2 }} 
                        />
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2">TCP连接: {performanceData.timing.tcpConnection}ms</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(100, performanceData.timing.tcpConnection / 500 * 100)} 
                          sx={{ height: 4, borderRadius: 2 }} 
                        />
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2">请求响应: {performanceData.timing.requestResponse}ms</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(100, performanceData.timing.requestResponse / 1000 * 100)} 
                          sx={{ height: 4, borderRadius: 2 }} 
                        />
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2">DOM处理: {performanceData.timing.domProcessing}ms</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(100, performanceData.timing.domProcessing / 1000 * 100)} 
                          sx={{ height: 4, borderRadius: 2 }} 
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2">总加载时间: {performanceData.timing.pageLoad}ms</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(100, performanceData.timing.pageLoad / 3000 * 100)} 
                          sx={{ height: 4, borderRadius: 2 }} 
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <MemoryIcon sx={{ mr: 1 }} />
                        内存使用
                      </Typography>
                      {performanceData.memory.jsHeapSizeLimit > 0 ? (
                        <>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="body2">
                              已使用: {(performanceData.memory.used / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={(performanceData.memory.used / performanceData.memory.jsHeapSizeLimit) * 100} 
                              sx={{ height: 4, borderRadius: 2 }} 
                            />
                          </Box>
                          <Box>
                            <Typography variant="body2">
                              限制: {(performanceData.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          浏览器不支持内存监控
                        </Typography>
                      )}
                      
                      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                        长任务
                      </Typography>
                      <Typography variant="body2">
                        检测到 {performanceData.longTasks.length} 个长任务
                      </Typography>
                      {performanceData.longTasks.length > 0 && (
                        <Typography variant="body2" color="error">
                          <WarningIcon fontSize="small" /> 存在可能影响性能的长任务
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {activeTab === 1 && performanceData && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                资源加载详情
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>资源名称</TableCell>
                      <TableCell>类型</TableCell>
                      <TableCell>加载时间 (ms)</TableCell>
                      <TableCell>大小 (KB)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {performanceData.resourceTimings.slice(0, 10).map((resource, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Tooltip title={resource.name}>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {new URL(resource.name).pathname.split('/').pop() || resource.name}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={resource.initiatorType} 
                            size="small" 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell>
                          {(resource.responseEnd - resource.startTime).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {resource.encodedBodySize ? (resource.encodedBodySize / 1024).toFixed(2) : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {performanceData.resourceTimings.length > 10 && (
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  显示前10个资源，共 {performanceData.resourceTimings.length} 个
                </Typography>
              )}
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                错误统计
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(errorHandler.getErrorStats()).map(([type, count]) => (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={type}>
                    <Card>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          {type}
                        </Typography>
                        <Typography variant="h6" component="div">
                          {count}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                最近错误
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>时间</TableCell>
                      <TableCell>类型</TableCell>
                      <TableCell>消息</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {errorHandler.getErrorQueue().slice(0, 5).map((error, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {new Date(error.timestamp).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={error.type} 
                            size="small" 
                            color="error" 
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={error.message}>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                              {error.message}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => {
            errorHandler.sendErrorReport();
            errorHandler.sendPerformanceReport();
          }}>
            发送报告
          </Button>
          <Button onClick={handleClose}>关闭</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PerformanceMonitor;