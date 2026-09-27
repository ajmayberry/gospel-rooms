/* ───────────── app: the sheet, the press, the people, the camera ───────────── */
const QS = new URLSearchParams(location.search);
const Q = { instant: QS.has('instant'), notour: QS.has('notour'), debug: QS.has('debug'), scene: +QS.get('scene') || 0, t: +QS.get('t') || 0 };
const cv = document.getElementById('c'), g = cv.getContext('2d');
const PHONE = Math.min(innerWidth, innerHeight) < 600;
let W = 0, H = 0, DPR = 1;
function resize() { DPR = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * DPR | 0; cv.height = H * DPR | 0; }
addEventListener('resize', resize); resize();

/* ── sheet layout: five acts, five rooms each ── */
const CW = 380, CHT = 345, MX = 90, MT = 120, MB = 150;
const SHW = MX * 2 + CW * 5, SHH = MT + MB + CHT * 5;
const LV = [1, 2.25, 4.5];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV'];

const lookIds = new WeakMap(); let lookN = 0;
const lookId = L => { let i = lookIds.get(L); if (i === undefined) { i = 'L' + lookN++; lookIds.set(L, i); } return i; };
const ANIM = { dove: { n: 6, dur: .45 }, doveGlide: { n: 1, dur: 1 }, bird: { n: 6, dur: .55 }, donkeyWalk: { n: 8, dur: 1.1 }, donkey: { n: 1, dur: 1 }, sheepGraze: { n: 4, dur: 3.2 }, sheep: { n: 1, dur: 1 }, sheepLie: { n: 1, dur: 1 } };
const skipTint = c => c === C.gold || c === C.fire || c === C.white;
function tintPrims(prims, T) {
  if (!T) return prims;
  return prims.map(p => p.k === PF && p.c && !p.nt && !skipTint(p.c) ? Object.assign({}, p, { c: T(p.c) }) : p);
}
function prepFig(f) {
  if (f.kind) { f.lid = f.kind; if (f.clip === 'perch') f.kind = 'doveGlide'; }
  else {
    let L = typeof f.look === 'string' ? LOOK[f.look] : f.look;
    if (f.noShadow) L = Object.assign({}, L, { shadow: false });
    f.L = L; f.lid = lookId(L);
  }
  if (!f.path) return;
  let cur = [f.start[0], f.start[1], f.start[2] || 0], face = f.face || [1, 1], t = 0;
  f.segs = [];
  for (const s of f.path) {
    if (s.go) {
      const to = [s.go[0], s.go[1], s.go[2] === undefined ? cur[2] : s.go[2]], dx = to[0] - cur[0], dy = to[1] - cur[1];
      if (Math.abs(dx) + Math.abs(dy) > .01) face = [dx, dy];
      const dur = Math.max(.01, Math.hypot(dx, dy, to[2] - cur[2]) / (s.v || 1));
      f.segs.push({ t0: t, dur, a: cur, b: to, clip: s.clip || 'walk', face, wade: s.wade });
      cur = to; t += dur;
    } else if (s.do) {
      if (s.face) face = s.face;
      f.segs.push({ t0: t, dur: s.t, a: cur, b: cur, clip: s.do, face, wade: s.wade }); t += s.t;
    } else if (s.hide !== undefined) { f.segs.push({ t0: t, dur: s.hide, a: cur, b: cur, hide: true, face }); t += s.hide; }
  }
  f.D = t; f.per = Math.max(t, f.T || 0);
}

const SC = SCENES.map((def, i) => {
  const S = new Scene(def); def.build(S);
  const T = TINT[def.tint];
  const { bg, fg } = S.lists();
  const col = i % 5, row = i / 5 | 0;
  const ox = MX + col * CW + CW / 2, oy = MT + row * CHT + 98;
  const layers = [tintPrims(bg, T), tintPrims(fg, T)].map(pr => pr.length ? { pr, b: primsBounds(pr) } : null);
  for (const f of S.figs) prepFig(f);
  return { i, def, S, T, ox, oy, layers, figs: S.figs, cell: [MX + col * CW, MT + row * CHT, CW, CHT], rev: Q.instant ? -99 : null, clock0: 0 };
});

/* ── swatch strip and title are printed too ── */
const SW = (() => {
  const pr = [], x0 = 0, s = 22;
  const cols = [[1, 0, 0, 0], [.6, 0, 0, 0], [.3, 0, 0, 0], [0, 1, 0, 0], [0, .6, 0, 0], [0, .3, 0, 0], [0, 0, 1, 0], [0, 0, .6, 0], [0, 0, .3, 0], [0, 0, 0, 1], [0, 0, 0, .6], [0, 0, 0, .3], [.6, 0, .6, 0], [0, .6, 0, .6], [0, 0, .74, .7], [.5, .5, .5, .5]];
  cols.forEach((c, k) => { const x = x0 + k * (s + 4) + Math.floor(k / 3) * 6; pr.push(fp([x, 0, x + s, 0, x + s, s, x, s], c, { lw: .3 })); });
  return { pr, b: primsBounds(pr), ox: SHW - MX - 16 * 26 - 30, oy: SHH - MB + 70 };
})();

/* ── the press: time-sliced bakes, a level LRU ── */
const BK = new Map(); let bkBytes = 0;
const BK_MAX = (PHONE ? 140 : 420) * 1048576;
let job = null;
function bkey(i, l, v, lv) { return i + '|' + l + '|' + v + '|' + lv; }
function layerOf(i, l) { return i === 'sw' ? (l === 0 ? SW : null) : SC[i].layers[l]; }
function originOf(i) { return i === 'sw' ? [SW.ox, SW.oy] : [SC[i].ox, SC[i].oy]; }
function mkPrint(i, l, v, lv) {
  const L = layerOf(i, l), r = LV[lv], b = L.b, o = originOf(i);
  const W = Math.ceil((b[2] - b[0]) * r), H = Math.ceil((b[3] - b[1]) * r);
  const pt = new Print(L.pr, b[0], b[1], W, H, r, 1 + v * 7919 + (i === 'sw' ? 99 : i) * 31, o[0], o[1]);
  pt.key = bkey(i, l, v, lv); pt.lv = lv; pt.used = 0;
  return pt;
}
function bget(i, l, v, lv) { const p = BK.get(bkey(i, l, v, lv)); return p && p.done ? p : null; }
function want(list, i, v, lv) {
  for (let l = 0; l < 2; l++) { if (!layerOf(i, l)) continue; const k = bkey(i, l, v, lv), p = BK.get(k); if (!p || !p.done) list.push([i, l, v, lv]); }
}
function evict(visible) {
  if (bkBytes <= BK_MAX) return;
  const arr = [...BK.values()].filter(p => p.done).sort((a, b) => a.used - b.used);
  for (const p of arr) {
    if (bkBytes <= BK_MAX * .85) break;
    const i = +p.key.split('|')[0];
    if (p.lv === 0 && p.key.split('|')[2] === '0') continue;           // the overview print is always kept
    if (visible.has(i) && p.used > now - .5) continue;
    BK.delete(p.key); bkBytes -= p.bytes;
  }
}
function press(deadline, visible, lvNeed, nextScene) {
  let guard = 0;
  while (performance.now() < deadline && guard++ < 40) {
    if (!job) {
      const list = [];
      for (const i of visible) want(list, i, 0, lvNeed);
      if (!list.length) for (let i = 0; i < SC.length && list.length < 2; i++) want(list, i, 0, 0);
      if (!list.length) want(list, 'sw', 0, lvNeed === 0 ? 0 : Math.min(1, lvNeed));
      if (!list.length) for (const i of visible) { want(list, i, 1, lvNeed); want(list, i, 2, lvNeed); }
      if (!list.length && nextScene >= 0) { want(list, nextScene, 0, lvNeed); }
      if (!list.length && !PHONE) for (const i of visible) { if (lvNeed > 0) { want(list, i, 1, 0); want(list, i, 2, 0); } }
      if (!list.length) for (let i = 0; i < SC.length && list.length < 2; i++) { want(list, i, 1, 0); want(list, i, 2, 0); }
      if (!list.length) return;
      const [i, l, v, lv] = list[0];
      job = mkPrint(i, l, v, lv); BK.set(job.key, job);
    }
    if (job.rows(deadline)) {
      job.bytes = job.W * job.H * 4; bkBytes += job.bytes; job.used = now;
      const [i, l, v, lv] = job.key.split('|');
      if (i !== 'sw' && l === '0' && v === '0' && lv === '0' && SC[i].rev === null) SC[i].rev = now;
      job = null; evict(visible);
    }
  }
}
function bestPrint(i, l, v, lv) {
  let p = bget(i, l, v, lv) || bget(i, l, 0, lv);
  if (!p) for (let k = LV.length - 1; k >= 0 && !p; k--) p = bget(i, l, v, k) || bget(i, l, 0, k);
  if (p) p.used = now;
  return p;
}
function drawPrint(p, o) { g.drawImage(p.canvas, o[0] + p.bx, o[1] + p.by, p.W / p.r, p.H / p.r); }

/* ── the people: where each one is at time t ── */
function figState(f, t) {
  if (f.ride) {
    const m = figState(f.ride, t); if (!m) return null;
    return Object.assign({}, m, { z: m.z + .82, clip: f.clip, dep: .01, f, kind: null });
  }
  const ph = f.ph || 0;
  if (!f.segs) return { x: f.at[0], y: f.at[1], z: f.at[2] || 0, clip: f.clip || 'stand', face: f.face || [1, 1], a: 1, wade: f.wade || 0, f, tc: t + ph };
  let lt = ((t + ph) % f.per + f.per) % f.per, segs = f.segs;
  if (lt >= f.D) { if (f.fade) return null; lt = f.D - .001; }
  let k = 0; while (k < segs.length - 1 && lt >= segs[k].t0 + segs[k].dur) k++;
  const s = segs[k]; if (s.hide) return null;
  const u = clamp((lt - s.t0) / s.dur, 0, 1);
  let a = 1;
  if (f.fade) {
    let r0 = k, r1 = k;
    while (r0 > 0 && !segs[r0 - 1].hide) r0--;
    while (r1 < segs.length - 1 && !segs[r1 + 1].hide) r1++;
    const vs = segs[r0].t0, ve = segs[r1].t0 + segs[r1].dur;
    a = clamp(Math.min(lt - vs, ve - lt) / .6, 0, 1);
    if (vs === 0 && f.per === f.D && ve === f.D && !segs.some(q => q.hide)) a = 1;
  }
  return { x: lerp(s.a[0], s.b[0], u), y: lerp(s.a[1], s.b[1], u), z: lerp(s.a[2], s.b[2], u), clip: s.clip, face: s.face, a, wade: s.wade !== undefined ? s.wade : (f.wade || 0), f, tc: t + ph };
}
let sprMs = 0;
function figSprite(st, lv, boil, tintName, T) {
  const f = st.f, r = LV[lv];
  let key, make;
  if (f.cross) {
    key = 'X|' + f.lid + '|' + tintName + '|' + boil + '|' + lv;
    make = () => crucifiedPrims(f.L, T);
    return getSpr(key, make, r, boil, f);
  }
  const sx = st.face[0] - st.face[1], sy = st.face[0] + st.face[1], ln = Math.hypot(sx, sy) || 1;
  const back = sy / ln < -.2;
  if (f.kind || (st.f.ride === undefined && st.kind)) {
    const kind = f.kind, A = ANIM[kind] || { n: 1, dur: 1 }, fr = Math.floor(((st.tc / A.dur) % 1 + 1) % 1 * A.n);
    key = 'A|' + kind + '|' + fr + '|' + (back ? 1 : 0) + '|' + tintName + '|' + boil + '|' + lv;
    make = () => animalPrims(kind, fr / A.n, back, T);
  } else {
    const c = CL[st.clip] || CL.stand, fr = Math.floor(((st.tc / c.dur) % 1 + 1) % 1 * c.n);
    const TT = f.L.shine ? null : T;
    key = f.lid + '|' + st.clip + '|' + fr + '|' + (back ? 1 : 0) + '|' + (TT ? tintName : '-') + '|' + (f.prop || '') + '|' + boil + '|' + lv;
    make = () => figPrims(f.L, Object.assign({}, POSE0, c.f(TAU * fr / c.n)), back, f.prop, TT);
  }
  const s = getSpr(key, make, r, boil, f);
  return s && { s, mirror: sx < 0 };
}
function getSpr(key, make, r, boil, f) {
  let s = spriteGet(key);
  if (!s && sprMs < (PHONE ? 5 : 7)) { const t0 = performance.now(); s = spriteBake(key, make(), r, 3 + boil * 101); sprMs += performance.now() - t0; }
  if (s) f._spr = s; else s = f._spr;
  return s;
}
function drawFig(st, sc, lv, boil, tintName) {
  const f = st.f, wade = st.wade || 0;
  const q = P(st.x, st.y, st.z - wade), ox = sc.ox + q[0], oy = sc.oy + q[1];
  const got = figSprite(st, lv, boil, tintName, sc.T);
  if (!got) return;
  const s = got.s || got, mirror = got.mirror;
  g.save();
  g.globalAlpha = st.a * (sc.fa === undefined ? 1 : sc.fa);
  if (wade > 0) { const wl = sc.oy + P(st.x, st.y, 0)[1]; g.beginPath(); g.rect(ox - 60, oy - 200, 120, wl - (oy - 200)); g.clip(); }
  g.translate(ox, oy); if (mirror) g.scale(-1, 1);
  g.drawImage(s.cv, s.x, s.y, s.w, s.h);
  g.restore();
  if (wade > 0) {
    const w = sc.oy + P(st.x, st.y, 0)[1], wob = Math.sin(now * 2 + st.x) * .8;
    g.save(); g.globalAlpha = .7 * st.a; g.strokeStyle = 'rgb(56,78,150)'; g.lineWidth = .6;
    g.beginPath(); g.ellipse(ox, w, 9 + wob, 3, 0, 0, TAU); g.stroke();
    g.beginPath(); g.ellipse(ox, w, 13 - wob, 4.4, 0, .2, PI - .2); g.stroke(); g.restore();
  }
}

/* ── the sheet furniture ── */
const GRAIN = (() => {
  const c = mkCanvas(256, 256), x = c.getContext('2d'), r = mul32(777), im = x.createImageData(256, 256);
  for (let i = 0; i < 256 * 256; i++) { const n = NOISE[i], v = 255 - (n * 16 + r() * 10) | 0; im.data[i * 4] = v; im.data[i * 4 + 1] = v - 2; im.data[i * 4 + 2] = v - 6; im.data[i * 4 + 3] = 255; }
  x.putImageData(im, 0, 0);
  x.strokeStyle = 'rgba(120,100,70,.12)'; x.lineWidth = .6;
  for (let i = 0; i < 70; i++) { const a = r() * 256, b = r() * 256, t = r() * TAU; x.beginPath(); x.moveTo(a, b); x.quadraticCurveTo(a + Math.cos(t) * 6, b + Math.sin(t) * 6 + 3, a + Math.cos(t) * 12, b + Math.sin(t) * 12); x.stroke(); }
  return c;
})();
let grainPat = null;
const INKCSS = INKS.map(k => 'rgb(' + k.rgb.join(',') + ')');
function inkStroke(fn, inks, w) {
  g.save(); g.globalCompositeOperation = 'multiply'; g.lineWidth = w || .7;
  for (const k of inks) { const o = INKS[k].off; g.save(); g.translate(o[0] * 1.2, o[1] * 1.2); g.strokeStyle = INKCSS[k]; g.fillStyle = INKCSS[k]; fn(); g.restore(); }
  g.restore();
}
function marks() {
  inkStroke(() => {
    g.beginPath();
    for (let cx = 0; cx <= 5; cx++) for (let cy = 0; cy <= 5; cy++) {
      const x = MX + cx * CW, y = MT + cy * CHT;
      const ex = cx === 0 || cx === 5, ey = cy === 0 || cy === 5;
      if (ex || ey) {
        const dx = cx === 0 ? -1 : cx === 5 ? 1 : 0, dy = cy === 0 ? -1 : cy === 5 ? 1 : 0;
        if (dx) { g.moveTo(x + dx * 12, y); g.lineTo(x + dx * 40, y); }
        if (dy) { g.moveTo(x, y + dy * 12); g.lineTo(x, y + dy * 40); }
      } else { g.moveTo(x - 7, y); g.lineTo(x + 7, y); g.moveTo(x, y - 7); g.lineTo(x, y + 7); }
    }
    g.stroke();
    for (const [x, y] of [[SHW / 2, MT / 2 - 12], [SHW / 2, SHH - 34], [MX / 2, MT + CHT * 2.5], [SHW - MX / 2, MT + CHT * 2.5]]) {
      g.beginPath(); g.arc(x, y, 9, 0, TAU); g.moveTo(x - 15, y); g.lineTo(x + 15, y); g.moveTo(x, y - 15); g.lineTo(x, y + 15); g.stroke();
    }
  }, [0, 1, 2, 3], .8);
}
function titles() {
  g.save(); g.globalCompositeOperation = 'multiply';
  const serif = 'Iowan Old Style, Palatino, "Book Antiqua", Georgia, serif';
  const put = (txt, x, y, size, ink, o) => {
    o = o || {}; g.font = (o.it ? 'italic ' : '') + size + 'px ' + serif; g.textAlign = o.al || 'left'; g.textBaseline = 'alphabetic';
    if (g.letterSpacing !== undefined) g.letterSpacing = (o.ls || 0) + 'px';
    const of = INKS[ink].off; g.fillStyle = INKCSS[ink]; g.globalAlpha = o.a || .92; g.fillText(txt, x + of[0], y + of[1]);
  };
  put('THE GOSPEL', MX, MT - 46, 38, 3, { ls: 9 });
  const tw = g.measureText('THE GOSPEL').width;
  put('in twenty-five rooms, from Nazareth to the upper room', MX + tw + 22, MT - 47, 17, 2, { it: true });
  put('Every word from the King James Bible · every detail from a verse', SHW - MX, MT - 47, 13, 1, { al: 'right', ls: 1.2 });
  const acts = ['I · THE PROMISE', 'II · THE CHILD', 'III · THE CALLING', 'IV · TOWARD JERUSALEM', 'V · DEATH AND LIFE'];
  for (let r = 0; r < 5; r++) {
    g.save(); g.translate(MX - 34, MT + r * CHT + CHT / 2); g.rotate(-PI / 2); put(acts[r], 0, 0, 12, 2, { al: 'center', ls: 3 }); g.restore();
  }
  for (let i = 0; i < 25; i++) { const c = SC[i].cell; put(ROMAN[i], c[0] + 12, c[1] + CHT - 12, 11, 3, { ls: 1, a: .7 }); put(SC[i].def.title, c[0] + CW - 12, c[1] + CHT - 12, 11, 3, { al: 'right', it: true, a: .7 }); }
  put('OCHRE 0°   OLIVE 45°   MADDER 75°   LAPIS 15°', SW.ox, SW.oy - 10, 10, 3, { ls: 2, a: .75 });
  put('Four spot inks, halftone, overprinted. Canvas only, one file.', MX, SHH - MB + 88, 12, 3, { it: true, a: .75 });
  g.restore();
}

/* ── camera ── */
const cam = { x: SHW / 2, y: SHH / 2, z: .3 };
const fitZ = () => Math.min(W / (SHW + 40), H / (SHH + 40));
const cardEl = document.getElementById('card');
function closeView(i) {
  const c = SC[i].cell, wide = W > 1100;
  const cw = wide ? 380 : 0, chh = wide ? 0 : Math.min(cardEl.offsetHeight || 190, H * .45);
  const z = Math.min((W - cw - 30) / (CW + 10), (H - chh - 30) / (CHT + 10)) * .97;
  return { x: c[0] + CW / 2 - cw / 2 / z, y: c[1] + CHT / 2 + chh / 2 / z - 4 / z, z };
}
const fitView = () => ({ x: SHW / 2, y: SHH / 2, z: fitZ() });
let fly = null;
function flyTo(v, dur, onEnd) {
  const d = Math.hypot(v.x - cam.x, v.y - cam.y) * Math.min(cam.z, v.z);
  fly = { a: { x: cam.x, y: cam.y, z: cam.z }, b: v, t0: now, dur: dur || 2.2, dip: clamp(d / 900, 0, .45), onEnd };
}
function stepFly() {
  if (!fly) return;
  const u = clamp((now - fly.t0) / fly.dur, 0, 1), e = ease(u);
  cam.x = lerp(fly.a.x, fly.b.x, e); cam.y = lerp(fly.a.y, fly.b.y, e);
  cam.z = Math.exp(lerp(Math.log(fly.a.z), Math.log(fly.b.z), e)) * (1 - fly.dip * Math.sin(PI * u));
  if (u >= 1) { const cb = fly.onEnd; fly = null; if (cb) cb(); }
}
const toWorld = (sx, sy) => [(sx - W / 2) / cam.z + cam.x, (sy - H / 2) / cam.z + cam.y];
function sceneAt(wx, wy) { for (const s of SC) { const c = s.cell; if (wx >= c[0] && wx < c[0] + c[2] && wy >= c[1] && wy < c[1] + c[3]) return s.i; } return -1; }
function nearestScene() {
  let best = 0, bd = 1e9;
  for (const s of SC) { const d = Math.hypot(s.cell[0] + CW / 2 - cam.x, s.cell[1] + CHT / 2 - cam.y); if (d < bd) { bd = d; best = s.i; } }
  return best;
}
function clampCam() {
  cam.z = clamp(cam.z, fitZ() * .6, 9);
  cam.x = clamp(cam.x, -100, SHW + 100); cam.y = clamp(cam.y, -100, SHH + 100);
}

/* ── the tour ── */
const tour = { on: !Q.notour, i: -1, phase: 'print', t0: 0 };
let lastInput = -99, now = 0;
const HOLD = 10;
function startScene(i) { SC[i].clock0 = now; }
function tourNext() {
  tour.i++;
  if (tour.i >= SC.length) { tour.phase = 'overview'; tour.t0 = now; flyTo(fitView(), 2.6); tour.i = -1; return; }
  tour.phase = 'fly'; startScene(tour.i);
  flyTo(closeView(tour.i), tour.i === 0 && cam.z < fitZ() * 1.5 ? 2.6 : 2.2, () => { tour.phase = 'hold'; tour.t0 = now; });
}
function stepTour() {
  if (!tour.on) { if (!Q.notour && now - lastInput > 20 && !drag && !fly) { tour.on = true; tour.i = nearestScene() - (cam.z > fitZ() * 2 ? 0 : 1); tour.i = Math.max(-1, tour.i - 1); tourNext(); } return; }
  if (tour.phase === 'print') { if (now - tour.t0 > (Q.instant ? .5 : 4.2) && SC.every(s => s.rev !== null)) tourNext(); }
  else if (tour.phase === 'hold') { if (now - tour.t0 > HOLD) tourNext(); }
  else if (tour.phase === 'overview') { if (!fly && now - tour.t0 > 8) tourNext(); }
}
function interrupt() { lastInput = now; if (tour.on) { tour.on = false; } fly = null; }

/* ── input ── */
const ptrs = new Map(); let drag = null, vel = [0, 0], lastTap = { t: -9, x: 0, y: 0 };
cv.addEventListener('pointerdown', e => {
  cv.setPointerCapture(e.pointerId); interrupt();
  ptrs.set(e.pointerId, [e.clientX, e.clientY]);
  if (ptrs.size === 1) drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: now, moved: 0 };
  else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; drag = { pinch: Math.hypot(a[0] - b[0], a[1] - b[1]), z: cam.z, mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], moved: 99 }; }
});
cv.addEventListener('pointermove', e => {
  if (!ptrs.has(e.pointerId)) return;
  ptrs.set(e.pointerId, [e.clientX, e.clientY]); lastInput = now;
  if (!drag) return;
  if (drag.pinch && ptrs.size === 2) {
    const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const w = toWorld(drag.mid[0], drag.mid[1]);
    cam.z = clamp(drag.z * d / drag.pinch, fitZ() * .6, 9);
    cam.x = w[0] - (mid[0] - W / 2) / cam.z; cam.y = w[1] - (mid[1] - H / 2) / cam.z; drag.mid = mid;
  } else if (!drag.pinch) {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    cam.x -= dx / cam.z; cam.y -= dy / cam.z; drag.moved += Math.abs(dx) + Math.abs(dy);
    vel = [dx / cam.z * 60, dy / cam.z * 60].map(v => v * .5 + 0); drag.x = e.clientX; drag.y = e.clientY;
  }
  clampCam();
});
const up = e => {
  if (!ptrs.has(e.pointerId)) return;
  ptrs.delete(e.pointerId);
  if (drag && !drag.pinch && drag.moved < 8) {
    if (now - lastTap.t < .32 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 30) { dbl(e.clientX, e.clientY); lastTap.t = -9; }
    else lastTap = { t: now, x: e.clientX, y: e.clientY };
    vel = [0, 0];
  }
  if (ptrs.size === 0) drag = null;
  else if (ptrs.size === 1) { const [p] = [...ptrs.values()]; drag = { x: p[0], y: p[1], moved: 99 }; }
};
cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
function dbl(sx, sy) {
  const w = toWorld(sx, sy), i = sceneAt(w[0], w[1]);
  if (i < 0) { flyTo(fitView(), 1.4); return; }
  const v = closeView(i);
  if (cam.z > v.z * .8 && nearestScene() === i) flyTo(fitView(), 1.6);
  else { startScene(i); flyTo(v, 1.5); }
}
cv.addEventListener('wheel', e => {
  e.preventDefault(); interrupt();
  const w = toWorld(e.clientX, e.clientY), k = Math.exp(-e.deltaY * (e.ctrlKey ? .01 : .0018));
  cam.z = clamp(cam.z * k, fitZ() * .6, 9);
  cam.x = w[0] - (e.clientX - W / 2) / cam.z; cam.y = w[1] - (e.clientY - H / 2) / cam.z; clampCam();
}, { passive: false });
function goScene(i) { i = (i + 25) % 25; interrupt(); startScene(i); flyTo(closeView(i), 1.3); }
addEventListener('keydown', e => {
  const k = e.key;
  if (k === 'ArrowRight') goScene(nearestScene() + 1);
  else if (k === 'ArrowLeft') goScene(nearestScene() - 1);
  else if (k === 'ArrowDown') goScene(nearestScene() + 5);
  else if (k === 'ArrowUp') goScene(nearestScene() - 5);
  else if (k === '+' || k === '=') { interrupt(); flyTo({ x: cam.x, y: cam.y, z: Math.min(9, cam.z * 1.5) }, .35); }
  else if (k === '-' || k === '_') { interrupt(); flyTo({ x: cam.x, y: cam.y, z: Math.max(fitZ() * .6, cam.z / 1.5) }, .35); }
  else if (k === '0') { interrupt(); flyTo(fitView(), 1.2); }
  else if (k === 'c' || k === 'C') { cardHidden = !cardHidden; cardEl.classList.toggle('off', cardHidden); }
  else if (k === ' ') { e.preventDefault(); if (tour.on) interrupt(); else { lastInput = -99; } }
  else return;
});
cv.addEventListener('dblclick', e => e.preventDefault());

/* ── the chapter card ── */
let cardHidden = false, cardFor = -2;
const $ = id => document.getElementById(id);
const curly = s => s.replace(/(^|[\s(])'/g, '$1‘').replace(/'/g, '’').replace(/(^|[\s(])"/g, '$1“').replace(/"/g, '”');
function setCard(i) {
  if (i === cardFor) return; cardFor = i;
  if (i < 0) { cardEl.classList.remove('on'); return; }
  const d = SC[i].def, q = curly(d.quote);
  $('kick').textContent = d.act + ' · Chapter ' + ROMAN[i];
  $('ttl').textContent = d.title;
  $('q').innerHTML = '<span class="dc">' + q[0] + '</span>' + q.slice(1).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  $('cite').textContent = d.cite;
  cardEl.classList.add('on');
}
$('prev').onclick = () => goScene(nearestScene() - 1);
$('next').onclick = () => goScene(nearestScene() + 1);
$('home').onclick = () => { interrupt(); flyTo(fitView(), 1.3); };

/* ── the frame ── */
let lastT = performance.now(), fps = 60;
function frame(ms) {
  const dt = Math.min(.1, (ms - lastT) / 1000); lastT = ms; now = ms / 1000; fps = lerp(fps, 1 / Math.max(dt, .001), .05);
  stepTour(); stepFly();
  if (!drag && !fly && (Math.abs(vel[0]) + Math.abs(vel[1]) > .5)) { cam.x -= vel[0] * dt; cam.y -= vel[1] * dt; vel = vel.map(v => v * Math.pow(.02, dt)); clampCam(); }
  if (drag) vel = vel.map(v => v * .8);

  const need = cam.z * DPR, lv = need > LV[1] * 1.05 ? 2 : need > LV[0] * 1.1 ? 1 : 0;
  const w0 = toWorld(0, 0), w1 = toWorld(W, H), visible = new Set();
  for (const s of SC) { const c = s.cell; if (c[0] < w1[0] + 40 && c[0] + c[2] > w0[0] - 40 && c[1] - 60 < w1[1] && c[1] + c[3] > w0[1]) visible.add(s.i); }
  const next = tour.on && tour.i + 1 < SC.length ? tour.i + 1 : -1;
  press(performance.now() + (PHONE ? 7 : 9), visible, lv, next);

  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#2b2622'; g.fillRect(0, 0, cv.width, cv.height);
  const Z = cam.z * DPR;
  g.setTransform(Z, 0, 0, Z, (W / 2 - cam.x * cam.z) * DPR, (H / 2 - cam.y * cam.z) * DPR);
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 30 * Z; g.shadowOffsetY = 8 * Z;
  g.fillStyle = 'rgb(' + PAPER.join(',') + ')'; g.fillRect(0, 0, SHW, SHH); g.restore();
  titles(); marks();
  const sw = bestPrint('sw', 0, 0, Math.min(lv, 1)); if (sw) drawPrint(sw, [SW.ox, SW.oy]);

  const boil = Math.floor(now * 3) % 3;
  sprMs = 0;
  const order = [...visible].sort((a, b) => a - b);
  for (const i of order) {
    const sc = SC[i];
    if (sc.rev === null) continue;
    const pin = clamp((now - sc.rev) / .9, 0, 1);
    const bg = bestPrint(i, 0, boil, lv); if (!bg) continue;
    g.save();
    if (pin < 1) { const c = sc.cell; g.beginPath(); g.rect(c[0] - 40, c[1] - 200, c[2] + 80, (c[3] + 200) * smooth(pin)); g.clip(); }
    drawPrint(bg, [sc.ox, sc.oy]);
    sc.fa = smooth(clamp((now - sc.rev - .7) / .6, 0, 1));
    if (sc.fa > 0) {
      const t = now - sc.clock0 + Q.t, sts = [];
      for (const f of sc.figs) { const st = figState(f, t); if (st && st.a > .01) sts.push(st); }
      sts.sort((a, b) => (a.x + a.y + (a.f.dep || a.dep || 0)) - (b.x + b.y + (b.f.dep || b.dep || 0)));
      for (const st of sts) drawFig(st, sc, lv, boil, sc.def.tint);
    }
    const fgp = sc.layers[1] && bestPrint(i, 1, boil, lv); if (fgp) drawPrint(fgp, [sc.ox, sc.oy]);
    g.restore();
  }
  // paper grain over everything printed
  if (!grainPat) grainPat = g.createPattern(GRAIN, 'repeat');
  if (grainPat.setTransform) grainPat.setTransform(new DOMMatrix().scale(.6));
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .55; g.fillStyle = grainPat; g.fillRect(Math.max(0, w0[0]), Math.max(0, w0[1]), Math.min(SHW, w1[0]) - Math.max(0, w0[0]), Math.min(SHH, w1[1]) - Math.max(0, w0[1])); g.restore();

  const cl = SC.length ? closeView(nearestScene()).z : 1;
  setCard(!cardHidden && cam.z > cl * .6 ? nearestScene() : -1);
  if (Q.debug) { g.setTransform(DPR, 0, 0, DPR, 0, 0); g.fillStyle = '#fff'; g.font = '12px monospace'; g.fillText(fps.toFixed(0) + ' fps  z ' + cam.z.toFixed(2) + '  lv ' + lv + '  bake ' + (bkBytes / 1048576 | 0) + 'MB  spr ' + (sprBytes / 1048576 | 0) + 'MB ' + SPR.size, 10, H - 10); }
  requestAnimationFrame(frame);
}

/* ── start ── */
now = performance.now() / 1000;
{ const f = fitView(); cam.x = f.x; cam.y = f.y; cam.z = f.z; }
tour.t0 = now;
if (Q.scene >= 1 && Q.scene <= 25) {
  const i = Q.scene - 1, v = closeView(i); cam.x = v.x; cam.y = v.y; cam.z = v.z; startScene(i);
  if (tour.on) { tour.phase = 'hold'; tour.i = i; tour.t0 = now; }
}
requestAnimationFrame(frame);
