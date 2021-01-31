import fs from "fs";
import path from "path";
import { generateSW } from "workbox-build";
import { workerName } from "./constants";

const generateSWPrecacheConfig = (
  { root, publicDir },
  extraWorkboxBuildConfig
) => {
  const hexoPublicDir = publicDir;
  // const rootPrefix = root.replace(/\/$/, "");
  return Object.assign(
    {
      globPatterns: ["**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}"],
      globDirectory: hexoPublicDir,
      swDest: path.join(publicDir, workerName),
    },
    extraWorkboxBuildConfig
  );
};

const runWorkboxBuild = function () {
  const { public_dir: publicDir, config } = this;

  const { root, offline } = config;

  // early return when no index.html presets in public directory
  const indexHTMLPath = path.join(publicDir, "index.html");
  if (!fs.existsSync(indexHTMLPath)) {
    return Promise.resolve();
  }

  const SWPrecacheConfig = generateSWPrecacheConfig(
    { root, publicDir },
    offline
  );

  return generateSW(SWPrecacheConfig);
};

export default runWorkboxBuild;
