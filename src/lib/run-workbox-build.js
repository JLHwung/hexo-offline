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
    logger.warn(warnings);
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
  try {
    offline = require(path.resolve(baseDir, "hexo-offline.config.cjs"));
  } catch {}

  const SWPrecacheConfig = generateSWPrecacheConfig({ publicDir }, offline);

  const result = await generateSW(SWPrecacheConfig);

  printSWResult(result, logger);

  return result;
}
