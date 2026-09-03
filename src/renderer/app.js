const Terminal = window.Terminal;
const FitAddon = window.FitAddon.FitAddon;
const WebLinksAddon = window.WebLinksAddon.WebLinksAddon;

const UBUNTU_THEME = {
  background: "#300A24",
  foreground: "#EEEEEC",
  cursor: "#EEEEEC",
  cursorAccent: "#300A24",
  selectionBackground: "#77216F",
  black: "#2E3436",
  red: "#CC0000",
  green: "#4E9A06",
  yellow: "#C4A000",
  blue: "#3465A4",
  magenta: "#75507B",
  cyan: "#06989A",
  white: "#D3D7CF",
  brightBlack: "#555753",
  brightRed: "#EF2929",
  brightGreen: "#8AE234",
  brightYellow: "#FCE94F",
  brightBlue: "#729FCF",
  brightMagenta: "#AD7FA8",
  brightCyan: "#34E2E2",
  brightWhite: "#EEEEEC",
};

const tabsEl = document.getElementById("tabs");
const terminalsEl = document.getElementById("terminals");
const headerTitle = document.getElementById("header-title");
const btnNew = document.getElementById("btn-new");

let fontSize = 14;
let info = { user: "user", host: "ubuntu", shellLabel: "bash" };
const tabs = [];
let activeId = null;
let nextId = 1;

function fontFamily() {
  return '"Ubuntu Mono", "Cascadia Mono", Consolas, "Liberation Mono", monospace';
}

function makeTerm() {
  const term = new Terminal({
    cursorBlink: true,
    fontFamily: fontFamily(),
    fontSize,
    lineHeight: 1.15,
    theme: UBUNTU_THEME,
    allowProposedApi: true,
    scrollback: 5000,
  });
  const fit = new FitAddon();
  term.loadAddon(fit);
  term.loadAddon(
    new WebLinksAddon((event, uri) => {
      event.preventDefault();
      window.ubuntu.openExternal(uri);
    })
  );
  return { term, fit };
}

async function addTab() {
  const id = String(nextId++);
  const pane = document.createElement("div");
  pane.className = "term-pane";
  pane.dataset.id = id;
  terminalsEl.appendChild(pane);

  const tabBtn = document.createElement("button");
  tabBtn.className = "tab";
  tabBtn.type = "button";
  tabBtn.dataset.id = id;
  tabBtn.innerHTML = `<span>${info.user}@${info.host}: ~</span><button class="close" type="button" title="Close">×</button>`;
  tabBtn.addEventListener("click", (e) => {
    if (e.target.closest(".close")) {
      closeTab(id);
      return;
    }
    activate(id);
  });
  tabsEl.appendChild(tabBtn);

  const { term, fit } = makeTerm();
  term.open(pane);
  fit.fit();

  const tab = { id, term, fit, pane, tabBtn, title: `${info.user}@${info.host}: ~` };
  tabs.push(tab);

  term.onData((data) => window.ubuntu.write(id, data));
  term.onResize(({ cols, rows }) => window.ubuntu.resize(id, cols, rows));
  term.onTitleChange((title) => {
    tab.title = title || tab.title;
    tabBtn.querySelector("span").textContent = tab.title;
    if (activeId === id) {
      headerTitle.textContent = tab.title;
      window.ubuntu.setTitle(tab.title);
    }
  });
  term.attachCustomKeyEventHandler((ev) => {
    const key = ev.key.toLowerCase();
    if (ev.ctrlKey && ev.shiftKey && key === "c") {
      if (ev.type === "keydown") copySelection();
      return false;
    }
    if (ev.ctrlKey && ev.shiftKey && key === "v") {
      if (ev.type === "keydown") paste();
      return false;
    }
    if (ev.ctrlKey && ev.shiftKey && (key === "t" || key === "w")) {
      return false;
    }
    return true;
  });

  await window.ubuntu.create({ id, cols: term.cols, rows: term.rows });
  activate(id);
  requestAnimationFrame(() => {
    fit.fit();
    window.ubuntu.resize(id, term.cols, term.rows);
    term.focus();
  });
}

function activate(id) {
  activeId = id;
  for (const t of tabs) {
    const on = t.id === id;
    t.pane.classList.toggle("active", on);
    t.tabBtn.classList.toggle("active", on);
    if (on) {
      headerTitle.textContent = t.title;
      window.ubuntu.setTitle(t.title);
      t.fit.fit();
      t.term.focus();
    }
  }
}

function closeTab(id) {
  const idx = tabs.findIndex((t) => t.id === id);
  if (idx < 0) return;
  const [tab] = tabs.splice(idx, 1);
  window.ubuntu.kill(id);
  tab.term.dispose();
  tab.pane.remove();
  tab.tabBtn.remove();
  if (!tabs.length) {
    addTab();
    return;
  }
  if (activeId === id) activate(tabs[Math.max(0, idx - 1)].id);
}

function active() {
  return tabs.find((t) => t.id === activeId);
}

function copySelection() {
  const t = active();
  if (!t) return;
  const text = t.term.getSelection();
  if (text) window.ubuntu.writeClipboard(text);
}

async function paste() {
  const t = active();
  if (!t) return;
  const text = await window.ubuntu.readClipboard();
  if (text) window.ubuntu.write(t.id, text);
}

function applyZoom(delta) {
  if (delta === 0) fontSize = 14;
  else fontSize = Math.min(28, Math.max(10, fontSize + delta));
  for (const t of tabs) {
    t.term.options.fontSize = fontSize;
    t.fit.fit();
    window.ubuntu.resize(t.id, t.term.cols, t.term.rows);
  }
}

async function boot() {
  info = await window.ubuntu.info();
  headerTitle.textContent = `${info.user}@${info.host} · ${info.shellLabel}`;

  window.ubuntu.onData(({ id, data }) => {
    tabs.find((t) => t.id === id)?.term.write(data);
  });

  window.ubuntu.onExit(({ id }) => {
    const t = tabs.find((tab) => tab.id === id);
    if (t) t.term.write("\r\n[Process exited]\r\n");
  });

  window.ubuntu.onMenu("menu:new-tab", () => addTab());
  window.ubuntu.onMenu("menu:close-tab", () => activeId && closeTab(activeId));
  window.ubuntu.onMenu("menu:copy", copySelection);
  window.ubuntu.onMenu("menu:paste", paste);
  window.ubuntu.onMenu("menu:zoom", applyZoom);

  btnNew.addEventListener("click", () => addTab());

  window.addEventListener("resize", () => {
    const t = active();
    if (!t) return;
    t.fit.fit();
    window.ubuntu.resize(t.id, t.term.cols, t.term.rows);
  });

  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "t") {
      e.preventDefault();
      addTab();
    }
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "w") {
      e.preventDefault();
      if (activeId) closeTab(activeId);
    }
  });

  await addTab();
}

boot();
