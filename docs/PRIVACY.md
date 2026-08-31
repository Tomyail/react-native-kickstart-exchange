# Privacy guidance for host applications

Using this wrapper with a live Kickstart Exchange key adds advertising functionality to the host application.

The vendored KickstartSDK privacy manifest declares collection of:

- Product Interaction
- Advertising Data

Its declared purposes include Third Party Advertising, Developer Advertising, Analytics, and App Functionality.

## Host responsibilities

Before shipping, the host application's publisher must:

1. Review the current upstream `PrivacyInfo.xcprivacy` bundled at `ios/Vendor/KickstartSDK/Sources/KickstartExchange/Resources/PrivacyInfo.xcprivacy`.
2. Update App Store Connect App Privacy answers to match the host's actual integration.
3. Update its privacy policy and any previous “no telemetry” or “no advertising data” claims.
4. Determine whether consent, regional disclosures, parental controls, or age-gating apply to its users and jurisdictions.
5. Use a live key only after completing those obligations.

The `preview` key is intended for local development and Simulator validation; it does not remove these obligations for a later live integration.
