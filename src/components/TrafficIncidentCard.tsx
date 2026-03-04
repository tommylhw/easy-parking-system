import { SymbolView } from "expo-symbols";
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "@/src/theme/theme-provider";
import { TrafficIncident } from "@/src/types/domain";
import { useCallback } from "react";
import { GlassCard } from "./GlassCard";

export function TrafficIncidentCard({
  incident,
}: {
  incident: TrafficIncident;
}) {
  const { palette } = useAppTheme();

  const openSourceUrl = useCallback(async () => {
    const url = "https://programme.rthk.hk/channel/radio/trafficnews/index.php";
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  }, []);

  return (
    <GlassCard>
      <View style={styles.row}>
        <Text
          style={[
            styles.tag,
            {
              color: incident.isAccident ? palette.danger : palette.secondary,
            },
          ]}
        >
          {incident.isAccident ? "Accident" : "Traffic Alert"}
        </Text>
        <TouchableOpacity
          style={styles.sourceContainer}
          onPress={() => openSourceUrl()}
        >
          <Text style={[styles.source, { color: palette.subtext }]}>
            {incident.source}
          </Text>
          <SymbolView name="link" size={12} tintColor={palette.subtext} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.summary, { color: palette.text }]}>
        {incident.summary}
      </Text>
      {incident.timestamp ? (
        <Text style={[styles.time, { color: palette.subtext }]}>
          {incident.timestamp}
        </Text>
      ) : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tag: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  source: {
    fontSize: 12,
    fontWeight: "600",
  },
  summary: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 21,
  },
  time: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "500",
  },
  sourceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
