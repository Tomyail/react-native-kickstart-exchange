import Foundation

/**
 * Parses host-provided color strings into sRGB components.
 *
 * The parser is intentionally Foundation-only so it stays unit-testable with a
 * plain `swiftc` invocation, independent of SwiftUI or the vendored SDK.
 *
 * Supported formats (case-insensitive, `#` prefix required):
 * `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`. Short digits expand by repetition,
 * matching CSS shorthand semantics. Anything else returns `nil` so invalid
 * input falls back to the SDK's default styling instead of crashing.
 */
enum KickstartExchangeColorParsing {
    typealias Components = (red: Double, green: Double, blue: Double, alpha: Double)

    static func components(from text: String) -> Components? {
        guard text.count == 4 || text.count == 5 || text.count == 7 || text.count == 9 else {
            return nil
        }
        guard text.hasPrefix("#") else { return nil }

        let digits = text.dropFirst()
        guard digits.allSatisfy(\.isHexDigit) else { return nil }

        let normalized: String
        switch digits.count {
        case 3:
            normalized = String(digits.flatMap { [$0, $0] }) + "ff"
        case 4:
            normalized = String(digits.flatMap { [$0, $0] })
        case 6:
            normalized = String(digits) + "ff"
        default:
            normalized = String(digits)
        }

        guard normalized.count == 8, let rgba = UInt32(normalized, radix: 16) else {
            return nil
        }

        func channel(_ value: UInt32) -> Double {
            Double(value) / 255.0
        }

        return (
            channel((rgba >> 24) & 0xFF),
            channel((rgba >> 16) & 0xFF),
            channel((rgba >> 8) & 0xFF),
            channel(rgba & 0xFF)
        )
    }

    /// Tolerates the `undefined`/`null` React Native may forward for cleared
    /// optional props.
    static func components(from text: String?) -> Components? {
        guard let text, !text.isEmpty else { return nil }
        return components(from: text)
    }
}
