import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useAppTheme } from '@/src/theme/theme-provider';

export default function TabLayout() {
  const { palette } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: palette.cardSecondary,
          borderTopColor: palette.border,
          height: 86,
          paddingTop: 8,
          paddingBottom: 20,
        },
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.subtext,
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 12,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Parking',
          tabBarIcon: ({ color, size }) => <Ionicons name="car-sport" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="traffic"
        options={{
          title: 'Traffic',
          tabBarIcon: ({ color, size }) => <Ionicons name="warning" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="stations"
        options={{
          title: 'Stations',
          tabBarIcon: ({ color, size }) => <Ionicons name="speedometer" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, size }) => <Ionicons name="bookmark" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="options" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
