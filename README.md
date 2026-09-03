# Ubuntu Terminal (Windows)

A desktop terminal that looks like Ubuntu’s GNOME Terminal and runs a **Unix-style shell out of the box**. You do not need WSL, Git Bash, or an Ubuntu distro.

On Windows it ships **BusyBox ash** (`ls`, `grep`, `sed`, `awk`, `find`, `vi`, `wget`, pipes, and the usual `user@host:~$` prompt). On Linux it uses your login shell.

This is a Unix toolkit on Windows, not a Linux kernel. Commands like `apt` and Linux-only binaries are not included.

## Download

Windows x64 builds: [Releases](https://github.com/Dhiva-Labs/ubuntu-term/releases)

- **Ubuntu Terminal-Setup-*.exe** — installer
- **Ubuntu Terminal-Portable-*.exe** — no install

## Run from source

```bash
npm install
npm start
```

## Build the Windows installer

On Windows (or GitHub Actions):

```bash
npm install
npm run dist:win
```

## Shortcuts (GNOME Terminal style)

| Action    | Shortcut        |
|-----------|-----------------|
| New tab   | Ctrl+Shift+T    |
| Close tab | Ctrl+Shift+W    |
| Copy      | Ctrl+Shift+C    |
| Paste     | Ctrl+Shift+V    |
| Zoom      | Ctrl + / − / 0  |
