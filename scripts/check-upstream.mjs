import { readFile } from "node:fs/promises";
import {
  copiedPaths,
  metadataPath,
  selectedTreeHash,
  upstreamSource,
  vendorDir,
} from "./upstream.mjs";

const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
const vendorHash = await selectedTreeHash(vendorDir);
const copiedPathsMatch = JSON.stringify(metadata.copiedPaths) === JSON.stringify(copiedPaths);
const validCommit = /^[0-9a-f]{40}$/.test(metadata.commit ?? "");

if (
  metadata.upstream !== upstreamSource ||
  !metadata.tag ||
  !validCommit ||
  !copiedPathsMatch ||
  metadata.sourceSha256 !== vendorHash
) {
  throw new Error(
    "Vendored KickstartSDK does not match UPSTREAM.json. Run: pnpm sync:upstream -- --tag <tag>"
  );
}

console.log(`Verified vendored KickstartSDK ${metadata.tag} (${metadata.commit})`);
