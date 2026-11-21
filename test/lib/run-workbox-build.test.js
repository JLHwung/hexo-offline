import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, beforeEach, afterEach, it, mock } from "node:test";
import _runWorkboxBuild from "../../lib/lib/run-workbox-build.js";
const runWorkboxBuild = _runWorkboxBuild.default;
import _constants from "../../lib/lib/constants.js";
const { workerName } = _constants;
const baseDir = process.cwd();

describe("run-workbox-build", () => {
  const publicDir = path.resolve("./run-workbox-build.test");
  const indexHTMLPath = path.join(publicDir, "index.html");
  const workerPath = path.join(publicDir, workerName);
  beforeEach(() => {
    fs.mkdirSync(publicDir, { recursive: true });
  });
  afterEach(() => {
    fs.rmSync(publicDir, { recursive: true, force: true });
  });
  it("should generate service-worker.js when index.html presents", async () => {
    const html = ["<html>", "<body></body>", "</html>"].join("\n");
    fs.writeFileSync(indexHTMLPath, html);

    const context = {
      public_dir: publicDir,
      base_dir: baseDir,
      config: {},
      log: {
        error: mock.fn(),
        warn: mock.fn(),
        info: mock.fn(),
      },
    };
    await runWorkboxBuild.call(context);
    assert.ok(fs.existsSync(workerPath));
  });

  it("should activate a new service worker without waiting", async () => {
    const html = ["<html>", "<body></body>", "</html>"].join("\n");
    fs.writeFileSync(indexHTMLPath, html);

    const context = {
      public_dir: publicDir,
      base_dir: baseDir,
      config: {},
      log: {
        error: mock.fn(),
        warn: mock.fn(),
        info: mock.fn(),
      },
    };
    await runWorkboxBuild.call(context);
    const sw = fs.readFileSync(workerPath, "utf-8");
    // workbox-build emits an unconditional self.skipWaiting() when
    // skipWaiting is enabled, and a SKIP_WAITING message listener otherwise.
    assert.match(sw, /self\.skipWaiting\(\)/);
    assert.doesNotMatch(sw, /SKIP_WAITING/);
    assert.match(sw, /\.clientsClaim\(\)/);
  });

  it("should not generate service-worker.js when index.html is not found", async () => {
    const context = {
      public_dir: publicDir,
      base_dir: baseDir,
      config: {},
      log: {
        error: mock.fn(),
        warn: mock.fn(),
        info: mock.fn(),
      },
    };
    await runWorkboxBuild.call(context);
    assert.strictEqual(fs.existsSync(workerPath), false);
  });

  it("should print warning when 'offline' is in the config section", async () => {
    const html = ["<html>", "<body></body>", "</html>"].join("\n");
    fs.writeFileSync(indexHTMLPath, html);

    const context = {
      public_dir: publicDir,
      base_dir: baseDir,
      config: {
        offline: {},
      },
      log: {
        error: mock.fn(),
        warn: mock.fn(),
        info: mock.fn(),
      },
    };
    await runWorkboxBuild.call(context);
    assert.strictEqual(context.log.warn.mock.calls[0].arguments[0], `
Starting from hexo-offline v2 the 'offline' config in _config.yaml is
deprecated. Please create 'hexo-offline.config.cjs' in hexo root directory.
See https://github.com/JLHwung/hexo-offline#usage for more info.
`);
  });

  describe("with hexo-offline.config.cjs", () => {
    // hexo-offline.config.cjs is loaded with require(), which caches by path,
    // so each test gets its own base directory outside the repository.
    let hexoBaseDir;
    beforeEach(() => {
      hexoBaseDir = fs.mkdtempSync(path.join(os.tmpdir(), "hexo-offline-"));
      fs.writeFileSync(
        indexHTMLPath,
        ["<html>", "<body></body>", "</html>"].join("\n")
      );
    });
    afterEach(() => {
      fs.rmSync(hexoBaseDir, { recursive: true, force: true });
    });
    const runWithConfig = async (config) => {
      fs.writeFileSync(
        path.join(hexoBaseDir, "hexo-offline.config.cjs"),
        typeof config === "string"
          ? config
          : `module.exports = ${JSON.stringify(config)};`
      );
      const context = {
        public_dir: publicDir,
        base_dir: hexoBaseDir,
        config: {},
        log: {
          error: mock.fn(),
          warn: mock.fn(),
          info: mock.fn(),
        },
      };
      context.result = await runWorkboxBuild.call(context);
      return context;
    };

    it("should let users opt out of skipWaiting and clientsClaim", async () => {
      await runWithConfig({ skipWaiting: false, clientsClaim: false });
      const sw = fs.readFileSync(workerPath, "utf-8");
      assert.match(sw, /SKIP_WAITING/);
      assert.doesNotMatch(sw, /\.clientsClaim\(\)/);
    });

    it("should print each workbox-build warning once", async () => {
      const context = await runWithConfig({
        globPatterns: ["**/*.html", "**/*.does-not-exist"],
      });
      const warnings = context.log.warn.mock.calls.map(
        (call) => call.arguments[0]
      );
      assert.strictEqual(warnings.length, 1);
      assert.strictEqual(typeof warnings[0], "string");
      assert.match(warnings[0], /glob patterns doesn't match any files/);
    });

    it("should report an invalid hexo-offline.config.cjs and fall back to defaults", async () => {
      const context = await runWithConfig(
        "module.exports = { skipWaiting: false },"
      );
      const errors = context.log.error.mock.calls.map(
        (call) => call.arguments[0]
      );
      assert.strictEqual(errors.length, 1);
      assert.match(
        errors[0],
        /ignoring .*hexo-offline\.config\.cjs because it failed to load/
      );
      // The broken config's skipWaiting: false is not applied.
      assert.ok(context.result);
      const sw = fs.readFileSync(workerPath, "utf-8");
      assert.doesNotMatch(sw, /SKIP_WAITING/);
    });
  });
});
