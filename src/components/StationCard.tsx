import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/theme-provider';
import { FillingStation } from '@/src/types/domain';
import { formatDistanceKm } from '@/src/utils/date';
import { GlassCard } from './GlassCard';

type Props = {
  station: FillingStation;
  favorite: boolean;
  onToggleFavorite: () => void;
  onNavigate: () => void;
};

export function StationCard({ station, favorite, onToggleFavorite, onNavigate }: Props) {
  const { palette } = useAppTheme();

  return (
    <GlassCard>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: palette.text }]} numberOfLines={1}>
            {station.brand}
          </Text>
          <Text style={[styles.subtitle, { color: palette.subtext }]} numberOfLines={2}>
            {station.location}
          </Text>
        </View>

        <Pressable
          onPress={onToggleFavorite}
          accessibilityRole="button"
          accessibilityLabel={favorite ? 'Remove station from favorites' : 'Save station to favorites'}>
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={22}
            color={favorite ? palette.secondary : palette.subtext}
          />
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: palette.text }]}>{station.district}</Text>
        <Text style={[styles.meta, { color: palette.text }]}>{formatDistanceKm(station.distanceKm) ?? '-'}</Text>
      </View>

      {station.prices?.length ? (
        <Text style={[styles.prices, { color: palette.subtext }]} numberOfLines={2}>
          {station.prices.slice(0, 2).join(' · ')}
        </Text>
      ) : null}

      <Pressable
        onPress={onNavigate}
        style={[styles.actionButton, { backgroundColor: palette.primary }]}
        accessibilityRole="button"
        accessibilityLabel={`Navigate to ${station.brand} station`}>
        <Ionicons name="navigate" color="#fff" size={16} />
        <Text style={styles.actionText}>Route</Text>
      </Pressable>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  titleWrap: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  meta: {
    fontSize: 13,
    fontWeight: '600',
  },
  prices: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
  },
  actionButton: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
