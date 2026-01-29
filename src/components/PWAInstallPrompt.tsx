import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Button,
  Box,
  Typography,
  IconButton,
  Slide,
  Fab,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Close as CloseIcon,
  GetApp as InstallIcon,
  OfflineBolt as OfflineIcon,
} from '@mui/icons-material';
import { checkPWAInstallationStatus, triggerPWAInstall } from '../service-worker-registration';

declare global {
  interface Window {
    deferredPrompt?: BeforeInstallPromptEvent;
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt: React.FC = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const theme = useTheme();

  useEffect(() => {
    // 检测是否为iOS设备
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);
    
    // 检查是否已经安装
    const checkInstallStatus = () => {
      const installed = checkPWAInstallationStatus();
      setIsStandalone(installed);
    };
    
    checkInstallStatus();
    
    // 监听beforeinstallprompt事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installPromptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(installPromptEvent);
      setShowInstallPrompt(true);
    };
    
    // 监听appinstalled事件
    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      checkInstallStatus(); // 重新检查安装状态
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // 检查是否已经有安装提示
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        // Service worker已准备就绪
      });
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      
      // 等待用户响应
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('用户接受了安装');
      } else {
        console.log('用户拒绝了安装');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleClose = () => {
    setShowInstallPrompt(false);
  };

  // 对于iOS设备，显示安装说明
  if (isIOS && !isStandalone) {
    return (
      <Snackbar
        open={true}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ 
          bottom: { xs: 80, sm: 20 },
          '.MuiSnackbarContent-root': {
            background: 'linear-gradient(45deg, #2D6CDF, #61DAFB)',
            color: 'white',
          }
        }}
      >
        <Alert
          severity="info"
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={() => setShowInstallPrompt(false)}
            >
              <CloseIcon />
            </IconButton>
          }
          sx={{ width: '100%', background: 'transparent', color: 'inherit' }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            <strong>💡 如何在iOS上安装：</strong>
          </Typography>
          <Typography variant="body2">
            点击屏幕底部的 <strong>分享</strong> 按钮 → 选择 <strong>"添加到主屏幕"</strong>
          </Typography>
        </Alert>
      </Snackbar>
    );
  }

  // 如果已安装或不需要显示提示，则不显示任何内容
  if (isStandalone || !showInstallPrompt) {
    return null;
  }

  return (
    <Slide direction="up" in={showInstallPrompt}>
      <Snackbar
        open={showInstallPrompt}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ 
          bottom: { xs: 80, sm: 20 },
          '.MuiSnackbarContent-root': {
            background: 'linear-gradient(45deg, #2D6CDF, #61DAFB)',
            color: 'white',
          }
        }}
      >
        <Alert
          icon={<DownloadIcon />}
          severity="success"
          action={
            <>
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleInstallClick}
                startIcon={<InstallIcon />}
                sx={{ fontWeight: 'bold' }}
              >
                安装
              </Button>
              <IconButton
                color="inherit"
                size="small"
                onClick={handleClose}
              >
                <CloseIcon />
              </IconButton>
            </>
          }
          sx={{ 
            width: '100%', 
            background: 'transparent', 
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              安装导航站应用
            </Typography>
            <Typography variant="body2">
              享受更快的加载速度和离线功能
            </Typography>
          </Box>
        </Alert>
      </Snackbar>
    </Slide>
  );
};

// 增强版PWA安装提示 - 作为浮动按钮
export const PWAInstallFloatingButton: React.FC = () => {
  const [showButton, setShowButton] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const checkInstallStatus = () => {
      const installed = checkPWAInstallationStatus();
      setIsStandalone(installed);
    };
    
    checkInstallStatus();
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installPromptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(installPromptEvent);
      setShowButton(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('用户接受了安装');
      }
      setDeferredPrompt(null);
      setShowButton(false);
    }
  };

  if (isStandalone || !showButton) {
    return null;
  }

  return (
    <Tooltip title="安装应用到桌面">
      <Fab
        color="primary"
        aria-label="安装应用"
        onClick={handleInstallClick}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1200,
          backgroundColor: 'primary.main',
          color: 'white',
          boxShadow: 4,
          '&:hover': {
            backgroundColor: 'primary.dark',
            transform: 'scale(1.05)',
          },
        }}
      >
        <DownloadIcon />
      </Fab>
    </Tooltip>
  );
};

export default PWAInstallPrompt;