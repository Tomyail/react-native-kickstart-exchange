# Styling the banner

`KickstartExchangeBanner` exposes the upstream SDK's supported style seams
plus one package-owned background seam. Everything else about the card —
layout, typography, Dynamic Type, accessibility, ad reporting — stays owned by
the SDK.

## Props overview

| Prop | Type | Default | Controls |
| --- | --- | --- | --- |
| `apiKey` | `string` (required) | — | Live key, or `preview` in Debug/Simulator. |
| `style` | `StyleProp<ViewStyle>` | — | React Native layout. Default height is `164`. |
| `testID` | `string` | — | Native view test identifier. |
| `colorScheme` | `"light" \| "dark"` | follow system | Banner's SwiftUI traits (see below). |
| `backgroundColor` | `KickstartExchangeColor` | `.windowBackground` | Solid card background. |
| `cornerStyle` | `"rounded" \| "square"` | `"rounded"` | Card corner treatment. |
| `strokeColor` | `KickstartExchangeColor` | system subtle stroke | 1pt card border color. |
| `disclosureBackgroundColor` | `KickstartExchangeColor` | blue (`#0000FF`) | Small "Ad" badge background. |
| `actionTextColor` | `KickstartExchangeColor` | blue (`#0000FF`) | "Get" button label color. |

All style props are optional. Omitting one, passing `null`/`undefined`, or
passing an invalid color keeps the SDK default for that aspect — invalid input
is dropped at the bridge, never fatal, and never reloads the ad.

## Color format

`KickstartExchangeColor` is a hex string, parsed on the native side:

- `#RGB`, `#RGBA` — CSS-style shorthand; digits expand by repetition
  (`#F0A` ≡ `#FF00AA`, `#0000` ≡ fully transparent black)
- `#RRGGBB`, `#RRGGBBAA` — 8-bit channels, alpha last (`#ff8a00cc`)
- Case-insensitive; the leading `#` is required

Anything else (`"red"`, `"rgb(…)"`, `"ff8a00"`, wrong length, non-hex digits)
parses to `nil` and the SDK default applies. Colors are parsed into
`Color(.sRGB, …)` values — no string interpolation into Swift code.

## `colorScheme` vs `backgroundColor`

They solve two different problems:

- **`colorScheme`** forces the banner's *SwiftUI traits* via
  `UIHostingController.overrideUserInterfaceStyle`. Use it when your app's
  theme preference can diverge from the system appearance (an in-app dark-mode
  toggle): every dynamic color in the card — including the default
  `.windowBackground` surface, secondary text, and focused-button states —
  resolves against the chosen scheme. Omit it to follow the system.
- **`backgroundColor`** paints the card surface with *your exact color*
  (typically a theme token such as `colors.surface`). It supersedes the
  scheme-derived surface, so the card matches host surfaces that the system
  palettes don't know about. Remaining dynamic colors (text, button fills)
  still follow `colorScheme`/system.

Recommendation for themed apps: pass both — `colorScheme` for the dynamic
colors, `backgroundColor` for the surface.

```tsx
const { isDark, colors } = useAppTheme();

<KickstartExchangeBanner
  apiKey={apiKey}
  colorScheme={isDark ? "dark" : "light"}
  backgroundColor={colors.surface}
  strokeColor={colors.border}
/>;
```

## The background seam (why a vendor patch exists)

The upstream card paints its own `.background(.windowBackground, …)` *inside*
`ExchangeAdvertisementCard`; no outer SwiftUI modifier can cover a background
drawn behind the card content. Making the surface customizable therefore
required teaching the card to read one extra environment key:

```swift
@Environment(\.exchangeAdCardBackground) private var cardBackground
…
.background(cardBackground, in: .rect(cornerRadius: cornerStyle.cornerRadius))
```

The key's default is `AnyShapeStyle(.windowBackground)`, so an uncustomized
banner is pixel-identical to the raw SDK. The definition lives in the
package-owned `ios/KickstartExchangeAdStyle.swift`; the two-line change rides
in `ios/vendor-patches/` and is hash-verified against the pristine upstream
snapshot by `check:upstream` (see [VENDORING.md](VENDORING.md)). Ad loading,
reporting, StoreKit, and accessibility behavior are untouched.

## What is *not* customizable

Deliberate non-goals, so expectations stay honest:

- **The "Get" button's fill** uses the system `.background.secondary` shape
  style; only its *text* color (`actionTextColor`) is adjustable.
- **The "Ad" badge's text** is always white (black/white when focused).
- **Layout metrics** — paddings, icon size, corner radius (20pt), maximum card
  width (450pt) — are fixed by the SDK.
- **The ad's information/report sheet** keeps its SDK appearance; the style
  environment values do flow into it where upstream reads them, but the sheet
  also uses its own fixed system materials.
- **visionOS `glassBackgroundEffect`** is untouched; `backgroundColor` is
  honored on iOS only (this package is iOS-only anyway).

## Prop updates

Every prop applies on React Native prop updates. Style changes re-render the
SwiftUI hierarchy in place — the banner keeps its identity, so the loaded ad,
its impression timer, and reporting state survive theme changes at runtime.
`colorScheme` switches traits without re-rendering at all.
