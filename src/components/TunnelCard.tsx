import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/theme-provider';
import { TunnelInfo } from '@/src/types/domain';
import { GlassCard } from './GlassCard';

export function TunnelCard({ tunnel }: { tunnel: TunnelInfo }) {
  const { palette } = useAppTheme();

  return (
    <GlassCard>
      <View style={styles.row}>
        <Text style={[styles.name, { color: palette.text }]}>{tunnel.name}</Text>
        <Text
          style={[
            styles.status,
            { color: tunnel.status === 'Normal' ? palette.success : palette.secondary },
          ]}>
          {tunnel.status}
        </Text>
      </View>
      <Text style={[styles.detail, { color: palette.subtext }]}>PC Toll: HK${tunnel.currentPcToll ?? 'N/A'}</Text>
      <Text style={[styles.detail, { color: palette.subtext }]}>Vehicle classes: {tunnel.vehicleClassCount}</Text>
      {tunnel.relatedIncident ? (
        <Text style={[styles.incident, { color: palette.secondary }]} numberOfLines={2}>
          {tunnel.relatedIncident}
        </Text>
      ) : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detail: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
  },
  incident: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
  },
});
