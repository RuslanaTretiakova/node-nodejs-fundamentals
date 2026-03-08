import path from "node:path";
import { pathToFileURL } from "node:url";
import fs from "node:fs/promises";

export const dynamic = async () => {
  const pluginName = process.argv[2];

  if (!pluginName) {
    console.log("Plugin not found");
    process.exit(1);
  }

  const pluginPath = path.resolve("src/modules/plugins", `${pluginName}.js`);

  const exists = await fs.stat(pluginPath).catch(() => null);
  if (!exists) {
    console.log("Plugin not found");
    process.exit(1);
  }

  try {
    const moduleUrl = pathToFileURL(pluginPath).href;
    const plugin = await import(moduleUrl);

    if (typeof plugin.run !== "function") {
      console.log("Plugin not found");
      process.exit(1);
    }

    const result = plugin.run();
    console.log(result);
  } catch {
    console.log("Plugin not found");
    process.exit(1);
  }
};

dynamic();
