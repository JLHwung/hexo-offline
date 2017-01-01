# hexo-offline
[![npm version](https://img.shields.io/npm/v/hexo-offline.svg?style=flat-square)](https://www.npmjs.com/package/hexo-offline)
[![Build Status](https://img.shields.io/travis/JLHwung/hexo-offline.svg?style=flat-square)](https://travis-ci.org/JLHwung/hexo-offline)
[![AppVeyor build status](https://img.shields.io/appveyor/ci/JLHwung/hexo-offline.svg?style=flat-square)](https://ci.appveyor.com/project/JLHwung/hexo-offline)
[![Coverage Status](https://img.shields.io/coveralls/JLHwung/hexo-offline.svg?style=flat-square)](https://coveralls.io/github/JLHwung/hexo-offline)
[![Dependencies Status](https://img.shields.io/david/JLHwung/hexo-offline.svg?style=flat-square)](https://david-dm.org/JLHwung/hexo-offline)
[![Dev Dependencies Status](https://img.shields.io/david/dev/JLHwung/hexo-offline.svg?style=flat-square)](https://david-dm.org/JLHwung/hexo-offline?type=dev)

hexo-offline is intended to provide offline experience for [hexo](https://hexo.io) built static website. It uses *ServiceWorker* under the hood. Simply install this plugin to your website and it should be offline ready by caching most of static assets.

## Install
```bash
npm i hexo-offline --save
```
Once installed, run `hexo clean && hexo generate` to activate offline experience.

## Usage
hexo-offline aims to provide out-of-the-box offline enhancement to your hexo project. Meanwhile it offers full list of options control from [sw-precache](https://github.com/GoogleChrome/sw-precache#options-parameter). Simply add your configuration to the root `_config.yml`.

```yaml
# offline config passed to sw-precache
offline:
  maximumFileSizeToCacheInBytes: 5242880
  staticFileGlobs:
  - public/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}
  stripPrefix: public
  verbose: true
```

## [Demo](https://jhuang.me)
