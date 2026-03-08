export const progress = () => {
  const args = process.argv.slice(2);

  const getArg = (name, def) => {
    const idx = args.indexOf(name);
    return idx !== -1 ? args[idx + 1] : def;
  };

  const duration = Number(getArg("--duration", 5000));
  const interval = Number(getArg("--interval", 100));
  const length = Number(getArg("--length", 30));
  const color = getArg("--color", null);

  const validColor = /^#[0-9A-Fa-f]{6}$/.test(color) ? color : null;

  let elapsed = 0;

  const timer = setInterval(() => {
    elapsed += interval;

    const percent = Math.min(100, Math.floor((elapsed / duration) * 100));
    const filled = Math.floor((percent / 100) * length);

    const fill = "█".repeat(filled);
    const empty = " ".repeat(length - filled);

    const coloredFill = validColor
      ? `\x1b[38;2;${parseInt(validColor.slice(1, 3), 16)};${parseInt(
          validColor.slice(3, 5),
          16
        )};${parseInt(validColor.slice(5, 7), 16)}m${fill}\x1b[0m`
      : fill;

    process.stdout.write(`\r[${coloredFill}${empty}] ${percent}%`);

    if (percent >= 100) {
      clearInterval(timer);
      console.log("\nDone!");
    }
  }, interval);
};

progress();
