import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useAppTheme } from '@/src/theme/theme-provider';

type Props = {
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
};

export function SearchInput({ value, placeholder, onChangeText, onSubmit }: Props) {
  const { palette } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <Ionicons name="search" size={18} color={palette.subtext} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.subtext}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        style={[styles.input, { color: palette.text }]}
        accessibilityLabel={placeholder}
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText('')} accessibilityRole="button" accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={18} color={palette.subtext} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
});
