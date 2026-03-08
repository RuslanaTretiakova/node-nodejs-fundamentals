import { promises as fs } from "fs";
import path from "path";

export const findByExt = async (workspacePath) => {
  try {
    if (!workspacePath) throw new Error("FS operation failed");

    const root = path.resolve(workspacePath);

    const exists = await fs.stat(root).catch(() => null);
    if (!exists) throw new Error("FS operation failed");

    const args = process.argv.slice(2);
    const extIndex = args.indexOf("--ext");
    let ext = ".txt";

    if (extIndex !== -1) {
      const raw = args[extIndex + 1];
      ext = raw.startsWith(".") ? raw : "." + raw;
    }

    const results = [];

    const walk = async (dir) => {
      const items = await fs.readdir(dir, { withFileTypes: true });

      for (const item of items) {
        const full = path.join(dir, item.name);
        const rel = path.relative(root, full);

        if (item.isDirectory()) {
          await walk(full);
        } else if (item.name.endsWith(ext)) {
          results.push(rel);
        }
      }
    };

    await walk(root);

    results.sort().forEach((r) => console.log(r));
  } catch {
    throw new Error("FS operation failed");
  }
};

const workspacePath = process.argv[2];
findByExt(workspacePath);