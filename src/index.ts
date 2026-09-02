import { requireNativeView } from "expo";
import React from "react";
import { Platform, type StyleProp, type ViewStyle } from "react-native";

/** Explicit appearance override for the banner's SwiftUI traits. */
export type KickstartExchangeColorScheme = "light" | "dark";

/** Corner treatment of the ad card. */
export type KickstartExchangeCornerStyle = "rounded" | "square";

/**
 * A hexadecimal color string: `#RGB`, `#RGBA`, `#RRGGBB`, or `#RRGGBBAA`
 * (case-insensitive). Invalid values are ignored at runtime and the SDK's
 * default styling applies instead; they never crash.
 */
export type KickstartExchangeColor = string;

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
  /**
   * Forces the banner's light/dark appearance.
   *
   * Pass this when the host app's theme preference can diverge from the
   * system appearance (e.g. an in-app dark mode toggle): it makes the banner's
   * dynamic colors — including the default `.windowBackground` card — resolve
   * against the chosen scheme. Omit to follow the system appearance.
   */
  colorScheme?: KickstartExchangeColorScheme;
  /**
   * Solid card background color, overriding the SDK's `.windowBackground`
   * default. Takes precedence over `colorScheme` for the card surface;
   * `colorScheme` still governs the remaining dynamic colors.
   */
  backgroundColor?: KickstartExchangeColor;
  /** Card corner treatment. Defaults to `rounded`. */
  cornerStyle?: KickstartExchangeCornerStyle;
  /** Card border color. Defaults to the SDK's subtle system stroke. */
  strokeColor?: KickstartExchangeColor;
  /** Background of the small "Ad" disclosure badge. Defaults to blue. */
  disclosureBackgroundColor?: KickstartExchangeColor;
  /** Text color of the "Get" App Store button. Defaults to blue. */
  actionTextColor?: KickstartExchangeColor;
};

type NativeBannerProps = {
  apiKey: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  colorScheme?: KickstartExchangeColorScheme;
  backgroundColor?: KickstartExchangeColor;
  cornerStyle?: KickstartExchangeCornerStyle;
  strokeColor?: KickstartExchangeColor;
  disclosureBackgroundColor?: KickstartExchangeColor;
  actionTextColor?: KickstartExchangeColor;
};

const NativeBanner =
  Platform.OS === "ios" ? requireNativeView<NativeBannerProps>("KickstartExchange") : null;

/**
 * Renders a privacy-preserving Kickstart Exchange banner on iOS 18+.
 *
 * Android and non-native platforms deliberately render nothing. The native
 * SDK owns all ad rendering, store navigation, accessibility, and reporting;
 * the optional style props only restyle the card and take effect on prop
 * updates without reloading the ad.
 */
export function KickstartExchangeBanner({
  apiKey,
  style,
  testID,
  colorScheme,
  backgroundColor,
  cornerStyle,
  strokeColor,
  disclosureBackgroundColor,
  actionTextColor,
}: KickstartExchangeBannerProps) {
  if (!apiKey.trim()) {
    throw new Error("KickstartExchangeBanner requires a non-empty apiKey.");
  }
  if (!NativeBanner) return null;

  return React.createElement(NativeBanner, {
    apiKey,
    style: [{ height: 164 }, style],
    testID,
    colorScheme,
    backgroundColor,
    cornerStyle,
    strokeColor,
    disclosureBackgroundColor,
    actionTextColor,
  });
}
