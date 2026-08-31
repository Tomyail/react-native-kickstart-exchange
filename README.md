# React Native Kickstart Exchange

[![npm version](https://img.shields.io/npm/v/%40tomyail%2Freact-native-kickstart-exchange)](https://www.npmjs.com/package/@tomyail/react-native-kickstart-exchange)
[![CI](https://github.com/Tomyail/react-native-kickstart-exchange/actions/workflows/ci.yml/badge.svg)](https://github.com/Tomyail/react-native-kickstart-exchange/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/Tomyail/react-native-kickstart-exchange)](LICENSE)

A community-maintained React Native wrapper for [Kickstart Exchange](https://github.com/twostraws/KickstartSDK)'s SwiftUI banner on iOS 18+. This is not an official Kickstart product.

## Requirements

- iOS 18.0 or later
- React Native 0.76 or later
- Expo Modules API
- A Kickstart Exchange API key for production builds

Android and other non-native platforms return `null` without rendering a banner.

## Installation

### Expo projects

```sh
npm install @tomyail/react-native-kickstart-exchange
npx expo install expo-build-properties
```

Set the iOS deployment target to 18.0 in `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "deploymentTarget": "18.0"
          }
        }
      ]
    ]
  }
}
```

Then regenerate and build the native project:

```sh
npx expo prebuild
npx expo run:ios
```

### Bare React Native projects

If Expo Modules are not installed yet:

```sh
npx install-expo-modules@latest
```

Install the package and CocoaPods dependency:

```sh
npm install @tomyail/react-native-kickstart-exchange
cd ios && pod install
```

Set the deployment target of the iOS app and Pods to `18.0` or later before building.

The package includes the required upstream SDK source, so you do not need to add a Swift Package manually in Xcode.

## Usage

```tsx
import { KickstartExchangeBanner } from "@tomyail/react-native-kickstart-exchange";

export function AdPlacement() {
  const apiKey =
    process.env.EXPO_PUBLIC_KICKSTART_EXCHANGE_KEY ??
    (__DEV__ ? "preview" : "");

  if (!apiKey) return null;

  return (
    <KickstartExchangeBanner
      apiKey={apiKey}
      style={{ marginHorizontal: 16, marginTop: 24 }}
      testID="kickstart-exchange-banner"
    />
  );
}
```

`apiKey` is required and must be non-empty. The default banner height is `164` points; pass a `style` to control its layout.

### Preview mode

The upstream SDK accepts the literal `preview` key only in Debug builds and on the iOS Simulator. It loads a deterministic test advert without a Kickstart Exchange account.

Never use `preview` in a shipping build. Pass your live key through your app's build configuration instead.

## Privacy and App Store disclosure

The bundled SDK privacy manifest declares Product Interaction and Advertising Data for Third Party Advertising, Developer Advertising, Analytics, and App Functionality.

Before shipping with a live key, review the SDK's current data practices and update your app's:

- App Store Connect App Privacy answers
- Privacy Policy
- Consent and regional disclosure flow, where applicable

See [Privacy guidance](docs/PRIVACY.md) and [third-party notices](docs/THIRD_PARTY_NOTICES.md).

## Example app

A minimal Expo app is available in [`example/`](example/). Run it on an iOS 18+ Simulator with the `preview` key:

```sh
cd example
npm install
npx expo prebuild --clean --platform ios
npx expo run:ios
```

## Troubleshooting

### `no such module 'KickstartExchange'`

Run `pod install` again, confirm that the app deployment target is iOS 18.0 or later, and build the `.xcworkspace` rather than the `.xcodeproj`.

### The banner is not visible

The SDK may be loading or may have no available advert. Confirm that the view has layout height, that the API key is valid, and that the app is active. The default wrapper height is 164 points.

### Android renders nothing

This package currently supports iOS only. Android intentionally returns `null`.

## Versioning

Releases use [Conventional Commits](https://www.conventionalcommits.org/) and [git-cliff](https://git-cliff.org/). New versions are published to npm from matching Git tags such as `v0.1.0`.

For contributing, upstream SDK synchronization, and release maintenance, see the documents in [`docs/`](docs/).

## License

This wrapper is MIT licensed. The bundled KickstartSDK source is separately MIT licensed by Paul Hudson. See [third-party notices](docs/THIRD_PARTY_NOTICES.md).
