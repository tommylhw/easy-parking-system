import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/src/components/EmptyState";
import { FilterChips } from "@/src/components/FilterChips";
import { LoadingState } from "@/src/components/LoadingState";
import { MapCanvas } from "@/src/components/MapCanvas";
import { ParkingCard } from "@/src/components/ParkingCard";
import { RecentSearches } from "@/src/components/RecentSearches";
import { SearchInput } from "@/src/components/SearchInput";
import { SectionHeader } from "@/src/components/SectionHeader";
import { StaleBanner } from "@/src/components/StaleBanner";
import { useAppTheme } from "@/src/theme/theme-provider";
import { ParkingItem } from "@/src/types/domain";
import { formatTimestamp } from "@/src/utils/date";
import { withDistance } from "@/src/utils/geo";
import { requestCurrentLocation } from "@/src/utils/location";
import { openInMaps } from "@/src/utils/navigation";
import { fetchParkingBundle } from "@/src/utils/parkingData";
import {
  addRecentSearch,
  listFavoriteIds,
  listRecentSearches,
  toggleFavorite,
} from "@/src/utils/sqliteDB";

const SEARCH_FILTERS = ["All", "Car Parks", "Metered"];

export default function ParkingScreen() {
  const { isDark, palette } = useAppTheme();

  const [carparks, setCarparks] = useState<ParkingItem[]>([]);
  const [metered, setMetered] = useState<ParkingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stale, setStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  }>();
  const [locationDenied, setLocationDenied] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const loadDbState = useCallback(async () => {
    const [favoriteSet, recent] = await Promise.all([
      listFavoriteIds("parking"),
      listRecentSearches("parking", 8),
    ]);

    setFavoriteIds(favoriteSet);
    setRecentSearches(recent);
  }, []);

  const loadLocation = useCallback(async () => {
    const locResult = await requestCurrentLocation();
    if (!locResult.granted) {
      setLocationDenied(true);
      return;
    }

    setLocationDenied(false);
    setLocation(locResult.coordinates);
    // console.log(
    //   "Current location:",
    //   locResult.coordinates!.latitude,
    //   locResult.coordinates!.longitude,
    // );
  }, []);

  const loadParkingData = useCallback(async () => {
    try {
      const response = await fetchParkingBundle();
      setCarparks(response.carparks);
      setMetered(response.metered);
      setStale(response.stale);
      setLastUpdated(response.updatedAt);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to fetch parking data",
      );
    }
  }, []);

  const reloadAll = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      await Promise.all([loadLocation(), loadParkingData(), loadDbState()]);

      if (refresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    },
    [loadDbState, loadLocation, loadParkingData],
  );

  useEffect(() => {
    void reloadAll(false);
  }, [reloadAll]);

  const merged = useMemo(() => {
    const allItems = [...carparks, ...metered];
    return withDistance(allItems, location);
  }, [carparks, metered, location]);

  const filteredItems = useMemo(() => {
    let items = merged;

    if (selectedFilter === "Car Parks") {
      items = items.filter((item) => item.source === "carpark");
    }

    if (selectedFilter === "Metered") {
      items = items.filter((item) => item.source === "metered");
    }

    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return items;
    }

    return items.filter((item) => {
      const haystack =
        `${item.name} ${item.address} ${item.district}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [merged, search, selectedFilter]);

  const mapMarkers = useMemo(
    () =>
      filteredItems.slice(0, 80).map((item) => ({
        id: item.id,
        coordinate: item.coordinates,
        title: item.name,
        subtitle: `${item.source === "carpark" ? "Car park" : "Metered"} · Vacancy ${item.vacancy ?? "N/A"}`,
        color:
          item.source === "carpark" ? palette.mapCarpark : palette.mapMetered,
      })),
    [filteredItems, palette.mapCarpark, palette.mapMetered],
  );

  const handleSubmitSearch = useCallback(async () => {
    if (!search.trim()) {
      return;
    }

    await addRecentSearch("parking", search);
    setRecentSearches(await listRecentSearches("parking", 8));
  }, [search]);

  const handleSelectRecent = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleToggleFavorite = useCallback(async (item: ParkingItem) => {
    const isSaved = await toggleFavorite({
      itemId: item.id,
      itemType: "parking",
      name: item.name,
      latitude: item.coordinates.latitude,
      longitude: item.coordinates.longitude,
      payload: JSON.stringify(item),
    });

    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isSaved) {
        next.add(item.id);
      } else {
        next.delete(item.id);
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
            refreshing={isRefreshing}
            onRefresh={() => {
              void reloadAll(true);
            }}
            tintColor={palette.primary}
          />
        }
      >
        <SectionHeader
          title="Nearby Parking"
          subtitle="Hong Kong car parks and metered spaces with live availability where available."
        />

        <SearchInput
          value={search}
          placeholder="Search district, road, or car park"
          onChangeText={setSearch}
          onSubmit={handleSubmitSearch}
        />

        {!search ? (
          <RecentSearches
            searches={recentSearches}
            onPress={handleSelectRecent}
          />
        ) : null}

        <FilterChips
          options={SEARCH_FILTERS}
          selected={selectedFilter}
          onSelect={setSelectedFilter}
        />

        {stale ? <StaleBanner /> : null}

        {locationDenied ? (
          <StaleBanner text="Location permission is disabled. Showing city-wide results." />
        ) : null}

        <MapCanvas center={location} markers={mapMarkers} />

        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>
            Results ({filteredItems.length})
          </Text>
          {lastUpdated ? (
            <Text style={[styles.sectionMeta, { color: palette.subtext }]}>
              Updated {formatTimestamp(lastUpdated)}
            </Text>
          ) : null}
        </View>

        {isLoading ? <LoadingState label="Loading nearby parking..." /> : null}

        {!isLoading && error ? (
          <EmptyState title="Unable to load parking data" subtitle={error} />
        ) : null}

        {!isLoading && !error && filteredItems.length === 0 ? (
          <EmptyState
            title="No parking spots matched"
            subtitle="Try a broader district or clear the filters."
          />
        ) : null}

        {!isLoading && !error
          ? filteredItems.slice(0, 35).map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(index * 40).duration(280)}
              >
                <ParkingCard
                  item={item}
                  favorite={favoriteIds.has(item.id)}
                  onToggleFavorite={() => {
                    void handleToggleFavorite(item);
                  }}
                  onNavigate={() => {
                    void openInMaps(
                      item.coordinates.latitude,
                      item.coordinates.longitude,
                      item.name,
                    );
                  }}
                />
              </Animated.View>
            ))
          : null}

        <Pressable
          onPress={() => {
            void reloadAll(true);
          }}
          style={[
            styles.reloadButton,
            { borderColor: palette.border, backgroundColor: palette.card },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Refresh parking data"
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
  sectionRow: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionMeta: {
    fontSize: 12,
    fontWeight: "500",
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
