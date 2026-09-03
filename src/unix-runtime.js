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
  if (!exists(dest) && exists(src)) {
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(src, dest);
  }
  return exists(dest) ? dest : src;
}

function extraBinDirs() {
  const dirs = [];
  const windir = process.env.WINDIR || "C:\\Windows";
  dirs.push(path.join(windir, "System32"));
  dirs.push(path.join(windir, "System32", "OpenSSH"));
  const git = [
    process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Git", "usr", "bin"),
    process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Git", "bin"),
  ].filter(Boolean);
  for (const d of git) {
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
    PS1: "\\[\\033[01;32m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ ",
    BB_TERMINAL_MODE: "1",
    PATH: pathParts.join(path.delimiter),
  };
}

module.exports = { busyboxPath, exists, envForUnixShell };
