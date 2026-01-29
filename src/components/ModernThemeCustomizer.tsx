import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  Typography,
  Slider,
  FormControlLabel,
  Switch,
  Button,
  IconButton,
  Paper,
  Grid,
  Tooltip,
  Fab,
  Popper,
  ClickAwayListener,
  Grow,
  MenuList,
  MenuItem,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Tune as SettingsIcon,
  Close as CloseIcon,
  Colorize as ColorizeIcon,
  WbSunny as LightModeIcon,
  NightsStay as DarkModeIcon,
  Gradient as GradientIcon,
} from '@mui/icons-material';
import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';

// 定义主题配置接口
interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  borderRadius: number;
  fontFamily: string;
  gradientEnabled: boolean;
  gradientAngle: number;
  backgroundType: 'solid' | 'gradient' | 'image';
  backgroundOpacity: number;
  cardShadow: number;
  sidebarWidth: number;
  headerHeight: number;
}

// 默认主题配置
const DEFAULT_THEME_CONFIG: ThemeConfig = {
  primaryColor: '#2D6CDF',
  secondaryColor: '#61DAFB',
  accentColor: '#FF6B6B',
  borderRadius: 12,
  fontFamily: 'Roboto, sans-serif',
  gradientEnabled: true,
  gradientAngle: 45,
  backgroundType: 'gradient',
  backgroundOpacity: 0.15,
  cardShadow: 4,
  sidebarWidth: 280,
  headerHeight: 70,
};

// 预设颜色主题
const PRESET_THEMES = [
  { name: '经典蓝', primary: '#2D6CDF', secondary: '#61DAFB' },
  { name: '热情红', primary: '#FF6B6B', secondary: '#FF8E8E' },
  { name: '清新绿', primary: '#4ECDC4', secondary: '#C0E0DE' },
  { name: '活力橙', primary: '#FF9F1C', secondary: '#FFBF69' },
  { name: '优雅紫', primary: '#A663CC', secondary: '#D6D1EA' },
  { name: '科技蓝', primary: '#0077BE', secondary: '#00A8CC' },
];

// 主题定制器组件
const ModernThemeCustomizer: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('themeConfig');
    return saved ? JSON.parse(saved) : DEFAULT_THEME_CONFIG;
  });

  // 保存配置到本地存储
  useEffect(() => {
    localStorage.setItem('themeConfig', JSON.stringify(config));
    
    // 应用主题配置到全局样式
    const styleElement = document.createElement('style');
    styleElement.id = 'dynamic-theme-styles';
    styleElement.innerHTML = `
      :root {
        --primary-color: ${config.primaryColor};
        --secondary-color: ${config.secondaryColor};
        --accent-color: ${config.accentColor};
        --border-radius: ${config.borderRadius}px;
        --card-shadow: 0 ${config.cardShadow}px ${config.cardShadow * 2}px rgba(0,0,0,0.1);
        --header-height: ${config.headerHeight}px;
        --sidebar-width: ${config.sidebarWidth}px;
      }
      
      body {
        font-family: ${config.fontFamily};
      }
      
      .MuiPaper-root, .MuiCard-root {
        border-radius: var(--border-radius) !important;
      }
    `;
    
    // 替换或添加样式
    const existingStyle = document.getElementById('dynamic-theme-styles');
    if (existingStyle) {
      document.head.removeChild(existingStyle);
    }
    document.head.appendChild(styleElement);
  }, [config]);

  const handleConfigChange = (field: keyof ThemeConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyPresetTheme = (preset: typeof PRESET_THEMES[0]) => {
    setConfig(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary
    }));
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <>
      {/* 主题定制器触发按钮 */}
      <Fab
        color="primary"
        aria-label="主题定制"
        onClick={toggleDrawer}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1300,
          backgroundColor: 'primary.main',
          color: 'white',
          boxShadow: 4,
          '&:hover': {
            backgroundColor: 'primary.dark',
            transform: 'scale(1.05)',
          },
        }}
      >
        <PaletteIcon />
      </Fab>

      {/* 主题定制器抽屉 */}
      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            width: 400,
            p: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2">
            主题定制器
          </Typography>
          <IconButton onClick={toggleDrawer}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 100px)', pr: 1 }}>
          {/* 预设主题 */}
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 'bold' }}>
            预设主题
          </Typography>
          <Grid container spacing={1} sx={{ mb: 3 }}>
            {PRESET_THEMES.map((preset, index) => (
              <Grid size={{ xs: 6, sm: 4 }} key={index}>
                <Tooltip title={preset.name}>
                  <Card
                    onClick={() => applyPresetTheme(preset)}
                    sx={{
                      cursor: 'pointer',
                      border: config.primaryColor === preset.primary ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 1, textAlign: 'center' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            backgroundColor: preset.primary,
                            borderRadius: '50%',
                            mr: 0.5,
                          }}
                        />
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            backgroundColor: preset.secondary,
                            borderRadius: '50%',
                          }}
                        />
                      </Box>
                      <Typography variant="caption">{preset.name}</Typography>
                    </CardContent>
                  </Card>
                </Tooltip>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* 主色调设置 */}
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 'bold' }}>
            主题颜色
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>主要颜色</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                style={{
                  width: '50px',
                  height: '30px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {config.primaryColor.toUpperCase()}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>次要颜色</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="color"
                value={config.secondaryColor}
                onChange={(e) => handleConfigChange('secondaryColor', e.target.value)}
                style={{
                  width: '50px',
                  height: '30px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {config.secondaryColor.toUpperCase()}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>强调颜色</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="color"
                value={config.accentColor}
                onChange={(e) => handleConfigChange('accentColor', e.target.value)}
                style={{
                  width: '50px',
                  height: '30px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {config.accentColor.toUpperCase()}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* 圆角设置 */}
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 'bold' }}>
            形状与圆角
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              圆角大小: {config.borderRadius}px
            </Typography>
            <Slider
              value={config.borderRadius}
              onChange={(_, value) => handleConfigChange('borderRadius', value)}
              min={0}
              max={30}
              step={1}
              valueLabelDisplay="auto"
            />
          </Box>

          {/* 阴影设置 */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              卡片阴影: {config.cardShadow}
            </Typography>
            <Slider
              value={config.cardShadow}
              onChange={(_, value) => handleConfigChange('cardShadow', value)}
              min={0}
              max={24}
              step={1}
              valueLabelDisplay="auto"
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* 渐变设置 */}
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 'bold' }}>
            渐变效果
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.gradientEnabled}
                  onChange={(e) => handleConfigChange('gradientEnabled', e.target.checked)}
                />
              }
              label="启用渐变效果"
            />
          </Box>

          {config.gradientEnabled && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                渐变角度: {config.gradientAngle}°
              </Typography>
              <Slider
                value={config.gradientAngle}
                onChange={(_, value) => handleConfigChange('gradientAngle', value)}
                min={0}
                max={360}
                step={15}
                valueLabelDisplay="auto"
              />
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* 字体设置 */}
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 'bold' }}>
            字体设置
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>字体系列</Typography>
            <select
              value={config.fontFamily}
              onChange={(e) => handleConfigChange('fontFamily', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            >
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="'Inter', sans-serif">Inter</option>
              <option value="'Open Sans', sans-serif">Open Sans</option>
              <option value="'Montserrat', sans-serif">Montserrat</option>
              <option value="'Poppins', sans-serif">Poppins</option>
              <option value="'Nunito', sans-serif">Nunito</option>
            </select>
          </Box>

          {/* 重置按钮 */}
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setConfig(DEFAULT_THEME_CONFIG)}
            sx={{ mt: 2 }}
          >
            恢复默认设置
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default ModernThemeCustomizer;