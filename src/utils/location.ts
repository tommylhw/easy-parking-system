import * as Location from 'expo-location';

import { Coordinates } from '@/src/types/domain';

export type LocationResult = {
  granted: boolean;
  coordinates?: Coordinates;
};

export async function requestCurrentLocation(): Promise<LocationResult> {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (!permission.granted) {
    return { granted: false };
  }

  const current = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    granted: true,
    coordinates: {
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
    },
  };
}
