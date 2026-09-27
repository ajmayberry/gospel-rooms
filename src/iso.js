/* ───────────── iso: the diorama builder ─────────────
   Every scene is the same 10 m × 10 m slab (x runs down-right, y runs down-left,
   z up), seen by the same isometric camera. 1 m = 20 paper units. */
const K = 20, CX = K * Math.cos(PI / 6), SY = K * Math.sin(PI / 6);
const SLAB = 10;
function P(x, y, z) { return [(x - y) * CX, (x + y) * SY - (z || 0) * K]; }
function pp(pts) { const o = []; for (const q of pts) { const s = P(q[0], q[1], q[2]); o.push(s[0], s[1]); } return o; }

class Scene {
  constructor(def) {
    this.def = def; this.objs = []; this.figs = []; this.lights = [];
    this.rng = mul32(strSeed(def.id));
  }
  r(a, b) { return a + (b - a) * this.rng(); }
  push(d, prims, fg) { this.objs.push({ d, prims, fg: !!fg, i: this.objs.length }); }
  lists() {
    const o = this.objs.slice().sort((a, b) => a.d - b.d || a.i - b.i);
    const bg = [], fg = [];
    for (const ob of o) (ob.fg ? fg : bg).push(...ob.prims);
    return { bg, fg };
  }
  fig(f) { this.figs.push(f); return f; }
}

/* ── solids ── */
function box(S, x, y, z, w, d, h, c, o) {
  o = o || {};
  const top = pp([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]]);
  const fx = pp([[x + w, y, z + h], [x + w, y + d, z + h], [x + w, y + d, z], [x + w, y, z]]);
  const fy = pp([[x, y + d, z + h], [x + w, y + d, z + h], [x + w, y + d, z], [x, y + d, z]]);
  const lw = o.lw === undefined ? LW : o.lw;
  const pr = [fp(fy, o.sy || shade(c, .24), { lw }), fp(fx, o.sx || shade(c, .11), { lw }), fp(top, o.top || c, { lw })];
  if (o.tex) o.tex(pr, x, y, z, w, d, h);
  S.push(o.d !== undefined ? o.d : x + w + y + d - .01 + z * .001, pr, o.fg);
}
// stone coursing on the two visible faces of a box
function stoneTex(c, course) {
  return (pr, x, y, z, w, d, h) => {
    const cs = course || .42, r = mul32(strSeed('' + x + y + z + w));
    for (let zz = z + cs; zz < z + h - .05; zz += cs) {
      pr.push(lp(pp([[x + w, y, zz], [x + w, y + d, zz]]), .22, { ld: .55 }), lp(pp([[x, y + d, zz], [x + w, y + d, zz]]), .22, { ld: .55 }));
    }
    for (let zz = z; zz < z + h - .05; zz += cs) {
      const z1 = Math.min(z + h, zz + cs);
      for (let u = r() * .7; u < d; u += .5 + r() * .5) pr.push(lp(pp([[x + w, y + u, zz], [x + w, y + u, z1]]), .2, { ld: .5 }));
      for (let u = r() * .7; u < w; u += .5 + r() * .5) pr.push(lp(pp([[x + u, y + d, zz], [x + u, y + d, z1]]), .2, { ld: .5 }));
    }
  };
}
function cylPts(x, y, z, r, a0, a1, n) {
  const o = [];
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; const s = P(x + Math.cos(a) * r, y + Math.sin(a) * r, z); o.push(s[0], s[1]); }
  return o;
}
function cyl(S, x, y, z, r, h, c, o) {
  o = o || {};
  const n = 20, a0 = -PI / 4, a1 = PI * .75;
  const body = cylPts(x, y, z, r, a0, a1, n).concat(revPairs(cylPts(x, y, z + h, r, a0, a1, n)));
  const top = cylPts(x, y, z + h, r, 0, TAU, 28); top.length -= 2;
  const pr = [fp(body, o.side || shade(c, .16)), fp(top, o.top || c)];
  if (o.inner) pr.push(fp(cylPts(x, y, z + h, r * .8, 0, TAU, 24).slice(0, -2), o.inner, { lw: .3 }));
  S.push(o.d !== undefined ? o.d : x + y + r, pr, o.fg);
}
function revPairs(a) { const o = []; for (let i = a.length - 2; i >= 0; i -= 2) o.push(a[i], a[i + 1]); return o; }

// A turned vessel (jar, waterpot, basket) drawn as its silhouette about a vertical axis.
function lathe(S, x, y, z, prof, c, o) {
  o = o || {};
  const b = P(x, y, z), L = [], R = [];
  for (const [hh, rr] of prof) { const w = rr * CX * 1.414; L.push(b[0] - w, b[1] - hh * K); R.push(b[0] + w, b[1] - hh * K); }
  const bot = prof[0][1] * CX * 1.414, botY = prof[0][1] * SY * 1.414;
  const arc = []; for (let i = 1; i < 12; i++) { const a = PI * i / 12; arc.push(b[0] - Math.cos(a) * bot, b[1] + Math.sin(a) * botY); }
  const body = L.slice(0, 2).concat(arc.slice().reverse().length ? [] : []);
  // outline: left side bottom→top, rim, right side top→bottom, bottom arc
  const out = [];
  for (let i = 0; i < L.length; i += 2) out.push(L[i], L[i + 1]);
  for (let i = R.length - 2; i >= 0; i -= 2) out.push(R[i], R[i + 1]);
  for (let i = arc.length - 2; i >= 0; i -= 2) out.push(arc[i], arc[i + 1]);
  const pr = [fp(out, c)];
  const top = prof[prof.length - 1], tw = top[1] * CX * 1.414, th = top[1] * SY * 1.414, ty = b[1] - top[0] * K;
  if (o.mouth !== false) pr.push(fp(ellPts(b[0], ty, tw, th, 20), o.mouth || shade(c, .5), { lw: .35 }));
  if (o.fill) pr.push(fp(ellPts(b[0], ty + th * .08, tw * .86, th * .8, 20), o.fill, { lw: .25 }));
  if (o.bands) for (const bh of o.bands) { const i = prof.findIndex(q => q[0] >= bh) ; const rr = prof[Math.max(0, i)][1] * CX * 1.414; pr.push(lp([b[0] - rr, b[1] - bh * K, b[0], b[1] - bh * K + 2, b[0] + rr, b[1] - bh * K], .25, { ld: .7 })); }
  S.push(o.d !== undefined ? o.d : x + y + .3, pr, o.fg);
}

/* ── ground, water, walls, backdrop ── */
function slab(S, top, o) {
  o = o || {};
  const D = o.depth || 1.1, bands = o.bands || [C.soil, C.soilD, C.stoneD];
  const pr = [];
  const faceX = (z0, z1) => pp([[SLAB, 0, z0], [SLAB, SLAB, z0], [SLAB, SLAB, z1], [SLAB, 0, z1]]);
  const faceY = (z0, z1) => pp([[0, SLAB, z0], [SLAB, SLAB, z0], [SLAB, SLAB, z1], [0, SLAB, z1]]);
  const n = bands.length;
  for (let i = 0; i < n; i++) {
    const z0 = -D * i / n, z1 = -D * (i + 1) / n;
    pr.push(fp(faceY(z0, z1), shade(bands[i], .14), { lw: i ? .3 : LW }), fp(faceX(z0, z1), bands[i], { lw: i ? .3 : LW }));
  }
  // pebbles in the cut
  const r = mul32(strSeed(S.def.id + 'peb'));
  for (let i = 0; i < 26; i++) {
    const side = r() < .5, u = .3 + r() * 9.4, zz = -D * (.2 + r() * .72), s = .08 + r() * .14;
    const q = side ? P(SLAB, u, zz) : P(u, SLAB, zz);
    pr.push(fp(ellPts(q[0], q[1], s * 20, s * 12, 9), o.pebble || C.stone, { lw: .25 }));
  }
  pr.push(fp(pp([[0, 0, 0], [SLAB, 0, 0], [SLAB, SLAB, 0], [0, SLAB, 0]]), top));
  S.push(-900, pr);
}
function waterSlab(S, o) {
  o = o || {};
  const D = o.depth || 1.4, pr = [];
  pr.push(fp(pp([[0, SLAB, 0], [SLAB, SLAB, 0], [SLAB, SLAB, -D], [0, SLAB, -D]]), shade(C.waterD, .08)));
  pr.push(fp(pp([[SLAB, 0, 0], [SLAB, SLAB, 0], [SLAB, SLAB, -D], [SLAB, 0, -D]]), C.waterD));
  pr.push(fp(pp([[0, SLAB, -D], [SLAB, SLAB, -D], [SLAB, SLAB, -D - .25], [0, SLAB, -D - .25]]), C.soilD, { lw: .3 }));
  pr.push(fp(pp([[SLAB, 0, -D], [SLAB, SLAB, -D], [SLAB, SLAB, -D - .25], [SLAB, 0, -D - .25]]), C.soil, { lw: .3 }));
  pr.push(fp(pp([[0, 0, 0], [SLAB, 0, 0], [SLAB, SLAB, 0], [0, SLAB, 0]]), o.top || C.water));
  const r = mul32(strSeed(S.def.id + 'wave'));
  for (let i = 0; i < (o.waves || 34); i++) {
    const x = .4 + r() * 9.2, y = .4 + r() * 9.2, l = .3 + r() * .5;
    pr.push(lp(pp([[x, y, 0], [x + l * .5, y - l * .5, 0], [x + l, y - l * .1, 0]]), .3, { ld: .8 }));
  }
  S.push(-900, pr);
}
// Two back walls, cut like a dollhouse. openings: {wall:'a'|'b', u0,u1,z0,z1, c}
function walls(S, H, c, o) {
  o = o || {};
  const t = o.t || .3;
  box(S, 0, -t, 0, SLAB, t, H, c, { d: -800, tex: o.tex === false ? null : stoneTex(c), sy: o.inner || shade(c, .05), sx: shade(c, .2) });
  box(S, -t, -t, 0, t, SLAB + t, H, c, { d: -801, tex: o.tex === false ? null : stoneTex(c), sx: o.inner || shade(c, .05), sy: shade(c, .2) });
  for (const op of o.open || []) opening(S, op, t);
}
function opening(S, op, t) {
  const A = op.wall === 'a', { u0, u1, z0, z1 } = op;
  const q = (u, z, dd) => A ? [u, -dd, z] : [-dd, u, z];
  const pr = [fp(pp([q(u0, z0, 0), q(u1, z0, 0), q(u1, z1, 0), q(u0, z1, 0)]), op.c || C.sky)];
  // reveal (jamb) showing the wall's thickness
  if (A) pr.push(fp(pp([q(u0, z0, 0), q(u0, z0, t), q(u0, z1, t), q(u0, z1, 0)]), shade(op.jamb || C.stone, .12), { lw: .35 }));
  else pr.push(fp(pp([q(u1, z0, 0), q(u1, z0, t), q(u1, z1, t), q(u1, z1, 0)]), shade(op.jamb || C.stone, .12), { lw: .35 }));
  if (op.paint) op.paint(pr, q);
  S.push(A ? -799 : -799.5, pr);
}
// Floor with flagstones.
function floor(S, c, o) {
  o = o || {};
  slab(S, c, { depth: o.depth || .7, bands: o.bands || [C.stone, C.stoneD], pebble: C.stoneD });
  const pr = [], r = mul32(strSeed(S.def.id + 'flag')), g = o.grid || 1.25;
  if (o.flags !== false) {
    for (let u = g; u < SLAB; u += g) pr.push(lp(pp([[u, 0, 0], [u, SLAB, 0]]), .22, { ld: .45 }));
    for (let v = g; v < SLAB; v += g) {
      for (let u = 0; u < SLAB; u += g) { const off = (Math.round(v / g) % 2) * g * .5; pr.push(lp(pp([[u + off, v, 0], [Math.min(SLAB, u + off + g * .92), v, 0]]), .22, { ld: .45 })); }
    }
  }
  S.push(-850, pr);
}
// Painted sky flats along the two back edges. s runs 0..20 from the left end, round the corner, to the right end.
function bd(s, w) { return s <= 10 ? [0, 10 - s, w] : [s - 10, 0, w]; }
function bdPoly(pts, c, o) {
  const dense = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const n = Math.max(1, Math.ceil(Math.abs(b[0] - a[0]) / .5));
    for (let k = 0; k < n; k++) { const t = k / n; dense.push(bd(lerp(a[0], b[0], t), lerp(a[1], b[1], t))); }
  }
  return fp(pp(dense), c, o);
}
function bdLine(pts, w, o) { const dense = []; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.ceil(Math.abs(b[0] - a[0]) / .5)); for (let k = 0; k < n; k++) { const t = k / n; dense.push(bd(lerp(a[0], b[0], t), lerp(a[1], b[1], t))); } } dense.push(bd(pts[pts.length - 1][0], pts[pts.length - 1][1])); return lp(pp(dense), w, o); }
function backdrop(S, H, sky, paint) {
  const pr = [];
  pr.push(fp(pp([[0, 0, 0], [0, SLAB, 0], [0, SLAB, H], [0, 0, H]]), shade(sky, .03)));
  pr.push(fp(pp([[0, 0, 0], [SLAB, 0, 0], [SLAB, 0, H], [0, 0, H]]), sky));
  if (paint) paint(pr);
  // the flats' top edge and thickness
  pr.push(fp(pp([[0, SLAB, H], [0, 0, H], [SLAB, 0, H], [SLAB, -.12, H], [-.12, -.12, H], [-.12, SLAB, H]]), C.wood, { lw: .3 }));
  S.push(-1000, pr);
}
function hills(pr, base, amp, c, seed, o) {
  const r = mul32(seed), pts = [[0, 0]];
  for (let s = 0; s <= 20.001; s += .5) pts.push([s, base + amp * (.5 + .5 * Math.sin(s * .55 + seed % 7)) * (.6 + .4 * r())]);
  pts.push([20, 0]);
  pr.push(bdPoly(pts, c, o));
}
function skyline(pr, s0, s1, base, c, seed) {
  const r = mul32(seed);
  for (let s = s0; s < s1;) {
    const w = .5 + r() * .9, h = base + .3 + r() * .7;
    pr.push(bdPoly([[s, base - .3], [s + w, base - .3], [s + w, h], [s, h]], c, { lw: .3 }));
    s += w + r() * .15;
  }
}

/* ── things ── */
function blob(cx, cy, rx, ry, c, o) { return fp(ellPts(cx, cy, rx, ry, o && o.n || 18, o && o.rot), c, o); }
function olive(S, x, y, s, o) {
  o = o || {}; s = s || 1;
  const b = P(x, y, 0), pr = [], r = mul32(strSeed('ol' + x + y));
  const h = 2.1 * s * K;
  pr.push(fp([b[0] - 4 * s, b[1], b[0] - 2 * s, b[1] - h * .5, b[0] - 5 * s, b[1] - h, b[0] + 1 * s, b[1] - h * .9, b[0] + 3 * s, b[1] - h * .45, b[0] + 4 * s, b[1]], C.woodD));
  pr.push(lp([b[0] - 1, b[1] - h * .2, b[0] + 1, b[1] - h * .55, b[0] - 2, b[1] - h * .8], .25, { ld: .7 }));
  const crown = o.c || [.12, .5, 0, .28];
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * TAU + r(), rr = (10 + r() * 9) * s;
    pr.push(blob(b[0] + Math.cos(a) * 14 * s, b[1] - h - 6 * s + Math.sin(a) * 8 * s, rr, rr * .72, i % 2 ? crown : shade(crown, .1)));
  }
  pr.push(blob(b[0], b[1] - h - 8 * s, 15 * s, 10 * s, mix(crown, C.none, .3)));
  if (o.night) for (const p of pr) if (p.c) p.c = add(p.c, [0, 0, 0, .35]);
  S.push(x + y + .2, pr, o.fg);
}
function palm(S, x, y, s) {
  s = s || 1; const b = P(x, y, 0), pr = [], h = 4.2 * s * K;
  pr.push(fp([b[0] - 2.5 * s, b[1], b[0] + 1 * s, b[1] - h * .5, b[0] + 3 * s, b[1] - h, b[0] + 5 * s, b[1] - h, b[0] + 3.5 * s, b[1] - h * .5, b[0] + 2.5 * s, b[1]], C.wood));
  for (let i = 3; i < 20; i++) pr.push(lp([b[0] - 2 + i * .15 * s, b[1] - h * i / 20, b[0] + 3 + i * .15 * s, b[1] - h * i / 20 + 1.5], .25, { ld: .6 }));
  const tx = b[0] + 4 * s, ty = b[1] - h;
  for (let i = 0; i < 9; i++) {
    const a = PI + i / 8 * PI + (i % 2) * .15, L = 26 * s;
    const ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * .5 + 12 * s;
    const mx = tx + Math.cos(a) * L * .5, my = ty + Math.sin(a) * L * .5 - 4 * s;
    pr.push(fp([tx, ty, mx - 3 * Math.sin(a), my + 3, ex, ey, mx + 3 * Math.sin(a), my - 2], i % 2 ? C.leaf : C.grassD, { lw: .35 }));
  }
  S.push(x + y + .2, pr);
}
function bush(S, x, y, s, c) {
  s = s || 1; const b = P(x, y, 0), pr = [], r = mul32(strSeed('bu' + x + y));
  for (let i = 0; i < 4; i++) pr.push(blob(b[0] + (r() - .5) * 14 * s, b[1] - (4 + r() * 6) * s, (6 + r() * 4) * s, (5 + r() * 3) * s, i % 2 ? (c || C.leaf) : shade(c || C.leaf, .1)));
  S.push(x + y, pr);
}
function tufts(S, n, c, area, seed) {
  const r = mul32(seed || 5), pr = [];
  area = area || [0, 0, 10, 10];
  for (let i = 0; i < n; i++) {
    const x = area[0] + r() * (area[2] - area[0]), y = area[1] + r() * (area[3] - area[1]), b = P(x, y, 0);
    pr.push(lp([b[0] - 1.6, b[1], b[0] - 2.2, b[1] - 3], .3, { li: G_, ld: .9 }), lp([b[0], b[1], b[0] + .3, b[1] - 3.6], .3, { li: G_, ld: .9 }), lp([b[0] + 1.4, b[1], b[0] + 2.4, b[1] - 2.8], .3, { li: G_, ld: .9 }));
  }
  S.push(-880, pr);
}
function flowers(S, n, cols, area, seed) {
  const r = mul32(seed || 9), pr = [];
  for (let i = 0; i < n; i++) {
    const x = area[0] + r() * (area[2] - area[0]), y = area[1] + r() * (area[3] - area[1]), b = P(x, y, 0);
    pr.push(lp([b[0], b[1], b[0] + .4, b[1] - 3.4], .28, { li: G_, ld: .9 }));
    const c = cols[i % cols.length];
    pr.push(fp(ellPts(b[0] + .4, b[1] - 4, 1.3, 1, 7), c, { lw: .2 }));
    pr.push(fp(ellPts(b[0] + .4, b[1] - 4, .45, .4, 5), C.gold, { lw: 0 }));
  }
  S.push(-870, pr);
}
function rock(S, x, y, w, d, h, c, o) {
  o = o || {};
  const r = mul32(strSeed('rk' + x + y)), j = () => (r() - .5) * .3;
  const pts = [[x + j(), y + j(), h + j()], [x + w + j(), y + j(), h * .9 + j()], [x + w + j(), y + d + j(), h * .8 + j()], [x + j(), y + d + j(), h + j()]];
  const top = pp(pts);
  const fx = pp([pts[1], pts[2], [x + w, y + d, 0], [x + w, y, 0]]);
  const fy = pp([pts[3], pts[2], [x + w, y + d, 0], [x, y + d, 0]]);
  const pr = [fp(fy, shade(c, .26)), fp(fx, shade(c, .12)), fp(top, o.top || c)];
  for (let i = 0; i < 3; i++) { const u = r(); pr.push(lp(pp([[x + w, y + d * u, h * .8 * r()], [x + w, y + d * (u + .1), 0]]), .22, { ld: .5 })); }
  S.push(o.d !== undefined ? o.d : x + w + y + d, pr, o.fg);
}
// the recurring motif: a tiny eight-pointed point of gold light (Rev 22:16)
function star(S, x, y, z, s, o) {
  o = o || {}; s = s || 1;
  const c = P(x, y, z), pts = [];
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU - PI / 2, rr = (i % 2 ? 1.1 : 3.4) * s * (i % 4 === 2 ? .62 : 1); pts.push(c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr); }
  const pr = [];
  if (o.glow !== false) pr.push(gp(c[0], c[1], 7 * s, 7 * s, 3, [.25, 0, 0, 0], [0, .3, .35, .45], .3));
  pr.push(fp(pts, C.gold, { lw: .22 * s, wa: .12 }));
  S.push(o.d !== undefined ? o.d : 500, pr, o.fg);
}
// light is ink: stepped rings that thin the dark inks and add ochre
function pool(S, x, y, z, r, o) {
  o = o || {};
  const c = P(x, y, z);
  S.push(o.d !== undefined ? o.d : -840, [gp(c[0], c[1], r * CX * 1.414, r * SY * 1.414, o.n || 4, o.add || [.12, 0, .02, 0], o.lift || [0, .12, .08, .16], o.inner)]);
}
function halo(S, x, y, z, r, o) {
  o = o || {};
  const c = P(x, y, z);
  S.push(o.d !== undefined ? o.d : 400, [gp(c[0], c[1], r * K, r * K * (o.sq || 1), o.n || 5, o.add || [.1, 0, 0, 0], o.lift || [0, .16, .14, .2], o.inner)], o.fg);
}
function lamp(S, x, y, z, o) {
  o = o || {};
  const c = P(x, y, z), pr = [];
  pr.push(fp([c[0] - 3, c[1] - 1, c[0] + 3, c[1] - 1, c[0] + 4.5, c[1] - 2.2, c[0] + 2, c[1] + .8, c[0] - 2, c[1] + .8], C.soil, { lw: .3 }));
  pr.push(fp([c[0] + 3.6, c[1] - 2, c[0] + 4.4, c[1] - 6, c[0] + 5.2, c[1] - 2], C.fire, { lw: .2, wa: .15 }));
  S.push(x + y + .1, pr);
  if (o.pool !== false) pool(S, x, y, z, o.r || 2.2, { d: o.pd });
  halo(S, x, y, z + .2, o.hr || .9, { d: x + y + .11, n: 4 });
}
function cloth(pts3, c) { return fp(pp(pts3), c, { lw: .35 }); }
function rug(S, x, y, w, d, c, o) {
  const pr = [fp(pp([[x, y, .01], [x + w, y, .01], [x + w, y + d, .01], [x, y + d, .01]]), c, { lw: .35 })];
  pr.push(lp(pp([[x + .12, y + .12, .01], [x + w - .12, y + .12, .01], [x + w - .12, y + d - .12, .01], [x + .12, y + d - .12, .01], [x + .12, y + .12, .01]]), .22, { li: R_, ld: .6 }));
  S.push(-830, pr);
}
function path3(S, pts, width, c) {  // a trodden road on the ground
  const L = [], Rr = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    L.push([pts[i][0] - ty * width / 2, pts[i][1] + tx * width / 2, .005]); Rr.push([pts[i][0] + ty * width / 2, pts[i][1] - tx * width / 2, .005]);
  }
  S.push(-860, [fp(pp(L.concat(Rr.reverse())), c, { lw: .3 })]);
}
function stepsBox(S, x, y, w, d, n, h, c, axis) { // stairs rising toward -x (axis 'x') or -y
  for (let i = 0; i < n; i++) {
    const hh = h * (i + 1) / n;
    if (axis === 'y') box(S, x, y, 0, w, d * (n - i) / n, hh, c, { lw: .35 });
    else box(S, x, y, 0, w * (n - i) / n, d, hh, c, { lw: .35 });
  }
}
function house(S, x, y, w, d, h, c, o) {
  o = o || {};
  box(S, x, y, 0, w, d, h, c, { tex: stoneTex(c, .45), d: o.d, fg: o.fg });
  const pr = [];
  // parapet on the flat roof
  pr.push(fp(pp([[x, y, h], [x + w, y, h], [x + w, y, h + .25], [x, y, h + .25]]), shade(c, .08), { lw: .3 }));
  pr.push(fp(pp([[x, y, h], [x, y + d, h], [x, y + d, h + .25], [x, y, h + .25]]), shade(c, .15), { lw: .3 }));
  if (o.door) { const [side, u, dw, dh] = o.door; pr.push(side === 'x' ? fp(pp([[x + w, y + u, 0], [x + w, y + u + dw, 0], [x + w, y + u + dw, dh], [x + w, y + u, dh]]), o.doorC || C.dark, { lw: .35 }) : fp(pp([[x + u, y + d, 0], [x + u + dw, y + d, 0], [x + u + dw, y + d, dh], [x + u, y + d, dh]]), o.doorC || C.dark, { lw: .35 })); }
  for (const wdw of o.win || []) { const [side, u, z0, ww, wh, wc] = wdw; pr.push(side === 'x' ? fp(pp([[x + w, y + u, z0], [x + w, y + u + ww, z0], [x + w, y + u + ww, z0 + wh], [x + w, y + u, z0 + wh]]), wc || C.dark, { lw: .3 }) : fp(pp([[x + u, y + d, z0], [x + u + ww, y + d, z0], [x + u + ww, y + d, z0 + wh], [x + u, y + d, z0 + wh]]), wc || C.dark, { lw: .3 })); }
  S.push((o.d !== undefined ? o.d : x + w + y + d) + .001, pr, o.fg);
}
function pillar(S, x, y, h, c, o) {
  o = o || {};
  cyl(S, x, y, 0, .32, .2, c, { d: x + y + .5 });
  cyl(S, x, y, .2, .22, h - .45, c, { d: x + y + .501, side: shade(c, .1) });
  box(S, x - .35, y - .35, h - .25, .7, .7, .25, c, { d: x + y + .502, lw: .35 });
}
function cloud(S, x, y, z, s, o) {
  o = o || {};
  const c = P(x, y, z), pr = [], r = mul32(strSeed('cl' + x + y + z));
  for (let i = 0; i < 7; i++) { const a = i / 7 * PI; pr.push(blob(c[0] + Math.cos(a) * 16 * s * (i % 2 ? .7 : 1), c[1] - Math.sin(a) * 6 * s, (8 + r() * 5) * s, (6 + r() * 3) * s, o.c || C.white)); }
  pr.push(blob(c[0], c[1] + 1 * s, 20 * s, 6 * s, o.c || C.white, { lw: 0 }));
  S.push(o.d !== undefined ? o.d : 600, pr, o.fg);
}
function fishShape(cx, cy, s, flip, c) {
  const f = flip ? -1 : 1;
  return fp([cx - 3 * s * f, cy, cx - 1 * s * f, cy - 1.3 * s, cx + 2 * s * f, cy - .6 * s, cx + 3.2 * s * f, cy - 1.4 * s, cx + 3 * s * f, cy, cx + 3.2 * s * f, cy + 1.4 * s, cx + 2 * s * f, cy + .6 * s, cx - 1 * s * f, cy + 1.2 * s], c || [.2, .1, .06, .45], { lw: .2, wa: .1 });
}
function basket(S, x, y, z, s, c, o) {
  o = o || {}; s = s || 1;
  lathe(S, x, y, z, [[0, .16 * s], [.14 * s, .2 * s], [.26 * s, .22 * s]], c || C.ochre, { bands: [.07 * s, .14 * s, .21 * s], mouth: o.mouth || C.soil, fill: o.fill, d: o.d });
}
// a boat with its far side and floor behind the crew, and its near side in front of them
function boat(S, x, y, len, beam, dep, o) {
  o = o || {};
  const hull = o.c || C.woodD;
  const pts = n => { const a = []; for (let i = 0; i <= n; i++) { const t = i / n, u = x + t * len, w = beam / 2 * Math.pow(Math.sin(PI * t), .6); a.push([u, y - w], [u, y + w]); } return a; };
  const N = 12, top = pts(N);
  const far = [], near = [], floorL = [], floorR = [];
  for (let i = 0; i <= N; i++) { far.push(top[i * 2]); near.push(top[i * 2 + 1]); }
  const zg = o.z === undefined ? dep * .45 : o.z, zb = zg - dep;
  const farTop = far.map(q => [q[0], q[1], zg]), farBot = far.map((q, i) => [q[0], lerp(q[1], y, .55), zb]);
  const nearTop = near.map(q => [q[0], q[1], zg]), nearBot = near.map((q, i) => [q[0], lerp(q[1], y, .55), zb]);
  const inside = pp(farTop.concat(nearTop.slice().reverse()));
  const bgp = [fp(inside, shade(C.wood, .05))];
  bgp.push(fp(pp(farTop.concat(farBot.slice().reverse())), shade(hull, .1)));
  for (let i = 2; i < N; i += 3) bgp.push(lp(pp([[farTop[i][0], farTop[i][1], zg], [nearTop[i][0], nearTop[i][1], zg]]), .3, { ld: .7 }));
  if (o.catch) for (let i = 0; i < o.catch; i++) { const u = x + len * (.2 + .6 * ((i * .618) % 1)), v = y + (((i * .371) % 1) - .5) * beam * .5, q = P(u, v, zg - .05); bgp.push(fishShape(q[0], q[1], .9, i % 2, i % 3 ? [.3, .1, .05, .5] : [.1, .1, .1, .6])); }
  S.push(x + y + len * .1 - 1, bgp);
  const fgp = [fp(pp(nearTop.concat(nearBot.slice().reverse())), hull)];
  fgp.push(lp(pp(nearTop), .45));
  fgp.push(lp(pp(near.map(q => [q[0], q[1], zg - .14])), .25, { ld: .6 }));
  if (o.water) { // waterline over the hull
    const wl = near.map(q => [q[0], lerp(q[1], y, .1), 0]);
    fgp.push(fp(pp(wl.concat(nearBot.slice().reverse().map(q => [q[0], q[1], Math.min(0, q[2])]))), mix(C.water, C.waterD, .3), { lw: .3 }));
  }
  S.push(x + len + y + beam, fgp, true);
}
function crossBeam(S, x, y, h, o) {
  o = o || {};
  box(S, x - .09, y - .09, 0, .18, .18, h, C.woodD, { d: x + y + .3, lw: .35 });
  box(S, x - .09, y - .9, h - .95, .18, 1.8, .16, C.woodD, { d: x + y + .31, lw: .35 });
  if (o.title) { const c = P(x + .1, y, h + .1); const pr = [fp([c[0] - 5, c[1] - 3, c[0] + 5, c[1] - 3.5, c[0] + 5, c[1] + 2.5, c[0] - 5, c[1] + 3], C.linen, { lw: .3 })]; for (let i = 0; i < 3; i++) pr.push(lp([c[0] - 4, c[1] - 1.7 + i * 1.7, c[0] - 1, c[1] - 1.5 + i * 1.7, c[0] + 1, c[1] - 1.9 + i * 1.7, c[0] + 4, c[1] - 1.6 + i * 1.7], .28, { ld: .8 })); S.push(x + y + .33, pr); }
}
