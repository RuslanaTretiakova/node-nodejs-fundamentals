import { promises as fs } from "fs";
import path from "path";

export const merge = async (workspacePath) => {
  try {
    if (!workspacePath) throw new Error("FS operation failed");

    const root = path.resolve(workspacePath);
    const partsDir = path.join(root, "parts");

    const exists = await fs.stat(partsDir).catch(() => null);
    if (!exists) throw new Error("FS operation failed");

    const args = process.argv.slice(2);
    const filesIndex = args.indexOf("--files");

    let files = [];

    if (filesIndex !== -1) {
      files = args[filesIndex + 1].split(",");
      for (const f of files) {
        const full = path.join(partsDir, f);
        const ok = await fs.stat(full).catch(() => null);
        if (!ok) throw new Error("FS operation failed");
      }
    } else {
      const all = await fs.readdir(partsDir);
      files = all.filter((f) => f.endsWith(".txt")).sort();
      if (files.length === 0) throw new Error("FS operation failed");
    }

    let output = "";

    for (const file of files) {
      const content = await fs.readFile(path.join(partsDir, file), "utf8");
      output += content;
    }

    await fs.writeFile(path.join(root, "merged.txt"), output);
  } catch {
    throw new Error("FS operation failed");
  }
};

const workspacePath = process.argv[2];
merge(workspacePath);
