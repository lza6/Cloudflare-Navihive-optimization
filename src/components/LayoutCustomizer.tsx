import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Button,
  Grid,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ViewModule as ModuleIcon,
  ViewList as ListIcon,
  Tune as TuneIcon,
  ExpandMore as ExpandIcon,
  ViewCompact as CompactIcon,
  Web as WebIcon,
} from '@mui/icons-material';

interface LayoutCustomizerProps {
  onLayoutChange: (layoutSettings: any) => void;
  currentLayout: any;
}

const LayoutCustomizer: React.FC<LayoutCustomizerProps> = ({ onLayoutChange, currentLayout }) => {
  const [expanded, setExpanded] = useState(false);
  const [layoutSettings, setLayoutSettings] = useState({
    layoutType: currentLayout?.layoutType || 'grid',
    gridSize: currentLayout?.gridSize || 4, // 每行显示的卡片数
    cardSpacing: currentLayout?.cardSpacing || 2,
    sidebarPosition: currentLayout?.sidebarPosition || 'left',
    showSidebar: currentLayout?.showSidebar !== undefined ? currentLayout.showSidebar : true,
    showHeader: currentLayout?.showHeader !== undefined ? currentLayout.showHeader : true,
    showFooter: currentLayout?.showFooter !== undefined ? currentLayout.showFooter : true,
    showSearch: currentLayout?.showSearch !== undefined ? currentLayout.showSearch : true,
    showFilters: currentLayout?.showFilters !== undefined ? currentLayout.showFilters : true,
    showTags: currentLayout?.showTags !== undefined ? currentLayout.showTags : true,
    showDescription: currentLayout?.showDescription !== undefined ? currentLayout.showDescription : true,
    cardStyle: currentLayout?.cardStyle || 'standard',
    compactCards: currentLayout?.compactCards || false,
    showIcons: currentLayout?.showIcons !== undefined ? currentLayout.showIcons : true,
    showBadges: currentLayout?.showBadges !== undefined ? currentLayout.showBadges : true,
  });

  const handleSettingChange = (setting: string, value: any) => {
    const newSettings = {
      ...layoutSettings,
      [setting]: value
    };
    setLayoutSettings(newSettings);
    onLayoutChange(newSettings);
  };

  const layoutTypes = [
    { value: 'grid', label: '网格布局', icon: <ModuleIcon /> },
    { value: 'list', label: '列表布局', icon: <ListIcon /> },
    { value: 'dashboard', label: '仪表盘', icon: <DashboardIcon /> },
  ];

  const cardStyles = [
    { value: 'standard', label: '标准卡片' },
    { value: 'minimal', label: '极简风格' },
    { value: 'compact', label: '紧凑卡片' },
    { value: 'elevated', label: '浮雕风格' },
  ];

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
            <WebIcon color="primary" />
            <Typography variant="h6">布局定制</Typography>
            <Chip 
              icon={<TuneIcon />} 
              label="布局" 
              size="small" 
              color="secondary" 
              variant="outlined"
              sx={{ ml: 1 }}
            />
          </Box>
        </AccordionSummary>
        
        <AccordionDetails>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" gutterBottom>
                  布局类型
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>选择布局</InputLabel>
                  <Select
                    value={layoutSettings.layoutType}
                    label="选择布局"
                    onChange={(e) => handleSettingChange('layoutType', e.target.value)}
                  >
                    {layoutTypes.map((layout) => (
                      <MenuItem key={layout.value} value={layout.value}>
                        {layout.icon}
                        <span style={{ marginLeft: 8 }}>{layout.label}</span>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Typography variant="subtitle1" gutterBottom>
                  网格设置
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 120 }}>
                    每行卡片数: {layoutSettings.gridSize}
                  </Typography>
                  <Slider
                    value={layoutSettings.gridSize}
                    min={1}
                    max={6}
                    step={1}
                    onChange={(e, val) => handleSettingChange('gridSize', val as number)}
                    sx={{ flex: 1 }}
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 120 }}>
                    卡片间距: {layoutSettings.cardSpacing}
                  </Typography>
                  <Slider
                    value={layoutSettings.cardSpacing}
                    min={0}
                    max={5}
                    step={1}
                    onChange={(e, val) => handleSettingChange('cardSpacing', val as number)}
                    sx={{ flex: 1 }}
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  页面元素
                </Typography>
                
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={layoutSettings.showHeader}
                          onChange={(e) => handleSettingChange('showHeader', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="显示页头"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={layoutSettings.showFooter}
                          onChange={(e) => handleSettingChange('showFooter', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="显示页脚"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={layoutSettings.showSearch}
                          onChange={(e) => handleSettingChange('showSearch', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="显示搜索"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={layoutSettings.showFilters}
                          onChange={(e) => handleSettingChange('showFilters', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="显示筛选"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={layoutSettings.showTags}
                          onChange={(e) => handleSettingChange('showTags', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="显示标签"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={layoutSettings.showDescription}
                          onChange={(e) => handleSettingChange('showDescription', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="显示描述"
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" gutterBottom>
                  卡片样式
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>卡片样式</InputLabel>
                  <Select
                    value={layoutSettings.cardStyle}
                    label="卡片样式"
                    onChange={(e) => handleSettingChange('cardStyle', e.target.value)}
                  >
                    {cardStyles.map((style) => (
                      <MenuItem key={style.value} value={style.value}>
                        {style.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={layoutSettings.compactCards}
                      onChange={(e) => handleSettingChange('compactCards', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="紧凑卡片"
                />
                
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  卡片元素
                </Typography>
                
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={layoutSettings.showIcons}
                          onChange={(e) => handleSettingChange('showIcons', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="显示图标"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={layoutSettings.showBadges}
                          onChange={(e) => handleSettingChange('showBadges', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="显示徽章"
                    />
                  </Grid>
                </Grid>
                
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  侧边栏设置
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={layoutSettings.showSidebar}
                      onChange={(e) => handleSettingChange('showSidebar', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="显示侧边栏"
                />
                
                <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
                  <InputLabel>侧边栏位置</InputLabel>
                  <Select
                    value={layoutSettings.sidebarPosition}
                    label="侧边栏位置"
                    onChange={(e) => handleSettingChange('sidebarPosition', e.target.value)}
                    disabled={!layoutSettings.showSidebar}
                  >
                    <MenuItem value="left">左侧</MenuItem>
                    <MenuItem value="right">右侧</MenuItem>
                    <MenuItem value="top">顶部</MenuItem>
                    <MenuItem value="bottom">底部</MenuItem>
                  </Select>
                </FormControl>
                
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    预览布局
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: layoutSettings.cardSpacing,
                    justifyContent: 'center'
                  }}>
                    {Array.from({ length: layoutSettings.gridSize }).map((_, idx) => (
                      <Box 
                        key={idx}
                        sx={{ 
                          width: 80, 
                          height: 60, 
                          bgcolor: 'primary.main', 
                          opacity: 0.7, 
                          borderRadius: 1 
                        }} 
                      />
                    ))}
                  </Box>
                  <Typography variant="caption" color="textSecondary" align="center" display="block" sx={{ mt: 1 }}>
                    当前每行显示 {layoutSettings.gridSize} 个卡片
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => setLayoutSettings(currentLayout)}
              >
                重置
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => onLayoutChange(layoutSettings)}
              >
                应用布局
              </Button>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default LayoutCustomizer;