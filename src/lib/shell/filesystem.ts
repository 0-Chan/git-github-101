import LightningFS from "@isomorphic-git/lightning-fs";

export function createFS(namespace: string): any {
  return new LightningFS(namespace);
}

export async function destroyFS(namespace: string): Promise<void> {
  const fs = new LightningFS(namespace);
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
