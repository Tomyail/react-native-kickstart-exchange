# Updating the vendored KickstartSDK

The published package contains a source snapshot under `ios/Vendor/KickstartSDK/`. This repository intentionally has no Git submodule: the update script temporarily shallow-clones the approved upstream tag, copies the allowed paths, records its identity, and removes the temporary checkout.

## Update procedure

```sh
pnpm sync:upstream -- --tag <approved-tag>
pnpm check:upstream
```

Then review all of the following before committing:

- `UPSTREAM.json` tag, commit and hash;
- the `ios/Vendor/KickstartSDK/` diff;
- upstream `LICENSE` and `PrivacyInfo.xcprivacy` changes;
- Debug and Release consumer builds.

Do not edit `ios/Vendor/KickstartSDK/` by hand. The only non-upstream CocoaPods adaptation is `ios/KickstartExchangeResourceBundle.swift`, which remains outside the vendor tree.

## Publish guard

`npm pack` and `npm publish` run `prepack`, which invokes `check:upstream`. This offline check fails unless `UPSTREAM.json` contains a valid upstream URL, immutable tag, commit, expected paths and the SHA-256 of the checked-in vendor source.

The sync command is the only operation that requires network access. Consumers receive no Git metadata, update scripts, or submodules; they receive the verified source snapshot required by CocoaPods.
