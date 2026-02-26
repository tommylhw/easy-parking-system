import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { EmptyState } from '@/src/components/EmptyState';
import { LoadingState } from '@/src/components/LoadingState';
import { SectionHeader } from '@/src/components/SectionHeader';
import { StaleBanner } from '@/src/components/StaleBanner';
import { TrafficIncidentCard } from '@/src/components/TrafficIncidentCard';
import { TunnelCard } from '@/src/components/TunnelCard';
import { useAppTheme } from '@/src/theme/theme-provider';
import { TrafficIncident, TunnelInfo } from '@/src/types/domain';
import { fetchTrafficIncidents } from '@/src/utils/trafficData';
import { fetchTunnelInfo } from '@/src/utils/tunnelData';

export default function TrafficScreen() {
  const { palette } = useAppTheme();

  const [incidents, setIncidents] = useState<TrafficIncident[]>([]);
  const [tunnels, setTunnels] = useState<TunnelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const traffic = await fetchTrafficIncidents();
      const tunnelInfo = await fetchTunnelInfo(traffic.data.alerts);

      setIncidents(traffic.data.alerts);
      setTunnels(tunnelInfo);
      setStale(traffic.stale);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load traffic information');
    }
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    })();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.primary} />
        }>
        <SectionHeader
          title="Traffic & Tunnels"
          subtitle="Accident and congestion alerts, plus tunnel tolls and incident-linked status."
        />

        {stale ? <StaleBanner text="Traffic feed unavailable. Showing cached updates." /> : null}

        {loading ? <LoadingState label="Loading traffic updates..." /> : null}

        {!loading && error ? <EmptyState title="Traffic data unavailable" subtitle={error} /> : null}

        {!loading && !error ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Incident Alerts</Text>
            {incidents.length === 0 ? (
              <EmptyState
                title="No major accident alerts"
                subtitle="No accident or traffic-jam messages detected from the latest feed."
              />
            ) : (
              incidents.slice(0, 20).map((incident, index) => (
                <Animated.View key={incident.id} entering={FadeInDown.delay(index * 40).duration(260)}>
                  <TrafficIncidentCard incident={incident} />
                </Animated.View>
              ))
            )}
          </View>
        ) : null}

        {!loading && !error ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Tunnel Charges & Status</Text>
            {tunnels.length === 0 ? (
              <EmptyState
                title="No tunnel records available"
                subtitle="The toll dataset could not be parsed. Try refreshing shortly."
              />
            ) : (
              tunnels.slice(0, 18).map((tunnel, index) => (
                <Animated.View key={tunnel.id} entering={FadeInDown.delay(index * 30).duration(240)}>
                  <TunnelCard tunnel={tunnel} />
                </Animated.View>
              ))
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
    gap: 14,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
});
