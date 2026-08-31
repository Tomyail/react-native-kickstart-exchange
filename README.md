# React Native Kickstart Exchange

> **Development repository — not yet published to npm.**

A community-maintained, iOS 18+ React Native banner component for [Kickstart Exchange](https://github.com/twostraws/KickstartSDK). It is not an official Kickstart product.

The package is designed for production use: hosts pass their own live API key, while the SDK's `preview` key is an explicit development-only option. No API key is embedded in the package.

## Installation target

This is currently an **Expo Modules API** library. It works in Expo projects and can be used from a bare React Native project after adding Expo Modules support:

```sh
npx install-expo-modules@latest
```

The wrapper vendors the upstream MIT-licensed SDK source so that `pod install` is reproducible: consumers do **not** add a Swift Package manually.

```sh
pnpm add @tomyail/react-native-kickstart-exchange
cd ios && pod install
```

Requirements:

- iOS deployment target 18.0 or newer.
- React Native 0.76+ and Expo Modules API.
- A live Kickstart Exchange API key for shipping builds.

## Usage

```tsx
import { KickstartExchangeBanner } from "@tomyail/react-native-kickstart-exchange";

<KickstartExchangeBanner
  apiKey="ks_live_replace_with_your_key"
  style={{ marginHorizontal: 16, marginTop: 24 }}
/>;
```

`apiKey` is required; an empty key throws early rather than silently shipping an unusable placement.

For Debug builds and the iOS Simulator only, KickstartSDK accepts `apiKey="preview"` and loads its test advert. Never ship that key: the upstream SDK deliberately does not serve preview ads in production builds.

Android and other non-native platforms render `null`.

## Privacy and App Store responsibility

The bundled upstream `PrivacyInfo.xcprivacy` declares collection of Product Interaction and Advertising Data for advertising, analytics, app functionality, and developer advertising. The host application is responsible for accurately updating its App Store privacy answers, privacy policy, consent flow, and user-facing disclosures before using a live key.

See [docs/PRIVACY.md](docs/PRIVACY.md) and [docs/THIRD_PARTY_NOTICES.md](docs/THIRD_PARTY_NOTICES.md).

## Upstream maintenance

The sync script temporarily shallow-clones an approved immutable KickstartSDK tag, then writes the checked-in `ios/Vendor/KickstartSDK` snapshot. Neither this repository nor npm consumers use Git submodules.

```sh
pnpm sync:upstream -- --tag 0.5.0
pnpm check:upstream
```

`prepack` runs the same offline check and refuses to create a package when the vendored source differs from the tag, commit, or hash recorded in [`UPSTREAM.json`](UPSTREAM.json).

## Repository layout

| Path | Responsibility |
| --- | --- |
| `src/` | Public React Native API and platform behavior. |
| `ios/` | Expo native view bridge plus vendored SDK source and resources. |
| `scripts/` | Temporary-clone vendor sync and release-time parity check. |
| `example/` | Consumer-app verification scenarios. |
| `docs/` | Privacy, attribution, vendoring and release documents. |
| `.github/workflows/` | Package validation and tag-triggered npm release automation. |

## Status

The package has completed a clean `pod install`, Simulator Debug build, and visual verification of the upstream preview banner in a consumer app. A standalone Expo example, package CI, git-cliff configuration, and tag-triggered npm publishing workflow are included. Before the first public release, review the host-facing privacy documentation and configure the repository's `NPM_TOKEN` secret.

## License and upstream attribution

This project is MIT licensed. KickstartSDK is separately MIT licensed by Paul Hudson; its source is vendored solely to make CocoaPods installation reproducible. See [docs/THIRD_PARTY_NOTICES.md](docs/THIRD_PARTY_NOTICES.md).
