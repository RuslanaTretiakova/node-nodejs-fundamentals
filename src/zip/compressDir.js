import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { createBrotliCompress } from "node:zlib";

export const compressDir = async () => {
  const inputDir = path.resolve("workspace/toCompress");
  const outputDir = path.resolve("workspace/compressed");
  const archivePath = path.join(outputDir, "archive.br");

  const exists = await fsp.stat(inputDir).catch(() => null);
  if (!exists) throw new Error("FS operation failed");

  await fsp.mkdir(outputDir, { recursive: true });

  const files = [];

  async function walk(dir) {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        const relative = path.relative(inputDir, fullPath);
        files.push({ fullPath, relative });
      }
    }
  }

  await walk(inputDir);

  const json = JSON.stringify(files);
  const jsonStream = fs.ReadStream.from(json);

  const compressor = createBrotliCompress();
  const output = fs.createWriteStream(archivePath);

  await pipeline(jsonStream, compressor, output);
};

await compressDir();
