import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { createBrotliDecompress } from "node:zlib";

export const decompressDir = async () => {
  const inputDir = path.resolve("workspace/compressed");
  const archivePath = path.join(inputDir, "archive.br");
  const outputDir = path.resolve("workspace/decompressed");

  const exists = await fsp.stat(archivePath).catch(() => null);
  if (!exists) throw new Error("FS operation failed");

  await fsp.mkdir(outputDir, { recursive: true });

  const decompressor = createBrotliDecompress();
  const input = fs.createReadStream(archivePath);

  let json = "";

  await pipeline(
    input,
    decompressor,
    async function* (source) {
      for await (const chunk of source) {
        json += chunk.toString();
      }
    }
  );

  const files = JSON.parse(json);

  for (const file of files) {
    const outPath = path.join(outputDir, file.relative);
    await fsp.mkdir(path.dirname(outPath), { recursive: true });
    await fsp.copyFile(file.fullPath, outPath);
  }
};

await decompressDir();
