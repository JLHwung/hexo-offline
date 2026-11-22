import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { describe, beforeEach, afterEach, it } from "node:test";

// CI installs each supported Hexo major with `yarn add --dev hexo@<version>`.
const require = createRequire(import.meta.url);
let Hexo;
try {
  Hexo = require("hexo");
} catch {}

const pluginPath = fileURLToPath(new URL("../lib/index.js", import.meta.url));

describe("Hexo integration", { skip: !Hexo && "hexo is not installed" }, () => {
  let siteDir, hexo, deployed;
  beforeEach(async () => {
    siteDir = fs.mkdtempSync(path.join(os.tmpdir(), "hexo-offline-site-"));
    fs.writeFileSync(
      path.join(siteDir, "_config.yml"),
      [
        "title: test",
        "url: http://example.com",
        "skip_render: ['index.html']",
        "deploy:",
        "  type: probe",
      ].join("\n"),
    );
    fs.mkdirSync(path.join(siteDir, "source"));
    fs.writeFileSync(
      path.join(siteDir, "source", "index.html"),
      "<html>\n<body>\n<p>home</p>\n</body>\n</html>\n",
    );

    hexo = new Hexo(siteDir, { silent: true });
    // hexo-cli sets this once it finds a site; Hexo only reads _config.yml
    // when it is set.
    hexo.env.init = true;
    await hexo.init();
    await hexo.loadPlugin(pluginPath);

    deployed = undefined;
    // Records what a deployer finds in the public folder when it runs.
    hexo.extend.deployer.register("probe", function () {
      deployed = {
        files: fs.readdirSync(this.public_dir).sort(),
        indexHTML: fs.readFileSync(
          path.join(this.public_dir, "index.html"),
          "utf-8",
        ),
      };
      return Promise.resolve();
    });
  });
  afterEach(async () => {
    await hexo.exit();
    fs.rmSync(siteDir, { recursive: true, force: true });
  });

  it("should write the service worker before `hexo generate --deploy` deploys", async () => {
    await hexo.call("generate", { deploy: true });

    assert.ok(deployed, "the deployer did not run");
    assert.ok(
      deployed.files.includes("service-worker.js"),
      deployed.files.join(", "),
    );
    assert.ok(
      deployed.files.some((file) => /^workbox-[0-9a-f]+\.js$/.test(file)),
    );
    assert.match(deployed.indexHTML, /navigator\.serviceWorker/);
  });
});
