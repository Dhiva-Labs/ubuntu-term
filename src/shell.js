const os = require("os");
const path = require("path");
const { busyboxPath, exists, envForUnixShell } = require("./unix-runtime");

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
 * On Windows, use the bundled Unix shell (BusyBox ash) so the app works
 * without WSL. Git Bash is a fallback. PowerShell is last resort.
 */
function resolveShell() {
  if (process.platform === "win32") {
    const force = (process.env.UBUNTU_TERM_SHELL || "").toLowerCase();
    if (force === "wsl") {
      const wsl = which("wsl");
      if (wsl) {
        return {
          file: wsl,
          args: [],
          cwd: os.homedir(),
          label: "WSL",
          fallbackArgs: ["-d", "Ubuntu"],
          env: null,
        };
      }
    }

    const busybox = busyboxPath();
    if (exists(busybox) && force !== "gitbash") {
      return {
        file: busybox,
        args: ["ash", "-i"],
        cwd: os.homedir(),
        label: "ash",
        env: envForUnixShell(),
      };
    }

    const bash = gitBash();
    if (bash) {
      return {
        file: bash,
        args: ["--login", "-i"],
        cwd: os.homedir(),
        label: "bash",
        env: null,
      };
    }

    const pwsh = which("pwsh") || which("powershell");
    return {
      file: pwsh || "cmd.exe",
      args: [],
      cwd: os.homedir(),
      label: pwsh ? "PowerShell" : "Command Prompt",
      env: null,
    };
  }

  const shell = process.env.SHELL || "/bin/bash";
  return {
    file: shell,
    args: ["-l"],
    cwd: os.homedir(),
    label: path.basename(shell),
    env: null,
  };
}

function envForPty(chosen) {
  if (chosen && chosen.env) return chosen.env;
  return {
    ...process.env,
    TERM: "xterm-256color",
    COLORTERM: "truecolor",
    LANG: process.env.LANG || "en_US.UTF-8",
  };
}

module.exports = { resolveShell, envForPty };
