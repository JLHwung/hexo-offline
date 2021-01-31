import runWorkBoxBuild from "./run-workbox-build";
import injectSWRegister from "./inject-sw-register";

export default async function () {
  await runWorkBoxBuild.call(this);
  return injectSWRegister(this.public_dir);
}
