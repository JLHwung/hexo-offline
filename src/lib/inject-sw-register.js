import fs from "fs";
import path from "path";
import { workerName } from "./constants.js";

const template = fs.readFileSync(
  path.join(__dirname, "./template.js"),
  "utf-8"
);

const script = `<script>${template.replace("__workerName__", workerName)}</script>`;

// Insert the service worker register script before the closing </body></html>.
export default function injectSWRegister(html) {
  // return as-is if it has been injected before
  if (html.includes(`${script}</body></html>`)) {
    return html;
  }
  return html.replace(/<\/body>\s*<\/html>\s*$/, `${script}</body></html>`);
}
