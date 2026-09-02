// Minimal `react-native` stub. `Platform.OS` is read lazily so tests select
// the platform before dynamically importing the entry (the module resolves the
// native view at import time).
export const Platform = {
  get OS() {
    return globalThis.__TEST_PLATFORM__ ?? "ios";
  },
};
