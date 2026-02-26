import { useAppTheme } from "@/src/theme/theme-provider";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Text, View } from "react-native";

const HomeScreen = () => {
  return (
    <View>
      <StatusBar style={useAppTheme().isDark ? "light" : "dark"} />
      <Text>Home Screen</Text>
    </View>
  );
};

export default HomeScreen;
