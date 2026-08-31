require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name             = 'KickstartExchangeBridge'
  s.version          = package['version']
  s.summary          = package['description']
  s.description      = package['description']
  s.license          = package['license']
  s.author           = package['author']
  s.homepage         = package['homepage']
  s.source           = { :git => package.dig('repository', 'url') }
  s.platforms        = { :ios => '18.0' }
  s.static_framework = true
  s.source_files = [
    '**/*.{h,m,swift}',
    'Vendor/KickstartSDK/Sources/KickstartExchange/**/*.swift'
  ]
  # A named resource bundle avoids colliding with the host app's own
  # PrivacyInfo.xcprivacy while preserving the upstream manifest for CocoaPods
  # privacy aggregation and App Store tooling.
  s.resource_bundles = {
    'KickstartExchangeBridgeResources' => [
      'Vendor/KickstartSDK/Sources/KickstartExchange/Resources/PrivacyInfo.xcprivacy',
      'Vendor/KickstartSDK/Sources/KickstartExchange/Resources/Localizable.xcstrings'
    ]
  }
  s.dependency 'ExpoModulesCore'
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule',
    'SWIFT_VERSION' => '6.0'
  }
end
