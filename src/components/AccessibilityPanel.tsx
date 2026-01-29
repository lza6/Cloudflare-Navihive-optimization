import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Slider,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Accessibility as AccessibilityIcon,
  ExpandMore as ExpandIcon,
  Visibility as VisibilityIcon,
  Contrast as ContrastIcon,
  TextFields as FontIcon,
} from '@mui/icons-material';
import { useAccessibility, AccessibleButton } from './AccessibilityUtils';

const AccessibilityPanel: React.FC = () => {
  const {
    fontSize,
    contrast,
    screenReaderMode,
    setFontSize,
    setContrast,
    setScreenReaderMode,
    toggleFontSize,
    toggleContrast,
  } = useAccessibility();

  const [expanded, setExpanded] = useState(false);

  const fontSizeLabels = {
    normal: '正常',
    large: '大号',
    'extra-large': '超大号',
  };

  const contrastLabels = {
    normal: '标准对比度',
    high: '高对比度',
  };

  const handleFontChange = (e: Event, value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    if (val === undefined) return;
    const sizes: Array<'normal' | 'large' | 'extra-large'> = ['normal', 'large', 'extra-large'];
    const selectedSize = sizes[val];
    if (selectedSize) {
      setFontSize(selectedSize);
    }
  };

  const handleContrastChange = (e: Event, value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    if (val === undefined) return;
    const contrasts: Array<'normal' | 'high'> = ['normal', 'high'];
    const selectedContrast = contrasts[val];
    if (selectedContrast) {
      setContrast(selectedContrast);
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        mb: 3,
        borderRadius: 2,
        overflow: 'visible',
      }}
    >
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
            <AccessibilityIcon color="primary" />
            <Typography variant="h6">无障碍访问设置</Typography>
            <Chip
              icon={<FontIcon />}
              label={fontSizeLabels[fontSize]}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ ml: 1 }}
            />
            <Chip
              icon={<ContrastIcon />}
              label={contrastLabels[contrast]}
              size="small"
              color="secondary"
              variant="outlined"
            />
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              字体大小
            </Typography>
            <Slider
              value={['normal', 'large', 'extra-large'].indexOf(fontSize)}
              min={0}
              max={2}
              step={1}
              marks={[
                { value: 0, label: '正常' },
                { value: 1, label: '大号' },
                { value: 2, label: '超大号' },
              ]}
              valueLabelDisplay="auto"
              onChange={handleFontChange}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Button
                variant={fontSize === 'normal' ? 'contained' : 'outlined'}
                onClick={() => setFontSize('normal')}
              >
                正常
              </Button>
              <Button
                variant={fontSize === 'large' ? 'contained' : 'outlined'}
                onClick={() => setFontSize('large')}
              >
                大号
              </Button>
              <Button
                variant={fontSize === 'extra-large' ? 'contained' : 'outlined'}
                onClick={() => setFontSize('extra-large')}
              >
                超大号
              </Button>
              <Button
                variant="outlined"
                onClick={toggleFontSize}
              >
                循环切换
              </Button>
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              对比度
            </Typography>
            <Slider
              value={['normal', 'high'].indexOf(contrast)}
              min={0}
              max={1}
              step={1}
              marks={[
                { value: 0, label: '标准' },
                { value: 1, label: '高对比' },
              ]}
              valueLabelDisplay="auto"
              onChange={handleContrastChange}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Button
                variant={contrast === 'normal' ? 'contained' : 'outlined'}
                onClick={() => setContrast('normal')}
              >
                标准对比度
              </Button>
              <Button
                variant={contrast === 'high' ? 'contained' : 'outlined'}
                onClick={() => setContrast('high')}
              >
                高对比度
              </Button>
              <Button
                variant="outlined"
                onClick={toggleContrast}
              >
                切换对比度
              </Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={screenReaderMode}
                    onChange={(e) => setScreenReaderMode(e.target.checked)}
                    color="primary"
                  />
                }
                label="屏幕阅读器模式"
              />

              <AccessibleButton
                onClick={() => setScreenReaderMode(!screenReaderMode)}
                ariaLabel={screenReaderMode ? "关闭屏幕阅读器模式" : "开启屏幕阅读器模式"}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VisibilityIcon />
                  <span>{screenReaderMode ? '屏幕阅读器已启用' : '屏幕阅读器已禁用'}</span>
                </Box>
              </AccessibleButton>
            </Box>

            <Typography variant="body2" color="textSecondary">
              启用无障碍功能可改善视觉障碍用户的体验，包括更大的字体、更高的对比度等。
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default AccessibilityPanel;