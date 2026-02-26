import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/theme-provider';

export function StaleBanner({ text = 'Offline mode: showing cached data.' }: { text?: string }) {
  const { palette } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: palette.card, borderColor: palette.border }]}> 
      <Ionicons name="cloud-offline-outline" size={16} color={palette.secondary} />
      <Text style={[styles.text, { color: palette.subtext }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
});
