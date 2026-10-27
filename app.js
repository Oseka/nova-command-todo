const $ = id => document.getElementById(id);
const KEY = "nova-missions";

const DESTS = [
  {id:"kepler", name:"Kepler Reach", info:"A garden world circling three suns. Nobody agrees on what time it is.", c1:"#8affc1", c2:"#1b7f5a", glow:"#3dffa0"},
  {id:"ion", name:"Ion Belt Outpost", info:"A mining belt lit by permanent lightning. Pay is great. Hulls are not.", c1:"#ffd27a", c2:"#b0481a", glow:"#ffb020", ring:true},
  {id:"titan", name:"Titan Dock", info:"An ice harbour where every trade route meets. Everyone is selling something.", c1:"#bfe4ff", c2:"#3b6fb0", glow:"#6fb7ff"},
  {id:"nebula", name:"Nebula Drift", info:"A fog of violet gas. Signals vanish here, and so do some ships.", c1:"#e0a0ff", c2:"#5a1fa6", glow:"#b04dff"},
  {id:"crimson", name:"Crimson Moon", info:"A red desert moon with a dead city sleeping under the dust.", c1:"#ff9a8a", c2:"#8f1d2c", glow:"#ff4d5e"},
  {id:"void", name:"Void Station Zero", info:"The last light before deep space. Last stop for fuel, and for second thoughts.", c1:"#9aa7c9", c2:"#20263f", glow:"#7d8cff", ring:true}
];
const CREW = [
  {id:"vex", name:"Cmdr. Vex", role:"Pilot", icon:"👩‍🚀"},
  {id:"axiom", name:"AXIOM-7", role:"Android engineer", icon:"🤖"},
  {id:"soren", name:"Dr. Soren", role:"Xenobiologist", icon:"👽"},
  {id:"kade", name:"Kade", role:"Smuggler", icon:"🛸"}
];
const PRI = ["Routine", "Urgent", "Critical"];
const STEPS = ["On pad", "In orbit", "Landed"];
const ADV = ["Launch", "Land", "Re-arm"];

let missions = [], filter = "all", query = "", selDest = DESTS[0].id, selCrew = CREW[0].id;
const byId = (arr, id) => arr.find(x => x.id === id);
const pad = n => String(n).padStart(2, "0");


try { missions = JSON.parse(localStorage.getItem(KEY)); } catch { missions = null; }
if (!Array.isArray(missions)) {
  const h = 3600e3, n = Date.now();
  missions = [
    {id:1, text:"Finish the weather dashboard", dest:"nebula", crew:"axiom", pri:2, st:1, due:n + 26*h},
    {id:2, text:"Push every project to GitHub", dest:"titan", crew:"vex", pri:1, st:0, due:n + 52*h},
    {id:3, text:"Design the shop screenshots", dest:"kepler", crew:"soren", pri:0, st:2, due:0}
  ];
}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(missions)); } catch {} };


function planet(d, small) {
  const p = document.createElement("span");
  p.className = "planet" + (d.ring ? " ring" : "") + (small ? " sm" : "");
  p.style.setProperty("--c1", d.c1); p.style.setProperty("--c2", d.c2); p.style.setProperty("--glow", d.glow);
  return p;
}
function renderDests() {
  const box = $("dests"); box.innerHTML = "";
  DESTS.forEach(d => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "dest"; b.setAttribute("aria-pressed", d.id === selDest);
    const name = document.createElement("b"); name.textContent = d.name;
    b.append(planet(d), name);
    b.addEventListener("click", () => { selDest = d.id; renderDests(); });
    box.appendChild(b);
  });
  $("destInfo").textContent = byId(DESTS, selDest).info;
}
function renderCrew() {
  const box = $("crew"); box.innerHTML = "";
  CREW.forEach(c => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.setAttribute("aria-pressed", c.id === selCrew);
    const av = document.createElement("span"); av.className = "av"; av.textContent = c.icon;
    const t = document.createElement("span");
    const n = document.createElement("b"); n.textContent = c.name;
    const r = document.createElement("small"); r.textContent = c.role;
    t.append(n, r); b.append(av, t);
    b.addEventListener("click", () => { selCrew = c.id; renderCrew(); });
    box.appendChild(b);
  });
}


function countdown(m) {
  if (m.st === 2) return {text:"Mission complete", late:false};
  if (!m.due) return null;
  const diff = m.due - Date.now();
  if (diff <= 0) return {text:"Overdue", late:true};
  const s = Math.floor(diff / 1000), d = Math.floor(s / 86400);
  const hms = `${pad(Math.floor(s % 86400 / 3600))}:${pad(Math.floor(s % 3600 / 60))}:${pad(s % 60)}`;
  return {text:"T-" + (d ? d + "d " : "") + hms, late:false};
}
function buildCard(m) {
  const d = byId(DESTS, m.dest), c = byId(CREW, m.crew);
  const li = document.createElement("li");
  li.className = "mission"; li.dataset.pri = m.pri; li.dataset.st = m.st;

  const body = document.createElement("div"); body.className = "m-body";
  const h = document.createElement("h3"); h.textContent = m.text;
  const meta = document.createElement("div"); meta.className = "m-meta";
  const where = document.createElement("span"); where.textContent = "→ " + d.name;
  const who = document.createElement("span"); who.textContent = `${c.icon} ${c.name}`;
  const pill = document.createElement("span"); pill.className = "pill p" + m.pri; pill.textContent = PRI[m.pri];
  meta.append(where, who, pill);
  const cd = countdown(m);
  if (cd) {
    const t = document.createElement("span"); t.className = "tminus" + (cd.late ? " late" : "");
    t.textContent = cd.text; if (m.due && m.st < 2) t.dataset.due = m.due; meta.appendChild(t);
  }
  const track = document.createElement("div"); track.className = "track";
  [0, 1, 2].forEach(i => { const s = document.createElement("i"); if (i <= m.st) s.className = "on"; track.appendChild(s); });
  const tl = document.createElement("div"); tl.className = "track-l";
  STEPS.forEach(s => { const x = document.createElement("span"); x.textContent = s; tl.appendChild(x); });
  body.append(h, meta, track, tl);

  const acts = document.createElement("div"); acts.className = "acts";
  const adv = document.createElement("button"); adv.className = "adv"; adv.dataset.act = "adv"; adv.dataset.id = m.id;
  adv.textContent = ADV[m.st]; adv.setAttribute("aria-label", `${ADV[m.st]}: ${m.text}`);
  const del = document.createElement("button"); del.className = "scrub"; del.dataset.act = "del"; del.dataset.id = m.id;
  del.textContent = "Scrub mission"; del.setAttribute("aria-label", `Scrub mission: ${m.text}`);
  acts.append(adv, del);

  li.append(planet(d, true), body, acts);
  return li;
}
function render() {
  const q = query.toLowerCase();
  const shown = missions.filter(m => (filter === "all" || m.st === +filter) && m.text.toLowerCase().includes(q))
    .sort((a, b) => (a.st === 2) - (b.st === 2) || b.pri - a.pri || (a.due || 9e15) - (b.due || 9e15) || a.id - b.id);
  const list = $("list"); list.innerHTML = "";
  if (!shown.length) {
    const e = document.createElement("li"); e.className = "empty";
    e.textContent = missions.length ? "No missions match this view" : "The launch bay is empty. Brief your first mission.";
    list.appendChild(e);
  } else shown.forEach(m => list.appendChild(buildCard(m)));
  const total = missions.length, orbit = missions.filter(m => m.st === 1).length, land = missions.filter(m => m.st === 2).length;
  const pct = total ? Math.round(land / total * 100) : 0;
  $("sTotal").textContent = total; $("sOrbit").textContent = orbit; $("sLand").textContent = land;
  $("sPct").textContent = pct + "%"; $("ring").style.setProperty("--p", pct);
  save();
}
function tickCountdowns() {
  document.querySelectorAll("[data-due]").forEach(el => {
    const cd = countdown({st:0, due:+el.dataset.due});
    el.textContent = cd.text; el.classList.toggle("late", cd.late);
  });
  const d = new Date();
  $("clock").textContent = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}
setInterval(tickCountdowns, 1000);

let toastT;
function toast(msg) {
  const t = $("toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2200);
}


$("form").addEventListener("submit", e => {
  e.preventDefault();
  const text = $("text").value.trim();
  if (!text) { $("error").textContent = "Give the mission an objective before launch."; return; }
  $("error").textContent = "";
  const due = $("due").value ? new Date($("due").value).getTime() : 0;
  missions.push({id:Date.now(), text, dest:selDest, crew:selCrew, pri:+$("pri").value, st:0, due});
  $("text").value = ""; $("due").value = ""; $("pri").value = "0";
  warp = 1.4; toast("Mission briefed: " + byId(DESTS, selDest).name);
  render();
});
$("list").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  const m = missions.find(x => x.id === +b.dataset.id); if (!m) return;
  if (b.dataset.act === "del") { missions = missions.filter(x => x !== m); toast("Mission scrubbed"); }
  else {
    m.st = (m.st + 1) % 3;
    if (m.st === 1) { warp = 1.6; toast("Launched! Heading for " + byId(DESTS, m.dest).name); }
    if (m.st === 2) { const r = b.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2); toast("Touchdown on " + byId(DESTS, m.dest).name); }
  }
  render();
});
$("list").addEventListener("pointermove", e => {
  const c = e.target.closest(".mission"); if (!c) return;
  const r = c.getBoundingClientRect();
  c.style.setProperty("--mx", e.clientX - r.left + "px"); c.style.setProperty("--my", e.clientY - r.top + "px");
});
document.querySelectorAll(".filters button").forEach(b => b.addEventListener("click", () => {
  filter = b.dataset.f;
  document.querySelectorAll(".filters button").forEach(x => x.setAttribute("aria-pressed", x === b)); render();
}));
$("search").addEventListener("input", e => { query = e.target.value.trim(); render(); });
$("clearLanded").addEventListener("click", () => { missions = missions.filter(m => m.st !== 2); render(); });
$("wipe").addEventListener("click", () => { if (confirm("Remove every mission?")) { missions = []; render(); } });
document.addEventListener("keydown", e => {
  if (e.target.matches("input,select,textarea") || e.ctrlKey || e.metaKey) return;
  if (e.key === "n" || e.key === "N") { e.preventDefault(); $("text").focus(); }
  if (e.key === "/") { e.preventDefault(); $("search").focus(); }
});


const cv = $("space"), cx = cv.getContext("2d");
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
let W, H, stars = [], parts = [], mx = 0, my = 0, warp = 0;
function resize() {
  W = cv.width = innerWidth; H = cv.height = innerHeight;
  stars = Array.from({length: Math.min(280, Math.floor(W * H / 5500))}, () => ({x:Math.random() * W, y:Math.random() * H, z:Math.random() * .9 + .1}));
}
function burst(x, y) {
  if (still) return;
  for (let i = 0; i < 46; i++) { const a = Math.random() * 6.283, v = 2 + Math.random() * 5;
    parts.push({x, y, vx:Math.cos(a) * v, vy:Math.sin(a) * v, l:1, c:["#3df5ff", "#7dff6b", "#ff3dac", "#fff"][i % 4]}); }
}
function frame() {
  cx.clearRect(0, 0, W, H);
  for (const s of stars) {
    s.x -= s.z * (.25 + warp * 22); if (s.x < -80) { s.x = W + 10; s.y = Math.random() * H; }
    const px = s.x + mx * s.z * 24, py = s.y + my * s.z * 24;
    cx.strokeStyle = `rgba(190,225,255,${.35 + s.z * .6})`; cx.lineWidth = s.z * 1.8;
    cx.beginPath(); cx.moveTo(px, py); cx.lineTo(px + 1 + warp * s.z * 90, py); cx.stroke();
  }
  warp *= .95; if (warp < .01) warp = 0;
  for (const p of parts) { p.x += p.vx; p.y += p.vy; p.vy += .08; p.l -= .018; cx.globalAlpha = Math.max(p.l, 0); cx.fillStyle = p.c; cx.fillRect(p.x, p.y, 3, 3); }
  cx.globalAlpha = 1; parts = parts.filter(p => p.l > 0);
  requestAnimationFrame(frame);
}
addEventListener("resize", resize);
addEventListener("pointermove", e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
resize();
if (still) { warp = 0; frame = () => {}; }
else requestAnimationFrame(frame);

renderDests(); renderCrew(); render(); tickCountdowns();
