import fs from "fs";
import os from "os";
import path from "path";
import { generateSW } from "workbox-build";
import { workerName } from "./constants.js";
import readRoute from "./read-route.js";

const defaultGlobPatterns = [
  "**/*.{js,mjs,html,css,png,jpg,gif,webp,svg,eot,ttf,woff,woff2}",
];

// How many routes are read and copied at the same time, unless Hexo is run
// with --concurrency.
const defaultConcurrency = 16;

function formatNumber(number) {
  try {
    return new Intl.NumberFormat().format(number);
  } catch {
    return number;
  }
}

// Name the public folder rather than the temporary copy that was globbed.
// Some warnings embed the path JSON-encoded, which escapes "\" on Windows.
function replaceGlobDirectory(warning, globDirectory, publicDir) {
  if (!publicDir) {
    return warning;
  }
  // Hexo's public_dir ends with a separator; globDirectory doesn't.
  const target = publicDir.replace(/[\\/]+$/, "");
  const json = (value) => JSON.stringify(value).slice(1, -1);
  // Replace with functions, so "$" in the path is not a replacement pattern.
  return warning
    .replaceAll(json(globDirectory), () => json(target))
    .replaceAll(globDirectory, () => target);
}

function printSWResult(
  { count, size, warnings },
  logger,
  globDirectory,
  publicDir,
) {
  for (const warning of warnings) {
    logger.warn(replaceGlobDirectory(warning, globDirectory, publicDir));
  }
  logger.info(
    `Generated manifests for ${formatNumber(
      count,
    )} files. Total size: ${formatNumber(size)} bytes.`,
  );
}

// The glob patterns workbox-build will match against globDirectory, in a form
// that can be matched against route paths: `precache` for globPatterns, and
// `templates` for templatedURLs dependencies, which workbox-build hashes
// whatever their size.
function getGlobPatterns({ globPatterns, templatedURLs }) {
  const templates = [];
  for (const dependencies of Object.values(templatedURLs ?? {})) {
    if (Array.isArray(dependencies)) {
      templates.push(...dependencies);
    }
  }
  return {
    precache: toRoutePatterns(Array.isArray(globPatterns) ? globPatterns : []),
    templates: toRoutePatterns(templates),
  };
}

// Glob patterns in a form that can be matched against route paths. Invalid
// entries are dropped here; workbox-build reports them when it validates the
// config.
function toRoutePatterns(patterns) {
  return (
    patterns
      .filter((pattern) => typeof pattern === "string")
      // glob resolves "./**/*.css" against globDirectory; route paths have no "./".
      .map((pattern) => pattern.replace(/^\.\//, ""))
  );
}

// workbox-build's defaults for the options that limit what is precached.
const defaultGlobIgnores = ["**/node_modules/**/*"];
const defaultMaximumFileSize = 2 * 1024 * 1024;

// Files this build writes itself: the service worker and the Workbox runtime,
// with their source maps. They must not be precached.
function isGeneratedFile(routePath) {
  return (
    routePath === workerName ||
    routePath === `${workerName}.map` ||
    /^workbox-[0-9a-f]+\.js(\.map)?$/.test(routePath)
  );
}

// Run `fn` over `items` with at most `limit` calls in flight. Waits for every
// call to settle before rethrowing the first error.
async function forEachConcurrently(items, limit, fn) {
  let next = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (next < items.length) {
        await fn(items[next++]);
      }
    },
  );
  const failed = (await Promise.allSettled(workers)).find(
    ({ status }) => status === "rejected",
  );
  if (failed) {
    throw failed.reason;
  }
}

/**
 * Generate the service worker from Hexo's routes and add the generated files
 * as routes, so Hexo writes them to the public folder (and deployers pick them
 * up) like any other generated file.
 *
 * workbox-build only globs files on disk, so routes that may be precached are
 * copied to a temporary directory first.
 */
export default async function runWorkboxBuild(
  route,
  logger,
  extraConfig,
  publicDir,
  concurrency = defaultConcurrency,
) {
  if (typeof path.posix.matchesGlob !== "function") {
    throw new Error(
      `hexo-offline requires Node.js ^20.17.0 or >=22.5.0 (current: ${process.version}).`,
    );
  }
  const workboxConfig = {
    skipWaiting: true,
    clientsClaim: true,
    ...extraConfig,
  };
  workboxConfig.globPatterns ??= defaultGlobPatterns;
  // generateSW appends to globIgnores; don't change the user's array.
  if (Array.isArray(workboxConfig.globIgnores)) {
    workboxConfig.globIgnores = [...workboxConfig.globIgnores];
  }
  const patterns = getGlobPatterns(workboxConfig);
  const ignores = toRoutePatterns(
    Array.isArray(workboxConfig.globIgnores)
      ? workboxConfig.globIgnores
      : defaultGlobIgnores,
  );
  const maximumFileSize =
    workboxConfig.maximumFileSizeToCacheInBytes ?? defaultMaximumFileSize;
  const matches = (routePath, globs) =>
    globs.some((glob) => path.posix.matchesGlob(routePath, glob));

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hexo-offline-"));
  try {
    const globDirectory = path.join(tmpDir, "public");
    const outDir = path.join(tmpDir, "out");
    fs.mkdirSync(globDirectory);

    // workbox-build applies the exact glob rules later; this only picks the
    // routes it may precache, so nothing else is read or copied.
    const candidates = route
      .list()
      .filter(
        (routePath) =>
          !isGeneratedFile(routePath) &&
          matches(routePath, [...patterns.precache, ...patterns.templates]) &&
          !matches(routePath, ignores),
      );
    await forEachConcurrently(candidates, concurrency, async (routePath) => {
      let content;
      try {
        content = await readRoute(route, routePath);
      } catch {
        // Hexo reports the error itself when it writes this route.
        logger.warn(
          `hexo-offline: not precaching ${routePath} because it failed to generate.`,
        );
        return;
      }
      // Keep pages, styles and scripts, which Hexo may have rendered, so they
      // aren't rendered a second time. Other files (images, fonts) are usually
      // copied as-is, cheap to read again and may be large, so they are not kept.
      if (/\.(html|css|m?js)$/.test(routePath)) {
        route.set(routePath, {
          data: content,
          modified: route.isModified(routePath),
        });
      }
      // workbox-build would skip it anyway; don't copy it. templatedURLs
      // dependencies are hashed whatever their size, so they are always copied.
      if (
        content.length > maximumFileSize &&
        !matches(routePath, patterns.templates)
      ) {
        logger.warn(
          `hexo-offline: not precaching ${routePath} because it is ${formatNumber(
            content.length,
          )} bytes, larger than maximumFileSizeToCacheInBytes (${formatNumber(
            maximumFileSize,
          )}).`,
        );
        return;
      }
      const dest = path.join(globDirectory, routePath);
      try {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, content);
      } catch (err) {
        logger.warn(
          `hexo-offline: not precaching ${routePath} because it could not be copied to a temporary folder: ${err.message}`,
        );
      }
    });

    const result = await generateSW({
      ...workboxConfig,
      globDirectory,
      swDest: path.join(outDir, workerName),
    });

    for (const file of result.filePaths) {
      const routePath = path.relative(outDir, file).split(path.sep).join("/");
      route.set(routePath, fs.readFileSync(file));
    }

    printSWResult(result, logger, globDirectory, publicDir);
    return result;
  } finally {
    // Failing to clean up must not fail the build (or hide its error), e.g.
    // when another process briefly holds a file open on Windows.
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true, maxRetries: 3 });
    } catch (err) {
      logger.warn(
        `hexo-offline: could not remove the temporary folder ${tmpDir}: ${err.message}`,
      );
    }
  }
}
