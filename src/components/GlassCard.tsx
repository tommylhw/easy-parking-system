import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { useAppTheme } from '@/src/theme/theme-provider';

type Props = PropsWithChildren<{
  style?: ViewStyle;
}>;

export function GlassCard({ children, style }: Props) {
  const { palette, isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
          shadowColor: palette.shadow,
        },
        isDark ? styles.darkCard : styles.lightCard,
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  lightCard: {
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
  },
  darkCard: {
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
});
