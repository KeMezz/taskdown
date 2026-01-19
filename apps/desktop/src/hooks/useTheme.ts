/**
 * 테마 관리 훅
 * 시스템 다크 모드 감지 및 테마 적용
 */

import { useEffect } from 'react';
import { useAppStore, ThemeMode } from '../stores';

export function useTheme() {
  const { theme, setTheme } = useAppStore();

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    // 시스템 다크 모드 감지
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      switch (theme) {
        case 'dark':
          applyTheme(true);
          break;
        case 'light':
          applyTheme(false);
          break;
        case 'system':
          applyTheme(mediaQuery.matches);
          break;
      }
    };

    // 초기 테마 적용
    updateTheme();

    // 시스템 테마 변경 감지
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme(mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return { theme, setTheme };
}

export type { ThemeMode };
