# Architecture

## Deep module boundary

The package exposes one native view and hides all platform mechanics behind it.

```text
Host JSX
  └─ KickstartExchangeBanner (src/)
       └─ Expo requireNativeView("KickstartExchange")
            └─ KickstartExchangeModule (ios/)
                 └─ UIHostingController
                      └─ ExchangeBannerAdView (vendored KickstartSDK source)
```

The public API accepts only an API key and normal React Native layout props. KickstartSDK owns ad presentation, accessibility, networking, reporting, Store navigation, and its in-app information/reporting views.

## Why the SDK is vendored

The upstream SDK is distributed as a Swift Package and requires iOS 18. A CocoaPods target created by Expo/RN autolinking cannot reliably inherit an arbitrary Swift Package linked only to the app target; a clean `pod install` removes that manually-created relationship.

To make consumer installation reproducible, this package vendors the upstream MIT-licensed `Sources/KickstartExchange` tree in `ios/Vendor/KickstartSDK/` and compiles it in `KickstartExchangeBridge`. The maintenance script temporarily clones an exact reviewed tag; `UPSTREAM.json` and release checks prove that the resulting vendor snapshot matches it.

Consequences:

- Consumers run `pod install`; they do not edit Xcode's Package Dependencies.
- `KickstartExchangeResourceBundle.swift` supplies the `Bundle.module` lookup that SwiftPM would normally synthesize.
- The upstream privacy manifest is retained in a uniquely named CocoaPods resource bundle, avoiding a collision with the host app's `PrivacyInfo.xcprivacy`.
- Updating KickstartSDK is a deliberate vendoring update with a versioned notice and full consumer build verification.

## Platform support

| Platform | Behavior |
| --- | --- |
| iOS 18+ | Native SwiftUI banner. |
| Android | Returns `null`. |
| Web/other | Returns `null`. |

This initial release uses Expo Modules API for view registration. Bare React Native applications can use it after installing Expo Modules infrastructure, but it does not require a managed Expo workflow.

## Production key policy

The library does not ship a key and does not default to `preview`.

- Production hosts provide a live key from their build configuration.
- Developers may explicitly pass `preview` for Debug/Simulator verification.
- Hosts must not mount a `preview` banner in release builds; the SDK will not serve it there.

## Release gates

- Compile Debug and Release against a clean Pods directory.
- Verify a live key on iOS 18 hardware.
- Verify `preview` only in Debug/Simulator.
- Add a standalone example app and CI for install, pod install, and iOS compilation.
- Update through the documented submodule → vendor sync, then audit the vendored upstream diff, version, LICENSE and `PrivacyInfo.xcprivacy`.
- Publish App Store privacy guidance before publishing npm artifacts.
