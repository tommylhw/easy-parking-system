import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/theme-provider';
import { ParkingItem } from '@/src/types/domain';
import { formatDistanceKm } from '@/src/utils/date';
import { GlassCard } from './GlassCard';

type Props = {
  item: ParkingItem;
  favorite: boolean;
  onToggleFavorite: () => void;
  onNavigate: () => void;
};

export function ParkingCard({ item, favorite, onToggleFavorite, onNavigate }: Props) {
  const { palette } = useAppTheme();

  return (
    <GlassCard>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: palette.text }]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={[styles.badge, { color: item.source === 'carpark' ? palette.primary : palette.secondary }]}>
            {item.source === 'carpark' ? 'Car Park' : 'Metered'}
          </Text>
        </View>

        <Pressable
          onPress={onToggleFavorite}
          accessibilityRole="button"
          accessibilityLabel={favorite ? 'Remove from favorites' : 'Save to favorites'}>
          <Ionicons
            name={favorite ? 'star' : 'star-outline'}
            size={22}
            color={favorite ? palette.secondary : palette.subtext}
          />
        </Pressable>
      </View>

      <Text style={[styles.body, { color: palette.subtext }]} numberOfLines={2}>
        {item.address}
      </Text>

      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: palette.text }]}>Vacancy: {item.vacancy ?? 'N/A'}</Text>
        <Text style={[styles.meta, { color: palette.text }]}>Total: {item.totalSpaces ?? 'N/A'}</Text>
        <Text style={[styles.meta, { color: palette.text }]}>{formatDistanceKm(item.distanceKm) ?? '-'}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.subMeta, { color: palette.subtext }]}>{item.rateSummary ?? 'Rate unavailable'}</Text>
        <Text style={[styles.subMeta, { color: palette.subtext }]}>{item.openingHours ?? 'Hours unavailable'}</Text>
      </View>

      <Pressable
        onPress={onNavigate}
        style={[styles.actionButton, { backgroundColor: palette.primary }]}
        accessibilityRole="button"
        accessibilityLabel={`Navigate to ${item.name}`}>
        <Ionicons name="navigate" color="#fff" size={16} />
        <Text style={styles.actionText}>Open in Maps</Text>
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
  badge: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  body: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  meta: {
    fontSize: 13,
    fontWeight: '600',
  },
  subMeta: {
    fontSize: 12,
    fontWeight: '500',
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
