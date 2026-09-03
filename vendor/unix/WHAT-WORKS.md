# What works / what does not

Ubuntu Terminal on Windows is a **Unix-style shell + toolkit**, not a full Linux OS.
**No WSL, Git Bash, or Ubuntu distro is required.**

---

## Works out of the box

These are the everyday Linux habits this app is built for.

### Files and folders

| Command | Example | Notes |
|---------|---------|--------|
| `ls` | `ls` | List files (color) |
| `ll` | `ll` | Long list (`ls -alF`) |
| `la` / `l` | `la` | More listing aliases |
| `cd` / `pwd` | `cd Documents` | Change / print directory |
| `mkdir` | `mkdir my-app` | Create folder |
| `cp` | `cp a.txt b.txt` | Copy |
| `mv` | `mv old.txt new.txt` | Move / rename |
| `rm` | `rm file.txt` | Delete file |
| `rm -rf` | `rm -rf folder/` | Recursive delete (same idea as Linux) |
| `touch` | `touch notes.txt` | Create empty file |

### View / search / text

| Command | Notes |
|---------|--------|
| `cat`, `head`, `tail`, `less`, `more` | Read files |
| `grep`, `find`, `sed`, `awk` | Search and process text |
| `sort`, `uniq`, `wc` | Sort / count |
| pipes `\|`, redirects `>`, `>>`, `<` | Like Linux |

### Editor

| Command | Notes |
|---------|--------|
| `vi` | BusyBox editor — works in this terminal |
| `vim` | Same as `vi` (simple Vim-style keys, not full Vim/Neovim) |

Keys: `i` insert → `Esc` → `:w` save → `:q` quit → `:wq` save and quit.

### Git (bundled MinGit)

| Command | Notes |
|---------|--------|
| `git clone …` | Clone repos (HTTPS; SSH if Windows OpenSSH keys exist) |
| `git status` / `git add` / `git commit` | Everyday local work |
| `git pull` / `git push` / `git fetch` | Needs network + credentials |
| `git branch` / `git checkout` / `git log` / `git diff` | Supported |

### Terminal agents (AI coding CLIs)

The app **does not ship** Claude / Cursor / Codex / Gemini themselves (they need your own install + API/login).

If those CLIs are already installed on Windows, **they run in this terminal** like any other command.

| Helper | What it does |
|--------|----------------|
| `agents` | Lists which agent CLIs are detected on your PATH |
| `helpme` | Prints a short cheat sheet for built-in tools |

Examples once installed on Windows:

```bash
agents
claude
cursor-agent
npx -y @openai/codex
```

### App UI

| Feature | Shortcut |
|---------|----------|
| New tab | Ctrl+Shift+T |
| Close tab | Ctrl+Shift+W |
| Copy / Paste | Ctrl+Shift+C / Ctrl+Shift+V |
| Zoom | Ctrl + / − / 0 |

Prompt looks like Ubuntu: `user@host:~/path$`

---

## Does **not** work (not a Linux OS)

| Thing | Why |
|-------|-----|
| `apt` / `apt-get` / `dpkg` / `snap` | No Ubuntu package manager |
| Full Vim / Neovim plugins | Only BusyBox `vi` |
| Docker / Podman as on Linux | Not bundled |
| `systemd` / `systemctl` | No Linux init |
| Linux-only ELF binaries / AppImages | Windows cannot run them |
| Full Ubuntu desktop | This is a terminal only |
| Built-in Claude/Cursor/Codex without install | Install the CLI on Windows first, then use `agents` |

---

## Works if already on your Windows PC

Anything already on Windows `PATH` can be run here, for example:

- `node`, `npm`, `python`, `pip`
- `ssh` (Windows OpenSSH)
- `code` (VS Code)
- Agent CLIs you installed globally

---

## Rule of thumb

**Yes out of the box:** `ls`, `ll`, `cp`, `mv`, `rm -rf`, `vim`, `git clone`, pipes, BusyBox tools.  
**Agents:** use them here after you install the CLI on Windows (`agents` to check).  
**No:** full Ubuntu (`apt`, Linux services, Linux-only programs).

Type `helpme` inside the app anytime.
