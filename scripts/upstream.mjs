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

    const metadata = {
      ...upstream,
      copiedPaths,
      sourceSha256: await selectedTreeHash(checkout),
    };
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
    return metadata;
  });
}
