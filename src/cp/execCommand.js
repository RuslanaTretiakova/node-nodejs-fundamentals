import { spawn } from "child_process";

export const execCommand = () => {
  const cmdString = process.argv[2];

  if (!cmdString) {
    console.error("FS operation failed");
    process.exit(1);
  }

  const child = spawn(cmdString, {
    shell: true,
    env: process.env,
    stdio: ["inherit", "pipe", "pipe"]
  });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.on("exit", (code) => {
    process.exit(code);
  });

  child.on("error", () => {
    console.error("FS operation failed");
    process.exit(1);
  });
};

execCommand();
