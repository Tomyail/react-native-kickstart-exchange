import Foundation

/**
 * SwiftPM synthesizes `Bundle.module` for the upstream source. CocoaPods does
 * not, so the vendored build supplies the same lookup contract for its named
 * resource bundle.
 */
private final class KickstartExchangeResourceBundleToken {}

extension Bundle {
  static let module: Bundle = {
    let bundleName = "KickstartExchangeBridgeResources"
    let candidates = [
      Bundle(for: KickstartExchangeResourceBundleToken.self).resourceURL,
      Bundle.main.resourceURL,
    ]

    for resourceURL in candidates.compactMap({ $0 }) {
      if let bundle = Bundle(url: resourceURL.appendingPathComponent("\(bundleName).bundle")) {
        return bundle
      }
    }

    // The SDK remains usable when a host intentionally strips localized
    // resources; its literals fall back to their source-language values.
    return Bundle(for: KickstartExchangeResourceBundleToken.self)
  }()
}
