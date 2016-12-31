import runSWPrecache from './run-sw-precache'
import injectSWRegister from './inject-sw-register'

export default function () {
  return runSWPrecache.call(this)
    .then(() => injectSWRegister(this.public_dir))
}
