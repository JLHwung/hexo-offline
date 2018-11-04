import fs from "fs";
import path from "path";
import { workerName } from "./constants";

const template = fs.readFileSync(
  path.join(__dirname, "./template.js"),
  "utf-8"
);

const helperSWRegister = function() {
  const registerContent = template.replace("__workerName__", workerName);
  return `<script>${registerContent}</script>`;
};

const injectSWRegisterWithContent = script => publicDir => {
  const indexHTMLPath = path.join(publicDir, "index.html");

  // early return when no index.html presets in public directory
  if (!fs.existsSync(indexHTMLPath)) {
    return;
  }

  const fileContent = fs.readFileSync(indexHTMLPath, "utf-8");

  // early return if it has been injected before
  if (fileContent.includes(`${script}</body></html>`)) {
    return;
  }

  const injectedContent = fileContent.replace(
    /<\/body>\s*<\/html>\s*$/,
    `${script}</body></html>`
  );
  fs.writeFileSync(indexHTMLPath, injectedContent);
};

export default injectSWRegisterWithContent(helperSWRegister());
