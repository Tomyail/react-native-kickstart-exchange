/**
 * Minimal `expo` stub. `requireNativeView` returns an identifiable function so
 * tests can assert the props the component hands to the native view without
 * any native runtime.
 */
export function requireNativeView(name) {
  const nativeView = function NativeViewStub() {
    throw new Error("The native view stub must not be rendered.");
  };
  nativeView.moduleName = name;
  return nativeView;
}
