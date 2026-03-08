import { promises as fs } from "fs";
import path from "path";

export const restore = async (workspacePath) => {
  try {
    if (!workspacePath) throw new Error("FS operation failed");

    const root = path.resolve(workspacePath);
    const snapshotPath = path.join(path.dirname(root), "snapshot.json");

    const snapshotExists = await fs.stat(snapshotPath).catch(() => null);
    if (!snapshotExists) throw new Error("FS operation failed");

    const restoredPath = path.join(path.dirname(root), "workspace_restored");

    const already = await fs.stat(restoredPath).catch(() => null);
    if (already) throw new Error("FS operation failed");

    await fs.mkdir(restoredPath);

    const snapshot = JSON.parse(await fs.readFile(snapshotPath, "utf8"));

    for (const entry of snapshot.entries) {
      const target = path.join(restoredPath, entry.path);

      if (entry.type === "directory") {
        await fs.mkdir(target, { recursive: true });
      } else {
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.writeFile(target, Buffer.from(entry.content, "base64"));
      }
    }
  } catch {
    throw new Error("FS operation failed");
  }
};

const workspacePath = process.argv[2];
restore(workspacePath);
