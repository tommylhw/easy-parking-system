import { useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker, Region } from 'react-native-maps';

import { useAppTheme } from '@/src/theme/theme-provider';
import { Coordinates } from '@/src/types/domain';

type MarkerItem = {
  id: string;
  coordinate: Coordinates;
  title: string;
  subtitle?: string;
  color: string;
};

type Props = {
  center?: Coordinates;
  markers: MarkerItem[];
  height?: number;
};

const HK_DEFAULT_CENTER: Coordinates = {
  latitude: 22.3193,
  longitude: 114.1694,
};

export function MapCanvas({ center, markers, height = 280 }: Props) {
  const { palette } = useAppTheme();

  const region = useMemo<Region>(() => {
    const target = center ?? HK_DEFAULT_CENTER;
    return {
      latitude: target.latitude,
      longitude: target.longitude,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }, [center]);

  return (
    <View style={[styles.wrapper, { borderColor: palette.border, height }]}> 
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={region}
        showsUserLocation
        showsCompass
        showsScale
        loadingEnabled
        mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}>
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            pinColor={marker.color}
            title={marker.title}
            description={marker.subtitle}>
            <Callout tooltip={false}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{marker.title}</Text>
                {marker.subtitle ? <Text style={styles.calloutSubtitle}>{marker.subtitle}</Text> : null}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  callout: {
    maxWidth: 220,
    padding: 4,
  },
  calloutTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  calloutSubtitle: {
    fontSize: 12,
    color: '#404043',
  },
});
