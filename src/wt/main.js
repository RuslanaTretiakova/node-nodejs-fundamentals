import { Worker } from "node:worker_threads";
import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";

function mergeSortedArrays(arrays) {
  const result = [];
  const indices = new Array(arrays.length).fill(0);

  while (true) {
    let minVal = Infinity;
    let minIndex = -1;

    for (let i = 0; i < arrays.length; i++) {
      const idx = indices[i];
      if (idx < arrays[i].length && arrays[i][idx] < minVal) {
        minVal = arrays[i][idx];
        minIndex = i;
      }
    }

    if (minIndex === -1) break;

    result.push(minVal);
    indices[minIndex]++;
  }

  return result;
}

export const main = async () => {
  const filePath = path.resolve("data.json");
  const raw = await fs.readFile(filePath, "utf8");
  const numbers = JSON.parse(raw);

  const cpuCount = os.cpus().length;

  const chunkSize = Math.ceil(numbers.length / cpuCount);
  const chunks = [];
  for (let i = 0; i < cpuCount; i++) {
    chunks.push(numbers.slice(i * chunkSize, (i + 1) * chunkSize));
  }

  const workers = chunks.map((chunk, index) => {
    return new Promise((resolve) => {
      const worker = new Worker(path.resolve("src/wt/worker.js"));
      worker.postMessage(chunk);
      worker.on("message", (sortedChunk) => resolve({ index, sortedChunk }));
    });
  });

  const results = await Promise.all(workers);
  const sortedChunks = results
    .sort((a, b) => a.index - b.index)
    .map((r) => r.sortedChunk);

  const finalSorted = mergeSortedArrays(sortedChunks);

  console.log(finalSorted);
};

await main();
