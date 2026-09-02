import SwiftUI

/**
 * Resolved presentation preferences for the vendored banner.
 *
 * `nil` entries mean "not customized": the corresponding upstream environment
 * value keeps its SDK default, so an uncustomized banner is pixel-identical to
 * the raw SDK. Colors arrive from React Native as hex strings and are parsed
 * defensively; invalid values are dropped rather than crashing.
 */
struct KickstartExchangeAdStyle {
    var cornerStyle: ExchangeAdCornerStyle = .rounded
    var strokeColor: Color?
    var disclosureBackgroundColor: Color?
    var actionTextColor: Color?
    var cardBackground: AnyShapeStyle?

    init(
        cornerStyle: ExchangeAdCornerStyle = .rounded,
        strokeColor: Color? = nil,
        disclosureBackgroundColor: Color? = nil,
        actionTextColor: Color? = nil,
        cardBackground: AnyShapeStyle? = nil
    ) {
        self.cornerStyle = cornerStyle
        self.strokeColor = strokeColor
        self.disclosureBackgroundColor = disclosureBackgroundColor
        self.actionTextColor = actionTextColor
        self.cardBackground = cardBackground
    }
}

extension EnvironmentValues {
    /**
     * Package-owned background seam for the vendored ad card.
     *
     * The upstream card paints its own `.background(.windowBackground, ...)`,
     * which no outer SwiftUI modifier can override. The vendored source
     * therefore reads this key through a reviewed, hash-verified patch (see
     * `ios/vendor-patches/`). The default preserves upstream behavior exactly.
     */
    @Entry var exchangeAdCardBackground = AnyShapeStyle(.windowBackground)
}

extension View {
    /// Applies every non-nil style preference to a vendored Exchange banner.
    ///
    /// Uses `transformEnvironment` so `nil` preferences leave the SDK's
    /// documented defaults untouched instead of replacing them with a fixed
    /// color.
    func kickstartExchangeAdStyle(_ style: KickstartExchangeAdStyle) -> some View {
        self
            .exchangeAdCornerStyle(style.cornerStyle)
            .transformEnvironment(\.exchangeAdStrokeColor) { stroke in
                if let strokeColor = style.strokeColor { stroke = strokeColor }
            }
            .transformEnvironment(\.exchangeAdDisclosureBackgroundColor) { background in
                if let disclosureBackgroundColor = style.disclosureBackgroundColor {
                    background = disclosureBackgroundColor
                }
            }
            .transformEnvironment(\.exchangeAdActionTextColor) { textColor in
                if let actionTextColor = style.actionTextColor { textColor = actionTextColor }
            }
            .transformEnvironment(\.exchangeAdCardBackground) { cardBackground in
                if let resolved = style.cardBackground { cardBackground = resolved }
            }
    }
}

/// Bridges parsed hex components into SwiftUI colors.
enum KickstartExchangeColorFactory {
    static func color(from text: String?) -> Color? {
        KickstartExchangeColorParsing.components(from: text).map { components in
            Color(
                .sRGB,
                red: components.red,
                green: components.green,
                blue: components.blue,
                opacity: components.alpha
            )
        }
    }

    /// Wraps parsed colors for the card background seam.
    static func shape(from text: String?) -> AnyShapeStyle? {
        color(from: text).map(AnyShapeStyle.init)
    }
}
