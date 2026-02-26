import { Alert, Platform } from 'react-native';
import * as Linking from 'expo-linking';

export async function openInMaps(latitude: number, longitude: number, label: string) {
  const encodedLabel = encodeURIComponent(label);
  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${latitude},${longitude}&q=${encodedLabel}`
      : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  const supported = await Linking.canOpenURL(url);
  if (!supported) {
    Alert.alert('Unable to open maps app');
    return;
  }

  await Linking.openURL(url);
}
