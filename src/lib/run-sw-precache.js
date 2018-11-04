import fs from "fs";
import path from "path";
import SWPrecache from "sw-precache";
import { workerName } from "./constants";

const generateSWPrecacheConfig = (
  { root, publicDir, logger },
  extraSWPrecacheConfig
) => {
  const hexoPublicDir = publicDir;
  const rootPrefix = root.replace(/\/$/, "");
  return Object.assign(
    {
      logger,
      replacePrefix: rootPrefix,
      staticFileGlobs: [
        hexoPublicDir + "/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}"
      ],
      stripPrefix: hexoPublicDir
    },
    extraSWPrecacheConfig
  );
};

const runSWPrecache = function() {
  const { public_dir: publicDir, config, log } = this;

  const { root, offline } = config;

  // early return when no index.html presets in public directory
  const indexHTMLPath = path.join(publicDir, "index.html");
  if (!fs.existsSync(indexHTMLPath)) {
    return Promise.resolve();
  }

  const SWPrecacheConfig = generateSWPrecacheConfig(
    { root, publicDir, logger: log.info.bind(log) },
    offline
  );

  return SWPrecache.write(path.join(publicDir, workerName), SWPrecacheConfig);
};

export default runSWPrecache;
