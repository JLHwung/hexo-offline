import runWorkBoxBuild from "./run-workbox-build";
import injectSWRegister from "./inject-sw-register";

export default function () {
  return runWorkBoxBuild
    .call(this)
    .then(() => injectSWRegister(this.public_dir));
}
