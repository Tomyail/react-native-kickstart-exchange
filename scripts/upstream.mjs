import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const upstreamSource = "https://github.com/twostraws/KickstartSDK.git";
export const vendorDir = join(root, "ios", "Vendor", "KickstartSDK");
export const metadataPath = join(root, "UPSTREAM.json");
export const copiedPaths = ["LICENSE", "Sources/KickstartExchange"];

/** Reviewed local patches applied on top of the vendored upstream snapshot. */
export const patchesDir = join(root, "ios", "vendor-patches");

export function patchFiles(patches) {
  return (patches ?? []).map((patch) => {
    const relativePath = relative(root, join(root, patch));
    if (
      !relativePath.startsWith("ios/vendor-patches/") ||
      relativePath.includes("..") ||
      !relativePath.endsWith(".patch")
    ) {
      throw new Error(`Refusing patch outside ios/vendor-patches: ${patch}`);
    }
    return join(root, relativePath);
  });
}

function gitApply(cwd, patchPaths, reverse) {
  if (patchPaths.length === 0) return;
  execFileSync("git", ["apply", ...(reverse ? ["--reverse"] : []), ...patchPaths], {
    cwd,
    encoding: "utf8",
  });
}

function git(directory, args) {
  return execFileSync("git", args, { cwd: directory, encoding: "utf8" }).trim();
}

function identity(directory) {
  return {
    upstream: upstreamSource,
    tag: git(directory, ["describe", "--tags", "--exact-match", "HEAD"]),
    commit: git(directory, ["rev-parse", "HEAD"]),
  };
}

async function filesRecursively(directory) {
  if ((await stat(directory)).isFile()) return [directory];
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.sort((a, b) => a.name.localeCompare(b.name)).map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return filesRecursively(path);
    if (entry.isFile()) return [path];
    return [];
  }));
  return nested.flat();
}

export async function selectedTreeHash(directory) {
  const hasher = createHash("sha256");
  for (const copiedPath of copiedPaths) {
    for (const path of (await filesRecursively(join(directory, copiedPath))).sort()) {
      hasher.update(relative(directory, path));
      hasher.update("\0");
      hasher.update(await readFile(path));
      hasher.update("\0");
    }
  }
  return hasher.digest("hex");
}

/**
 * Proves, fully offline, that the vendored tree equals the recorded pristine
 * upstream snapshot plus the recorded patches: copy the vendor tree aside,
 * reverse every patch, and hash the result.
 */
export async function verifyPatches(metadata) {
  const patches = patchFiles(metadata.patches);
  if (patches.length === 0) return null;

  const tempRoot = await mkdtemp(join(tmpdir(), "kickstart-exchange-verify-"));
  try {
    const mirroredVendorLayout = join(tempRoot, "ios", "Vendor", "KickstartSDK");
    await mkdir(dirname(mirroredVendorLayout), { recursive: true });
    await cp(vendorDir, mirroredVendorLayout, { recursive: true });
    gitApply(tempRoot, patches, true);
    return await selectedTreeHash(mirroredVendorLayout);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

/** Runs an operation against a throwaway, immutable upstream tag checkout. */
export async function withUpstreamTag(tag, operation) {
  if (!tag || tag.startsWith("-")) {
    throw new Error("Provide an immutable upstream tag: pnpm sync:upstream -- --tag <tag>");
  }

  const tempRoot = await mkdtemp(join(tmpdir(), "kickstart-exchange-"));
  const checkout = join(tempRoot, "KickstartSDK");
  try {
    execFileSync("git", ["clone", "--depth", "1", "--branch", tag, upstreamSource, checkout], {
      stdio: "inherit",
    });
    const upstream = identity(checkout);
    if (upstream.tag !== tag) {
      throw new Error(`Requested ${tag}, but upstream resolved ${upstream.tag}.`);
    }
    return await operation(checkout, upstream);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

export async function syncVendor(tag) {
  return withUpstreamTag(tag, async (checkout, upstream) => {
    await rm(vendorDir, { recursive: true, force: true });
    await mkdir(vendorDir, { recursive: true });
    for (const copiedPath of copiedPaths) {
      await cp(join(checkout, copiedPath), join(vendorDir, copiedPath), { recursive: true });
    }

    const upstreamSha256 = await selectedTreeHash(vendorDir);

    // Local patches are part of the reviewed snapshot contract: they must
    // re-apply cleanly on the fresh copy, or the sync stops for review.
    gitApply(root, patchFiles(await currentPatchNames()));

    const metadata = {
      ...upstream,
      copiedPaths,
      patches: await currentPatchNames(),
      upstreamSha256,
      sourceSha256: await selectedTreeHash(vendorDir),
    };
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
    return metadata;
  });
}

async function currentPatchNames() {
  const entries = await readdir(patchesDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".patch"))
    .map((entry) => `ios/vendor-patches/${entry.name}`)
    .sort();
}
