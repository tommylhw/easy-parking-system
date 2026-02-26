import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/theme-provider';

export function LoadingState({ label = 'Loading data...' }: { label?: string }) {
  const { palette } = useAppTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={palette.primary} />
      <Text style={[styles.label, { color: palette.subtext }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
