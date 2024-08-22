# hexo-offline

[![npm version](https://img.shields.io/npm/v/hexo-offline.svg?style=flat-square)](https://www.npmjs.com/package/hexo-offline)
![Build Status](https://img.shields.io/github/actions/workflow/status/JLHwung/hexo-offline/ci.yml?branch=main&style=flat-square)
[![Coverage Status](https://img.shields.io/coveralls/JLHwung/hexo-offline.svg?style=flat-square)](https://coveralls.io/github/JLHwung/hexo-offline)

hexo-offline is intended to provide [offline experience](https://web.dev/progressive-web-apps/) for [hexo](https://hexo.io) built static website. It uses _ServiceWorker_ under the hood. Simply install this plugin to your website and it should be offline ready by caching most of static assets.

See [here](https://github.com/JLHwung/hexo-offline/tree/v1) for v1 docs.

## Demo

- [徑庭](https://jhuang.me)

## Install

```bash
npm i hexo-offline --save
```

Once installed, run `hexo clean && hexo generate` to activate offline experience.

## Usage

If the website serves all content from the origin server, you don't have to add any config. Simply install and run `hexo clean && hexo generate`.

While hexo-offline aims to provide zero-config offline enhancement to your hexo project, it does offer full list of options control from [workbox-build](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build?hl=en#.generateSW). Create a `hexo-offline.config.cjs` in the hexo root directory

```js
// offline config passed to workbox-build.
module.exports = {
  globPatterns: ["**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}"],
  globDirectory: "/path/to/hexo/public",
  swDest: "/path/to/hexo/service-worker.js",
},
```

Again, the config is demo only and you don't have to copy and paste if you serves all contents from the origin server.

### What if content is served via CDN?

Suppose that you have used two CDN scripts:

```yaml
- https://cdn.example.com/script-name/script-version.js
- http://cdn.another-example.org/script-name/script-version.css
```

Add this config to root `hexo-offline.config.cjs`

```js
// offline config passed to workbox-build.
module.exports = {
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/cdn\.example\.com\/.*/,
      handler: "CacheFirst"
    },
    {
      urlPattern: /^https:\/\/cdn\.another-example\.org\/.*/,
      handler: "CacheFirst"
    }
  ]
},
```

For more information, see [Workbox Runtime Caching Entry](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build?hl=en#.RuntimeCachingEntry).

Note:

1. As the CDN resources is runtime cached, it means that the resource will be cached only after a user-agent visit the page where the resource is referenced. Therefore, if you have included a CDN resource `example.com/script.js` in `some-page.html` only, the user who visit `index.html` only would not have `example.com/script.js` in cache.
1. we use `cacheFirst` handler as CDN resources with specific version are not supposed to change in the future.
