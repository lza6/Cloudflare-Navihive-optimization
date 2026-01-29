import React, { useState, useEffect } from 'react';
import {
  Box,
  Alert,
  AlertTitle,
  Fab,
  Tooltip,
  Typography,
  LinearProgress,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  OfflineBolt as OfflineIcon,
  CloudOff as CloudOffIcon,
  Cached as SyncIcon,
  Close as CloseIcon,
  SignalWifiStatusbarConnectedNoInternet4 as OfflineWifiIcon,
} from '@mui/icons-material';

interface OfflineIndicatorProps {
  onOnline: () => void;
  onOffline: () => void;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ onOnline, onOffline }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // 检测网络状态
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(false);
      onOnline();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
      onOffline();
    };

    // 初始化网络状态
    setIsOnline(navigator.onLine);
    if (!navigator.onLine) {
      setShowIndicator(true);
      onOffline();
    }

    // 添加事件监听器
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 清理事件监听器
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onOnline, onOffline]);

  const handleSync = async () => {
    setSyncing(true);
    
    // 模拟同步过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSyncing(false);
  };

  if (isOnline) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        width: 'auto',
        maxWidth: '90%',
      }}
    >
      <Alert
        severity="warning"
        variant="filled"
        iconMapping={{
          warning: <OfflineWifiIcon fontSize="inherit" />,
        }}
        sx={{
          backgroundColor: 'warning.main',
          color: 'warning.contrastText',
          borderRadius: 2,
          boxShadow: 3,
          minWidth: 300,
        }}
      >
        <AlertTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CloudOffIcon />
            <span>离线模式</span>
          </Box>
        </AlertTitle>
        <Typography variant="body2">
          您当前处于离线状态，部分功能可能受限。已缓存的内容仍可正常使用。
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
            离线状态下，您可以浏览已缓存的页面和数据
          </Typography>
        </Box>
      </Alert>
    </Box>
  );
};

export default OfflineIndicator;