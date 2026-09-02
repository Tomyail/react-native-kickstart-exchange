import ExpoModulesCore
import SwiftUI

/**
 * Expo Modules bridge for the SwiftUI Kickstart Exchange banner.
 *
 * The upstream MIT-licensed SDK source is compiled by this pod, so consumers
 * do not need to mutate their app target to link a Swift Package. The bridge
 * deliberately has no default API key: a host must explicitly opt into either
 * a live key or the SDK's Debug/Simulator-only `preview` key.
 *
 * Every style prop is optional and falls back to the SDK's documented default
 * when absent, `null`/`undefined`, or carrying an invalid value (e.g. a
 * malformed color string is dropped, never fatal).
 */
public final class KickstartExchangeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("KickstartExchange")

    View(KickstartExchangeBannerView.self) {
      Prop("apiKey") { (view: KickstartExchangeBannerView, apiKey: String) in
        view.apply(apiKey: apiKey)
      }
      Prop("colorScheme") { (view: KickstartExchangeBannerView, colorScheme: String?) in
        view.apply(colorScheme: colorScheme)
      }
      Prop("backgroundColor") { (view: KickstartExchangeBannerView, color: String?) in
        view.updateStyle { $0.cardBackground = color.flatMap(KickstartExchangeColorFactory.shape) }
      }
      Prop("cornerStyle") { (view: KickstartExchangeBannerView, cornerStyle: String?) in
        view.updateStyle { $0.cornerStyle = cornerStyle == "square" ? .square : .rounded }
      }
      Prop("strokeColor") { (view: KickstartExchangeBannerView, color: String?) in
        view.updateStyle { $0.strokeColor = KickstartExchangeColorFactory.color(from: color) }
      }
      Prop("disclosureBackgroundColor") { (view: KickstartExchangeBannerView, color: String?) in
        view.updateStyle { $0.disclosureBackgroundColor = KickstartExchangeColorFactory.color(from: color) }
      }
      Prop("actionTextColor") { (view: KickstartExchangeBannerView, color: String?) in
        view.updateStyle { $0.actionTextColor = KickstartExchangeColorFactory.color(from: color) }
      }
    }
  }
}

private struct BannerContainer: View {
  let apiKey: String?
  var adStyle = KickstartExchangeAdStyle()

  @ViewBuilder
  var body: some View {
    if let apiKey {
      ExchangeBannerAdView(apiKey: apiKey)
        .kickstartExchangeAdStyle(adStyle)
    } else {
      EmptyView()
    }
  }
}

/**
 * Hosts the SwiftUI view while React Native owns the outer layout.
 *
 * React Native prop updates re-assign the container view, which SwiftUI diffs
 * like a normal body re-evaluation: the banner keeps its structural identity,
 * so its ad-loading and reporting state survives style changes.
 */
final class KickstartExchangeBannerView: ExpoView {
  private var apiKey: String?
  private var adStyle = KickstartExchangeAdStyle()

  private let hostingController = UIHostingController(rootView: BannerContainer(apiKey: nil))

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)

    hostingController.view.backgroundColor = .clear
    addSubview(hostingController.view)
    hostingController.view.translatesAutoresizingMaskIntoConstraints = false
    NSLayoutConstraint.activate([
      hostingController.view.leadingAnchor.constraint(equalTo: leadingAnchor),
      hostingController.view.trailingAnchor.constraint(equalTo: trailingAnchor),
      hostingController.view.topAnchor.constraint(equalTo: topAnchor),
      hostingController.view.bottomAnchor.constraint(equalTo: bottomAnchor),
    ])
  }

  func apply(apiKey: String) {
    self.apiKey = apiKey
    render()
  }

  /// Forces the banner's SwiftUI traits so hosts whose in-app theme overrides
  /// the system appearance still get matching dynamic colors (including the
  /// card's `.windowBackground` default). `nil` follows the system again.
  func apply(colorScheme: String?) {
    switch colorScheme {
    case "light":
      hostingController.overrideUserInterfaceStyle = .light
    case "dark":
      hostingController.overrideUserInterfaceStyle = .dark
    default:
      hostingController.overrideUserInterfaceStyle = .unspecified
    }
  }

  func updateStyle(_ mutate: (inout KickstartExchangeAdStyle) -> Void) {
    mutate(&adStyle)
    render()
  }

  private func render() {
    hostingController.rootView = BannerContainer(apiKey: apiKey, adStyle: adStyle)
  }
}
