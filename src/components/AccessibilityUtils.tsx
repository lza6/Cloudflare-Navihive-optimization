import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  fontSize: 'normal' | 'large' | 'extra-large';
  contrast: 'normal' | 'high';
  screenReaderMode: boolean;
  setFontSize: (size: 'normal' | 'large' | 'extra-large') => void;
  setContrast: (contrast: 'normal' | 'high') => void;
  setScreenReaderMode: (enabled: boolean) => void;
  toggleFontSize: () => void;
  toggleContrast: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal');
  const [contrast, setContrast] = useState<'normal' | 'high'>('normal');
  const [screenReaderMode, setScreenReaderMode] = useState(false);

  // 从本地存储恢复设置
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility-font-size') as 'normal' | 'large' | 'extra-large' | null;
    const savedContrast = localStorage.getItem('accessibility-contrast') as 'normal' | 'high' | null;
    const savedScreenReader = localStorage.getItem('accessibility-screen-reader') === 'true';

    if (savedFontSize) setFontSize(savedFontSize);
    if (savedContrast) setContrast(savedContrast);
    setScreenReaderMode(savedScreenReader);
  }, []);

  // 保存设置到本地存储
  useEffect(() => {
    localStorage.setItem('accessibility-font-size', fontSize);
    localStorage.setItem('accessibility-contrast', contrast);
    localStorage.setItem('accessibility-screen-reader', screenReaderMode.toString());
  }, [fontSize, contrast, screenReaderMode]);

  const toggleFontSize = () => {
    setFontSize(prev => {
      if (prev === 'normal') return 'large';
      if (prev === 'large') return 'extra-large';
      return 'normal';
    });
  };

  const toggleContrast = () => {
    setContrast(prev => prev === 'normal' ? 'high' : 'normal');
  };

  const value = {
    fontSize,
    contrast,
    screenReaderMode,
    setFontSize,
    setContrast,
    setScreenReaderMode,
    toggleFontSize,
    toggleContrast,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      <div
        className={`accessibility-container font-size-${fontSize} contrast-${contrast}`}
        style={{
          fontSize: fontSize === 'large' ? '1.2rem' : fontSize === 'extra-large' ? '1.5rem' : undefined,
        }}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// 无障碍按钮组件
interface AccessibleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  tabIndex?: number;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  onClick,
  onKeyDown,
  tabIndex = 0,
  ariaLabel,
  className = '',
  style,
}) => {
  const handleClick = () => {
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
    onKeyDown?.(e);
  };

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      className={`accessible-button ${className}`}
      style={{
        cursor: 'pointer',
        outline: 'none',
        ...style,
      }}
    >
      {children}
    </button>
  );
};

// 无障碍链接组件
interface AccessibleLinkProps {
  href: string;
  children: React.ReactNode;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
  ariaLabel?: string;
  className?: string;
}

export const AccessibleLink: React.FC<AccessibleLinkProps> = ({
  href,
  children,
  target = '_self',
  rel,
  ariaLabel,
  className = '',
}) => {
  const fullRel = rel || (target === '_blank' ? 'noopener noreferrer' : undefined);

  return (
    <a
      href={href}
      target={target}
      rel={fullRel}
      aria-label={ariaLabel}
      className={`accessible-link ${className}`}
      style={{
        textDecoration: 'none',
      }}
    >
      {children}
    </a>
  );
};