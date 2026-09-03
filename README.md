# Ubuntu Terminal (Windows)

A desktop terminal that looks like Ubuntu’s GNOME Terminal and runs a **Unix-style shell out of the box**. You do not need WSL, Git Bash, or an Ubuntu distro.

On Windows it ships **BusyBox ash** plus **Git**. These work with no extra install:

```bash
ls
ll
vim file.txt
git clone https://github.com/example/repo.git
```

`vim` is BusyBox `vi` (simple, not full Vim). `git` is MinGit, so clone / pull / commit / push work. `apt` and Linux-only binaries are still not included.

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
