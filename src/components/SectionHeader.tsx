import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/theme-provider';

type Props = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: Props) {
  const { palette } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: palette.subtext }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});
