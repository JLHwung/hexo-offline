import fs from "fs";
import path from "path";
import { workerName } from "./constants.js";

// Options that no longer apply: the service worker is built from Hexo's
// generated routes and always emitted as a route named `workerName`.
const removedOptions = ["globDirectory", "swDest"];

export default function loadConfig({ base_dir: baseDir, config, log: logger }) {
  let offline;
  if (config && "offline" in config) {
    logger.warn(`
Starting from hexo-offline v2 the 'offline' config in _config.yaml is
deprecated. Please create 'hexo-offline.config.cjs' in hexo root directory.
See https://github.com/JLHwung/hexo-offline#usage for more info.
`);
    offline = config.offline;
  }

  // A missing config file is fine. If it exists but fails to load, report it
  // and still generate a service worker without it, rather than shipping a
  // site without an up-to-date worker.
  const configPath = path.resolve(baseDir, "hexo-offline.config.cjs");
  try {
    if (fs.existsSync(configPath)) {
      // Re-read the config file itself (not modules it requires) on every
      // build in a long-running process.
      delete require.cache[require.resolve(configPath)];
      offline = require(configPath);
    }
  } catch (err) {
    logger.error(
      `hexo-offline: ignoring ${configPath} because it failed to load:\n${err?.stack ?? String(err)}`
    );
  }

  if (offline == null) {
    return {};
  }
  if (typeof offline !== "object") {
    logger.warn(
      `hexo-offline: ignoring the offline config because it is not an object.`
    );
    return {};
  }

  const ignored = removedOptions.filter((key) => key in offline);
  if (ignored.length > 0) {
    logger.warn(
      `hexo-offline: ignoring ${ignored.map((key) => `'${key}'`).join(" and ")}. ` +
        `Since hexo-offline v5 the service worker is built from the files Hexo ` +
        `generates and is always written to '${workerName}' in the public folder.`
    );
    offline = { ...offline };
    for (const key of ignored) {
      delete offline[key];
    }
  }
  return offline;
}
