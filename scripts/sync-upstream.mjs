import { syncVendor } from "./upstream.mjs";

const tagIndex = process.argv.indexOf("--tag");
const tag = tagIndex === -1 ? undefined : process.argv[tagIndex + 1];
const metadata = await syncVendor(tag);
console.log(`Vendored KickstartSDK ${metadata.tag} (${metadata.commit})`);
