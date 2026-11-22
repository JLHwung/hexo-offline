import assert from "node:assert";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { describe, beforeEach, afterEach, it, mock } from "node:test";
import _handler from "../../lib/lib/index.js";
const handler = _handler.default;

// Minimal stand-in for Hexo's router. Function routes are "rendered" on every
// read, like Hexo's routes during `hexo generate`; a function that throws
// makes the route stream emit an error, like a failing render.
class FakeRouter {
  constructor(routes) {
    this.routes = new Map(
      Object.entries(routes).map(([routePath, data]) => [
        routePath,
        { data, modified: true },
      ]),
    );
    this.renders = new Map();
  }
  list() {
    return [...this.routes.keys()];
  }
  get(routePath) {
    if (!this.routes.has(routePath)) return;
    const { data } = this.routes.get(routePath);
    if (typeof data !== "function") {
      return Readable.from([data]);
    }
    this.renders.set(routePath, (this.renders.get(routePath) ?? 0) + 1);
    return new Readable({
      read() {
        try {
          this.push(data());
          this.push(null);
        } catch (err) {
          this.destroy(err);
        }
      },
    });
  }
  isModified(routePath) {
    return this.routes.get(routePath)?.modified ?? false;
  }
  set(routePath, data) {
    this.routes.set(
      routePath,
      typeof data === "object" && data.data != null
        ? { modified: true, ...data }
        : { data, modified: true },
    );
  }
  text(routePath) {
    const { data } = this.routes.get(routePath);
    return Buffer.isBuffer(data) ? data.toString() : data;
  }
}

const indexHTML = "<html><body><p>home</p></body></html>";
const alias = {
  g: "generate",
  generate: "generate",
  d: "deploy",
  deploy: "deploy",
  s: "server",
  server: "server",
  l: "list",
  list: "list",
};

describe("after_generate handler", () => {
  let baseDir;
  beforeEach(() => {
    baseDir = fs.mkdtempSync(path.join(os.tmpdir(), "hexo-offline-"));
  });
  afterEach(() => {
    fs.rmSync(baseDir, { recursive: true, force: true });
  });
  const run = async (
    routes,
    {
      configFile,
      config = {},
      cmd = "generate",
      args = {},
      setup,
      expectError = false,
      hexo = {},
    } = {},
  ) => {
    if (configFile !== undefined) {
      fs.writeFileSync(
        path.join(baseDir, "hexo-offline.config.cjs"),
        configFile,
      );
    }
    const route = new FakeRouter(routes);
    setup?.(route);
    const log = { error: mock.fn(), warn: mock.fn(), info: mock.fn() };
    const context = {
      route,
      log,
      base_dir: baseDir,
      public_dir: "/site/public",
      config,
      env: { cmd, args },
      extend: { console: { alias } },
      ...hexo,
    };
    let result, error;
    try {
      result = await handler.call(context);
    } catch (err) {
      if (!expectError) throw err;
      error = err;
    }
    // after_generate filters pass their return value on to the next filter.
    assert.strictEqual(result, undefined);
    const generated = route.list().includes("service-worker.js");
    const warnings = log.warn.mock.calls.map((call) => call.arguments[0]);
    return { route, log, warnings, generated, error, context };
  };

  it("should add the service worker and inject the register script", async () => {
    const { route, generated } = await run({
      "index.html": () => indexHTML,
      "css/style.css": "body{}",
    });
    assert.ok(generated);
    assert.match(
      route.text("index.html"),
      /serviceWorker.*<\/script><\/body><\/html>$/s,
    );

    const sw = route.text("service-worker.js");
    assert.ok(sw, "service-worker.js route is missing");
    assert.match(sw, /url:"index\.html"/);
    assert.match(sw, /url:"css\/style\.css"/);
    // The Workbox runtime the service worker imports is added as a route too.
    const runtime = sw.match(/"\.\/(workbox-[0-9a-f]+)"/)[1];
    assert.ok(route.list().includes(`${runtime}.js`));
  });

  it("should precache index.html with the register script injected", async () => {
    const { route } = await run({ "index.html": indexHTML });
    // workbox-build uses the MD5 of the file content as the revision.
    const revision = route
      .text("service-worker.js")
      .match(/url:"index\.html",revision:"(\w+)"/)[1];
    const expected = crypto
      .createHash("md5")
      .update(route.text("index.html"))
      .digest("hex");
    assert.strictEqual(revision, expected);
  });

  it("should render each precached page only once", async () => {
    const { route } = await run({
      "index.html": () => indexHTML,
      "about/index.html": () => "<html><body>about</body></html>",
    });
    assert.strictEqual(route.renders.get("index.html"), 1);
    assert.strictEqual(route.renders.get("about/index.html"), 1);
    // The rendered page is kept on the route for Hexo to write.
    assert.strictEqual(
      route.text("about/index.html"),
      "<html><body>about</body></html>",
    );
  });

  it("should keep rendered styles and scripts, but not other files", async () => {
    const { route } = await run({
      "index.html": indexHTML,
      "css/style.css": () => "body{}",
      "js/app.js": () => "app()",
      "images/a.png": () => Buffer.from("png"),
    });
    const sw = route.text("service-worker.js");
    for (const file of ["css/style.css", "js/app.js", "images/a.png"]) {
      assert.match(sw, new RegExp(`url:"${file.replaceAll(".", "\\.")}"`));
    }
    assert.strictEqual(route.text("css/style.css"), "body{}");
    assert.strictEqual(route.text("js/app.js"), "app()");
    assert.strictEqual(
      typeof route.routes.get("images/a.png").data,
      "function",
    );
  });

  it("should keep the modified flag of precached pages", async () => {
    const { route } = await run(
      { "index.html": indexHTML, "about/index.html": () => "<html></html>" },
      {
        setup: (route) =>
          (route.routes.get("about/index.html").modified = false),
      },
    );
    assert.strictEqual(route.isModified("about/index.html"), false);
  });

  it("should not read routes that cannot be precached", async () => {
    const { route } = await run({
      "index.html": indexHTML,
      "feed.xml": () => "<feed/>",
    });
    assert.strictEqual(route.renders.get("feed.xml"), undefined);
    assert.doesNotMatch(route.text("service-worker.js"), /feed\.xml/);
  });

  it("should skip a page that fails to render and precache the rest", async () => {
    const broken = () => {
      throw new Error("render failed");
    };
    const { route, warnings, generated } = await run({
      "index.html": indexHTML,
      "broken/index.html": broken,
      "css/style.css": "body{}",
    });
    assert.ok(generated);
    const sw = route.text("service-worker.js");
    assert.doesNotMatch(sw, /broken/);
    assert.match(sw, /url:"css\/style\.css"/);
    assert.ok(
      warnings.some((w) => /not precaching broken\/index\.html/.test(w)),
    );
    // Left alone, so Hexo reports the render error when it writes the route.
    assert.strictEqual(route.routes.get("broken/index.html").data, broken);
  });

  it("should activate a new service worker without waiting by default", async () => {
    const { route } = await run({ "index.html": indexHTML });
    const sw = route.text("service-worker.js");
    // workbox-build emits an unconditional self.skipWaiting() when
    // skipWaiting is enabled, and a SKIP_WAITING message listener otherwise.
    assert.match(sw, /self\.skipWaiting\(\)/);
    assert.doesNotMatch(sw, /SKIP_WAITING/);
    assert.match(sw, /\.clientsClaim\(\)/);
  });

  it("should apply options from hexo-offline.config.cjs", async () => {
    const { route } = await run(
      { "index.html": indexHTML, "css/style.css": "body{}" },
      {
        configFile:
          'module.exports = { skipWaiting: false, clientsClaim: false, globPatterns: ["**/*.html"] };',
      },
    );
    const sw = route.text("service-worker.js");
    assert.match(sw, /SKIP_WAITING/);
    assert.doesNotMatch(sw, /\.clientsClaim\(\)/);
    assert.doesNotMatch(sw, /style\.css/);
  });

  it("should accept glob patterns starting with ./", async () => {
    const { route } = await run(
      { "index.html": indexHTML, "css/style.css": "body{}" },
      {
        configFile: 'module.exports = { globPatterns: ["./**/*.{html,css}"] };',
      },
    );
    assert.match(route.text("service-worker.js"), /url:"css\/style\.css"/);
  });

  it("should print each workbox-build warning once", async () => {
    const { warnings } = await run(
      { "index.html": indexHTML },
      {
        configFile:
          'module.exports = { globPatterns: ["**/*.html", "**/*.does-not-exist"] };',
      },
    );
    assert.strictEqual(warnings.length, 1);
    assert.strictEqual(typeof warnings[0], "string");
    assert.match(warnings[0], /glob patterns doesn't match any files/);
    // The warning names the public folder, not the temporary copy.
    assert.ok(warnings[0].includes("/site/public"), warnings[0]);
    assert.ok(!warnings[0].includes(os.tmpdir()), warnings[0]);
  });

  it("should use the default glob patterns when globPatterns is null", async () => {
    const { route } = await run(
      { "index.html": indexHTML, "css/style.css": "body{}" },
      { configFile: "module.exports = { globPatterns: null };" },
    );
    assert.match(route.text("service-worker.js"), /url:"css\/style\.css"/);
  });

  it("should not generate the service worker when index.html fails", async () => {
    const broken = () => {
      throw new Error("render failed");
    };
    const { route, warnings, generated } = await run({
      "index.html": broken,
      "css/style.css": "body{}",
    });
    assert.strictEqual(generated, false);
    assert.ok(warnings.some((w) => /index\.html failed to generate/.test(w)));
    // Left alone, so Hexo reports the render error when it writes the route.
    assert.strictEqual(route.routes.get("index.html").data, broken);
  });

  it("should not precache the service worker or Workbox runtime routes", async () => {
    const { route } = await run({
      "index.html": indexHTML,
      "service-worker.js": "old worker",
      "workbox-0123abcd.js": "old runtime",
    });
    const sw = route.text("service-worker.js");
    assert.doesNotMatch(sw, /url:"service-worker\.js"/);
    assert.doesNotMatch(sw, /workbox-0123abcd/);
  });

  it("should pass templatedURLs dependencies over the size limit to workbox-build", async () => {
    const { warnings, error } = await run(
      {
        "index.html": indexHTML,
        "js/bundle.js": () => "x".repeat(2048),
      },
      {
        config: {
          offline: {
            maximumFileSizeToCacheInBytes: 1024,
            templatedURLs: { "/app": ["js/bundle.js"] },
          },
        },
      },
    );
    // Without the dependency, workbox-build fails because the templatedURLs
    // glob matches nothing. With it, workbox-build applies the size limit to
    // the templated URL itself and warns.
    assert.strictEqual(error, undefined);
    assert.ok(
      warnings.some((w) => w.includes("/app")),
      warnings.join("\n"),
    );
    assert.ok(!warnings.some((w) => /not precaching js\/bundle\.js/.test(w)));
  });

  it("should not change the user's globIgnores", async () => {
    const globIgnores = ["images/**"];
    await run(
      { "index.html": indexHTML },
      { config: { offline: { globIgnores } } },
    );
    assert.deepStrictEqual(globIgnores, ["images/**"]);
  });

  it("should not read or precache routes matched by globIgnores", async () => {
    const { route } = await run(
      {
        "index.html": indexHTML,
        "images/a.png": () => Buffer.from("png"),
        "css/style.css": "body{}",
      },
      { configFile: 'module.exports = { globIgnores: ["images/**"] };' },
    );
    assert.strictEqual(route.renders.get("images/a.png"), undefined);
    const sw = route.text("service-worker.js");
    assert.doesNotMatch(sw, /images\/a\.png/);
    assert.match(sw, /url:"css\/style\.css"/);
  });

  it("should skip files over maximumFileSizeToCacheInBytes with a warning", async () => {
    const { route, warnings } = await run(
      {
        "index.html": indexHTML,
        "images/big.png": () => Buffer.alloc(2048),
      },
      {
        configFile: "module.exports = { maximumFileSizeToCacheInBytes: 1024 };",
      },
    );
    assert.doesNotMatch(route.text("service-worker.js"), /big\.png/);
    assert.ok(
      warnings.some((w) =>
        /not precaching images\/big\.png because it is 2,048 bytes/.test(w),
      ),
      warnings.join("\n"),
    );
  });

  it("should let workbox-build report invalid glob patterns", async () => {
    const { error } = await run(
      { "index.html": indexHTML },
      {
        configFile:
          'module.exports = { globPatterns: ["**/*.html", /\\.css$/] };',
        expectError: true,
      },
    );
    assert.ok(error);
    assert.doesNotMatch(error.message, /is not a function/);
  });

  it("should restore index.html when building the service worker fails", async () => {
    const { route, generated, error } = await run(
      { "index.html": indexHTML },
      {
        configFile: "module.exports = { notAWorkboxOption: true };",
        expectError: true,
      },
    );
    assert.ok(error, "expected workbox-build to reject the config");
    assert.strictEqual(generated, false);
    assert.strictEqual(route.text("index.html").toString(), indexHTML);
  });

  it("should warn once that watch mode doesn't generate the service worker", async () => {
    const { route, warnings, generated, context } = await run(
      { "index.html": indexHTML },
      { args: { watch: true } },
    );
    await handler.call(context);
    assert.strictEqual(generated, false);
    assert.strictEqual(route.text("index.html"), indexHTML);
    assert.strictEqual(context.log.warn.mock.callCount(), 1);
    assert.match(warnings[0], /not generated in watch mode/);
  });

  it("should do nothing without index.html", async () => {
    const { route, generated } = await run({ "css/style.css": "body{}" });
    assert.strictEqual(generated, false);
    assert.deepStrictEqual(route.list(), ["css/style.css"]);
  });

  for (const cmd of ["deploy", "d", "G", ""]) {
    it(`should run for ${cmd ? `'hexo ${cmd}'` : "the Hexo API"}`, async () => {
      const { generated } = await run({ "index.html": indexHTML }, { cmd });
      assert.ok(generated);
    });
  }

  for (const [label, options] of [
    ["'hexo server'", { cmd: "server" }],
    ["'hexo s'", { cmd: "s" }],
    ["'hexo S'", { cmd: "S" }],
    ["'hexo list'", { cmd: "list" }],
    ["'hexo generate --watch'", { cmd: "generate", args: { watch: true } }],
    ["'hexo g -w'", { cmd: "g", args: { w: true } }],
    [
      "Hexo watching through its API",
      { cmd: "", hexo: { _watchBox: () => {} } },
    ],
  ]) {
    it(`should do nothing for ${label}`, async () => {
      const { route, generated } = await run(
        { "index.html": indexHTML },
        options,
      );
      assert.strictEqual(generated, false);
      assert.deepStrictEqual(route.list(), ["index.html"]);
      assert.strictEqual(route.text("index.html"), indexHTML);
    });
  }
});
