const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ubuntu", {
  info: () => ipcRenderer.invoke("app:info"),
  create: (opts) => ipcRenderer.invoke("pty:create", opts),
  write: (id, data) => ipcRenderer.send("pty:write", { id, data }),
  resize: (id, cols, rows) => ipcRenderer.send("pty:resize", { id, cols, rows }),
  kill: (id) => ipcRenderer.send("pty:kill", { id }),
  onData: (fn) => ipcRenderer.on("pty:data", (_e, payload) => fn(payload)),
  onExit: (fn) => ipcRenderer.on("pty:exit", (_e, payload) => fn(payload)),
  onMenu: (channel, fn) => ipcRenderer.on(channel, (_e, ...args) => fn(...args)),
  setTitle: (title) => ipcRenderer.send("app:title", title),
  openExternal: (url) => ipcRenderer.send("app:open-external", url),
  readClipboard: () => ipcRenderer.invoke("clip:read"),
  writeClipboard: (text) => ipcRenderer.invoke("clip:write", text),
});
