import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { StyleSheet, Text, View } from "react-native";
import {
  KickstartExchangeBanner,
  type KickstartExchangeColorScheme,
} from "@tomyail/react-native-kickstart-exchange";

const apiKey =
  process.env.EXPO_PUBLIC_KICKSTART_EXCHANGE_KEY ?? (__DEV__ ? "preview" : "");

// Example palette mirroring a themed host app: the banner card follows the
// system scheme via colorScheme, and every customizable surface uses the same
// palette tokens (see docs/STYLING.md for defaults and formats).
const palette = {
  light: {
    background: "#f5f2eb",
    surface: "#fffaf3",
    stroke: "#e2d7ca",
    accent: "#b85f3b",
    text: "#171a18",
  },
  dark: {
    background: "#15120f",
    surface: "#201c18",
    stroke: "#44392f",
    accent: "#dc815d",
    text: "#f8efe6",
  },
} as const;

export default function App() {
  const systemScheme = useColorScheme();
  const colorScheme: KickstartExchangeColorScheme =
    systemScheme === "dark" ? "dark" : "light";
  const colors = palette[colorScheme];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme} />
      <View style={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.stroke }]}>
          KICKSTART EXCHANGE
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>React Native example</Text>
        <Text style={[styles.description, { color: colors.stroke }]}>
          This screen verifies the native SwiftUI banner on iOS 18 and above,
          restyled to follow the system appearance.
        </Text>
        <KickstartExchangeBanner
          apiKey={apiKey}
          style={styles.banner}
          testID="kickstart-exchange-banner"
          colorScheme={colorScheme}
          backgroundColor={colors.surface}
          strokeColor={colors.stroke}
          actionTextColor={colors.accent}
        />
        <Text style={[styles.note, { color: colors.stroke }]}>
          {__DEV__
            ? 'Debug/Simulator uses the upstream "preview" advert unless a live key is configured.'
            : "Configure EXPO_PUBLIC_KICKSTART_EXCHANGE_KEY for a release build."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
  },
  description: {
    fontSize: 17,
    lineHeight: 24,
  },
  banner: {
    marginTop: 16,
  },
  note: {
    fontSize: 13,
    lineHeight: 19,
  },
});
