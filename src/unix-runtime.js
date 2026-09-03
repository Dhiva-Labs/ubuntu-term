const fs = require("fs");
const os = require("os");
const path = require("path");
const { app } = require("electron");

function exists(file) {
  try {
    return fs.existsSync(file);
  } catch {
    return false;
  }
}

function unixRoot() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "unix");
  }
  return path.join(__dirname, "..", "vendor", "unix");
}

function busyboxPath() {
  return path.join(unixRoot(), "busybox.exe");
}

function ensureAshrc() {
  const dir = app.getPath("userData");
  const dest = path.join(dir, "ashrc");
  const src = path.join(unixRoot(), "ashrc");
  if (!exists(src)) return dest;
  fs.mkdirSync(dir, { recursive: true });
  const incoming = fs.readFileSync(src, "utf8");
  const want = profileVersion(incoming);
  const have = exists(dest) ? profileVersion(fs.readFileSync(dest, "utf8")) : 0;
  if (!exists(dest) || have < want) {
    fs.writeFileSync(dest, incoming);
  }
  return dest;
}

function profileVersion(text) {
  const m = String(text).match(/ubuntu-term-profile\s+(\d+)/);
  return m ? Number(m[1]) : 0;
}

function extraBinDirs() {
  const dirs = [];
  const gitCmd = path.join(unixRoot(), "git", "cmd");
  const gitUsr = path.join(unixRoot(), "git", "usr", "bin");
  const gitMingw = path.join(unixRoot(), "git", "mingw64", "bin");
  for (const d of [gitCmd, gitUsr, gitMingw]) {
    if (exists(d)) dirs.push(d);
  }
  const windir = process.env.WINDIR || "C:\\Windows";
  dirs.push(path.join(windir, "System32"));
  dirs.push(path.join(windir, "System32", "OpenSSH"));
  const installedGit = [
    process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Git", "cmd"),
    process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Git", "usr", "bin"),
    process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Git", "bin"),
  ].filter(Boolean);
  for (const d of installedGit) {
    if (exists(d)) dirs.push(d);
  }
  return dirs;
}

function envForUnixShell() {
  const busybox = busyboxPath();
  const ashrc = ensureAshrc();
  const home = os.homedir();
  const user = os.userInfo().username;
  const pathParts = [path.dirname(busybox), ...extraBinDirs(), process.env.PATH || ""];

  return {
    ...process.env,
    TERM: "xterm-256color",
    COLORTERM: "truecolor",
    LANG: process.env.LANG || "en_US.UTF-8",
    HOME: home,
    USER: user,
    LOGNAME: user,
    USERNAME: user,
    HOSTNAME: os.hostname(),
    ENV: ashrc,
    EDITOR: "vi",
    VISUAL: "vi",
    GIT_EDITOR: "vi",
    PS1: "\\[\\033[01;32m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ ",
    BB_TERMINAL_MODE: "1",
    PATH: pathParts.join(path.delimiter),
  };
}

module.exports = { busyboxPath, exists, envForUnixShell };
