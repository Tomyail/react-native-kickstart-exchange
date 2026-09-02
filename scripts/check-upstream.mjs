import { readFile } from "node:fs/promises";
import {
  copiedPaths,
  metadataPath,
  patchFiles,
  selectedTreeHash,
  upstreamSource,
  vendorDir,
  verifyPatches,
} from "./upstream.mjs";

const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
const vendorHash = await selectedTreeHash(vendorDir);
const copiedPathsMatch = JSON.stringify(metadata.copiedPaths) === JSON.stringify(copiedPaths);
const validCommit = /^[0-9a-f]{40}$/.test(metadata.commit ?? "");

// Touch every recorded patch (and reject paths outside the patch directory)
// before hashing, so the metadata cannot silently drop a patch.
patchFiles(metadata.patches);

const reversedHash = await verifyPatches(metadata);
const pristineMatch =
  metadata.patches?.length > 0
    ? reversedHash === metadata.upstreamSha256
    : metadata.upstreamSha256 === undefined ||
      metadata.upstreamSha256 === metadata.sourceSha256;

if (
  metadata.upstream !== upstreamSource ||
  !metadata.tag ||
  !validCommit ||
  !copiedPathsMatch ||
  metadata.sourceSha256 !== vendorHash ||
  !pristineMatch
) {
  throw new Error(
    "Vendored KickstartSDK does not match UPSTREAM.json. Run: pnpm sync:upstream -- --tag <tag>"
  );
}

const patchSummary = metadata.patches?.length
  ? ` + ${metadata.patches.length} local patch(es)`
  : "";
console.log(
  `Verified vendored KickstartSDK ${metadata.tag} (${metadata.commit})${patchSummary}`
);
