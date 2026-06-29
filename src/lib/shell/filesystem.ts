import LightningFS from "@isomorphic-git/lightning-fs";

// One LightningFS instance per namespace. Multiple live instances on the same
// namespace fight over the same Web Lock, and a wipe (init with `wipe: true`)
// steals that lock — aborting the other instance with
// "Lock broken by another request with the 'steal' option". Caching guarantees a
// single instance so a wipe only ever releases/re-acquires its own free lock.
const instances = new Map<string, any>();

export function createFS(namespace: string): any {
  let fs = instances.get(namespace);
  if (!fs) {
    fs = new LightningFS(namespace);
    instances.set(namespace, fs);
  }
  return fs;
}

export async function destroyFS(namespace: string): Promise<void> {
  const fs = createFS(namespace); // reuse the singleton; no competing instance to steal from
  await fs.init(namespace, { wipe: true });
}

export function resolvePath(cwd: string, target: string): string {
  if (target.startsWith("/")) {
    return normalizePath(target);
  }

  const parts = cwd.split("/").filter(Boolean);
  const targetParts = target.split("/").filter(Boolean);

  for (const part of targetParts) {
    if (part === "..") {
      parts.pop();
    } else if (part !== ".") {
      parts.push(part);
    }
  }

  return `/${parts.join("/")}`;
}

function normalizePath(p: string): string {
  const parts = p.split("/").filter(Boolean);
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === "..") resolved.pop();
    else if (part !== ".") resolved.push(part);
  }
  return `/${resolved.join("/")}`;
}
