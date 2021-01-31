import fs from "fs";
import path from "path";
import injectSWRegister from "../../src/lib/inject-sw-register";

test("inject-sw-register should inject script when index.html presents", () => {
  const publicDir = path.resolve("./inject-sw-register.spec");
  fs.mkdirSync(publicDir);

  const html = ["<html>", "<body>", "</body>  ", "</html>"].join("\n");
  const indexHTMLPath = path.join(publicDir, "index.html");
  fs.writeFileSync(indexHTMLPath, html);

  injectSWRegister(publicDir);
  const content = fs.readFileSync(indexHTMLPath, "utf-8");

  expect(content).toContain("</script></body></html>");

  fs.unlinkSync(indexHTMLPath);
  fs.rmdirSync(publicDir);
});

test("inject-sw-register should not throw when index.html is not found", () => {
  const publicDir = path.resolve("./inject-sw-register.spec");
  fs.mkdirSync(publicDir);

  expect(() => injectSWRegister(publicDir)).not.toThrow();

  fs.rmdirSync(publicDir);
});

test("inject-sw-register should not inject script again once injected", () => {
  const publicDir = path.resolve("./inject-sw-register.spec");
  fs.mkdirSync(publicDir);

  const html = ["<html>", "<body>", "</body>  ", "</html>"].join("\n");
  const indexHTMLPath = path.join(publicDir, "index.html");
  fs.writeFileSync(indexHTMLPath, html);

  injectSWRegister(publicDir);
  const content = fs.readFileSync(indexHTMLPath, "utf-8");

  injectSWRegister(publicDir);
  const newContent = fs.readFileSync(indexHTMLPath, "utf-8");

  expect(content).toBe(newContent);

  fs.unlinkSync(indexHTMLPath);
  fs.rmdirSync(publicDir);
});
