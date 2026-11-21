import fs from "fs";
import path from "path";
import { generateSW } from "workbox-build";
import { workerName } from "./constants";

function generateSWPrecacheConfig({ publicDir }, extraWorkboxBuildConfig) {
  const hexoPublicDir = publicDir;
  return {
    globPatterns: [
      "**/*.{js,mjs,html,css,png,jpg,gif,webp,svg,eot,ttf,woff,woff2}",
    ],
    globDirectory: hexoPublicDir,
    swDest: path.join(publicDir, workerName),
    // Activate a new service worker as soon as it is installed instead of
    // waiting for every open tab to close, so a refresh after a deploy
    // serves the new content.
    skipWaiting: true,
    clientsClaim: true,
    ...extraWorkboxBuildConfig,
  };
}

function formatNumber(number) {
  try {
    return new Intl.NumberFormat().format(number);
  } catch {
    return number;
  }
}

function printSWResult({ count, size, warnings }, logger) {
  for (const warning of warnings) {
    logger.warn(warning);
  }
  logger.info(
    `Generated manifests for ${formatNumber(
      count
    )} files. Total size: ${formatNumber(size)} bytes.`
  );
}
export default async function runWorkboxBuild() {
  const {
    public_dir: publicDir,
    base_dir: baseDir,
    config,
    log: logger,
  } = this;

  // early return when no index.html presets in public directory
  const indexHTMLPath = path.join(publicDir, "index.html");
  if (!fs.existsSync(indexHTMLPath)) {
    return Promise.resolve();
  }

  let offline;
  if ("offline" in config) {
    logger.warn(`
Starting from hexo-offline v2 the 'offline' config in _config.yaml is
deprecated. Please create 'hexo-offline.config.cjs' in hexo root directory.
See https://github.com/JLHwung/hexo-offline#usage for more info.
`);
    offline = config.offline;
  }
  // A missing config file is fine. If it exists but fails to load, report it
  // and still generate a service worker without it, rather than leaving the
  // previous build's worker in place. Don't throw: this runs on before_exit,
  // so throwing would fail every hexo command.
  const configPath = path.resolve(baseDir, "hexo-offline.config.cjs");
  try {
    if (fs.existsSync(configPath)) {
      offline = require(configPath);
    }
  } catch (err) {
    logger.error(
      `hexo-offline: ignoring ${configPath} because it failed to load:\n${err?.stack ?? String(err)}`
    );
  }

  const SWPrecacheConfig = generateSWPrecacheConfig({ publicDir }, offline);

  const result = await generateSW(SWPrecacheConfig);

  printSWResult(result, logger);

  return result;
}
