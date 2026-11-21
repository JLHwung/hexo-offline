## 5.0.0 (2026-11-21)

##### Breaking Changes

*  generate the service worker with the rest of the site (#114, #93) (2f822d98)
*  activate updated service workers without waiting (#141) (29392ab1)

##### Migrating from 4.x

* Remove `globDirectory` and `swDest` from `hexo-offline.config.cjs`. They are ignored with a warning: the service worker is now built from the files Hexo generates and is always written to `service-worker.js` in the public folder. Other glob options, such as `globPatterns` and `globIgnores`, are matched against those generated files, relative to the public folder.
* `hexo generate --deploy` and `hexo deploy --generate` now deploy the service worker, so you no longer need to run `hexo generate` and `hexo deploy` separately. A plain `hexo deploy` with an existing public folder still deploys it as it is.
* `hexo server` and `hexo generate --watch` no longer generate a service worker. After a watch build, run `hexo generate` before deploying. To try the service worker locally, serve the generated public folder on a different port from the one you use for `hexo server`.
* A new service worker now takes over as soon as it is installed (`skipWaiting: true` and `clientsClaim: true`), so a refresh after a deploy shows the new content. To keep the previous behaviour, for example if your site asks users before applying updates, set both to `false` in `hexo-offline.config.cjs`.
* Node.js ^20.17.0 or >=22.5.0 is required.
* Run `hexo clean` once after upgrading, so files v4 wrote directly to the public folder (such as an old `workbox-*.js`) are removed.

##### Chores

* **deps:**
  *  bump brace-expansion from 2.1.1 to 2.1.8 (#246) (cd8ed077)
  *  bump tar from 7.5.16 to 7.5.23 (#238) (1a1c8405)
  *  bump browserslist from 4.28.2 to 4.29.6 (#243) (cb24524a)
  *  bump undici from 6.27.0 to 6.29.1 (#245) (0eb76a88)
  *  bump serialize-javascript from 7.0.5 to 7.1.4 (#247) (7441a3c9)
  *  bump fast-uri from 3.1.2 to 3.1.9 (#248) (6c7898c8)
  *  update yarn to v4.19.0 (#234) (cc540735)
  *  update actions/setup-node action to v7 (#235) (1e9907e3)
  *  update actions/checkout action to v7 (#233) (11f94871)
  *  update dependency @babel/core to v7.29.6 [security] (#231) (b1e21fc0)
  *  update yarn monorepo to v4.17.0 (#229) (b2c94cdf)
  *  update yarn to v4.16.0 (#228) (c8720ec8)
  *  update yarn to v4.15.0 (#227) (0a92c7fb)
  *  update dependency lint-staged to v17 (#225) (236b5411)
  *  bump brace-expansion from 1.1.12 to 1.1.13 (#221) (3e9fd08b)
  *  update yarn to v4.14.1 (#224) (d21ab4c8)
  *  update yarn to v4.14.0 (#223) (c369a504)
  *  update yarn to v4.13.0 (#219) (0ef55511)
  *  bump rollup from 2.79.2 to 2.80.0 (#217) (d33de790)
  *  bump lodash from 4.17.21 to 4.17.23 (#214) (3af96498)
  *  update yarn to v4.12.0 (#213) (517d8262)
  *  update actions/checkout action to v6 (#212) (3fdc67e0)
*  make prepublishOnly work on a clean checkout (34ec3c78)
*  migrate Renovate config to config:recommended (2afa6028)
*  bump @babel/* to 8.1.0 (6c829d37)
*  update all transitive deps (254ff249)
*  bump Babel to 8.0.0 (7bc19ed3)

##### Continuous Integration

*  publish to npm with OIDC trusted publishing (a3281b38)
*  reduce test matrix and pair old Hexo with old Node.js (60159320)
*  limit CI push trigger to main only (ecf4cd84)
*  disable fail-fast in test matrix (30ed7b4f)
*  test against Hexo 5, 6, 7 and 8 (3bd7baca)
*  test on Node.js 20, 22, 24, 26 and drop 18 (41757f0b)

##### Bug Fixes

*  compile lib to CommonJS under Babel 8 (fbc46644)
*  log each workbox-build warning once (29392ab1)
*  report a hexo-offline.config.cjs that fails to load instead of ignoring it (29392ab1)

## 4.0.0 (2025-11-12)

##### Breaking Changes

*  drop Node.js 18 support (4624cfb0)

##### Chores

* **deps:**
  *  update yarn to v4.11.0 (#211) (d872ce90)
  *  update yarn to v4.10.3 (#208) (1fcc2444)
  *  update actions/setup-node action to v6 (#210) (17933aca)
  *  update yarn to v4.10.0 (#207) (ea5af0b1)
  *  update dependency hexo to v8 (#206) (520a1905)
  *  update actions/setup-node action to v5 (#205) (32e08c7c)
  *  update yarn to v4.9.4 (#204) (5c11d0cb)
  *  update yarn to v4.9.3 (#203) (f91a20ed)
  *  update actions/checkout action to v5 (#202) (9c9191b5)
  *  bump brace-expansion from 1.1.11 to 1.1.12 (#201) (6a2c7cfb)
  *  update yarn to v4.9.2 (#200) (d8aa15d6)
  *  update dependency lint-staged to v16 (#199) (0c29841d)
  *  update yarn to v4.9.1 (#198) (cca1dcc2)
  *  update yarn to v4.9.0 (#197) (5d26cf38)
  *  bump @babel/helpers from 7.25.0 to 7.27.0 (#196) (f018e493)
  *  bump @babel/runtime from 7.12.5 to 7.27.0 (#195) (59ee641d)
  *  update yarn to v4.8.0 (#194) (bb7a8d22)
  *  update yarn to v4.7.0 (#193) (7df5e492)
  *  update yarn to v4.6.0 (#192) (99fdee92)
  *  update yarn to v4.5.3 (#191) (a577a024)
  *  update yarn to v4.5.2 (#190) (b52c8b74)
  *  update yarn to v4.5.1 (#188) (188ecbe3)
  *  bump cross-spawn from 7.0.3 to 7.0.6 (#189) (aa7d687c)
  *  bump rollup from 2.79.1 to 2.79.2 (#187) (2d90327b)

## 3.0.0 (2024-09-18)

##### Breaking Changes
- bump workbox-build to v7 (#184) (da4bc603)
- requires Node.js >= 18

##### Chores

* declare hexo 7.0 support (08d7411c)
* **deps:**
  *  update actions/checkout action to v4 (#186) (ec73fb9c)
  *  update yarn to v4.5.0 (#185) (a03c1c62)
  *  bump micromatch from 4.0.7 to 4.0.8 (#183) (efc8681e)
  *  update yarn to v4.4.1 (#182) (6f5d7c9f)
  *  bump ajv from 6.12.0 to 6.12.6 (#181) (211571b5)
  *  update deps (18ae1ff2)
  *  bump semver from 5.7.1 to 5.7.2 (#178) (5088120b)
  *  run yarn dedupe after renovate updates (f0c5fd21)
  *  update dependency terser to v5.14.2 [security] (#160) (47504c63)
  *  update coverallsapp/github-action action to v1.2.5 (#158) (75858cbb)
  *  update dependency husky to v8 (#151) (72484b2b)
  *  update actions/cache action to v3 (#149) (6b59dbda)
  *  update actions/checkout action to v3 (#148) (5eebac98)
  *  update actions/setup-node action to v3 (#147) (8ee92457)

#### 2.0.1 (2022-01-06)

##### Chores

*  support Hexo v6 (#143) (2ad4305)
*  update renovate config (3fe78f7f)
* **deps:**  update coverallsapp/github-action action to v1.1.3 (#144) (05269257)

## 2.0.0 (2021-03-12)

##### Breaking Changes

- use workbox-build (#138) (8208bef7)
- drop node < 10 support (4711dad5)

#### 1.0.1 (2018-12-06)

##### Chores

- **package:**
  - update yarn lockfiles (0225b25c)
  - update devDependencies (638f390a)
- **deps:**
  - update babel monorepo to v7.2.0 (#57) (9d9babcd)
  - update dependency prettier to v1.15.3 (#56) (845477f6)
  - update dependency lint-staged to v8.1.0 (#54) (b0abea6f)
  - update dependency prettier to v1.15.2 (bf02d99e)
  - update dependency husky to v1.2.0 (0cf31bee)
  - update babel monorepo (d1c93593)
  - pin dependencies (#51) (b305ad1f)

##### Code Style Changes

- format whole project (15deac7a)

## 1.0.0 (2018-06-09)

##### Chores

- **package:**
  - drop node.js 4 support (66b55e0e)
  - update dependencies (4b983894)
- **npmignore:** include lib only in package (9c6bcbd6)

#### 0.2.3 (2018-03-15)

##### Chores

- **package:**
  - update standard to version 11.0.1 (e68823a0)
  - use yaspeller-ci (159bacc4)
  - does not spellcheck CHANGELOG.md (017b5d40)
  - update lockfile (9599ee3f)
  - update tap to version 11.0.1 (7bb8fad0)
  - remove package-lock (d2fa713b)
  - update yarn lockfile (6164d774)
  - update lockfile (7dfc5419)
  - update yaspeller to version 4.0.0 (eb7b6a11)
  - upgrade dependencies to latest version (5f1bb1a0)
  - update nyc to version 11.0.2 (f075611c)
  - add package-lock (53d1f274)
  - upgrade dependencies (e1bc34b4)
  - update babel-preset-babili to version 0.1.1 (ccabd582)
  - update cross-env to version 5.0.0 (f7180935)
  - regenerate yarn lockfile (b97f7d6a)
  - update standard to version 10.0.0 (3c209f06)
- **appveyor:**
  - use yarn cache in appveyor (f34bbd51)
  - use bundled npm version (8fd7e21d)
- **travis:**
  - add greenkeeper lockfile (6bdc17b6)
  - use node as latest node.js build target (178aac46)
- **yaspeller:** add vuejs to dictionary (46dce2db)

##### Documentation Changes

- **README:** fix typo (ad34600c)
- **readme:** add vuejs.org as demo site (7c89bf62)

##### Bug Fixes

- **run-sw-precache:** remove hardcoded public directory (c178610e)
- **inject-sw-register:** remove async attribute on script (9d735e04)
- **appveyor:** use yarn as install process (e6526892)

#### 0.2.2 (2017-3-31)

##### Chores

- **yaspeller:** update dictionary (1793a9f5)
- **package:**
  - upgrade sw-precache to version 5.1.0 (dc7feb09)
  - update babel-preset-env to version 1.3.2 (6f1b0f49)
  - update cross-env to version 4.0.0 (09b6024d)
  - update standard to version 9.0.0 (67a28e13)
  - re-generate yarn lockfile using default registry (4b9e5d55)
  - update cross-env to version 3.2.3 (c0e4b6ef)
  - update babel-preset-babili to version 0.0.12 (f172fa6e)

#### 0.2.1 (2017-2-20)

##### Chores

- **package:** update babel-plugin-istanbul to version 4.0.0 (87589b23)

##### Documentation Changes

- **readme:** add CDN contents usage (4432e0b4)

##### Bug Fixes

- **inject-sw-register:** early return when injected before (7d4b61fd)

##### Tests

- **inject-sw-register:** add test case on duplicated injection (bfa88df9)

### 0.2.0 (2017-2-17)

##### Chores

- **yaspeller:** add words to dictionary (316eac55)
- **package:**
  - update babel-preset-babili to version 0.0.11 (333e85e1)
  - update tap to version 10.0.1 (672ecc66)
  - update babel-preset-babili to version 0.0.10 (6a082c0d)

##### Bug Fixes

- **package:** update sw-precache to version 5.0.0 (6d5719a1)

#### 0.1.3 (2017-1-17)

##### Chores

- **yaspeller:** add words to dictionary (40775e56)

#### 0.1.2 (2017-1-17)

##### Chores

- **package:**
  - update sw-precache to version 4.3.0 (e95ac9b3)
  - remove unused babel-core (2ed41655)
  - remove unused babel-register (5a08426f)

##### Bug Fixes

- **package:** change prepublish script to prepublishOnly (4470a438)

##### Tests

- **yaspeller:** add yaspeller (31191a97)

#### 0.1.1 (2017-1-15)

##### Chores

- **package:**
  - update tap to version 9.0.3 (ed45acd4)
  - update tap to version 9.0.1 (b6a451bd)

##### Documentation Changes

- **readme:** add more badges (b579c93e)

##### Other Changes

- **package:** revise package description (9bce29c5)

##### Tests

- **travis:** add fast_finish (78f14250)
- **appveyor:** initial test configuration (59186cf8)
