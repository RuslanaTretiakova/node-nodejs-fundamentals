import { Transform } from "node:stream";

export const lineNumberer = () => {
  let line = 1;

  const transformer = new Transform({
    readableObjectMode: false,
    writableObjectMode: false,

    transform(chunk, encoding, callback) {
      const lines = chunk.toString().split("\n");
      const numbered = lines
        .map((l) => `${line++} | ${l}`)
        .join("\n");

      callback(null, numbered);
    }
  });

  process.stdin.pipe(transformer).pipe(process.stdout);
};

lineNumberer();
