import { useCallback, useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/src/components/EmptyState';
import { GlassCard } from '@/src/components/GlassCard';
import { SectionHeader } from '@/src/components/SectionHeader';
import { useAppTheme } from '@/src/theme/theme-provider';
import { FavoriteRecord } from '@/src/types/domain';
import { openInMaps } from '@/src/utils/navigation';
import {
  clearRecentSearches,
  listFavorites,
  listRecentSearches,
  removeFavorite,
} from '@/src/utils/sqliteDB';

export default function SavedScreen() {
  const { palette } = useAppTheme();

  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [parkingHistory, setParkingHistory] = useState<string[]>([]);
  const [stationHistory, setStationHistory] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    const [allFavorites, parking, stations] = await Promise.all([
      listFavorites(),
      listRecentSearches('parking', 12),
      listRecentSearches('station', 12),
    ]);

    setFavorites(allFavorites);
    setParkingHistory(parking);
    setStationHistory(stations);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader title="Saved" subtitle="Favorites and recent searches stored on-device with SQLite." />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Favorites ({favorites.length})</Text>
          {favorites.length === 0 ? (
            <EmptyState title="No favorites yet" subtitle="Save parking spots or stations to see them here." />
          ) : (
            favorites.map((favorite) => (
              <GlassCard key={`${favorite.itemType}-${favorite.itemId}`}>
                <Text style={[styles.favoriteTitle, { color: palette.text }]} numberOfLines={2}>
                  {favorite.name}
                </Text>
                <Text style={[styles.favoriteType, { color: palette.subtext }]}>
                  {favorite.itemType === 'parking' ? 'Parking' : 'Filling Station'}
                </Text>
                <View style={styles.favoriteActions}>
                  <Pressable
                    onPress={() => {
                      void openInMaps(favorite.latitude, favorite.longitude, favorite.name);
                    }}
                    style={[styles.smallButton, { backgroundColor: palette.primary }]}
                    accessibilityRole="button"
                    accessibilityLabel={`Navigate to ${favorite.name}`}>
                    <Text style={styles.smallButtonText}>Navigate</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      void (async () => {
                        await removeFavorite(favorite.itemId, favorite.itemType);
                        await loadData();
                      })();
                    }}
                    style={[styles.smallButton, { backgroundColor: palette.danger }]}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${favorite.name} from favorites`}>
                    <Text style={styles.smallButtonText}>Remove</Text>
                  </Pressable>
                </View>
              </GlassCard>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Recent Parking Searches</Text>
          {parkingHistory.length === 0 ? (
            <EmptyState title="No parking history" />
          ) : (
            <GlassCard>
              {parkingHistory.map((item) => (
                <Text key={item} style={[styles.historyItem, { color: palette.text }]}> 
                  • {item}
                </Text>
              ))}
            </GlassCard>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Recent Station Searches</Text>
          {stationHistory.length === 0 ? (
            <EmptyState title="No station history" />
          ) : (
            <GlassCard>
              {stationHistory.map((item) => (
                <Text key={item} style={[styles.historyItem, { color: palette.text }]}> 
                  • {item}
                </Text>
              ))}
            </GlassCard>
          )}
        </View>

        <Pressable
          onPress={() => {
            void (async () => {
              await clearRecentSearches();
              await loadData();
            })();
          }}
          style={[styles.clearButton, { borderColor: palette.border, backgroundColor: palette.card }]}
          accessibilityRole="button"
          accessibilityLabel="Clear all recent search history">
          <Text style={[styles.clearButtonText, { color: palette.text }]}>Clear Search History</Text>
        </Pressable>
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
  favoriteTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  favoriteType: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
  },
  favoriteActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  smallButton: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  historyItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  clearButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
