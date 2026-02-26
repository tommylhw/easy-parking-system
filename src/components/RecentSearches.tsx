import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/theme-provider';

export function RecentSearches({
  searches,
  onPress,
}: {
  searches: string[];
  onPress: (value: string) => void;
}) {
  const { palette } = useAppTheme();

  if (!searches.length) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: palette.subtext }]}>Recent searches</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
        {searches.map((item) => (
          <Pressable
            key={item}
            onPress={() => onPress(item)}
            style={[styles.chip, { borderColor: palette.border, backgroundColor: palette.card }]}
            accessibilityRole="button"
            accessibilityLabel={`Use recent search ${item}`}>
            <Text style={[styles.chipText, { color: palette.text }]} numberOfLines={1}>
              {item}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  container: {
    gap: 8,
  },
  chip: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxWidth: 180,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
