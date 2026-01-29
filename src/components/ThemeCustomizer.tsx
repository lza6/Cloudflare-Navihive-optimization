import React, { useState, useEffect, useCallback } from 'react';
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
  Button,
  IconButton,
  Popover,
  Grid,
  useTheme,
} from '@mui/material';
import {
  Palette as PaletteIcon,
  ColorLens as ColorLensIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import { ThemeOptions, createTheme, ThemeProvider } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

interface ThemeCustomizerProps {
  onThemeChange?: (theme: ThemeOptions) => void;
  defaultTheme?: ThemeOptions;
}

interface CustomThemeOptions {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  borderRadius: number;
  fontFamily: string;
  darkMode: boolean;
  contrast: number;
  saturation: number;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ 
  onThemeChange, 
  defaultTheme = {} 
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [customTheme, setCustomTheme] = useState<CustomThemeOptions>({
    primaryColor: theme.palette.primary?.main || '#1976d2',
    secondaryColor: theme.palette.secondary?.main || '#dc004e',
    accentColor: theme.palette.info?.main || '#0288d1',
    backgroundColor: theme.palette.background?.default || '#fafafa',
    surfaceColor: theme.palette.background?.paper || '#ffffff',
    borderRadius: 8,
    fontFamily: 'Roboto, sans-serif',
    darkMode: theme.palette.mode === 'dark',
    contrast: 100,
    saturation: 100,
  });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'theme-customizer-popover' : undefined;

  const handleChange = (field: keyof CustomThemeOptions, value: any) => {
    const newTheme = { ...customTheme, [field]: value };
    setCustomTheme(newTheme);
    
    if (onThemeChange) {
      onThemeChange(buildTheme(newTheme));
    }
  };

  const buildTheme = (options: CustomThemeOptions): ThemeOptions => {
    // 根据饱和度和对比度调整颜色
    const adjustColor = (color: string, sat: number, cont: number) => {
      // 简单的颜色调整逻辑，实际项目中可以使用更复杂的颜色处理库
      return color;
    };

    return {
      palette: {
        mode: options.darkMode ? 'dark' : 'light',
        primary: {
          main: adjustColor(options.primaryColor, options.saturation, options.contrast),
          light: alpha(options.primaryColor, 0.7),
          dark: alpha(options.primaryColor, 0.9),
          contrastText: '#fff',
        },
        secondary: {
          main: adjustColor(options.secondaryColor, options.saturation, options.contrast),
          light: alpha(options.secondaryColor, 0.7),
          dark: alpha(options.secondaryColor, 0.9),
          contrastText: '#fff',
        },
        info: {
          main: adjustColor(options.accentColor, options.saturation, options.contrast),
        },
        background: {
          default: adjustColor(options.backgroundColor, options.saturation, options.contrast),
          paper: adjustColor(options.surfaceColor, options.saturation, options.contrast),
        },
      },
      typography: {
        fontFamily: options.fontFamily,
      },
      shape: {
        borderRadius: options.borderRadius,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: options.borderRadius,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: options.borderRadius,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none', // Remove default MUI background image
            },
          },
        },
      },
    };
  };

  const handleReset = () => {
    setCustomTheme({
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
      accentColor: '#0288d1',
      backgroundColor: '#fafafa',
      surfaceColor: '#ffffff',
      borderRadius: 8,
      fontFamily: 'Roboto, sans-serif',
      darkMode: false,
      contrast: 100,
      saturation: 100,
    });
    
    if (onThemeChange) {
      onThemeChange(buildTheme({
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
        accentColor: '#0288d1',
        backgroundColor: '#fafafa',
        surfaceColor: '#ffffff',
        borderRadius: 8,
        fontFamily: 'Roboto, sans-serif',
        darkMode: false,
        contrast: 100,
        saturation: 100,
      }));
    }
  };

  return (
    <>
      <IconButton 
        onClick={handleClick}
        color="inherit"
        aria-label="自定义主题"
        sx={{ 
          bgcolor: 'action.selected',
          '&:hover': { bgcolor: 'action.hover' }
        }}
      >
        <PaletteIcon />
      </IconButton>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxWidth: '90vw',
            p: 2,
            mt: 1,
          }
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          个性化主题定制
        </Typography>
        
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom>
              主色调
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="color"
                value={customTheme.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                style={{ width: 50, height: 30, border: 'none', borderRadius: 4 }}
              />
              <Typography variant="body2">{customTheme.primaryColor}</Typography>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom>
              辅助色
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="color"
                value={customTheme.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                style={{ width: 50, height: 30, border: 'none', borderRadius: 4 }}
              />
              <Typography variant="body2">{customTheme.secondaryColor}</Typography>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom>
              强调色
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="color"
                value={customTheme.accentColor}
                onChange={(e) => handleChange('accentColor', e.target.value)}
                style={{ width: 50, height: 30, border: 'none', borderRadius: 4 }}
              />
              <Typography variant="body2">{customTheme.accentColor}</Typography>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom>
              背景色
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="color"
                value={customTheme.backgroundColor}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                style={{ width: 50, height: 30, border: 'none', borderRadius: 4 }}
              />
              <Typography variant="body2">{customTheme.backgroundColor}</Typography>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom>
              表面色
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="color"
                value={customTheme.surfaceColor}
                onChange={(e) => handleChange('surfaceColor', e.target.value)}
                style={{ width: 50, height: 30, border: 'none', borderRadius: 4 }}
              />
              <Typography variant="body2">{customTheme.surfaceColor}</Typography>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom>
              圆角大小: {customTheme.borderRadius}px
            </Typography>
            <Slider
              value={customTheme.borderRadius}
              onChange={(e, value) => handleChange('borderRadius', value as number)}
              min={0}
              max={24}
              step={1}
              valueLabelDisplay="auto"
            />
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom>
              字体
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>字体选择</InputLabel>
              <Select
                value={customTheme.fontFamily}
                label="字体选择"
                onChange={(e) => handleChange('fontFamily', e.target.value)}
              >
                <MenuItem value="'Roboto', sans-serif">Roboto</MenuItem>
                <MenuItem value="'Inter', sans-serif">Inter</MenuItem>
                <MenuItem value="'Open Sans', sans-serif">Open Sans</MenuItem>
                <MenuItem value="'Montserrat', sans-serif">Montserrat</MenuItem>
                <MenuItem value="'Source Sans Pro', sans-serif">Source Sans Pro</MenuItem>
                <MenuItem value="Arial, sans-serif">Arial</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={customTheme.darkMode}
                  onChange={(e) => handleChange('darkMode', e.target.checked)}
                  color="primary"
                />
              }
              label="深色模式"
            />
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom>
              饱和度: {customTheme.saturation}%
            </Typography>
            <Slider
              value={customTheme.saturation}
              onChange={(e, value) => handleChange('saturation', value as number)}
              min={50}
              max={150}
              step={5}
              valueLabelDisplay="auto"
            />
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom>
              对比度: {customTheme.contrast}%
            </Typography>
            <Slider
              value={customTheme.contrast}
              onChange={(e, value) => handleChange('contrast', value as number)}
              min={70}
              max={130}
              step={5}
              valueLabelDisplay="auto"
            />
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                onClick={handleReset}
                fullWidth
              >
                重置
              </Button>
              <Button 
                variant="contained" 
                onClick={handleClose}
                fullWidth
              >
                应用
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Popover>
    </>
  );
};

export default ThemeCustomizer;