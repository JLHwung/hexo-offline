import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, beforeEach, afterEach, it, mock } from "node:test";
import _loadConfig from "../../lib/lib/load-config.js";
const loadConfig = _loadConfig.default;

describe("load-config", () => {
  // hexo-offline.config.cjs is loaded with require(), which caches by path,
  // so each test gets its own base directory.
  let baseDir;
  beforeEach(() => {
    baseDir = fs.mkdtempSync(path.join(os.tmpdir(), "hexo-offline-"));
  });
  afterEach(() => {
    fs.rmSync(baseDir, { recursive: true, force: true });
  });
  const load = ({ configFile, config = {} } = {}) => {
    if (configFile !== undefined) {
      fs.writeFileSync(path.join(baseDir, "hexo-offline.config.cjs"), configFile);
    }
    const log = { error: mock.fn(), warn: mock.fn(), info: mock.fn() };
    const result = loadConfig({ base_dir: baseDir, config, log });
    const messages = (fn) => fn.mock.calls.map((call) => call.arguments[0]);
    return { result, errors: messages(log.error), warnings: messages(log.warn) };
  };

  it("should return an empty config when there is none", () => {
    const { result, errors, warnings } = load();
    assert.deepStrictEqual(result, {});
    assert.deepStrictEqual(errors, []);
    assert.deepStrictEqual(warnings, []);
  });

  it("should load hexo-offline.config.cjs", () => {
    const { result } = load({ configFile: "module.exports = { skipWaiting: false };" });
    assert.deepStrictEqual(result, { skipWaiting: false });
  });

  it("should warn about the deprecated 'offline' section in _config.yml", () => {
    const { result, warnings } = load({ config: { offline: { clientsClaim: false } } });
    assert.deepStrictEqual(result, { clientsClaim: false });
    assert.match(warnings[0], /'offline' config in _config\.yaml is\ndeprecated/);
  });

  it("should report an invalid hexo-offline.config.cjs and ignore it", () => {
    const { result, errors } = load({
      configFile: "module.exports = { skipWaiting: false },",
    });
    assert.deepStrictEqual(result, {});
    assert.strictEqual(errors.length, 1);
    assert.match(errors[0], /ignoring .*hexo-offline\.config\.cjs because it failed to load/);
  });

  it("should pick up changes to hexo-offline.config.cjs", () => {
    load({ configFile: "module.exports = { skipWaiting: false };" });
    const { result } = load({ configFile: "module.exports = { skipWaiting: true };" });
    assert.deepStrictEqual(result, { skipWaiting: true });
  });

  it("should ignore an offline config that is not an object", () => {
    const { result, warnings } = load({ config: { offline: true } });
    assert.deepStrictEqual(result, {});
    assert.match(warnings.at(-1), /not an object/);
  });

  it("should drop globDirectory and swDest with a warning", () => {
    const { result, warnings } = load({
      configFile:
        'module.exports = { globDirectory: "public", swDest: "public/sw.js", skipWaiting: false };',
    });
    assert.deepStrictEqual(result, { skipWaiting: false });
    assert.strictEqual(warnings.length, 1);
    assert.match(warnings[0], /ignoring 'globDirectory' and 'swDest'/);
  });
});
