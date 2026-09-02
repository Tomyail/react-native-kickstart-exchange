/**
 * Redirects the modules the package's public entry imports to deterministic
 * test stubs, so `node --test` can exercise the component without React
 * Native's runtime.
 */
const stubs = {
  react: new URL("./stubs/react.mjs", import.meta.url).href,
  "react-native": new URL("./stubs/react-native.mjs", import.meta.url).href,
  expo: new URL("./stubs/expo.mjs", import.meta.url).href,
};

export async function resolve(specifier, context, nextResolve) {
  return nextResolve(stubs[specifier] ?? specifier, context);
}
