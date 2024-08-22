import assert from "node:assert";
import fs from "node:fs";
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
        warn: mock.fn(),
        info: mock.fn(),
      },
    };
    await runWorkboxBuild.call(context);
    assert.ok(fs.existsSync(workerPath));
  });

  it("should not generate service-worker.js when index.html is not found", async () => {
    const context = {
      public_dir: publicDir,
      base_dir: baseDir,
      config: {},
      log: {
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
});
