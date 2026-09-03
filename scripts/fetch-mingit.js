"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const MINGIT_URL =
  "https://github.com/git-for-windows/git/releases/download/v2.55.0.windows.5/MinGit-2.55.0.5-64-bit.zip";

const root = path.join(__dirname, "..");
const dest = path.join(root, "vendor", "unix", "git");
const zip = path.join(root, "vendor", "unix", "mingit.zip");
const gitExe = path.join(dest, "cmd", "git.exe");

if (fs.existsSync(gitExe)) {
  console.log("MinGit already present at vendor/unix/git");
  process.exit(0);
}

fs.mkdirSync(path.dirname(zip), { recursive: true });
console.log("Downloading MinGit...");
const curl = spawnSync("curl", ["-fL", "--retry", "3", "-o", zip, MINGIT_URL], {
  stdio: "inherit",
});
if (curl.status !== 0) {
  console.error("Failed to download MinGit");
  process.exit(1);
}

fs.mkdirSync(dest, { recursive: true });
const unpack =
  process.platform === "win32"
    ? spawnSync("tar", ["-xf", zip, "-C", dest], { stdio: "inherit" })
    : spawnSync("unzip", ["-o", zip, "-d", dest], { stdio: "inherit" });
if (unpack.status !== 0) {
  console.error("Failed to unpack MinGit");
  process.exit(1);
}

fs.rmSync(zip, { force: true });
if (!fs.existsSync(gitExe)) {
  console.error("MinGit unpack did not produce cmd/git.exe");
  process.exit(1);
}
console.log("MinGit ready");
