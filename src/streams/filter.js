import { Transform } from "node:stream";

export const filter = () => {
  const patternIndex = process.argv.indexOf("--pattern");
  if (patternIndex === -1 || !process.argv[patternIndex + 1]) {
    console.error("Pattern not provided");
    process.exit(1);
  }

  const pattern = process.argv[patternIndex + 1];

  const transformer = new Transform({
    transform(chunk, encoding, callback) {
      const lines = chunk.toString().split("\n");
      const filtered = lines.filter((l) => l.includes(pattern)).join("\n");
      callback(null, filtered);
    }
  });

  process.stdin.pipe(transformer).pipe(process.stdout);
};

filter();
