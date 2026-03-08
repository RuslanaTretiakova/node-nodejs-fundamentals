import { promises as fs } from "fs";
import path from "path";

export const snapshot = async (workspacePath) => {
  try {
    if (!workspacePath) throw new Error("FS operation failed");

    const root = path.resolve(workspacePath);

    const exists = await fs.stat(root).catch(() => null);
    if (!exists) throw new Error("FS operation failed");

    const entries = [];

    const walk = async (dir) => {
      const items = await fs.readdir(dir, { withFileTypes: true });

      for (const item of items) {
        const full = path.join(dir, item.name);
        const rel = path.relative(root, full);

        if (item.isDirectory()) {
          entries.push({ path: rel, type: "directory" });
          await walk(full);
        } else {
          const data = await fs.readFile(full);
          entries.push({
            path: rel,
            type: "file",
            size: data.length,
            content: data.toString("base64")
          });
        }
      }
    };

    await walk(root);

    const snapshotObj = {
      rootPath: root,
      entries
    };

    const snapshotPath = path.join(path.dirname(root), "snapshot.json");
    await fs.writeFile(snapshotPath, JSON.stringify(snapshotObj, null, 2));
  } catch {
    throw new Error("FS operation failed");
  }
};

const workspacePath = process.argv[2];
snapshot(workspacePath);