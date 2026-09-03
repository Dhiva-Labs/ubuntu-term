# Ubuntu Terminal (Windows)

A desktop terminal that looks and behaves like Ubuntu’s GNOME Terminal.

On Windows it uses **WSL Ubuntu** if installed, otherwise **Git Bash**, otherwise PowerShell. On Linux it uses your login shell.

## Download

Windows x64 builds are on the [Releases](https://github.com/Dhiva-Labs/ubuntu-term/releases) page:

- **Ubuntu Terminal Setup.exe** — installer (NSIS)
- **Ubuntu Terminal*.exe** — portable, no install

## Run

```bash
npm install
npm start
```

## Download (Windows)

Grab the latest `.exe` from [Releases](https://github.com/Dhiva-Labs/ubuntu-term/releases).

- **Setup** installer if you want it in Start Menu
- **Portable** `.exe` if you just want to run it

## Build the Windows installer yourself

From this folder on a Windows machine (or a Windows CI runner):

```bash
npm install
npm run dist:win
```

Installers land in `dist/` (`Ubuntu Terminal Setup.exe` and a portable `.exe`).

## Shortcuts (GNOME Terminal style)

| Action    | Shortcut        |
|-----------|-----------------|
| New tab   | Ctrl+Shift+T    |
| Close tab | Ctrl+Shift+W    |
| Copy      | Ctrl+Shift+C    |
| Paste     | Ctrl+Shift+V    |
| Zoom      | Ctrl + / − / 0  |

For a real Ubuntu userspace on Windows, install [WSL](https://learn.microsoft.com/windows/wsl/install) and the Ubuntu distro (`wsl --install -d Ubuntu`).
