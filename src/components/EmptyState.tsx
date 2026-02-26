import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/theme-provider';

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  const { palette } = useAppTheme();

  return (
    <View style={[styles.container, { borderColor: palette.border, backgroundColor: palette.card }]}>
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: palette.subtext }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});
