# hexo-offline
[![npm version](https://img.shields.io/npm/v/hexo-offline.svg?style=flat-square)](https://www.npmjs.com/package/hexo-offline)
[![Build Status](https://img.shields.io/travis/JLHwung/hexo-offline.svg?style=flat-square)](https://travis-ci.org/JLHwung/hexo-offline)
[![AppVeyor build status](https://img.shields.io/appveyor/ci/JLHwung/hexo-offline.svg?style=flat-square)](https://ci.appveyor.com/project/JLHwung/hexo-offline)
[![Coverage Status](https://img.shields.io/coveralls/JLHwung/hexo-offline.svg?style=flat-square)](https://coveralls.io/github/JLHwung/hexo-offline)
[![Dependencies Status](https://img.shields.io/david/JLHwung/hexo-offline.svg?style=flat-square)](https://david-dm.org/JLHwung/hexo-offline)
[![Dev Dependencies Status](https://img.shields.io/david/dev/JLHwung/hexo-offline.svg?style=flat-square)](https://david-dm.org/JLHwung/hexo-offline?type=dev)

hexo-offline is intended to provide offline experience for [hexo](https://hexo.io) built static website. It uses *ServiceWorker* under the hood. Simply install this plugin to your website and it should be offline ready by caching most of static assets.

## Demo
- [vuejs.org](https://vuejs.org): Read Vuejs documentation in the flight.

## Install
```bash
npm i hexo-offline --save
```
Once installed, run `hexo clean && hexo generate` to activate offline experience.

## Usage
If the website serves all content from the origin server, you don't have to add any config. Simply install and run `hexo clean && hexo generate`.

While hexo-offline aims to provide zero-config offline enhancement to your hexo project, it does offer full list of options control from [sw-precache](https://github.com/GoogleChrome/sw-precache#options-parameter). Simply add your configuration to the root `_config.yml`.

```yaml
# offline config passed to sw-precache.
offline:
  maximumFileSizeToCacheInBytes: 5242880
  staticFileGlobs:
  - public/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff,woff2}
  stripPrefix: public
  verbose: true
```

Again, the config is demonstration only and you don't have to copy and paste if you serves all contents from the origin server.

### How if content serves via CDN?

Suppose that you have used two CDN scripts:
```yaml
- https://cdn.example.com/script-name/script-version.js
- http://cdn.another-example.org/script-name/script-version.css
```

Add this config to root `_config.yml`
```yaml
offline:
  runtimeCaching:
    - urlPattern: /*
      handler: cacheFirst
      options:
        origin: cdn.example.com
    - urlPattern: /*
      handler: cacheFirst
      options:
        origin: cdn.another-example.org
```

Note:

1. As the CDN resources is runtime cached, it means that the resource will be cached only after a user-agent visit the page where the resource is referenced. Therefore, if you have included a CDN resource `example.com/script.js` in `some-page.html` only, the user who visit `index.html` only would not have `example.com/script.js` in cache.
1. we use `cacheFirst` handler as CDN resources with specific version are not supposed to change in the future.
