import loadConfig from "./load-config.js";
import injectSWRegister from "./inject-sw-register.js";
import readRoute from "./read-route.js";
import runWorkboxBuild from "./run-workbox-build.js";

// Only build the service worker when the site is generated for publishing:
// `hexo generate` and `hexo deploy`, or Hexo used through its API (no command).
// Skipped for `hexo server`, so local previews are not cached by a service
// worker, and for commands like `hexo list` that load the site without
// writing it.
function isPublishCommand(hexo) {
  const cmd = hexo.env?.cmd;
  if (!cmd) {
    return true;
  }
  const name = cmd.toLowerCase();
  const alias = hexo.extend?.console?.alias ?? {};
  return ["generate", "deploy"].includes(alias[name] ?? name);
}

// `hexo generate --watch`, or Hexo watching through its API (`hexo.watch()`,
// also used by hexo-server), which sets `_watchBox` (Hexo 5 to 8) until
// `hexo.unwatch()`.
function isWatching(hexo) {
  const args = hexo.env?.args ?? {};
  return Boolean(args.w || args.watch || hexo._watchBox != null);
}

// The limit from `hexo generate --concurrency <n>` (or `-c <n>`), if given.
function getConcurrency(hexo) {
  const args = hexo.env?.args ?? {};
  const value = Number.parseInt(args.c ?? args.concurrency, 10);
  return value > 0 ? value : undefined;
}

// Hexo instances already warned about watch mode (the filter runs on every
// change while watching).
const warnedAboutWatch = new WeakSet();

// after_generate filter: runs once Hexo has built every route and before the
// routes are written to the public folder (and before `hexo g -d` deploys).
export default async function () {
  if (!isPublishCommand(this)) {
    return;
  }

  const { route, log: logger } = this;
  // `hexo generate --watch` writes the public folder without the service
  // worker, so warn that it needs a regular build before deploying.
  if (isWatching(this)) {
    if (!warnedAboutWatch.has(this)) {
      warnedAboutWatch.add(this);
      logger.warn(
        "hexo-offline: the service worker is not generated in watch mode, and Hexo removes the previously generated one from the public folder. Run `hexo generate` before deploying.",
      );
    }
    return;
  }

  if (!route.list().includes("index.html")) {
    return;
  }

  let indexHTML;
  try {
    indexHTML = await readRoute(route, "index.html");
  } catch {
    // Leave the route alone: Hexo reports the error when it writes it.
    logger.warn(
      "hexo-offline: not generating the service worker because index.html failed to generate.",
    );
    return;
  }

  const config = loadConfig(this);
  // Inject before building, so index.html is precached with the script.
  route.set("index.html", injectSWRegister(indexHTML.toString()));
  try {
    // Don't return the result: after_generate filters pass their return value
    // on to the next filter.
    await runWorkboxBuild(
      route,
      logger,
      config,
      this.public_dir,
      getConcurrency(this),
    );
  } catch (err) {
    // Don't leave index.html registering a service worker that wasn't built.
    route.set("index.html", indexHTML);
    throw err;
  }
}
