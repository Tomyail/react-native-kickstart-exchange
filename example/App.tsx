import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { KickstartExchangeBanner } from "@tomyail/react-native-kickstart-exchange";

const apiKey =
  process.env.EXPO_PUBLIC_KICKSTART_EXCHANGE_KEY ?? (__DEV__ ? "preview" : "");

export default function App() {
  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>KICKSTART EXCHANGE</Text>
        <Text style={styles.title}>React Native example</Text>
        <Text style={styles.description}>
          This screen verifies the native SwiftUI banner on iOS 18 and above.
        </Text>
        <KickstartExchangeBanner
          apiKey={apiKey}
          style={styles.banner}
          testID="kickstart-exchange-banner"
        />
        <Text style={styles.note}>
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
    backgroundColor: "#f5f2eb",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  eyebrow: {
    color: "#777c75",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  title: {
    color: "#171a18",
    fontSize: 36,
    fontWeight: "800",
  },
  description: {
    color: "#626862",
    fontSize: 17,
    lineHeight: 24,
  },
  banner: {
    marginTop: 16,
  },
  note: {
    color: "#777c75",
    fontSize: 13,
    lineHeight: 19,
  },
});
