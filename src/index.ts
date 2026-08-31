import { requireNativeView } from "expo";
import React from "react";
import { Platform, type StyleProp, type ViewStyle } from "react-native";

export type KickstartExchangeBannerProps = {
  /**
   * A Kickstart Exchange live API key for production builds.
   *
   * The literal `preview` key is supported by the upstream SDK only in Debug
   * builds and on the iOS Simulator. It must not be used for shipping apps.
   */
  apiKey: string;
  /** The banner's React Native layout style. Its default height is 164. */
  style?: StyleProp<ViewStyle>;
  /** Test identifier applied to the native banner view. */
  testID?: string;
};

type NativeBannerProps = {
  apiKey: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const NativeBanner =
  Platform.OS === "ios" ? requireNativeView<NativeBannerProps>("KickstartExchange") : null;

/**
 * Renders a privacy-preserving Kickstart Exchange banner on iOS 18+.
 *
 * Android and non-native platforms deliberately render nothing. The native
 * SDK owns all ad rendering, store navigation, accessibility, and reporting.
 */
export function KickstartExchangeBanner({ apiKey, style, testID }: KickstartExchangeBannerProps) {
  if (!apiKey.trim()) {
    throw new Error("KickstartExchangeBanner requires a non-empty apiKey.");
  }
  if (!NativeBanner) return null;

  return React.createElement(NativeBanner, {
    apiKey,
    style: [{ height: 164 }, style],
    testID,
  });
}
