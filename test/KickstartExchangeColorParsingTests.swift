import Foundation

/**
 * Plain-swiftc unit tests for the package's hex color parser.
 *
 * Run with `npm run test:swift`, which compiles this file together with
 * `ios/KickstartExchangeColorParsing.swift`. Foundation-only by design so the
 * suite stays runnable without an Xcode project.
 */
@main
struct KickstartExchangeColorParsingTests {
    static func main() {
        var failures = 0

        func expect(
            _ input: String?,
            _ expected: KickstartExchangeColorParsing.Components?,
            file: StaticString = #fileID,
            line: UInt = #line
        ) {
            let actual = KickstartExchangeColorParsing.components(from: input)
            switch (actual, expected) {
            case (nil, nil):
                return
            case let (actual?, expected?):
                if actual.red != expected.red
                    || actual.green != expected.green
                    || actual.blue != expected.blue
                    || actual.alpha != expected.alpha
                {
                    failures += 1
                    print(
                        "FAIL \(file):\(line) \(input ?? "nil") => "
                            + "(\(actual.red), \(actual.green), \(actual.blue), \(actual.alpha)), "
                            + "expected (\(expected.red), \(expected.green), \(expected.blue), \(expected.alpha))"
                    )
                }
            default:
                failures += 1
                print("FAIL \(file):\(line) \(input ?? "nil") => \(String(describing: actual)), expected \(String(describing: expected))")
            }
        }

        func channel(_ value: UInt8) -> Double {
            Double(value) / 255.0
        }

        // #RRGGBB
        expect("#ff8a00", (channel(0xFF), channel(0x8A), channel(0x00), 1))
        expect("#FF8A00", (channel(0xFF), channel(0x8A), channel(0x00), 1))
        expect("#000000", (0, 0, 0, 1))
        expect("#ffffff", (1, 1, 1, 1))

        // #RRGGBBAA
        expect("#ff8a00cc", (channel(0xFF), channel(0x8A), channel(0x00), channel(0xCC)))
        expect("#00000000", (0, 0, 0, 0))
        expect("#ffffffff", (1, 1, 1, 1))
        expect("#80808080", (channel(0x80), channel(0x80), channel(0x80), channel(0x80)))

        // Shorthands expand by digit repetition, matching CSS semantics.
        expect("#F0A", (1, 0, channel(0xAA), 1))
        expect("#fff", (1, 1, 1, 1))
        expect("#000", (0, 0, 0, 1))
        expect("#0000", (0, 0, 0, 0))
        expect("#1234", (channel(0x11), channel(0x22), channel(0x33), channel(0x44)))

        // Absent / cleared props.
        expect(nil, nil)
        expect("", nil)

        // Invalid input is dropped, never fatal.
        expect("ff8a00", nil) // missing '#'
        expect("#ff8a0", nil) // 5 hex digits but not 4 (7 chars total)
        expect("#12345", nil)
        expect("#1234567", nil)
        expect("#123456789", nil)
        expect("#GGGGGG", nil)
        expect("red", nil)
        expect("#", nil)
        expect("rgb(255, 138, 0)", nil)

        if failures > 0 {
            print("\(failures) color parsing test(s) failed")
            exit(1)
        }
        print("All KickstartExchangeColorParsing tests passed")
    }
}
