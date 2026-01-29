import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeOptions, createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setCustomTheme: (themeOptions: Partial<ThemeOptions>) => void;
  resetTheme: () => void;
  mode: PaletteMode;
  setMode: (mode: PaletteMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const savedTheme = localStorage.getItem('theme-mode');
    if (savedTheme) {
      return savedTheme as PaletteMode;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  const [customThemeOptions, setCustomThemeOptions] = useState<Partial<ThemeOptions>>(() => {
    const savedCustomTheme = localStorage.getItem('custom-theme');
    return savedCustomTheme ? JSON.parse(savedCustomTheme) : {};
  });

  const theme = React.useMemo(() => {
    // 创建基础主题
    let baseThemeOptions: ThemeOptions = {
      palette: {
        mode,
        ...(mode === 'light'
          ? {
              // 浅色主题
              background: {
                default: '#fafafa',
                paper: '#ffffff',
              },
            }
          : {
              // 深色主题
              background: {
                default: '#121212',
                paper: '#1d1d1d',
              },
            }),
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      shape: {
        borderRadius: 8,
      },
    };

    // 合并自定义主题选项
    const mergedThemeOptions = {
      ...baseThemeOptions,
      ...customThemeOptions,
      palette: {
        ...baseThemeOptions.palette,
        ...customThemeOptions.palette,
      },
    };

    return createTheme(mergedThemeOptions);
  }, [mode, customThemeOptions]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const setCustomTheme = (themeOptions: Partial<ThemeOptions>) => {
    setCustomThemeOptions(prev => ({ ...prev, ...themeOptions }));
  };

  const resetTheme = () => {
    setCustomThemeOptions({});
    localStorage.removeItem('custom-theme');
  };

  // 保存主题模式到本地存储
  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  // 保存自定义主题到本地存储
  useEffect(() => {
    if (Object.keys(customThemeOptions).length > 0) {
      localStorage.setItem('custom-theme', JSON.stringify(customThemeOptions));
    } else {
      localStorage.removeItem('custom-theme');
    }
  }, [customThemeOptions]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setCustomTheme,
        resetTheme,
        mode,
        setMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};