/* ===== Gestion des concours, historique, rappels de sauvegarde, hors ligne =====
   Chargé AVANT app.js : app.js utilise Concours.key() pour savoir où enregistrer.
   Stockage :
   - localStorage "boxes.index"    liste des concours [{id, nom, cree, modif, fichier}]
   - localStorage "boxes.current"  id du concours ouvert
   - localStorage "boxes.c.<id>"   état complet du concours (même format que la sauvegarde .json)
   - IndexedDB "boxes-historique"  points de restauration (40 max par concours)
   L'ancienne clé "boxes" (version précédente) est reprise automatiquement et n'est jamais effacée. */
const Concours = (() => {
  const IDX = "boxes.index", CUR = "boxes.current", K = id => "boxes.c." + id;
  const MAX_SNAPS = 40, AUTO_SNAP_MS = 5 * 60 * 1000, REMIND_MS = 2 * 60 * 60 * 1000;
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const fmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" });
  const fmtH = new Intl.DateTimeFormat("fr-FR", { timeStyle: "short" });
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const el = id => document.getElementById(id);

  /* ---------- Liste des concours ---------- */
  const readIdx = () => { try { const a = JSON.parse(localStorage.getItem(IDX) || "[]"); return Array.isArray(a) ? a.filter(c => c && c.id) : []; } catch (e) { return []; } };
  const writeIdx = () => { try { localStorage.setItem(IDX, JSON.stringify(list)); } catch (e) {} };
  let list = readIdx();
  if (!list.length) {
    const old = localStorage.getItem("boxes"), id = uid(), now = Date.now();
    list = [{ id, nom: old ? "Concours actuel" : "Mon premier concours", cree: now, modif: old ? now : 0, fichier: 0 }];
    if (old) localStorage.setItem(K(id), old);
    writeIdx();
  }
  let cur = localStorage.getItem(CUR);
  if (!list.some(c => c.id === cur)) cur = list[0].id;
  localStorage.setItem(CUR, cur);
  const info = (id = cur) => list.find(c => c.id === id);

  const emptyState = () => {
    const P = [{ n: "Bloc A", al: [{ c: 8, g: [], b: [] }, { c: 8, g: [], b: [] }, { c: 8, g: [], b: [] }] }];
    return JSON.stringify({ H: [], G: Array(24).fill(null), P, GROUP_MODE: "both", PERSON_LAYOUTS: {}, GROUP_AREAS: {}, GROUP_LAYOUTS: {}, NO_HOLES: true, RULES: { EJ: "block", EE: "block", AV: "block", facing: false } });
  };
  const counts = json => { try { const o = JSON.parse(json); return { h: (o.H || []).length, p: (o.G || []).filter(x => x != null).length }; } catch (e) { return { h: 0, p: 0 }; } };
  const slug = () => (info()?.nom || "concours").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "concours";

  /* ---------- Historique (IndexedDB) ---------- */
  const dbP = new Promise(res => {
    try {
      const r = indexedDB.open("boxes-historique", 1);
      r.onupgradeneeded = () => { const s = r.result.createObjectStore("snaps", { keyPath: "k", autoIncrement: true }); s.createIndex("cid", "cid"); };
      r.onsuccess = () => res(r.result); r.onerror = () => res(null);
    } catch (e) { res(null); }
  });
  const tx = async (mode, fn) => { const db = await dbP; if (!db) return null; return new Promise(res => { const t = db.transaction("snaps", mode), s = t.objectStore("snaps"); let out; fn(s, v => out = v); t.oncomplete = () => res(out); t.onerror = () => res(null); }); };
  const snapsOf = cid => tx("readonly", (s, set) => { const r = s.index("cid").getAll(cid); r.onsuccess = () => set((r.result || []).sort((a, b) => b.t - a.t)); });
  async function snapshot(raison, cid = cur) {
    const json = localStorage.getItem(K(cid)); if (!json) return false;
    const all = (await snapsOf(cid)) || [];
    if (all[0] && all[0].json === json) return false;
    const c = counts(json);
    await tx("readwrite", s => { s.add({ cid, t: Date.now(), raison, json, nb: c.h, pl: c.p }); all.slice(MAX_SNAPS - 1).forEach(x => s.delete(x.k)); });
    return true;
  }
  const dropSnaps = cid => snapsOf(cid).then(all => all && tx("readwrite", s => all.forEach(x => s.delete(x.k))));

  /* ---------- Changement de concours ---------- */
  let leaving = false;
  async function go(id) { await snapshot("Avant de changer de concours"); leaving = true; localStorage.setItem(CUR, id); location.reload(); }
  function create(nom, json) {
    const id = uid(), now = Date.now();
    localStorage.setItem(K(id), json || emptyState());
    list.push({ id, nom: nom || "Nouveau concours", cree: now, modif: json ? now : 0, fichier: 0 });
    writeIdx(); return id;
  }

  /* ---------- Appelé par app.js à chaque enregistrement ---------- */
  let stateTxt = "";
  function touched() {
    const c = info(); if (!c) return;
    c.modif = Date.now(); writeIdx();
    stateTxt = "Enregistré à " + fmtH.format(new Date()); renderBar();
  }
  function storageFull() { stateTxt = "⚠️ Mémoire du navigateur pleine : téléchargez une sauvegarde .json"; renderBar(); }

  /* ---------- Barre du concours ---------- */
  const dirty = c => c && c.modif > (c.fichier || 0);
  function renderBar() {
    const c = info(); if (!c || !el("ccName")) return;
    el("ccName").textContent = c.nom;
    document.title = c.nom + " · Gestion des boxes";
    const f = c.fichier ? "dernier fichier .json : " + fmt.format(c.fichier) : "aucun fichier .json téléchargé";
    el("ccState").textContent = [stateTxt || "Enregistré dans ce navigateur", f].join(" · ");
    el("ccOffline").hidden = navigator.onLine !== false;
    const late = dirty(c) && (c.fichier ? Date.now() - c.fichier > REMIND_MS : Date.now() - c.cree > 30 * 60 * 1000);
    const snoozed = +sessionStorage.getItem("boxes.snooze." + c.id) > Date.now();
    el("ccRemind").hidden = !(late && !snoozed);
  }

  /* ---------- Fenêtre « Mes concours » ---------- */
  function openList() {
    const d = el("ccDlg"); d.dataset.mode = "list";
    const rows = [...list].sort((a, b) => (b.modif || b.cree) - (a.modif || a.cree)).map(c => {
      const n = counts(localStorage.getItem(K(c.id)) || "{}"), isCur = c.id === cur;
      return `<li class="cc-row${isCur ? " cur" : ""}"><div><strong>${esc(c.nom)}</strong>${isCur ? ' <span class="cc-badge">ouvert</span>' : ""}
        <div class="prep-meta">${n.h} chevaux · ${n.p} placés · modifié ${c.modif ? "le " + fmt.format(c.modif) : "jamais"}</div></div>
        <div class="cc-row-actions">${isCur ? "" : `<button class="main" data-a="open" data-id="${c.id}">Ouvrir</button>`}
        <button data-a="ren" data-id="${c.id}">Renommer</button><button data-a="dup" data-id="${c.id}">Dupliquer</button>
        ${list.length > 1 ? `<button class="danger" data-a="del" data-id="${c.id}">Supprimer</button>` : ""}</div></li>`;
    }).join("");
    d.innerHTML = `<div class="cc-dlg-head"><h2>Mes concours</h2><button data-a="close" aria-label="Fermer">✕</button></div>
      <p class="sub">Chaque concours a ses chevaux, ses groupes, son plan et son historique. Tout reste enregistré dans ce navigateur.</p>
      <ul class="cc-list">${rows}</ul>
      <form class="cc-new" data-f="new"><input name="nom" placeholder="Nom du nouveau concours, ex. FTBGP nov 2026" required><button class="main">Créer un concours vide</button></form>
      <label class="cc-import">Importer une sauvegarde .json comme nouveau concours<input type="file" accept=".json,.txt" data-f="imp"></label>
      <p class="sub" id="ccDlgMsg" role="status" style="margin:0"></p>`;
    if (!d.open) d.showModal();
  }
  async function onListClick(e) {
    const b = e.target.closest("button[data-a]"); if (!b) return;
    const id = b.dataset.id, c = info(id), a = b.dataset.a;
    if (a === "close") return el("ccDlg").close();
    if (a === "open") return go(id);
    if (a === "ren") { const n = prompt("Nouveau nom du concours :", c.nom); if (n && n.trim()) { c.nom = n.trim(); writeIdx(); renderBar(); openList(); } return; }
    if (a === "dup") { const nid = create(c.nom + " (copie)", localStorage.getItem(K(id)) || emptyState()); info(nid).modif = Date.now(); writeIdx(); return go(nid); }
    if (a === "del") {
      const n = counts(localStorage.getItem(K(id)) || "{}");
      if (!confirm(`Supprimer définitivement « ${c.nom} » (${n.h} chevaux) et son historique ?\n\nCette action ne peut pas être annulée. Pensez à télécharger une sauvegarde .json avant.`)) return;
      localStorage.removeItem(K(id)); list = list.filter(x => x.id !== id); writeIdx(); await dropSnaps(id);
      if (id === cur) return go(list[0].id);
      openList();
    }
  }
  function onListSubmit(e) {
    if (e.target.dataset.f !== "new") return; e.preventDefault();
    const nom = e.target.nom.value.trim(); if (!nom) return;
    go(create(nom));
  }
  function onListChange(e) {
    if (e.target.dataset.f !== "imp") return;
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      let c = null; try { c = cleanBackup(JSON.parse(r.result)); } catch (err) {}
      if (!c) { el("ccDlgMsg").textContent = "Fichier non reconnu : ce n’est pas une sauvegarde de cet outil."; e.target.value = ""; return; }
      const nom = prompt("Nom de ce concours :", f.name.replace(/\.(json|txt)$/i, "").replace(/^sauvegarde-boxes-?/, "") || "Concours importé");
      if (nom === null) { e.target.value = ""; return; }
      go(create(nom.trim() || "Concours importé", JSON.stringify(c)));
    };
    r.readAsText(f, "utf-8");
  }

  /* ---------- Fenêtre « Historique » ---------- */
  async function openHist() {
    await snapshot("Ouverture de l’historique");
    const d = el("ccDlg"), all = (await snapsOf(cur)) || []; d.dataset.mode = "hist";
    const rows = all.map((s, i) => `<li class="cc-row"><div><strong>${fmt.format(s.t)}</strong>${i === 0 ? ' <span class="cc-badge">dernier</span>' : ""}
      <div class="prep-meta">${esc(s.raison)} · ${s.nb} chevaux · ${s.pl} placés</div></div>
      <div class="cc-row-actions">${i === 0 ? "" : `<button class="main" data-a="restore" data-k="${s.k}">Revenir à ce point</button>`}<button data-a="file" data-k="${s.k}">Télécharger (.json)</button></div></li>`).join("");
    d.innerHTML = `<div class="cc-dlg-head"><h2>Historique · ${esc(info().nom)}</h2><button data-a="close" aria-label="Fermer">✕</button></div>
      <p class="sub">Un point est créé automatiquement toutes les 5 minutes s’il y a eu des changements, et avant chaque opération importante. Les ${MAX_SNAPS} derniers points sont gardés. Revenir à un point crée d’abord un point « avant restauration » : rien n’est perdu.</p>
      ${all.length ? `<ul class="cc-list">${rows}</ul>` : '<p class="sub">Aucun point pour le moment.</p>'}`;
    d._snaps = all;
    if (!d.open) d.showModal();
  }
  async function onHistClick(e) {
    const b = e.target.closest("button[data-a]"); if (!b || !b.dataset.k) return;
    const s = (el("ccDlg")._snaps || []).find(x => x.k == b.dataset.k); if (!s) return;
    if (b.dataset.a === "file") {
      const d = new Date(s.t), p = n => String(n).padStart(2, "0");
      dl(`historique-${slug()}-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}h${p(d.getMinutes())}.json`, s.json);
      return;
    }
    if (b.dataset.a === "restore") {
      if (!confirm(`Revenir à l’état du ${fmt.format(s.t)} (${s.nb} chevaux, ${s.pl} placés) ?\n\nL’état actuel est gardé dans l’historique.`)) return;
      await snapshot("Avant restauration", cur);
      localStorage.setItem(K(cur), s.json); info().modif = Date.now(); writeIdx();
      leaving = true; location.reload();
    }
  }

  /* ---------- Démarrage ---------- */
  function init() {
    const d = el("ccDlg");
    d.addEventListener("click", e => { if (e.target === d || e.target.closest('[data-a="close"]')) return d.close(); d.dataset.mode === "hist" ? onHistClick(e) : onListClick(e); });
    d.addEventListener("submit", onListSubmit);
    d.addEventListener("change", onListChange);
    el("ccOpen").onclick = openList;
    el("ccHist").onclick = openHist;
    el("ccBk").onclick = () => el("bk").click();
    el("ccLater").onclick = () => { sessionStorage.setItem("boxes.snooze." + cur, Date.now() + 60 * 60 * 1000); renderBar(); };
    el("bk").addEventListener("click", () => { const c = info(); c.fichier = Date.now(); writeIdx(); renderBar(); });
    addEventListener("online", renderBar); addEventListener("offline", renderBar);
    setInterval(() => { snapshot("Automatique"); renderBar(); }, AUTO_SNAP_MS);
    setInterval(renderBar, 60 * 1000);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") snapshot("Automatique"); });
    addEventListener("beforeunload", e => {
      const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname); // pas d’alerte pendant le développement (Live Server recharge la page)
      if (!leaving && !local && dirty(info())) { e.preventDefault(); e.returnValue = ""; }
    });
    snapshot("Ouverture du concours");
    renderBar();
    if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  return { key: () => K(cur), slug, touched, storageFull, init, snapshot, get nom() { return info()?.nom || ""; } };
})();
