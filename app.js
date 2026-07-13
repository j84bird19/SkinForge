(() => {
  "use strict";

  const STORAGE_KEY = "skinforge-build01";
  const canvas = document.getElementById("designCanvas");
  const ctx = canvas.getContext("2d");
  const emptyHint = document.getElementById("emptyHint");
  const imageUpload = document.getElementById("imageUpload");
  const toast = document.getElementById("toast");
  const layersList = document.getElementById("layersList");
  const saveState = document.getElementById("saveState");

  const state = {
    projectName: "Untitled Character",
    tool: "select",
    view: "front",
    workspace: "outfit",
    color: "#db4f82",
    zoom: 1,
    layers: [],
    selectedLayerId: null,
    undoStack: [],
    redoStack: [],
    isDrawing: false,
    lastPoint: null,
    draftStroke: null
  };

  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  function snapshot() {
    return JSON.stringify({
      projectName: state.projectName,
      tool: state.tool,
      view: state.view,
      workspace: state.workspace,
      color: state.color,
      layers: state.layers,
      selectedLayerId: state.selectedLayerId
    });
  }

  function restoreSnapshot(raw) {
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    state.projectName = data.projectName || "Untitled Character";
    state.tool = data.tool || "select";
    state.view = data.view || "front";
    state.workspace = data.workspace || "outfit";
    state.color = data.color || "#db4f82";
    state.layers = Array.isArray(data.layers) ? data.layers : [];
    state.selectedLayerId = data.selectedLayerId || state.layers.at(-1)?.id || null;
  }

  function pushUndo() {
    state.undoStack.push(snapshot());
    if (state.undoStack.length > 40) state.undoStack.shift();
    state.redoStack = [];
  }

  function autosave() {
    try {
      localStorage.setItem(STORAGE_KEY, snapshot());
      saveState.textContent = "Autosaved locally";
      setTimeout(() => saveState.textContent = "All changes saved", 700);
    } catch (error) {
      console.error(error);
      saveState.textContent = "Save failed";
      showToast("Could not save locally");
    }
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
  }

  function selectedLayer() {
    return state.layers.find(layer => layer.id === state.selectedLayerId) || null;
  }

  function addLayer(type = "drawing", name = "New Layer", object = {}) {
    pushUndo();
    const layer = {
      id: uid(),
      name,
      type,
      visible: true,
      locked: false,
      opacity: 1,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotation: 0,
      object
    };
    state.layers.push(layer);
    state.selectedLayerId = layer.id;
    syncUI();
    render();
    autosave();
    return layer;
  }

  function createStarterFigure() {
    if (state.layers.length) return;
    const figure = {
      kind: "figure",
      accent: state.color,
      view: state.view
    };
    addLayer("figure", "Character Base", figure);
    emptyHint.classList.add("hidden");
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f4f1e9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGuide();

    state.layers.forEach(layer => {
      if (!layer.visible) return;
      ctx.save();
      ctx.globalAlpha = layer.opacity ?? 1;
      if (layer.type === "image" && layer.object?.src) drawImageLayer(layer);
      if (layer.type === "figure") drawFigure(layer);
      if (layer.type === "drawing") drawStrokeLayer(layer);
      if (layer.type === "shape") drawShapeLayer(layer);
      if (layer.type === "text") drawTextLayer(layer);
      ctx.restore();
    });

    if (state.draftStroke) {
      ctx.save();
      ctx.strokeStyle = state.draftStroke.color;
      ctx.lineWidth = state.draftStroke.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      state.draftStroke.points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawGuide() {
    ctx.save();
    ctx.strokeStyle = "rgba(44,48,61,.09)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 60);
    ctx.lineTo(canvas.width / 2, canvas.height - 60);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(44,48,61,.35)";
    ctx.font = "700 18px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(`${state.view.toUpperCase()} VIEW`, canvas.width / 2, 40);
    ctx.restore();
  }

  function drawFigure(layer) {
    const accent = layer.object?.accent || state.color;
    const cx = canvas.width / 2 + (layer.x || 0);
    const top = 150 + (layer.y || 0);

    ctx.save();
    ctx.translate(cx, top);
    ctx.rotate((layer.rotation || 0) * Math.PI / 180);

    const side = state.view === "side";
    const back = state.view === "back";

    ctx.fillStyle = "#232632";
    ctx.strokeStyle = "#151722";
    ctx.lineWidth = 8;

    ctx.beginPath();
    ctx.ellipse(0, 62, side ? 43 : 58, 67, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(side ? -42 : -92, 145);
    ctx.quadraticCurveTo(0, 92, side ? 44 : 92, 145);
    ctx.lineTo(side ? 64 : 118, 520);
    ctx.quadraticCurveTo(0, 590, side ? -52 : -118, 520);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#1b1d28";
    ctx.beginPath();
    ctx.moveTo(-92, 160);
    ctx.lineTo(-178, 470);
    ctx.lineTo(-120, 490);
    ctx.lineTo(-20, 210);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(92, 160);
    ctx.lineTo(178, 470);
    ctx.lineTo(120, 490);
    ctx.lineTo(20, 210);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-72, 515);
    ctx.lineTo(-112, 870);
    ctx.lineTo(-35, 870);
    ctx.lineTo(0, 545);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(72, 515);
    ctx.lineTo(112, 870);
    ctx.lineTo(35, 870);
    ctx.lineTo(0, 545);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#12141c";
    ctx.fillRect(-132, 850, 108, 48);
    ctx.fillRect(24, 850, 108, 48);

    ctx.strokeStyle = "#f6f2e9";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-50, 12);
    ctx.quadraticCurveTo(0, -40, 55, 10);
    ctx.stroke();

    ctx.strokeStyle = back ? "#f5b642" : "#62d7ff";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(-60, 220);
    ctx.lineTo(64, 350);
    ctx.lineTo(-48, 458);
    ctx.stroke();

    ctx.restore();
  }

  function drawImageLayer(layer) {
    if (!layer.object.image) {
      const image = new Image();
      image.onload = () => {
        layer.object.image = image;
        if (!layer.width || layer.width === 100) {
          const maxW = 620;
          const scale = Math.min(1, maxW / image.width);
          layer.width = image.width * scale;
          layer.height = image.height * scale;
        }
        render();
      };
      image.src = layer.object.src;
      return;
    }
    const image = layer.object.image;
    const x = canvas.width / 2 - layer.width / 2 + layer.x;
    const y = canvas.height / 2 - layer.height / 2 + layer.y;
    ctx.save();
    ctx.translate(x + layer.width / 2, y + layer.height / 2);
    ctx.rotate(layer.rotation * Math.PI / 180);
    ctx.drawImage(image, -layer.width / 2, -layer.height / 2, layer.width, layer.height);
    ctx.restore();
  }

  function drawStrokeLayer(layer) {
    const points = layer.object?.points || [];
    if (points.length < 2) return;
    ctx.strokeStyle = layer.object.color || state.color;
    ctx.lineWidth = layer.object.size || 12;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.stroke();
  }

  function drawShapeLayer(layer) {
    ctx.save();
    ctx.translate(canvas.width/2 + layer.x, canvas.height/2 + layer.y);
    ctx.rotate(layer.rotation * Math.PI / 180);
    ctx.fillStyle = layer.object.color || state.color;
    ctx.fillRect(-layer.width/2, -layer.height/2, layer.width, layer.height);
    ctx.restore();
  }

  function drawTextLayer(layer) {
    ctx.save();
    ctx.translate(canvas.width/2 + layer.x, canvas.height/2 + layer.y);
    ctx.rotate(layer.rotation * Math.PI / 180);
    ctx.fillStyle = layer.object.color || state.color;
    ctx.font = `900 ${Math.max(18, layer.height / 2)}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText(layer.object.text || "CHARACTER", 0, 0);
    ctx.restore();
  }

  function syncUI() {
    document.getElementById("projectName").value = state.projectName;
    document.querySelectorAll("[data-tool]").forEach(btn => btn.classList.toggle("active", btn.dataset.tool === state.tool));
    document.querySelectorAll("[data-view]").forEach(btn => btn.classList.toggle("active", btn.dataset.view === state.view));
    document.querySelectorAll("[data-workspace]").forEach(btn => btn.classList.toggle("active", btn.dataset.workspace === state.workspace));
    document.querySelectorAll(".swatch").forEach(btn => btn.classList.toggle("active", btn.dataset.color === state.color));
    document.documentElement.style.setProperty("--accent", state.color);
    canvas.style.transform = `scale(${state.zoom})`;
    document.getElementById("zoomLabel").textContent = `${Math.round(state.zoom * 100)}%`;
    renderLayers();
    syncProperties();
    emptyHint.classList.toggle("hidden", state.layers.length > 0);
  }

  function renderLayers() {
    layersList.innerHTML = "";
    [...state.layers].reverse().forEach(layer => {
      const row = document.createElement("div");
      row.className = `layer-row ${layer.id === state.selectedLayerId ? "active" : ""}`;
      row.innerHTML = `
        <div class="layer-thumb"></div>
        <div class="layer-name">${escapeHtml(layer.name)}</div>
        <button class="layer-icon visibility" title="Toggle visibility">${layer.visible ? "◉" : "○"}</button>
        <button class="layer-icon lock" title="Toggle lock">${layer.locked ? "🔒" : "🔓"}</button>
      `;
      row.addEventListener("click", event => {
        if (event.target.closest("button")) return;
        state.selectedLayerId = layer.id;
        syncUI();
      });
      row.querySelector(".visibility").addEventListener("click", () => {
        layer.visible = !layer.visible;
        syncUI(); render(); autosave();
      });
      row.querySelector(".lock").addEventListener("click", () => {
        layer.locked = !layer.locked;
        syncUI(); autosave();
      });
      layersList.appendChild(row);
    });
  }

  function syncProperties() {
    const layer = selectedLayer();
    const values = {
      propX: layer?.x ?? 0,
      propY: layer?.y ?? 0,
      propW: Math.round(layer?.width ?? 100),
      propH: Math.round(layer?.height ?? 100),
      propRotation: layer?.rotation ?? 0,
      propOpacity: Math.round((layer?.opacity ?? 1) * 100)
    };
    Object.entries(values).forEach(([id, value]) => document.getElementById(id).value = value);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
    })[char]);
  }

  function handleImage(file) {
    if (!file || !file.type.startsWith("image/")) {
      showToast("Choose an image file");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => showToast("Could not read that image");
    reader.onload = () => {
      addLayer("image", file.name.replace(/\.[^.]+$/, ""), { src: reader.result });
      emptyHint.classList.add("hidden");
      showToast("Reference image added");
    };
    reader.readAsDataURL(file);
  }

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  canvas.addEventListener("pointerdown", event => {
    if (state.tool === "draw") {
      state.isDrawing = true;
      canvas.setPointerCapture(event.pointerId);
      const p = canvasPoint(event);
      state.draftStroke = { points:[p], color:state.color, size:12 };
      render();
    }
  });

  canvas.addEventListener("pointermove", event => {
    if (!state.isDrawing || state.tool !== "draw") return;
    state.draftStroke.points.push(canvasPoint(event));
    render();
  });

  canvas.addEventListener("pointerup", event => {
    if (!state.isDrawing || !state.draftStroke) return;
    state.isDrawing = false;
    const stroke = state.draftStroke;
    state.draftStroke = null;
    if (stroke.points.length > 1) {
      addLayer("drawing", `Drawing ${state.layers.length + 1}`, stroke);
    } else render();
  });

  document.querySelectorAll("[data-tool]").forEach(btn => btn.addEventListener("click", () => {
    state.tool = btn.dataset.tool;
    if (state.tool === "image") imageUpload.click();
    if (state.tool === "shape") {
      addLayer("shape", `Shape ${state.layers.length + 1}`, { color: state.color });
      const layer = selectedLayer();
      layer.width = 180; layer.height = 180;
      render(); syncUI();
    }
    if (state.tool === "text") {
      const text = prompt("Text to add:", "CHARACTER");
      if (text) {
        addLayer("text", text, { text, color: state.color });
        const layer = selectedLayer();
        layer.width = 300; layer.height = 80;
        syncUI(); render();
      }
    }
    syncUI();
  }));

  document.querySelectorAll("[data-view]").forEach(btn => btn.addEventListener("click", () => {
    state.view = btn.dataset.view;
    state.layers.filter(l => l.type === "figure").forEach(l => l.object.view = state.view);
    syncUI(); render(); autosave();
  }));

  document.querySelectorAll("[data-workspace]").forEach(btn => btn.addEventListener("click", () => {
    state.workspace = btn.dataset.workspace;
    showToast(`${btn.textContent} workspace selected`);
    syncUI(); autosave();
  }));

  document.querySelectorAll(".swatch").forEach(btn => btn.addEventListener("click", () => {
    state.color = btn.dataset.color;
    const layer = selectedLayer();
    if (layer?.type === "figure") layer.object.accent = state.color;
    if (["shape","drawing","text"].includes(layer?.type)) layer.object.color = state.color;
    syncUI(); render(); autosave();
  }));

  document.getElementById("customColor").addEventListener("input", event => {
    state.color = event.target.value;
    document.documentElement.style.setProperty("--accent", state.color);
    const layer = selectedLayer();
    if (layer?.type === "figure") layer.object.accent = state.color;
    render(); autosave();
  });

  imageUpload.addEventListener("change", event => {
    handleImage(event.target.files?.[0]);
    event.target.value = "";
  });
  document.getElementById("uploadHeroBtn").addEventListener("click", () => imageUpload.click());

  document.getElementById("addLayerBtn").addEventListener("click", () => addLayer("drawing", `Layer ${state.layers.length + 1}`, { points:[], color:state.color, size:12 }));

  document.getElementById("projectName").addEventListener("input", event => {
    state.projectName = event.target.value;
    autosave();
  });

  ["propX","propY","propW","propH","propRotation","propOpacity"].forEach(id => {
    document.getElementById(id).addEventListener("input", event => {
      const layer = selectedLayer();
      if (!layer || layer.locked) return;
      const value = Number(event.target.value);
      if (id === "propX") layer.x = value;
      if (id === "propY") layer.y = value;
      if (id === "propW") layer.width = Math.max(1, value);
      if (id === "propH") layer.height = Math.max(1, value);
      if (id === "propRotation") layer.rotation = value;
      if (id === "propOpacity") layer.opacity = Math.min(1, Math.max(0, value / 100));
      render(); autosave();
    });
  });

  document.getElementById("duplicateBtn").addEventListener("click", () => {
    const layer = selectedLayer();
    if (!layer) return showToast("Select a layer first");
    pushUndo();
    const copy = JSON.parse(JSON.stringify(layer));
    copy.id = uid(); copy.name = `${layer.name} Copy`; copy.x += 24; copy.y += 24;
    if (copy.object?.image) delete copy.object.image;
    state.layers.push(copy); state.selectedLayerId = copy.id;
    syncUI(); render(); autosave(); showToast("Layer duplicated");
  });

  document.getElementById("deleteBtn").addEventListener("click", () => {
    const index = state.layers.findIndex(l => l.id === state.selectedLayerId);
    if (index < 0) return showToast("Select a layer first");
    pushUndo();
    state.layers.splice(index, 1);
    state.selectedLayerId = state.layers.at(-1)?.id || null;
    syncUI(); render(); autosave(); showToast("Layer deleted");
  });

  document.getElementById("undoBtn").addEventListener("click", () => {
    const previous = state.undoStack.pop();
    if (!previous) return showToast("Nothing to undo");
    state.redoStack.push(snapshot());
    restoreSnapshot(previous);
    syncUI(); render(); autosave();
  });

  document.getElementById("redoBtn").addEventListener("click", () => {
    const next = state.redoStack.pop();
    if (!next) return showToast("Nothing to redo");
    state.undoStack.push(snapshot());
    restoreSnapshot(next);
    syncUI(); render(); autosave();
  });

  document.getElementById("zoomIn").addEventListener("click", () => {
    state.zoom = Math.min(1.8, state.zoom + .1); syncUI();
  });
  document.getElementById("zoomOut").addEventListener("click", () => {
    state.zoom = Math.max(.5, state.zoom - .1); syncUI();
  });
  document.getElementById("fitBtn").addEventListener("click", () => {
    state.zoom = 1; syncUI();
  });

  document.getElementById("saveBtn").addEventListener("click", () => {
    autosave(); showToast("Project saved locally");
  });

  document.getElementById("exportBtn").addEventListener("click", () => {
    if (!state.layers.length) createStarterFigure();
    const link = document.createElement("a");
    link.download = `${state.projectName.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "skinforge-character"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("Character sheet exported");
  });

  document.querySelectorAll("[data-kit]").forEach(btn => btn.addEventListener("click", () => {
    const names = {
      backbling:"Back Bling Concept",
      pickaxe:"Pickaxe Concept",
      glider:"Glider Concept",
      emote:"Emote Notes"
    };
    addLayer("shape", names[btn.dataset.kit], { color:state.color });
    const layer = selectedLayer();
    layer.width = 150; layer.height = 150;
    layer.x = 220; layer.y = -160 + state.layers.length * 12;
    syncUI(); render();
    showToast(`${names[btn.dataset.kit]} added`);
  }));

  document.getElementById("analyzeBtn").addEventListener("click", () => {
    let score = 35;
    score += Math.min(25, state.layers.length * 5);
    if (state.layers.some(l => l.type === "figure")) score += 15;
    if (state.layers.some(l => l.type === "image")) score += 8;
    if (state.layers.some(l => l.type === "drawing" || l.type === "shape")) score += 8;
    if (state.projectName.trim() && state.projectName !== "Untitled Character") score += 9;
    score = Math.min(100, score);

    document.getElementById("scorePanel").classList.remove("hidden");
    document.getElementById("scoreNumber").textContent = score;
    document.getElementById("scoreTitle").textContent =
      score >= 85 ? "Submission-ready foundation" :
      score >= 65 ? "Strong concept direction" :
      "Needs a clearer signature";
    document.getElementById("scoreText").textContent =
      score >= 85 ? "Clear theme, readable silhouette, and coordinated accessory potential." :
      score >= 65 ? "Push one signature feature harder and add an alternate style." :
      "Add a character base, one memorable item, and a tighter color story.";
  });

  document.querySelectorAll("[data-mobile-panel]").forEach(btn => btn.addEventListener("click", () => {
    const side = btn.dataset.mobilePanel;
    document.querySelector(".left-panel").classList.toggle("open", side === "left" && !document.querySelector(".left-panel").classList.contains("open"));
    document.querySelector(".right-panel").classList.toggle("open", side === "right" && !document.querySelector(".right-panel").classList.contains("open"));
  }));

  document.querySelector("[data-mobile-center]").addEventListener("click", () => {
    document.querySelector(".left-panel").classList.remove("open");
    document.querySelector(".right-panel").classList.remove("open");
  });

  function load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { restoreSnapshot(saved); }
      catch (error) { console.error("Could not restore project", error); }
    }
    syncUI();
    render();
  }

  window.addEventListener("beforeunload", autosave);
  window.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault(); autosave(); showToast("Project saved locally");
    }
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(console.error));
  }

  load();
})();