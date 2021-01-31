import fs from "fs";
import path from "path";
import runWorkboxBuild from "../../src/lib/run-workbox-build.js";
import { workerName } from "../../src/lib/constants";

test("run-workbox-build should generate service-worker.js when index.html presents", () => {
  const publicDir = path.resolve("./run-workbox-build.spec");
  fs.mkdirSync(publicDir);

  const html = ["<html>", "<body></body>", "</html>"].join("\n");
  const indexHTMLPath = path.join(publicDir, "index.html");
  fs.writeFileSync(indexHTMLPath, html);

  const context = {
    public_dir: publicDir,
    config: {
      root: "/",
      offline: {},
    },
  };

  const cleanup = () => {
    fs.unlinkSync(indexHTMLPath);
    fs.rmdirSync(publicDir);
  };

  return runWorkboxBuild.call(context).then(
    () => {
      const workerPath = path.join(publicDir, workerName);
      expect(fs.existsSync(workerPath)).toBe(true);
      fs.unlinkSync(workerPath);
      cleanup();
    },
    (error) => {
      console.error(error);
      cleanup();
    }
  );
});

test("run-workbox-build should not generate service-worker.js when index.html is not found", () => {
  const publicDir = path.resolve("./run-workbox-build.spec");
  fs.mkdirSync(publicDir);

  const context = {
    public_dir: publicDir,
    config: {
      root: "/",
      offline: {},
    },
    log: console,
  };

  const cleanup = () => {
    fs.rmdirSync(publicDir);
  };

  return runWorkboxBuild.call(context).then(
    () => {
      const workerPath = path.join(publicDir, workerName);
      expect(fs.existsSync(workerPath)).toBe(false);
      cleanup();
    },
    (error) => {
      console.error(error);
      cleanup();
    }
  );
});
