import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardActionArea, 
  Typography, 
  Box, 
  Fade, 
  Grow, 
  Zoom,
  IconButton,
  Chip,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

// 定义组件属性接口
interface ModernCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  image?: string;
  badge?: string;
  badgeColor?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  onClick?: () => void;
  onHover?: () => void;
  onMouseLeave?: () => void;
  disabled?: boolean;
  variant?: 'elevation' | 'outlined';
  elevation?: number;
  children?: React.ReactNode;
  className?: string;
  animation?: 'fade' | 'slide' | 'zoom' | 'bounce';
  animationDelay?: number;
  hoverEffect?: boolean;
  showShadowOnHover?: boolean;
  cornerRibbon?: string; // 角标文字
  cornerRibbonColor?: string; // 角标颜色
  footer?: React.ReactNode; // 卡片底部内容
  actions?: React.ReactNode; // 卡片操作区域
  compact?: boolean; // 紧凑模式
  glowEffect?: boolean; // 发光效果
  pulseEffect?: boolean; // 脉冲效果
}

// 自定义样式
const StyledCard = styled(Card)<{ 
  $showShadowOnHover?: boolean; 
  $glowEffect?: boolean; 
  $pulseEffect?: boolean;
}>(({ theme, $showShadowOnHover, $glowEffect, $pulseEffect }) => ({
  position: 'relative',
  overflow: 'visible',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  ...(!!$showShadowOnHover && {
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: theme.shadows[20],
    },
  }),
  ...(!!$glowEffect && {
    boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`,
    '&:hover': {
      boxShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.5)}`,
    },
  }),
  ...(!!$pulseEffect && {
    animation: 'pulse 2s infinite',
  }),
  '@keyframes pulse': {
    '0%': {
      boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.4)}`,
    },
    '70%': {
      boxShadow: `0 0 0 10px ${alpha(theme.palette.primary.main, 0)}`,
    },
    '100%': {
      boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}`,
    },
  },
}));

interface CornerRibbonProps {
  ribbonColor?: string;
}

const CornerRibbon = styled(Box)<CornerRibbonProps>(({ theme, ribbonColor }) => ({
  position: 'absolute',
  top: 8,
  right: -20,
  background: ribbonColor || theme.palette.primary.main,
  color: theme.palette.common.white,
  padding: '4px 16px',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  transform: 'rotate(45deg)',
  zIndex: 1,
  boxShadow: theme.shadows[3],
}));

const ModernCard: React.FC<ModernCardProps> = ({
  title,
  subtitle,
  description,
  icon,
  image,
  badge,
  badgeColor = 'primary',
  onClick,
  onHover,
  onMouseLeave,
  disabled = false,
  variant = 'elevation',
  elevation = 2,
  children,
  className,
  animation = 'fade',
  animationDelay = 0,
  hoverEffect = true,
  showShadowOnHover = true,
  cornerRibbon,
  cornerRibbonColor,
  footer,
  actions,
  compact = false,
  glowEffect = false,
  pulseEffect = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  // 检测元素是否进入视口
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsHovered(true);
    onHover?.();
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    setIsHovered(false);
    onMouseLeave?.();
  };

  // 动画配置
  const getAnimationProps = () => {
    const baseProps: any = {
      initial: { opacity: 0, y: 20 },
      animate: isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
      transition: { 
        duration: 0.5, 
        delay: animationDelay / 1000,
        ease: [0.4, 0, 0.2, 1] // 使用贝塞尔曲线而不是字符串
      }
    };

    switch (animation) {
      case 'slide':
        return {
          ...baseProps,
          initial: { opacity: 0, x: -20 },
          animate: isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 },
        };
      case 'zoom':
        return {
          ...baseProps,
          initial: { opacity: 0, scale: 0.8 },
          animate: isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 },
        };
      case 'bounce':
        return {
          ...baseProps,
          initial: { opacity: 0, y: 50, scale: 0.9 },
          animate: isVisible ? { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { 
              duration: 0.6, 
              delay: animationDelay / 1000,
              ease: [0.4, 0, 0.2, 1], // 使用贝塞尔曲线而不是字符串
              type: 'spring' as const,
              stiffness: 200
            }
          } : { opacity: 0, y: 50, scale: 0.9 },
        };
      default:
        return baseProps;
    }
  };

  const animationProps = getAnimationProps();

  // 根据compact模式调整padding
  const contentPadding = compact ? 1.5 : 2.5;

  return (
    <motion.div
      ref={cardRef}
      {...animationProps}
      style={{ width: '100%' }}
    >
      <StyledCard
        className={className}
        variant={variant}
        elevation={elevation}
        $showShadowOnHover={showShadowOnHover}
        $glowEffect={glowEffect}
        $pulseEffect={pulseEffect}
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          opacity: disabled ? 0.6 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
          ...(hoverEffect && onClick && {
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
            },
          }),
        }}
      >
        {cornerRibbon && (
          <CornerRibbon ribbonColor={cornerRibbonColor}>
            {cornerRibbon}
          </CornerRibbon>
        )}

        {image ? (
          <Box
            component="img"
            src={image}
            alt={title}
            sx={{
              width: '100%',
              maxHeight: 200,
              objectFit: 'cover',
              borderTopLeftRadius: 'inherit',
              borderTopRightRadius: 'inherit',
            }}
          />
        ) : null}

        <CardActionArea
          onClick={onClick}
          disabled={disabled}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sx={{
            height: '100%',
            '&.Mui-disabled': {
              cursor: 'default',
            },
          }}
        >
          <CardContent sx={{ p: contentPadding, height: '100%', pb: '16px !important' }}>
            <Box display="flex" alignItems="center" mb={1}>
              {icon && (
                <Box mr={1.5} flexShrink={0}>
                  {icon}
                </Box>
              )}
              <Box flex={1}>
                <Typography
                  variant={compact ? 'h6' : 'h5'}
                  component="h3"
                  fontWeight="medium"
                  noWrap
                  sx={{
                    fontSize: compact ? '1rem' : '1.25rem',
                  }}
                >
                  {title}
                </Typography>
                {subtitle && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontSize: compact ? '0.75rem' : '0.875rem',
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>
              {badge && (
                <Chip
                  label={badge}
                  size="small"
                  color={badgeColor}
                  sx={{ ml: 1 }}
                />
              )}
            </Box>

            {description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  fontSize: compact ? '0.8rem' : '0.875rem',
                }}
              >
                {description}
              </Typography>
            )}

            {children}

            {actions && (
              <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                {actions}
              </Box>
            )}
          </CardContent>

          {footer && (
            <Box
              sx={{
                px: contentPadding,
                pb: contentPadding,
                borderTop: '1px solid',
                borderColor: 'divider',
                background: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[800], 0.5) : alpha(theme.palette.grey[100], 0.5),
              }}
            >
              {footer}
            </Box>
          )}
        </CardActionArea>
      </StyledCard>
    </motion.div>
  );
};

export default ModernCard;