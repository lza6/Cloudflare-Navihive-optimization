import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Alert, 
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Link,
  useTheme,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { validatePasswordStrength, validateUsername, sanitizeUserInput } from '../utils/security';
import { motion } from 'framer-motion';

interface SecurityEnhancedLoginProps {
  onLogin: (username: string, password: string, rememberMe: boolean) => void;
  loading?: boolean;
  error?: string | null;
  onForgotPassword?: () => void;
  onRegister?: () => void;
}

const SecurityEnhancedLogin: React.FC<SecurityEnhancedLoginProps> = ({
  onLogin,
  loading = false,
  error,
  onForgotPassword,
  onRegister
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [securityScore, setSecurityScore] = useState(0);
  const [showSecurityTips, setShowSecurityTips] = useState(false);
  const theme = useTheme();

  // 验证用户名
  const validateUsernameInput = (value: string) => {
    const cleanedValue = sanitizeUserInput(value);
    if (!validateUsername(cleanedValue)) {
      setUsernameError('用户名必须是3-20位，只能包含字母、数字、下划线和连字符');
      return false;
    }
    setUsernameError(null);
    return true;
  };

  // 验证密码
  const validatePasswordInput = (value: string) => {
    const validation = validatePasswordStrength(value);
    if (!validation.isValid) {
      setPasswordError(validation.errors.join(', '));
      setSecurityScore(0);
      return false;
    }
    setPasswordError(null);
    setSecurityScore(calculateSecurityScore(value));
    return true;
  };

  // 计算密码安全评分
  const calculateSecurityScore = (password: string): number => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[a-z]/.test(password)) score += 15;
    if (/\d/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    return Math.min(score, 100);
  };

  // 处理用户名变化
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    validateUsernameInput(value);
  };

  // 处理密码变化
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validatePasswordInput(value);
  };

  // 登录处理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isUsernameValid = validateUsernameInput(username);
    const isPasswordValid = validatePasswordInput(password);
    
    if (isUsernameValid && isPasswordValid) {
      onLogin(username, password, rememberMe);
    }
  };

  // 密码强度指示器
  const PasswordStrengthIndicator = () => {
    const getColor = (score: number) => {
      if (score < 40) return theme.palette.error.main;
      if (score < 70) return theme.palette.warning.main;
      return theme.palette.success.main;
    };

    const getText = (score: number) => {
      if (score === 0) return '请输入密码';
      if (score < 40) return '弱';
      if (score < 70) return '中等';
      return '强';
    };

    return (
      <Box sx={{ mt: 1, mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          密码强度: {getText(securityScore)}
        </Typography>
        <Box sx={{ 
          height: 8, 
          borderRadius: 4, 
          bgcolor: alpha(getColor(securityScore), 0.2),
          overflow: 'hidden'
        }}>
          <Box 
            sx={{ 
              height: '100%', 
              width: `${securityScore}%`, 
              bgcolor: getColor(securityScore),
              transition: 'width 0.3s ease, background-color 0.3s ease'
            }} 
          />
        </Box>
      </Box>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper 
        elevation={12} 
        sx={{ 
          p: 4, 
          maxWidth: 450, 
          mx: 'auto', 
          borderRadius: 3,
          background: theme.palette.mode === 'dark' 
            ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.grey[800], 0.8)})`
            : `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.grey[100], 0.9)})`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            安全登录
          </Typography>
          <Typography variant="body2" color="text.secondary">
            请输入您的凭据以继续
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small"
                onClick={() => setShowSecurityTips(!showSecurityTips)}
              >
                安全提示
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {showSecurityTips && (
          <Alert 
            severity="info" 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setShowSecurityTips(false)}
          >
            <Typography variant="body2" gutterBottom>
              <strong>安全提示:</strong>
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>使用强密码（至少8位，包含大小写字母、数字和特殊字符）</li>
              <li>定期更换密码</li>
              <li>不要在公共设备上选择“记住我”</li>
              <li>确保使用HTTPS连接</li>
            </ul>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="用户名"
            variant="outlined"
            margin="normal"
            value={username}
            onChange={handleUsernameChange}
            error={!!usernameError}
            helperText={usernameError || "使用字母、数字、下划线和连字符"}
            autoComplete="username"
            InputProps={{
              sx: { borderRadius: 2 }
            }}
          />

          <TextField
            fullWidth
            label="密码"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            value={password}
            onChange={handlePasswordChange}
            error={!!passwordError}
            helperText={passwordError || "至少8位，包含大小写字母、数字和特殊字符"}
            autoComplete="current-password"
            InputProps={{
              sx: { borderRadius: 2 },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="切换密码可见性"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {password && <PasswordStrengthIndicator />}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="primary"
                />
              }
              label="记住我"
            />
            
            {onForgotPassword && (
              <Link 
                component="button" 
                variant="body2" 
                onClick={(e) => {
                  e.preventDefault();
                  onForgotPassword();
                }}
                sx={{ 
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                忘记密码?
              </Link>
            )}
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || !!usernameError || !!passwordError}
            sx={{ 
              py: 1.5, 
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 'medium',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              }
            }}
          >
            {loading ? '登录中...' : '登录'}
          </Button>

          {onRegister && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                还没有账户?{' '}
                <Link 
                  component="button" 
                  variant="body2" 
                  onClick={(e) => {
                    e.preventDefault();
                    onRegister();
                  }}
                  sx={{ 
                    textDecoration: 'none',
                    fontWeight: 'medium',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  立即注册
                </Link>
              </Typography>
            </Box>
          )}
        </form>
      </Paper>
    </motion.div>
  );
};

export default SecurityEnhancedLogin;