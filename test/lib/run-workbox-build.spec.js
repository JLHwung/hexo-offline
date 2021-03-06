import fs from "fs";
import path from "path";
import rimraf from "rimraf";
import runWorkboxBuild from "../../src/lib/run-workbox-build.js";
import { workerName } from "../../src/lib/constants";
const baseDir = process.cwd();

describe("run-workbox-build", () => {
  const publicDir = path.resolve("./run-workbox-build.spec");
  const indexHTMLPath = path.join(publicDir, "index.html");
  const workerPath = path.join(publicDir, workerName);
  beforeAll(() => {
    rimraf.sync(publicDir);
    fs.mkdirSync(publicDir);
    const html = ["<html>", "<body></body>", "</html>"].join("\n");
    fs.writeFileSync(indexHTMLPath, html);
  });
  afterAll((cb) => {
    rimraf(publicDir, cb);
  });
  it("should generate service-worker.js when index.html presents", async () => {
    const context = {
      public_dir: publicDir,
      base_dir: baseDir,
      config: {},
      log: {
        warn: jest.fn(),
        info: jest.fn(),
      },
    };
    await runWorkboxBuild.call(context);
    expect(fs.existsSync(workerPath)).toBe(true);
  });
});

describe("run-workbox-build", () => {
  const publicDir = path.resolve("./run-workbox-build.spec");
  const indexHTMLPath = path.join(publicDir, "index.html");
  const workerPath = path.join(publicDir, workerName);
  beforeAll(() => {
    rimraf.sync(publicDir);
    fs.mkdirSync(publicDir);
  });
  afterAll((cb) => {
    rimraf(publicDir, cb);
  });

  it("should not generate service-worker.js when index.html is not found", async () => {
    const context = {
      public_dir: publicDir,
      base_dir: baseDir,
      config: {},
      log: {
        warn: jest.fn(),
        info: jest.fn(),
      },
    };
    await runWorkboxBuild.call(context);
    expect(fs.existsSync(workerPath)).toBe(false);
  });
});

describe("run-workbox-build", () => {
  const publicDir = path.resolve("./run-workbox-build.spec");
  const indexHTMLPath = path.join(publicDir, "index.html");
  beforeAll(() => {
    rimraf.sync(publicDir);
    fs.mkdirSync(publicDir);
    const html = ["<html>", "<body></body>", "</html>"].join("\n");
    fs.writeFileSync(indexHTMLPath, html);
  });
  afterAll((cb) => {
    rimraf(publicDir, cb);
  });

  it("should print warning when 'offline' is in the config section", async () => {
    const context = {
      public_dir: publicDir,
      base_dir: baseDir,
      config: {
        offline: {},
      },
      log: {
        warn: jest.fn(),
        info: jest.fn(),
      },
    };
    await runWorkboxBuild.call(context);
    expect(context.log.warn.mock.calls[0][0]).toMatchInlineSnapshot(`
      "
      Starting from hexo-offline v2 the 'offline' config in _config.yaml is
      deprecated. Please create 'hexo-offline.config.cjs' in hexo root directory.
      See https://github.com/JLHwung/hexo-offline#usage for more info.
      "
    `);
  });
});
