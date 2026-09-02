# Updating the vendored KickstartSDK

The published package contains a source snapshot under `ios/Vendor/KickstartSDK/`. This repository intentionally has no Git submodule: the update script temporarily shallow-clones the approved upstream tag, copies the allowed paths, applies the reviewed local patches, records its identity, and removes the temporary checkout.

## Local patches

`ios/vendor-patches/*.patch` holds the repo's reviewed modifications to the
vendored tree, applied on top of the pristine upstream snapshot by
`sync:upstream` and re-verified by `check:upstream`:

| Patch | Reason |
| --- | --- |
| `0001-ad-card-background-environment.patch` | Teaches `ExchangeAdvertisementCard` to read the package-owned `exchangeAdCardBackground` environment key (default `.windowBackground`) so hosts can set a solid card background. See [STYLING.md](STYLING.md). Two lines; no behavior change for uncustomized hosts. |

Patch rules:

- Patches must be **styling seams only** — never ad loading, reporting,
  StoreKit, or accessibility behavior.
- Keep each patch minimal and documented in the table above.
- New environment keys consumed by a patch are defined in package-owned
  Swift files outside the vendor tree (e.g. `ios/KickstartExchangeAdStyle.swift`);
  a patch should reference seams, not define features.
- `sync:upstream` refuses to finish when a patch no longer applies to a new
  upstream tag — that is the prompt to re-review and regenerate the patch.

## Update procedure

```sh
pnpm sync:upstream -- --tag <approved-tag>
pnpm check:upstream
```

Then review all of the following before committing:

- `UPSTREAM.json` tag, commit, `upstreamSha256`, `sourceSha256`, and patches;
- the `ios/Vendor/KickstartSDK/` diff;
- upstream `LICENSE` and `PrivacyInfo.xcprivacy` changes;
- Debug and Release consumer builds.

Do not edit `ios/Vendor/KickstartSDK/` by hand. The only non-vendored CocoaPods adaptations are `ios/KickstartExchangeResourceBundle.swift` and the other package-owned bridge sources, which remain outside the vendor tree.

## Publish guard

`npm pack` and `npm publish` run `prepack`, which invokes `check:upstream`. This offline check enforces that `UPSTREAM.json` describes exactly what is checked in:

1. The vendored tree hashes to `sourceSha256` (patched snapshot).
2. Reversing every recorded patch on a copy of the vendored tree yields
   `upstreamSha256` — an offline proof that the tree is precisely *pristine
   upstream + reviewed patches* and nothing else.
3. Patch files must live under `ios/vendor-patches/` and apply cleanly.

The sync command is the only operation that requires network access. Consumers receive no Git metadata, update scripts, or submodules; they receive the verified source snapshot required by CocoaPods.
