import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";

export const split = async () => {
  const linesIndex = process.argv.indexOf("--lines");
  const maxLines = linesIndex !== -1 ? Number(process.argv[linesIndex + 1]) : 10;

  const sourcePath = path.resolve("source.txt");
  const exists = await fsp.stat(sourcePath).catch(() => null);
  if (!exists) {
    console.error("source.txt not found");
    process.exit(1);
  }

  const stream = fs.createReadStream(sourcePath);
  const rl = readline.createInterface({ input: stream });

  let chunk = 1;
  let lineCount = 0;
  let buffer = [];

  for await (const line of rl) {
    buffer.push(line);
    lineCount++;

    if (lineCount === maxLines) {
      await fsp.writeFile(`chunk_${chunk}.txt`, buffer.join("\n"));
      chunk++;
      lineCount = 0;
      buffer = [];
    }
  }

  if (buffer.length > 0) {
    await fsp.writeFile(`chunk_${chunk}.txt`, buffer.join("\n"));
  }
};

split();
