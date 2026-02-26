import { ScrollView, Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/src/theme/theme-provider';

type Props = {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
};

export function FilterChips({ options, selected, onSelect }: Props) {
  const { palette } = useAppTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {options.map((option) => {
        const active = option === selected;

        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={[
              styles.chip,
              {
                borderColor: active ? palette.primary : palette.border,
                backgroundColor: active ? palette.primary : palette.card,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Filter ${option}`}>
            <Text style={[styles.chipText, { color: active ? '#fff' : palette.text }]}>{option}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
