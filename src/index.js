/* global hexo */
import handler from "./lib";

hexo.extend.filter.register("before_exit", handler);
