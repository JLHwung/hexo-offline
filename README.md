# hexo-offline
[![Build Status](https://img.shields.io/travis/JLHwung/hexo-offline.svg?style=flat-square)](https://travis-ci.org/JLHwung/hexo-offline)
[![Coverage Status](https://img.shields.io/coveralls/JLHwung/hexo-offline.svg?style=flat-square)](https://coveralls.io/github/JLHwung/hexo-offline)

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
  verbose: true
```

## [Demo](https://jhuang.me)
