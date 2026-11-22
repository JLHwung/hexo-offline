# Security Policy

## Supported versions

Security fixes are released for the latest major version only.

| Version | Supported |
| ------- | --------- |
| 5.x     | Yes       |
| < 5.0   | No        |

## Reporting a vulnerability

Please do not report security vulnerabilities through public GitHub issues, discussions or pull requests.

Report them privately through [GitHub's private vulnerability reporting](https://github.com/JLHwung/hexo-offline/security/advisories/new). If you can't use GitHub, email hexo-offline@jhuang.me instead.

Please include:

- the affected hexo-offline version, and the Hexo and Node.js versions
- a description of the issue and its impact
- steps to reproduce, ideally a minimal Hexo site or `hexo-offline.config.cjs`

You should receive a reply within 21 days. Once the issue is confirmed, a fix is released as soon as possible and the advisory is published with credit to the reporter, unless you prefer to stay anonymous.

## Scope

hexo-offline generates a service worker with [workbox-build](https://github.com/GoogleChrome/workbox). Report vulnerabilities in Workbox itself to the [Workbox project](https://github.com/GoogleChrome/workbox/security). If an issue in a dependency affects hexo-offline, for example through the generated service worker, please report it here too.

Caching behaviour that follows from your own configuration, such as `runtimeCaching` rules that cache pages you didn't intend to cache, is not a vulnerability in hexo-offline.

## Verifying releases

Releases are built and published from GitHub Actions with npm trusted publishing, and each one carries a provenance attestation. A maintainer approves every release with two-factor authentication before it becomes available. You can verify the signatures and provenance of installed packages with:

```bash
npm audit signatures
```
