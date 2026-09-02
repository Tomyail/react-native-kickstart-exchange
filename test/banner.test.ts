import assert from "node:assert/strict";
import { test } from "node:test";

type BannerModule = typeof import("../src/index.ts");

/**
 * Loads a fresh instance of the entry module bound to the requested platform.
 * The query string busts the ESM cache; `Platform.OS` is read at import time
 * inside the entry, so each platform needs its own module instance.
 */
async function loadBannerModule(platform: string): Promise<BannerModule> {
  globalThis.__TEST_PLATFORM__ = platform;
  return import(`../src/index.ts?platform=${platform}`);
}

test("iOS renders the native view with default style props omitted", async () => {
  const { KickstartExchangeBanner } = await loadBannerModule("ios");

  const element = KickstartExchangeBanner({ apiKey: "preview" });

  assert.ok(element);
  assert.equal(element.type.moduleName, "KickstartExchange");

  const { props } = element;
  assert.equal(props.apiKey, "preview");
  assert.deepEqual(props.style, [{ height: 164 }, undefined]);
  // Style props default to "not set"; the SDK defaults live natively.
  assert.equal(props.colorScheme, undefined);
  assert.equal(props.backgroundColor, undefined);
  assert.equal(props.cornerStyle, undefined);
  assert.equal(props.strokeColor, undefined);
  assert.equal(props.disclosureBackgroundColor, undefined);
  assert.equal(props.actionTextColor, undefined);
  assert.equal(props.testID, undefined);
});

test("iOS forwards every styling prop and merges the layout style", async () => {
  const { KickstartExchangeBanner } = await loadBannerModule("ios");

  const customStyle = { marginHorizontal: 16 };
  const element = KickstartExchangeBanner({
    apiKey: "live-key",
    style: customStyle,
    testID: "banner",
    colorScheme: "dark",
    backgroundColor: "#201c18",
    cornerStyle: "square",
    strokeColor: "#44392f",
    disclosureBackgroundColor: "#302922",
    actionTextColor: "#dc815d",
  });

  assert.ok(element);
  assert.deepEqual(element.props.style, [{ height: 164 }, customStyle]);
  assert.equal(element.props.apiKey, "live-key");
  assert.equal(element.props.testID, "banner");
  assert.equal(element.props.colorScheme, "dark");
  assert.equal(element.props.backgroundColor, "#201c18");
  assert.equal(element.props.cornerStyle, "square");
  assert.equal(element.props.strokeColor, "#44392f");
  assert.equal(element.props.disclosureBackgroundColor, "#302922");
  assert.equal(element.props.actionTextColor, "#dc815d");
});

test("apiKey must be non-empty", async () => {
  const { KickstartExchangeBanner } = await loadBannerModule("ios");

  assert.throws(() => KickstartExchangeBanner({ apiKey: "" }), /non-empty apiKey/);
  assert.throws(() => KickstartExchangeBanner({ apiKey: "   " }), /non-empty apiKey/);
});

test("Android renders null", async () => {
  const { KickstartExchangeBanner } = await loadBannerModule("android");
  assert.equal(KickstartExchangeBanner({ apiKey: "preview" }), null);
});

test("Web renders null", async () => {
  const { KickstartExchangeBanner } = await loadBannerModule("web");
  assert.equal(KickstartExchangeBanner({ apiKey: "preview", colorScheme: "light" }), null);
});
