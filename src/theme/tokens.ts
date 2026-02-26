import type { Theme } from '@react-navigation/native';

export type ThemeMode = 'system' | 'light' | 'dark';

export type AppPalette = {
  background: string;
  card: string;
  cardSecondary: string;
  text: string;
  subtext: string;
  border: string;
  primary: string;
  secondary: string;
  success: string;
  danger: string;
  mapCarpark: string;
  mapMetered: string;
  mapStation: string;
  shadow: string;
};

export type AppTheme = {
  isDark: boolean;
  palette: AppPalette;
  navigationTheme: Theme;
};

const lightPalette: AppPalette = {
  background: '#F2F2F7',
  card: 'rgba(255, 255, 255, 0.86)',
  cardSecondary: '#FFFFFF',
  text: '#111111',
  subtext: '#5A5A63',
  border: 'rgba(120, 120, 128, 0.22)',
  primary: '#007AFF',
  secondary: '#FF9500',
  success: '#34C759',
  danger: '#FF3B30',
  mapCarpark: '#007AFF',
  mapMetered: '#FF9500',
  mapStation: '#34C759',
  shadow: 'rgba(28, 28, 30, 0.16)',
};

const darkPalette: AppPalette = {
  background: '#1C1C1E',
  card: 'rgba(44, 44, 46, 0.86)',
  cardSecondary: '#2C2C2E',
  text: '#F2F2F7',
  subtext: '#AEAEB2',
  border: 'rgba(84, 84, 88, 0.52)',
  primary: '#0A84FF',
  secondary: '#FF9F0A',
  success: '#30D158',
  danger: '#FF453A',
  mapCarpark: '#0A84FF',
  mapMetered: '#FF9F0A',
  mapStation: '#30D158',
  shadow: 'rgba(0, 0, 0, 0.4)',
};

const navLight: Theme = {
  dark: false,
  colors: {
    primary: lightPalette.primary,
    background: lightPalette.background,
    card: '#FFFFFF',
    text: lightPalette.text,
    border: lightPalette.border,
    notification: lightPalette.secondary,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '800' },
  },
};

const navDark: Theme = {
  dark: true,
  colors: {
    primary: darkPalette.primary,
    background: darkPalette.background,
    card: '#1F1F23',
    text: darkPalette.text,
    border: darkPalette.border,
    notification: darkPalette.secondary,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '800' },
  },
};

export const themes: Record<'light' | 'dark', AppTheme> = {
  light: {
    isDark: false,
    palette: lightPalette,
    navigationTheme: navLight,
  },
  dark: {
    isDark: true,
    palette: darkPalette,
    navigationTheme: navDark,
  },
};

export const typography = {
  heading24: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
  heading20: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
  body16: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  body14: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  caption12: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
  },
};
