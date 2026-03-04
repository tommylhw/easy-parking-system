import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/src/components/EmptyState";
import { FilterChips } from "@/src/components/FilterChips";
import { LoadingState } from "@/src/components/LoadingState";
import { MapCanvas } from "@/src/components/MapCanvas";
import { RecentSearches } from "@/src/components/RecentSearches";
import { SearchInput } from "@/src/components/SearchInput";
import { SectionHeader } from "@/src/components/SectionHeader";
import { StaleBanner } from "@/src/components/StaleBanner";
import { StationCard } from "@/src/components/StationCard";
import { useAppTheme } from "@/src/theme/theme-provider";
import { FillingStation } from "@/src/types/domain";
import { fetchFillingStations } from "@/src/utils/fillingStations";
import { withDistance } from "@/src/utils/geo";
import { requestCurrentLocation } from "@/src/utils/location";
import { openInMaps } from "@/src/utils/navigation";
import {
  addRecentSearch,
  listFavoriteIds,
  listRecentSearches,
  toggleFavorite,
} from "@/src/utils/sqliteDB";

export default function StationsScreen() {
  const { isDark, palette } = useAppTheme();

  const [allStations, setAllStations] = useState<FillingStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  }>();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const loadDbState = useCallback(async () => {
    const [favoriteSet, recent] = await Promise.all([
      listFavoriteIds("station"),
      listRecentSearches("station", 8),
    ]);

    setFavoriteIds(favoriteSet);
    setRecentSearches(recent);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [locationResult, stationsResult] = await Promise.all([
        requestCurrentLocation(),
        fetchFillingStations(),
      ]);

      if (locationResult.coordinates) {
        setLocation(locationResult.coordinates);
      }

      setAllStations(stationsResult.data);
      setStale(stationsResult.stale);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to fetch filling station data",
      );
    }
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await Promise.all([loadData(), loadDbState()]);
      setLoading(false);
    })();
  }, [loadData, loadDbState]);

  const orderedStations = useMemo(
    () => withDistance(allStations, location),
    [allStations, location],
  );

  const brandOptions = useMemo(() => {
    const brands = new Set(orderedStations.map((item) => item.brand));
    return ["All", ...Array.from(brands).sort((a, b) => a.localeCompare(b))];
  }, [orderedStations]);

  const filteredStations = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return orderedStations.filter((station) => {
      const passesBrand =
        selectedBrand === "All" || station.brand === selectedBrand;
      if (!passesBrand) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return `${station.brand} ${station.location} ${station.district}`
        .toLowerCase()
        .includes(keyword);
    });
  }, [orderedStations, search, selectedBrand]);

  const mapMarkers = useMemo(
    () =>
      filteredStations.slice(0, 70).map((station) => ({
        id: station.id,
        coordinate: station.coordinates,
        title: `${station.brand} Station`,
        subtitle: station.location,
        color: palette.mapStation,
      })),
    [filteredStations, palette.mapStation],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadData(), loadDbState()]);
    setRefreshing(false);
  }, [loadData, loadDbState]);

  const onSubmitSearch = useCallback(async () => {
    if (!search.trim()) {
      return;
    }

    await addRecentSearch("station", search);
    setRecentSearches(await listRecentSearches("station", 8));
  }, [search]);

  const onToggleFavorite = useCallback(async (station: FillingStation) => {
    const isSaved = await toggleFavorite({
      itemId: station.id,
      itemType: "station",
      name: `${station.brand} - ${station.location}`,
      latitude: station.coordinates.latitude,
      longitude: station.coordinates.longitude,
      payload: JSON.stringify(station),
    });

    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isSaved) {
        next.add(station.id);
      } else {
        next.delete(station.id);
      }
      return next;
    });
  }, []);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={palette.primary}
          />
        }
      >
        <SectionHeader
          title="Filling Stations"
          subtitle="Nearby LPG and fuel stations with brand filters and quick navigation."
        />

        <SearchInput
          value={search}
          placeholder="Search station or district"
          onChangeText={setSearch}
          onSubmit={onSubmitSearch}
        />

        {!search ? (
          <RecentSearches
            searches={recentSearches}
            onPress={(value) => {
              setSearch(value);
            }}
          />
        ) : null}

        <FilterChips
          options={brandOptions}
          selected={selectedBrand}
          onSelect={setSelectedBrand}
        />

        {stale ? (
          <StaleBanner text="Offline mode: showing cached station data." />
        ) : null}

        <MapCanvas center={location} markers={mapMarkers} />

        {loading ? <LoadingState label="Loading filling stations..." /> : null}

        {!loading && error ? (
          <EmptyState title="Unable to load stations" subtitle={error} />
        ) : null}

        {!loading && !error && filteredStations.length === 0 ? (
          <EmptyState
            title="No stations matched"
            subtitle="Try a different brand filter or a shorter keyword."
          />
        ) : null}

        {!loading && !error
          ? filteredStations.slice(0, 35).map((station, index) => (
              <Animated.View
                key={station.id}
                entering={FadeInDown.delay(index * 30).duration(260)}
              >
                <StationCard
                  station={station}
                  favorite={favoriteIds.has(station.id)}
                  onToggleFavorite={() => {
                    void onToggleFavorite(station);
                  }}
                  onNavigate={() => {
                    void openInMaps(
                      station.coordinates.latitude,
                      station.coordinates.longitude,
                      `${station.brand} ${station.location}`,
                    );
                  }}
                />
              </Animated.View>
            ))
          : null}

        <Pressable
          onPress={() => {
            void onRefresh();
          }}
          style={[
            styles.reloadButton,
            { borderColor: palette.border, backgroundColor: palette.card },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Refresh station data"
        >
          <Text style={[styles.reloadText, { color: palette.text }]}>
            Refresh Data
          </Text>
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
    gap: 12,
  },
  reloadButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  reloadText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
