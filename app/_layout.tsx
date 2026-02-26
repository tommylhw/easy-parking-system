import Provider from "@/src/providers/provider";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

import "react-native-reanimated";

export default function RootLayout() {
  return (
    <Provider>
      <NativeTabs>
        {/* <NativeTabs.Trigger name="index">
            <Label>Home</Label>
            <Icon sf="house.fill" />
          </NativeTabs.Trigger> */}
        <NativeTabs.Trigger name="parking">
          <Label>Parking</Label>
          <Icon sf="car.fill" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="traffic">
          <Label>Traffic</Label>
          <Icon sf="road.lanes" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="stations">
          <Label>Stations</Label>
          <Icon sf="fuelpump.fill" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="saved">
          <Label>Saved</Label>
          <Icon sf="bookmark.fill" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="settings">
          <Label>Settings</Label>
          <Icon sf="gearshape.fill" />
        </NativeTabs.Trigger>
      </NativeTabs>
    </Provider>
  );
}
