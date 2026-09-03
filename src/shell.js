const fs = require("fs");
const os = require("os");
const path = require("path");

function exists(file) {
  try {
    return fs.existsSync(file);
  } catch {
    return false;
  }
}

function which(name) {
  const ext = process.platform === "win32" ? [".exe", ".cmd", ".bat", ""] : [""];
  const dirs = (process.env.PATH || "").split(path.delimiter);
  for (const dir of dirs) {
    for (const suffix of ext) {
      const candidate = path.join(dir, name + suffix);
      if (exists(candidate)) return candidate;
    }
  }
  return null;
}

function gitBash() {
  const guesses = [
    process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Git", "bin", "bash.exe"),
    process.env["PROGRAMFILES(X86)"] && path.join(process.env["PROGRAMFILES(X86)"], "Git", "bin", "bash.exe"),
    path.join(os.homedir(), "AppData", "Local", "Programs", "Git", "bin", "bash.exe"),
  ].filter(Boolean);
  return guesses.find(exists) || which("bash");
}

/**
 * Prefer a real Ubuntu/Linux shell. On Windows that is WSL, then Git Bash.
 */
function resolveShell() {
  if (process.platform === "win32") {
    const wsl = which("wsl");
    if (wsl) {
      return {
        file: wsl,
        args: [],
        cwd: os.homedir(),
        label: "Ubuntu (WSL)",
        fallbackArgs: ["-d", "Ubuntu"],
      };
    }
    const bash = gitBash();
    if (bash) {
      return {
        file: bash,
        args: ["--login", "-i"],
        cwd: os.homedir(),
        label: "Git Bash",
      };
    }
    const pwsh = which("pwsh") || which("powershell");
    return {
      file: pwsh || "cmd.exe",
      args: [],
      cwd: os.homedir(),
      label: pwsh ? "PowerShell" : "Command Prompt",
    };
  }

  const shell = process.env.SHELL || "/bin/bash";
  return {
    file: shell,
    args: ["-l"],
    cwd: os.homedir(),
    label: path.basename(shell),
  };
}

function envForPty() {
  return {
    ...process.env,
    TERM: "xterm-256color",
    COLORTERM: "truecolor",
    LANG: process.env.LANG || "en_US.UTF-8",
  };
}

module.exports = { resolveShell, envForPty };
