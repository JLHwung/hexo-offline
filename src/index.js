/* global hexo */
import handler from "./lib";

// Run after other after_generate filters (default priority 10), so files they
// modify are precached with their final content.
hexo.extend.filter.register("after_generate", handler, 100);
