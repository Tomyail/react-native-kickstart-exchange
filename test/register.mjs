import { register } from "node:module";

// Loaded via `node --import ./test/register.mjs` before the test files run.
register(new URL("./stub-loader.mjs", import.meta.url));
