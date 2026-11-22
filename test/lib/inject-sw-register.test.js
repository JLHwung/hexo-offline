import { describe, it } from "node:test";
import assert from "node:assert";
import _injectSWRegister from "../../lib/lib/inject-sw-register.js";
const injectSWRegister = _injectSWRegister.default;

describe("inject-sw-register", () => {
  it("should inject the register script before </body></html>", () => {
    const html = ["<html>", "<body>", "</body>  ", "</html>"].join("\n");
    const injected = injectSWRegister(html);
    assert.match(
      injected,
      /^<html>\n<body>\n<script>.*<\/script><\/body><\/html>$/s,
    );
    assert.match(
      injected,
      /navigator\.serviceWorker\s*\.register\("service-worker\.js"\)/,
    );
  });

  it("should not inject the script twice", () => {
    const html = "<html><body></body></html>";
    const injected = injectSWRegister(html);
    assert.strictEqual(injectSWRegister(injected), injected);
  });

  it("should leave HTML without a closing </body></html> unchanged", () => {
    const html = "<p>fragment</p>";
    assert.strictEqual(injectSWRegister(html), html);
  });
});
