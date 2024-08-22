import fs from "node:fs";
import path from "path";
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import _injectSWRegister from "../../lib/lib/inject-sw-register.js";
const injectSWRegister = _injectSWRegister.default;

describe("inject-sw-register", () => {
  const publicDir = path.resolve("./inject-sw-register.spec");
  beforeEach(() => {
    fs.mkdirSync(publicDir, { recursive: true });
  });
  afterEach(() => {
    fs.rmSync(publicDir, { recursive: true });
  });
  it("should inject script when index.html presents", () => {
    const html = ["<html>", "<body>", "</body>  ", "</html>"].join("\n");
    const indexHTMLPath = path.join(publicDir, "index.html");
    fs.writeFileSync(indexHTMLPath, html);

    injectSWRegister(publicDir);
    const content = fs.readFileSync(indexHTMLPath, "utf-8");

    assert.strictEqual(content.includes("</script></body></html>"), true);
  });
  it("should should not throw when index.html is not found", () => {
    assert.doesNotThrow(() => injectSWRegister(publicDir));
  });
  it("should not inject script again once injected", () => {
    const html = ["<html>", "<body>", "</body>  ", "</html>"].join("\n");
    const indexHTMLPath = path.join(publicDir, "index.html");
    fs.writeFileSync(indexHTMLPath, html);
  
    injectSWRegister(publicDir);
    const content = fs.readFileSync(indexHTMLPath, "utf-8");
  
    injectSWRegister(publicDir);
    const newContent = fs.readFileSync(indexHTMLPath, "utf-8");
  
    assert.strictEqual(newContent, content);
  });
});
