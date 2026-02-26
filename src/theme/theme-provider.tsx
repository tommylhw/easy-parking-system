import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

import { ThemeMode, themes } from '@/src/theme/tokens';

const THEME_MODE_KEY = 'easyparking:theme-mode';

type ThemeContextValue = {
  mode: ThemeMode;
  resolvedScheme: 'light' | 'dark';
  isDark: boolean;
  palette: (typeof themes)['light']['palette'];
  setMode: (mode: ThemeMode) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function normalizeScheme(colorScheme: ColorSchemeName): 'light' | 'dark' {
  return colorScheme === 'dark' ? 'dark' : 'light';
}

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(
    normalizeScheme(Appearance.getColorScheme())
  );

  useEffect(() => {
    void (async () => {
      const storedMode = await AsyncStorage.getItem(THEME_MODE_KEY);
      if (storedMode === 'light' || storedMode === 'dark' || storedMode === 'system') {
        setModeState(storedMode);
      }
    })();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(normalizeScheme(colorScheme));
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const resolvedScheme = mode === 'system' ? systemScheme : mode;

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolvedScheme,
      isDark: resolvedScheme === 'dark',
      palette: themes[resolvedScheme].palette,
      setMode: async (nextMode: ThemeMode) => {
        setModeState(nextMode);
        await AsyncStorage.setItem(THEME_MODE_KEY, nextMode);
      },
    }),
    [mode, resolvedScheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <NavigationThemeProvider value={themes[resolvedScheme].navigationTheme}>
        {children}
      </NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used inside AppThemeProvider');
  }

  return ctx;
}
