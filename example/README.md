# Example app

A minimal Expo consumer used to verify the published package shape and iOS native build.

## Run on iOS

From this directory:

```sh
pnpm install
pnpm exec expo prebuild --clean --platform ios
pnpm exec expo run:ios
```

The example uses the upstream `preview` key automatically in Debug/iOS Simulator builds. To test a live key, provide it at build time:

```sh
EXPO_PUBLIC_KICKSTART_EXCHANGE_KEY=ks_live_replace_with_your_key pnpm exec expo run:ios
```

Never commit a live key. The release app intentionally requires `EXPO_PUBLIC_KICKSTART_EXCHANGE_KEY`; an empty key is rejected by the component.

## Verification scenarios

1. Debug iOS Simulator shows the deterministic preview advert.
2. Release with a live key builds against iOS 18+ and loads the production advert.
3. Release without a key fails early rather than silently shipping an unusable placement.
4. Android and web render no native banner and do not crash.
