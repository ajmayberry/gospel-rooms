/* ───────────── raster: primitives → four density plates → halftone print ─────────────
   A drawing is a list of primitives in paper units (pu). Each one is painted into four
   density plates (alpha = ink amount), knocking out what is beneath it on every plate,
   the way a printer knocks out. The plates are then screened into dots at each ink's
   angle and misregistration and overprinted with multiply onto paper. */
const PF = 1, PL = 2, PG = 3;
const LW = .5, WOB = .55;

function fp(p, c, o) { o = o || {}; return { k: PF, p, c, lw: o.lw === undefined ? LW : o.lw, ko: o.ko, wa: o.wa, li: o.li, ld: o.ld }; }
function lp(p, w, o) { o = o || {}; return { k: PL, p, lw: w === undefined ? LW : w, li: o.li, ld: o.ld, wa: o.wa, tp: o.tp === undefined ? 1 : o.tp }; }
function gp(x, y, rx, ry, n, addD, lift, inner) { return { k: PG, x, y, rx, ry, n, add: addD, lift, inner: inner === undefined ? .15 : inner }; }

// Warp through a smooth noise field. Shared edges warp identically, so fills and
// lines stay married; a different seed gives a different "drawing" of the same thing.
function warp(x, y, amp, seed) {
  const s = seed * 41.3;
  return [x + amp * (noise2(x * .9 + s, y * .9) - .5) * 2.6, y + amp * (noise2(x * .9 + 97, y * .9 + s) - .5) * 2.6];
}
function warpPath(p, closed, amp, seed, step) {
  const out = [], n = p.length / 2, segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const x0 = p[i * 2], y0 = p[i * 2 + 1], j = (i + 1) % n, x1 = p[j * 2], y1 = p[j * 2 + 1];
    const L = Math.hypot(x1 - x0, y1 - y0), k = Math.max(1, Math.ceil(L / step));
    for (let s = 0; s < k; s++) { const t = s / k, w = warp(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, amp, seed); out.push(w[0], w[1]); }
  }
  if (!closed) { const w = warp(p[p.length - 2], p[p.length - 1], amp, seed); out.push(w[0], w[1]); }
  return out;
}
function addPoly(path, q) {
  path.moveTo(q[0], q[1]);
  for (let i = 2; i < q.length; i += 2) path.lineTo(q[i], q[i + 1]);
  path.closePath();
}
// A tapered stroke as a filled polygon, always wound the same way so overlaps stay solid.
function strokeShape(q, w, taper) {
  const n = q.length / 2; if (n < 2) return null;
  const cum = [0];
  for (let i = 1; i < n; i++) cum.push(cum[i - 1] + Math.hypot(q[i * 2] - q[i * 2 - 2], q[i * 2 + 1] - q[i * 2 - 1]));
  const tot = cum[n - 1] || 1e-6, Lf = [], Rt = [];
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1);
    let tx = q[b * 2] - q[a * 2], ty = q[b * 2 + 1] - q[a * 2 + 1];
    const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const t = cum[i] / tot;
    const ww = w * (taper ? .28 + .72 * Math.pow(Math.sin(PI * clamp(t, 0, 1)), .45) : 1) * .5;
    Lf.push(q[i * 2] - ty * ww, q[i * 2 + 1] + tx * ww);
    Rt.push(q[i * 2] + ty * ww, q[i * 2 + 1] - tx * ww);
  }
  const out = Lf;
  for (let i = Rt.length - 2; i >= 0; i -= 2) out.push(Rt[i], Rt[i + 1]);
  let area = 0;
  for (let i = 0, m = out.length / 2; i < m; i++) { const j = (i + 1) % m; area += out[i * 2] * out[j * 2 + 1] - out[j * 2] * out[i * 2 + 1]; }
  if (area < 0) { const r = []; for (let i = out.length - 2; i >= 0; i -= 2) r.push(out[i], out[i + 1]); return r; }
  return out;
}
// Outline drawn as separate hand strokes, one per edge, each with a little overshoot.
function strokePath(p, closed, w, amp, seed, taper) {
  const path = new Path2D(), n = p.length / 2, segs = closed ? n : 1;
  if (!closed) {
    const q = warpPath(p, false, amp, seed, 1.6), s = strokeShape(q, w, taper);
    if (s) addPoly(path, s);
    return path;
  }
  for (let i = 0; i < segs; i++) {
    const j = (i + 1) % n;
    let x0 = p[i * 2], y0 = p[i * 2 + 1], x1 = p[j * 2], y1 = p[j * 2 + 1];
    const L = Math.hypot(x1 - x0, y1 - y0); if (L < .05) continue;
    const ux = (x1 - x0) / L, uy = (y1 - y0) / L, h = hsh(x0 * 7 | 0, y0 * 7 | 0, seed);
    const o0 = (h - .3) * .5 * w * 1.2, o1 = (hsh(x1 * 7 | 0, y1 * 7 | 0, seed + 3) - .3) * .5 * w * 1.2;
    x0 -= ux * o0; y0 -= uy * o0; x1 += ux * o1; y1 += uy * o1;
    const q = warpPath([x0, y0, x1, y1], false, amp, seed, 1.6), s = strokeShape(q, w, taper);
    if (s) addPoly(path, s);
  }
  return path;
}
function ellPts(cx, cy, rx, ry, n, rot) {
  const o = [], cr = Math.cos(rot || 0), sr = Math.sin(rot || 0);
  for (let i = 0; i < n; i++) { const a = i / n * TAU, x = Math.cos(a) * rx, y = Math.sin(a) * ry; o.push(cx + x * cr - y * sr, cy + x * sr + y * cr); }
  return o;
}

// Paint primitives into plates. cx: five 2D contexts (4 inks + silhouette mask).
function paintPrims(prims, cx, seed) {
  for (const p of prims) {
    const amp = p.wa === undefined ? WOB : p.wa;
    if (p.k === PF) {
      if (p.c) {
        const path = new Path2D(); addPoly(path, warpPath(p.p, true, amp, seed, 2.2));
        for (let k = 0; k < 4; k++) {
          const g = cx[k];
          if (p.ko !== 0) { g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.fill(path); }
          if (p.c[k] > .003) { g.globalCompositeOperation = 'source-over'; g.fillStyle = 'rgba(0,0,0,' + p.c[k] + ')'; g.fill(path); }
        }
        if (p.ko !== 0) { cx[4].globalCompositeOperation = 'source-over'; cx[4].fillStyle = '#000'; cx[4].fill(path); }
      }
      if (p.lw) inkPath(cx, strokePath(p.p, true, p.lw, amp, seed, true), p.li, p.ld);
    } else if (p.k === PL) {
      inkPath(cx, strokePath(p.p, false, p.lw, amp, seed, p.tp), p.li, p.ld);
    } else if (p.k === PG) {
      for (let i = 0; i < p.n; i++) {
        const s = 1 - (1 - p.inner) * i / p.n;
        const path = new Path2D(); addPoly(path, warpPath(ellPts(p.x, p.y, p.rx * s, p.ry * s, 28), true, amp * .6, seed, 3));
        for (let k = 0; k < 4; k++) {
          const g = cx[k];
          if (p.lift && p.lift[k]) { g.globalCompositeOperation = 'destination-out'; g.fillStyle = 'rgba(0,0,0,' + p.lift[k] + ')'; g.fill(path); }
          if (p.add && p.add[k]) { g.globalCompositeOperation = 'source-over'; g.fillStyle = 'rgba(0,0,0,' + p.add[k] + ')'; g.fill(path); }
        }
      }
    }
  }
}
function inkPath(cx, path, li, ld) {
  const k = li === undefined ? B_ : li;
  const g = cx[k]; g.globalCompositeOperation = 'source-over'; g.fillStyle = 'rgba(0,0,0,' + (ld === undefined ? 1 : ld) + ')'; g.fill(path);
  cx[4].globalCompositeOperation = 'source-over'; cx[4].fillStyle = '#000'; cx[4].fill(path);
}

function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

// Screen the plates into dots and overprint them. Runs in row slices so a big bake
// never blocks a frame for long.
const PLATE = INKS.map((ink, k) => {
  const a = ink.ang * PI / 180;
  return { c: Math.cos(a), s: Math.sin(a), kr: 1 - ink.rgb[0] / 255, kg: 1 - ink.rgb[1] / 255, kb: 1 - ink.rgb[2] / 255, off: ink.off, k };
});
const ICELL = 1 / CELL;
class Print {
  constructor(prims, bx, by, W, H, r, seed, ux, uy) {
    Object.assign(this, { prims, bx, by, W, H, r, seed, ux, uy });
    this.row = 0; this.done = false; this.planes = null;
  }
  raster() {
    const { W, H, r, bx, by } = this;
    const cvs = [0, 1, 2, 3, 4].map(() => mkCanvas(W, H));
    const cx = cvs.map(c => c.getContext('2d', { willReadFrequently: true }));
    for (const g of cx) g.setTransform(r, 0, 0, r, -bx * r, -by * r);
    paintPrims(this.prims, cx, this.seed);
    this.planes = cx.map(g => g.getImageData(0, 0, W, H).data);
    this.img = new ImageData(W, H);
    this.offs = PLATE.map(P => [Math.round(P.off[0] * r), Math.round(P.off[1] * r)]);
  }
  rows(deadline) {
    if (!this.planes) { this.raster(); if (performance.now() > deadline) return false; }
    const { W, H, r, planes, offs } = this, out = this.img.data, mask = planes[4];
    const cellPx = CELL * r, ux = this.ux + this.bx, uy = this.uy + this.by, ir = 1 / r;
    const P0 = PAPER[0], P1 = PAPER[1], P2 = PAPER[2];
    while (this.row < H) {
      const y = this.row++;
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        let R = P0, Gc = P1, B = P2, any = 0;
        for (let k = 0; k < 4; k++) {
          const sx = x - offs[k][0], sy = y - offs[k][1];
          if (sx < 0 || sy < 0 || sx >= W || sy >= H) continue;
          const d0 = planes[k][(sy * W + sx) * 4 + 3];
          if (d0 < 3) continue;
          const P = PLATE[k];
          const u = ux + (sx + .5) * ir, v = uy + (sy + .5) * ir;
          const n = NOISE[((((v * .55 + k * 61) | 0) & 255) << 8) | (((u * .55 + k * 29) | 0) & 255)];
          let d = d0 / 255 * (1.08 - .2 * n);
          let cov;
          if (d > .9) {
            cov = .8 + .2 * n;
            if (hsh(x, y, k) < .022) cov *= .15;               // speckled dropout in solids
          } else {
            const a = (u * P.c + v * P.s) * ICELL, b = (v * P.c - u * P.s) * ICELL;
            const ia = Math.floor(a), ib = Math.floor(b), h = hsh(ia, ib, k + 11);
            const fa = a - ia - .5 - (h - .5) * .14, fb = b - ib - .5 - (((h * 7.31) % 1) - .5) * .14;
            const rad = Math.sqrt(d * .3183) * (.93 + h * .14);
            cov = (rad - Math.sqrt(fa * fa + fb * fb)) * cellPx + .5;
            if (cov <= 0) continue;
            if (cov > 1) cov = 1;
            if (h > .985) cov *= .3;                            // the odd starved dot
          }
          R *= 1 - cov * P.kr; Gc *= 1 - cov * P.kg; B *= 1 - cov * P.kb;
          if (cov > any) any = cov;
        }
        const m = mask[i * 4 + 3] / 255, al = m > any ? m : any;
        const o = i * 4;
        out[o] = R; out[o + 1] = Gc; out[o + 2] = B; out[o + 3] = al * 255;
      }
      if ((y & 7) === 7 && performance.now() > deadline) return false;
    }
    this.canvas = mkCanvas(W, H);
    this.canvas.getContext('2d').putImageData(this.img, 0, 0);
    this.planes = this.img = null; this.done = true;
    return true;
  }
}
function primsBounds(prims) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const p of prims) {
    if (p.k === PG) { x0 = Math.min(x0, p.x - p.rx); x1 = Math.max(x1, p.x + p.rx); y0 = Math.min(y0, p.y - p.ry); y1 = Math.max(y1, p.y + p.ry); continue; }
    const q = p.p;
    for (let i = 0; i < q.length; i += 2) { if (q[i] < x0) x0 = q[i]; if (q[i] > x1) x1 = q[i]; if (q[i + 1] < y0) y0 = q[i + 1]; if (q[i + 1] > y1) y1 = q[i + 1]; }
  }
  return [x0 - 3, y0 - 3, x1 + 3, y1 + 3];
}
