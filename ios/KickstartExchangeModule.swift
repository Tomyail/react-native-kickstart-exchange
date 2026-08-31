import ExpoModulesCore
import SwiftUI

/**
 * Expo Modules bridge for the SwiftUI Kickstart Exchange banner.
 *
 * The upstream MIT-licensed SDK source is compiled by this pod, so consumers
 * do not need to mutate their app target to link a Swift Package. The bridge
 * deliberately has no default API key: a host must explicitly opt into either
 * a live key or the SDK's Debug/Simulator-only `preview` key.
 */
public final class KickstartExchangeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("KickstartExchange")

    View(KickstartExchangeBannerView.self) {
      Prop("apiKey") { (view: KickstartExchangeBannerView, apiKey: String) in
        view.apply(apiKey: apiKey)
      }
    }
  }
}

private struct BannerContainer: View {
  let apiKey: String?

  @ViewBuilder
  var body: some View {
    if let apiKey {
      ExchangeBannerAdView(apiKey: apiKey)
    } else {
      EmptyView()
    }
  }
}

/** Hosts the SwiftUI view while React Native owns the outer layout. */
final class KickstartExchangeBannerView: ExpoView {
  private let hostingController = UIHostingController(
    rootView: BannerContainer(apiKey: nil)
  )

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
    hostingController.rootView = BannerContainer(apiKey: apiKey)
  }
}
