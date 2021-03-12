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
