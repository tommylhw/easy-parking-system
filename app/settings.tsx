import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/src/components/EmptyState";
import { GlassCard } from "@/src/components/GlassCard";
import { SectionHeader } from "@/src/components/SectionHeader";
import { useAppTheme } from "@/src/theme/theme-provider";
import { ThemeMode } from "@/src/theme/tokens";
import { clearApiCache } from "@/src/utils/cache";

const THEME_OPTIONS: ThemeMode[] = ["system", "light", "dark"];

export default function SettingsScreen() {
  const { isDark, mode, setMode, palette, resolvedScheme } = useAppTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader
          title="Settings"
          subtitle="Manual theme control or automatic system mode, optimized for iOS appearance."
        />

        <GlassCard>
          <Text style={[styles.blockTitle, { color: palette.text }]}>
            Appearance
          </Text>
          <Text style={[styles.description, { color: palette.subtext }]}>
            Current mode: {resolvedScheme}
          </Text>

          <View style={styles.row}>
            {THEME_OPTIONS.map((option) => {
              const selected = mode === option;

              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    void setMode(option);
                  }}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: selected
                        ? palette.primary
                        : palette.cardSecondary,
                      borderColor: selected ? palette.primary : palette.border,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Switch theme to ${option}`}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: selected ? "#fff" : palette.text },
                    ]}
                  >
                    {option.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>

        <GlassCard>
          <Text style={[styles.blockTitle, { color: palette.text }]}>
            Data & Cache
          </Text>
          <Text style={[styles.description, { color: palette.subtext }]}>
            Clear cached API payloads.
          </Text>

          <Pressable
            onPress={() => {
              void clearApiCache();
            }}
            style={[
              styles.actionButton,
              { backgroundColor: palette.secondary },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Clear API cache"
          >
            <Text style={styles.actionText}>Clear API Cache</Text>
          </Pressable>
        </GlassCard>

        <EmptyState
          title="Accessibility"
          subtitle="All major actions have VoiceOver labels, and navigation/actions are reachable with clear touch targets."
        />
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
  blockTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  optionButton: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  optionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  actionButton: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
