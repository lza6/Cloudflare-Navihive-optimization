/**
 * 站点预览组件
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button,
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import { Close as CloseIcon, OpenInNew as OpenIcon } from '@mui/icons-material';

interface SitePreviewProps {
  open: boolean;
  url: string;
  title: string;
  description?: string;
  onClose: () => void;
  onOpenExternal?: () => void;
}

const SitePreview: React.FC<SitePreviewProps> = ({
  open,
  url,
  title,
  description,
  onClose,
  onOpenExternal,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0); // 用于强制重新加载iframe

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
      // 每次打开时都重新生成iframe key，确保重新加载
      setIframeKey(prev => prev + 1);
    }
  }, [open]);

  const handleLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleError = () => {
    setLoading(false);
    setError('无法加载预览内容');
  };

  // 尝试获取安全的预览URL
  const getSafePreviewUrl = (): string => {
    try {
      const parsedUrl = new URL(url);
      // 某些站点可能不允许iframe嵌套，这里可以添加白名单或处理逻辑
      return parsedUrl.href;
    } catch {
      return url;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          height: '80vh',
          maxHeight: '80vh',
          width: { xs: '95vw', sm: '85vw', md: '70vw' }
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" noWrap>
            {title}
          </Typography>
          {description && (
            <Tooltip title={description}>
              <Chip label="描述" size="small" variant="outlined" />
            </Tooltip>
          )}
        </Box>
        <Box>
          <Tooltip title="在新窗口打开">
            <IconButton
              onClick={() => {
                onOpenExternal?.();
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
              size="small"
            >
              <OpenIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, height: '100%' }}>
        {loading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              width: '100%',
            }}
          >
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>正在加载预览...</Typography>
          </Box>
        )}
        {error && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              width: '100%',
              flexDirection: 'column',
            }}
          >
            <Typography color="error">{error}</Typography>
            <Button
              variant="contained"
              onClick={() => {
                setLoading(true);
                setError(null);
                setIframeKey(prev => prev + 1);
              }}
              sx={{ mt: 2 }}
            >
              重试
            </Button>
          </Box>
        )}
        {!loading && !error && (
          <iframe
            key={iframeKey} // 强制重新加载
            src={getSafePreviewUrl()}
            title={`${title} 预览`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: loading ? 'none' : 'block',
            }}
            onLoad={handleLoad}
            onError={handleError}
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>关闭</Button>
        <Button
          variant="contained"
          onClick={() => {
            onOpenExternal?.();
            window.open(url, '_blank', 'noopener,noreferrer');
          }}
          startIcon={<OpenIcon />}
        >
          在新窗口打开
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SitePreview;