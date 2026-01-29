import React, { useState, useRef, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';

interface LazyImageProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  fallback?: React.ReactNode;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number; // Intersection Observer 的阈值
  rootMargin?: string; // Intersection Observer 的根边距
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt = '',
  className,
  style,
  width = '100%',
  height = '100%',
  fallback,
  placeholder,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // 创建 Intersection Observer
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin,
      threshold,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // 停止观察当前元素
          observerRef.current?.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
    };
  }, [rootMargin, threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    onError?.();
  };

  return (
    <Box
      ref={imgRef}
      className={className}
      style={style}
      sx={{
        position: 'relative',
        width: width,
        height: height,
        overflow: 'hidden',
      }}
    >
      {/* 占位符 */}
      {!isInView && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {placeholder || <Skeleton variant="rectangular" width="100%" height="100%" />}
        </Box>
      )}

      {/* 图片元素 */}
      {isInView && (
        <Box
          component="img"
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          sx={{
            width: width,
            height: height,
            objectFit: 'cover',
            display: isLoaded ? 'block' : 'none',
          }}
        />
      )}

      {/* 加载完成前的骨架屏 */}
      {isInView && !isLoaded && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </Box>
      )}

      {/* 错误回退 */}
      {isInView && (
        <Box
          component="img"
          src={src}
          alt={alt}
          onError={(e) => {
            if (fallback) {
              e.currentTarget.style.display = 'none';
            }
            handleError();
          }}
          sx={{
            width: width,
            height: height,
            objectFit: 'cover',
            display: isLoaded ? 'block' : 'none',
          }}
        />
      )}

      {/* 错误回退内容 */}
      {fallback && (
        <Box
          sx={{
            display: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {fallback}
        </Box>
      )}
    </Box>
  );
};

export default LazyImage;