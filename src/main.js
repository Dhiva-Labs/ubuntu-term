const { app, BrowserWindow, ipcMain, Menu, clipboard, shell } = require("electron");
const path = require("path");
const os = require("os");
const pty = require("node-pty");
const { resolveShell, envForPty } = require("./shell");

const sessions = new Map();
let win;
const chosen = resolveShell();

function createWindow() {
  win = new BrowserWindow({
    width: 980,
    height: 620,
    minWidth: 520,
    minHeight: 320,
    backgroundColor: "#300a24",
    title: `${os.userInfo().username}@${os.hostname()}: ~`,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, "renderer", "index.html"));
  buildMenu();
}

function spawnSession(id, cols, rows) {
  const env = envForPty();
  let term;
  try {
    term = pty.spawn(chosen.file, chosen.args, {
      name: "xterm-256color",
      cols: cols || 80,
      rows: rows || 24,
      cwd: chosen.cwd,
      env,
    });
  } catch (err) {
    if (chosen.fallbackArgs) {
      term = pty.spawn(chosen.file, chosen.fallbackArgs, {
        name: "xterm-256color",
        cols: cols || 80,
        rows: rows || 24,
        cwd: chosen.cwd,
        env,
      });
    } else {
      throw err;
    }
  }

  sessions.set(id, term);

  term.onData((data) => {
    if (win && !win.isDestroyed()) {
      win.webContents.send("pty:data", { id, data });
    }
  });

  term.onExit(({ exitCode }) => {
    sessions.delete(id);
    if (win && !win.isDestroyed()) {
      win.webContents.send("pty:exit", { id, exitCode });
    }
  });
}

function killSession(id) {
  const term = sessions.get(id);
  if (!term) return;
  try {
    term.kill();
  } catch {
    /* already gone */
  }
  sessions.delete(id);
}

function buildMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "New Tab",
          accelerator: "CmdOrCtrl+Shift+T",
          click: () => win?.webContents.send("menu:new-tab"),
        },
        {
          label: "Close Tab",
          accelerator: "CmdOrCtrl+Shift+W",
          click: () => win?.webContents.send("menu:close-tab"),
        },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        {
          label: "Copy",
          accelerator: "CmdOrCtrl+Shift+C",
          click: () => win?.webContents.send("menu:copy"),
        },
        {
          label: "Paste",
          accelerator: "CmdOrCtrl+Shift+V",
          click: () => win?.webContents.send("menu:paste"),
        },
        { type: "separator" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        {
          label: "Zoom In",
          accelerator: "CmdOrCtrl+Plus",
          click: () => win?.webContents.send("menu:zoom", 1),
        },
        {
          label: "Zoom Out",
          accelerator: "CmdOrCtrl+-",
          click: () => win?.webContents.send("menu:zoom", -1),
        },
        {
          label: "Reset Zoom",
          accelerator: "CmdOrCtrl+0",
          click: () => win?.webContents.send("menu:zoom", 0),
        },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Terminal",
      submenu: [
        {
          label: "Show Menu Bar",
          type: "checkbox",
          checked: false,
          click: (item) => {
            if (!win) return;
            win.setAutoHideMenuBar(!item.checked);
            win.setMenuBarVisibility(item.checked);
          },
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

ipcMain.handle("app:info", () => ({
  user: os.userInfo().username,
  host: os.hostname(),
  home: os.homedir(),
  platform: process.platform,
  shellLabel: chosen.label,
  shellFile: chosen.file,
}));

ipcMain.handle("pty:create", (_e, { id, cols, rows }) => {
  spawnSession(id, cols, rows);
  return { ok: true };
});

ipcMain.on("pty:write", (_e, { id, data }) => {
  sessions.get(id)?.write(data);
});

ipcMain.on("pty:resize", (_e, { id, cols, rows }) => {
  try {
    sessions.get(id)?.resize(cols, rows);
  } catch {
    /* ignore */
  }
});

ipcMain.on("pty:kill", (_e, { id }) => killSession(id));

ipcMain.handle("clip:read", () => clipboard.readText());
ipcMain.handle("clip:write", (_e, text) => clipboard.writeText(text || ""));

ipcMain.on("app:title", (_e, title) => {
  if (win && !win.isDestroyed() && title) win.setTitle(title);
});

ipcMain.on("app:open-external", (_e, url) => {
  if (typeof url === "string" && /^https?:\/\//i.test(url)) shell.openExternal(url);
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  for (const id of [...sessions.keys()]) killSession(id);
  app.quit();
});
