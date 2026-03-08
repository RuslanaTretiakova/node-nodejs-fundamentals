import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

export const verify = async () => {
  const checksumsPath = path.resolve("checksums.json");

  const exists = await fs.stat(checksumsPath).catch(() => null);
  if (!exists) throw new Error("FS operation failed");

  let data;
  try {
    const raw = await fs.readFile(checksumsPath, "utf8");
    data = JSON.parse(raw);
  } catch {
    throw new Error("FS operation failed");
  }

  for (const [filename, expectedHash] of Object.entries(data)) {
    const filePath = path.resolve(filename);

    const fileExists = await fs.stat(filePath).catch(() => null);
    if (!fileExists) {
      console.log(`${filename} — FAIL`);
      continue;
    }

    const hash = createHash("sha256");
    const stream = createReadStream(filePath);

    const actualHash = await new Promise((resolve, reject) => {
      stream.on("data", (chunk) => hash.update(chunk));
      stream.on("end", () => resolve(hash.digest("hex")));
      stream.on("error", reject);
    });

    if (actualHash === expectedHash) {
      console.log(`${filename} — OK`);
    } else {
      console.log(`${filename} — FAIL`);
    }
  }
};

verify();