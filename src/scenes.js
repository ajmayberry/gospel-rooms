/* ───────────── the twenty-five rooms ─────────────
   Every drawn detail answers to a verse (see README). Where scripture is silent the
   scene shows plain period background that makes no claim. */
const TINT = {
  day: null,
  dusk: c => [clamp(c[0] * .9 + .1, 0, 1), c[1] * .85, clamp(c[2] * .88 + .12, 0, 1), clamp(c[3] * .85 + .1, 0, 1)],
  dawn: c => [clamp(c[0] * .92 + .08, 0, 1), c[1] * .85, clamp(c[2] * .9 + .09, 0, 1), clamp(c[3] * .88 + .08, 0, 1)],
  night: c => [c[0] * .45, c[1] * .7 + .04, c[2] * .55 + .04, clamp(c[3] * .72 + .36, 0, 1)],
  dark: c => [c[0] * .6, c[1] * .8 + .03, c[2] * .75 + .08, clamp(c[3] * .78 + .25, 0, 1)],
};
const toward = (a, b) => [b[0] - a[0], b[1] - a[1]];
function F(S, look, x, y, clip, face, o) { return S.fig(Object.assign({ look, at: [x, y, (o && o.z) || 0], clip, face: face || [1, 1] }, o)); }
function Wk(S, look, start, path, o) { return S.fig(Object.assign({ look, start, path }, o)); }
function A(S, kind, x, y, clip, face, o) { return S.fig(Object.assign({ kind, at: [x, y, (o && o.z) || 0], clip: clip || 'still', face: face || [1, 1] }, o)); }
function starsSky(pr, n, seed, w0) {
  const r = mul32(seed);
  for (let i = 0; i < n; i++) { const s = r() * 20, w = (w0 || 2) + r() * (3.9 - (w0 || 2)), q = P(...bd(s, w)); const z = .35 + r() * .45; const p = fp(ellPts(q[0], q[1], z, z, 6), [.35, 0, .03, 0], { lw: 0 }); p.nt = 1; pr.push(p); }
}
function town(pr, s0, s1, base, c, seed, lit) {
  const r = mul32(seed);
  for (let s = s0; s < s1;) {
    const w = .45 + r() * .8, h = base + .25 + r() * .55;
    pr.push(bdPoly([[s, base - .4], [s + w, base - .4], [s + w, h], [s, h]], c, { lw: .3 }));
    if (r() < .5) { const ws = s + w * .4; const p = bdPoly([[ws, h - .3], [ws + .12, h - .3], [ws + .12, h - .16], [ws, h - .16]], lit ? C.gold : C.dark, { lw: 0 }); if (lit) p.nt = 1; pr.push(p); }
    s += w + r() * .1;
  }
}
function cityWall(pr, s0, s1, base, h, c) {
  pr.push(bdPoly([[s0, base], [s1, base], [s1, base + h], [s0, base + h]], c, { lw: .35 }));
  for (let s = s0; s < s1 - .2; s += .42) pr.push(bdPoly([[s, base + h], [s + .22, base + h], [s + .22, base + h + .16], [s, base + h + .16]], c, { lw: .25 }));
}
function temple(pr, s, base, c) {
  pr.push(bdPoly([[s - 1.6, base], [s + 1.6, base], [s + 1.6, base + .9], [s - 1.6, base + .9]], c, { lw: .35 }));
  pr.push(bdPoly([[s - .7, base + .9], [s + .7, base + .9], [s + .7, base + 1.9], [s - .7, base + 1.9]], shade(c, -.05), { lw: .35 }));
  pr.push(bdPoly([[s - .25, base + .9], [s + .25, base + .9], [s + .25, base + 1.5], [s - .25, base + 1.5]], C.gold, { lw: .25 }));
}
function mat(S, x, y, w, d, c) { S.push(-835, [fp(pp([[x, y, .01], [x + w, y, .01], [x + w, y + d, .01], [x, y + d, .01]]), c, { lw: .3 })]); }
function cushion(S, x, y, c) { const q = P(x, y, .08); S.push(-834, [fp(ellPts(q[0], q[1], 10, 5, 12), c, { lw: .35 })]); }
function jar(S, x, y, s, c, o) { lathe(S, x, y, 0, [[0, .1 * s], [.12 * s, .2 * s], [.35 * s, .22 * s], [.52 * s, .12 * s], [.6 * s, .1 * s]], c || C.clay, Object.assign({ bands: [.3 * s] }, o)); }
function stonePot(S, x, y, o) { lathe(S, x, y, 0, [[0, .2], [.1, .25], [.55, .27], [.75, .24], [.8, .25]], C.stoneL, Object.assign({ fill: C.water, bands: [.2, .6] }, o)); }
function fire(S, x, y) {
  const c = P(x, y, 0), pr = [];
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; pr.push(fp(ellPts(c[0] + Math.cos(a) * 7, c[1] + Math.sin(a) * 3.5, 2.2, 1.4, 8), C.stoneD, { lw: .3 })); }
  pr.push(lp([c[0] - 4, c[1] + 1, c[0] + 4, c[1] - 2], .8, { ld: .9 }), lp([c[0] - 3, c[1] - 2, c[0] + 4, c[1] + 1], .8, { ld: .9 }));
  pr.push(fp([c[0] - 3, c[1], c[0] - 1, c[1] - 8, c[0] + .5, c[1] - 4, c[0] + 2, c[1] - 10, c[0] + 3.5, c[1]], C.fire, { lw: .25, wa: .3 }));
  S.push(x + y, pr);
  pool(S, x, y, 0, 2.6, { n: 5, add: [.16, 0, .04, 0], lift: [0, .14, .1, .2] });
  halo(S, x, y, .3, .7, { d: x + y + .01, n: 3 });
}
function reeds(S, n, area, seed) {
  const r = mul32(seed), pr = [];
  for (let i = 0; i < n; i++) { const x = area[0] + r() * (area[2] - area[0]), y = area[1] + r() * (area[3] - area[1]), b = P(x, y, 0), h = 10 + r() * 12; pr.push(lp([b[0], b[1], b[0] + (r() - .5) * 4, b[1] - h], .45, { li: G_, ld: 1 })); if (r() < .4) pr.push(fp(ellPts(b[0] + (r() - .5) * 3, b[1] - h, .9, 2.4, 6), C.soil, { lw: .2 })); }
  S.push(-865, pr);
}
function birdsFly(S, n, z, seed) {
  const r = mul32(seed);
  for (let i = 0; i < n; i++) { const y0 = 1 + r() * 8, x0 = -1, z0 = z + r() * .8; S.fig({ kind: 'bird', start: [x0, y0, z0], path: [{ go: [11, y0 - 3 + r() * 2, z0 + r() * .4], clip: 'fly', v: 1.6 + r() }], fade: true, ph: r() * 9, noShadow: true }); }
}
// a stepped halftone of light on a wall or backdrop, for windows and the opened heavens
function beam(S, pts, add, d) { const p = fp(pp(pts), add, { lw: 0, ko: 0 }); p.nt = 1; S.push(d === undefined ? -780 : d, [p]); }

/* ── set dressing: plain period household goods that make no claim ──
   Each helper notes its footprint in S._dz so a check can keep them off figures' paths. */
const dz = (S, x0, y0, x1, y1) => (S._dz || (S._dz = [])).push([x0, y0, x1, y1]);
const VES = {
  jug: [[0, .08], [.1, .14], [.26, .15], [.4, .08], [.46, .05], [.5, .07]],
  bowl: [[0, .07], [.07, .15], [.12, .18]],
  jar: [[0, .1], [.16, .18], [.34, .19], [.46, .1], [.5, .1]],
  amph: [[0, .03], [.16, .15], [.42, .19], [.64, .12], [.72, .06], [.86, .06], [.9, .08]],
};
const vessel = (S, kind, x, y, z, s, c, o) => lathe(S, x, y, z, VES[kind].map(([h, r]) => [h * s, r * s]), c, Object.assign({ bands: [VES[kind][1][0] * s * 1.6] }, o));
// a wooden ledge on a back wall ('a' runs along x at y = 0, 'b' along y at x = 0) set with vessels
function ledge(S, wall, u0, u1, z, seed) {
  const A = wall === 'a', r = mul32(seed), cs = [C.clay, C.stoneL, C.clay, C.ochre, C.wool, C.clay];
  if (A) box(S, u0, 0, z, u1 - u0, .34, .08, C.wood, { d: -791, lw: .3 }); else box(S, 0, u0, z, .34, u1 - u0, .08, C.wood, { d: -791, lw: .3 });
  for (let u = u0 + .22; u < u1 - .15; u += .3 + r() * .22) {
    const k = r() < .35 ? 'bowl' : r() < .6 ? 'jug' : 'jar', s = k === 'bowl' ? .9 : .7 + r() * .5;
    vessel(S, k, A ? u : .17, A ? .17 : u, z + .08, s, cs[(r() * cs.length) | 0], { d: -790 + u * .001 });
  }
}
// cloth hung from pegs on a back wall
function hangCloth(S, wall, u, z, w, h, c, stripe) {
  const A = wall === 'a', q = (uu, zz) => A ? [uu, .03, zz] : [.03, uu, zz];
  const pr = [fp(pp([q(u, z), q(u + w, z), q(u + w - .04, z - h), q(u + w * .5, z - h - .08), q(u + .04, z - h)]), c, { lw: .35 })];
  for (let i = 1; i < 3; i++) pr.push(lp(pp([q(u + w * i / 3, z), q(u + w * i / 3 + .02, z - h + .05)]), .22, { ld: .5 }));
  if (stripe) pr.push(lp(pp([q(u + .02, z - h * .78), q(u + w - .03, z - h * .78)]), .5, { li: stripe, ld: .8 }));
  for (const uu of [u + .06, u + w - .06]) { const p = P(...q(uu, z + .03)); pr.push(fp(ellPts(p[0], p[1], 1, .8, 6), C.woodD, { lw: .2 })); }
  S.push(-792, pr);
}
// grain sacks, tied at the neck
function sacks(S, x, y, n, seed, c) {
  const r = mul32(seed);
  for (let i = 0; i < n; i++) {
    const sx = x + (i % 3) * .5 + r() * .08, sy = y + ((i / 3) | 0) * .5 + (i % 3) * .06, s = .9 + r() * .25;
    lathe(S, sx, sy, 0, [[0, .2 * s], [.22 * s, .24 * s], [.42 * s, .2 * s], [.52 * s, .1 * s], [.56 * s, .05 * s], [.62 * s, .08 * s]], c || (i % 2 ? C.undyed : C.wool), { mouth: false, bands: [.53 * s] });
  }
  dz(S, x - .25, y - .25, x + Math.min(n, 3) * .5, y + Math.ceil(n / 3) * .5);
}
// a huddle of storage jars
function jars(S, x, y, n, seed) {
  const r = mul32(seed);
  for (let i = 0; i < n; i++) { const jx = x + (i % 2) * .45 + r() * .1, jy = y + ((i / 2) | 0) * .42 + (i % 2) * .2; vessel(S, r() < .5 ? 'amph' : 'jar', jx, jy, 0, .8 + r() * .5, r() < .75 ? C.clay : C.stoneL); }
  dz(S, x - .25, y - .25, x + .7, y + Math.ceil(n / 2) * .42 + .2);
}
// a plain bench along x ('x') or along y ('y')
function bench(S, x, y, len, axis, c) {
  c = c || C.wood;
  const w = axis === 'x' ? len : .45, d = axis === 'x' ? .45 : len;
  for (const t of [.1, len - .22]) box(S, axis === 'x' ? x + t : x + .08, axis === 'x' ? y + .08 : y + t, 0, axis === 'x' ? .12 : .3, axis === 'x' ? .3 : .12, .38, shade(c, .2), { lw: .3 });
  box(S, x, y, .38, w, d, .08, c, { lw: .35 });
  dz(S, x, y, x + w, y + d);
}
// split wood stacked along y
function woodpile(S, x, y, len) {
  len = len || 1.2;
  for (let row = 0; row < 3; row++) for (let i = 0; i < 4 - row; i++) {
    const yy = y + row * .1 + i * (len / 4), z = row * .16, e = P(x + .7, yy + .12, z + .08);
    box(S, x, yy, z, .7, len / 4 - .02, .16, C.woodD, { lw: .28, d: x + yy + .9 + row * .01 });
    S.push(x + yy + .91 + row * .01, [fp(ellPts(e[0], e[1], 2, 1.6, 8), C.wood, { lw: .22 })]);
  }
  dz(S, x, y, x + .7, y + len);
}
// a dry-stone field wall along a polyline
function lowWall(S, pts, h, c) {
  h = h || .5; c = c || C.stone;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1], n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / .9));
    for (let k = 0; k < n; k++) {
      const x = lerp(ax, bx, k / n), y = lerp(ay, by, k / n), x1 = lerp(ax, bx, (k + 1) / n), y1 = lerp(ay, by, (k + 1) / n);
      const bx0 = Math.min(x, x1) - .17, by0 = Math.min(y, y1) - .17;
      box(S, bx0, by0, 0, Math.abs(x1 - x) + .34, Math.abs(y1 - y) + .34, h * (.9 + ((k * 7) % 3) * .06), c, { tex: stoneTex(c, .22), lw: .35 });
      dz(S, bx0, by0, bx0 + Math.abs(x1 - x) + .34, by0 + Math.abs(y1 - y) + .34);
    }
  }
}
// a clay pot with something green in it
function potPlant(S, x, y, z, s) {
  s = s || 1; z = z || 0;
  lathe(S, x, y, z, [[0, .12 * s], [.28 * s, .2 * s], [.32 * s, .22 * s]], C.clay, { mouth: C.soil, bands: [.26 * s] });
  const q = P(x, y, z + .34 * s), pr = [];
  for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; pr.push(blob(q[0] + Math.cos(a) * 3.2 * s, q[1] - 3 * s + Math.sin(a) * 1.8 * s - (i % 2) * 2 * s, 2.6 * s, 2.2 * s, i % 2 ? C.leafL : C.leaf, { lw: .25 })); }
  S.push(x + y + .31, pr);
  if (!z) dz(S, x - .25, y - .25, x + .25, y + .25);
}
// a flat-woven rug with bands and a diamond row
function patRug(S, x, y, w, d, c1, c2) {
  const pr = [fp(pp([[x, y, .012], [x + w, y, .012], [x + w, y + d, .012], [x, y + d, .012]]), c1, { lw: .35 })];
  for (const t of [.14, .86]) pr.push(fp(pp([[x + .1, y + d * t - .07, .013], [x + w - .1, y + d * t - .07, .013], [x + w - .1, y + d * t + .07, .013], [x + .1, y + d * t + .07, .013]]), c2, { lw: .2 }));
  const n = Math.max(2, Math.round(w / .6));
  for (let i = 0; i < n; i++) { const cx = x + (i + .5) * w / n, cy = y + d / 2, a = w / n * .36, b = d * .22; pr.push(fp(pp([[cx - a, cy, .013], [cx, cy - b, .013], [cx + a, cy, .013], [cx, cy + b, .013]]), c2, { lw: .2 })); }
  for (let i = 0; i <= n * 2; i++) { const xx = x + i * w / (n * 2); pr.push(lp(pp([[xx, y + d, .012], [xx - .02, y + d + .1, .012]]), .25, { ld: .6 })); }
  S.push(-829, pr);
}
// a scatter of stones on open ground
function stones(S, n, area, seed, c) {
  const r = mul32(seed);
  for (let i = 0; i < n; i++) { const x = area[0] + r() * (area[2] - area[0]), y = area[1] + r() * (area[3] - area[1]), s = .18 + r() * .22; rock(S, x, y, s * 1.3, s, s * .7, c || C.stone); dz(S, x, y, x + s * 1.3, y + s); }
}
// some flagstones laid in a second stone
function flagTint(S, c, frac, seed, g) {
  g = g || 1.25; const r = mul32(seed), pr = [];
  for (let i = 0; i * g < SLAB - .01; i++) for (let j = 0; j * g < SLAB - .01; j++) if (r() < frac) { const x = i * g + .06, y = j * g + .06, w = Math.min(g, SLAB - i * g) - .12; pr.push(fp(pp([[x, y, .004], [x + w, y, .004], [x + w, y + g - .12, .004], [x, y + g - .12, .004]]), c, { lw: 0 })); }
  S.push(-851, pr);
}

/* ── shared sets ── */
function nazarethYard(S) {
  slab(S, C.earth);
  backdrop(S, 4, C.sky, pr => { hills(pr, 1.4, 1.2, C.sage, 11); hills(pr, .6, .9, C.olive, 12); town(pr, 12.5, 18, 1.1, C.plaster, 5); });
  tufts(S, 30, 0, [0, 4, 10, 10], 31);
  house(S, .2, .2, 5.4, 2.8, 2.7, C.plaster, { door: ['y', 1.8, .95, 1.85], win: [['x', 1.1, 1.5, .55, .5], ['y', 4.1, 1.5, .5, .45]] });
  for (let i = 0; i < 7; i++) box(S, 5.6, .5 + i * .3, 0, .9, .3, 2.7 - i * .38, C.plaster, { lw: .35 });   // outside stair to the roof
  for (const [x, y] of [[7.1, .5], [9.6, .5], [7.1, 3.8], [9.6, 3.8]]) box(S, x, y, 0, .18, .18, 2.3, C.woodD, { lw: .35 });
  for (let i = 0; i < 6; i++) box(S, 7 + i * .5, .4, 2.3, .12, 3.7, .1, C.wood, { lw: .3 });
  box(S, 7.7, 1.8, 0, 1.8, .7, .78, C.wood, { lw: .4 });                                                // the workbench
  box(S, 7.9, 1.9, .78, 1.2, .25, .12, C.sand, { lw: .3 });
  for (let i = 0; i < 4; i++) box(S, 9.75, .7 + i * .25, 0, .2, .2, 2 - i * .2, C.wood, { lw: .3 });          // timber stood on end
  for (let i = 0; i < 3; i++) box(S, 8, 4.4 + i * .18, i * .12, 1.8, .17, .12, C.wood, { lw: .3 });           // planks
  lathe(S, 1.6, 5.2, 0, [[0, .5], [.5, .45], [.8, .25], [.9, .12]], C.clay, { mouth: C.soilD, bands: [.3] });  // clay oven
  cyl(S, 3.4, 6.6, 0, .32, .16, C.stone); cyl(S, 3.4, 6.6, .16, .3, .1, C.stoneL);                         // hand mill
  jar(S, 2.6, 3.4, 1); jar(S, 3.05, 3.5, .8);
  olive(S, 1, 8.6, 1); bush(S, 9.2, 8.6, 1, C.leafL);
  mat(S, 2.4, 6.2, 1.4, 1.1, C.ochre);
  woodpile(S, .4, 5.9, 1.2); sacks(S, 4.1, 3.35, 2, 81); jars(S, .5, 3.4, 3, 82);
  potPlant(S, 1, 1, 2.7, .9); potPlant(S, 3.2, .6, 2.7, .7); potPlant(S, 4.6, .9, 2.7, .8);
  lowWall(S, [[2.6, 9.75], [8.4, 9.75]], .45); lowWall(S, [[9.75, 5.4], [9.75, 7.6]], .45);
}
function templeCourt(S, dark) {
  floor(S, C.stoneL, { grid: 1.6 });
  walls(S, 4.2, C.stoneL, { tex: stoneTex(C.stoneL, .5), open: [{ wall: 'a', u0: 6.4, u1: 8.2, z0: 0, z1: 2.8, c: C.dark }] });
  for (let i = 0; i < 5; i++) { pillar(S, 1.2 + i * 2, 1.3, 3.8, C.stone); }
  for (let i = 1; i < 5; i++) pillar(S, 1.3, 1.3 + i * 2, 3.8, C.stone);
  box(S, 0, .3, 3.8, 10, 1.4, .3, C.stone, { d: -700, lw: .4 });
  box(S, .3, 0, 3.8, 1.4, 10, .3, C.stone, { d: -701, lw: .4 });
  stepsBox(S, 6, .2, 2.6, 1.1, 3, .45, C.stone, 'y');
  flagTint(S, C.stone, .2, 241, 1.6);
  for (const [x, y] of [[4.2, .7], [8.6, .6]]) { lathe(S, x, y, 0, [[0, .3], [.3, .34], [.55, .4], [.62, .42]], C.stoneL, { fill: C.water, bands: [.3] }); dz(S, x - .45, y - .45, x + .45, y + .45); }
  bench(S, 9.2, 4.4, 2.6, 'y', C.stone);
}
function upperRoom(S) {
  floor(S, C.plaster, { grid: 1.25, bands: [C.plaster, C.stone, C.stoneD] });
  walls(S, 3.3, C.plaster, { tex: stoneTex(C.plaster, .5), open: [
    { wall: 'a', u0: 2.2, u1: 3.3, z0: 1.3, z1: 2.4, c: C.sky }, { wall: 'a', u0: 6.2, u1: 7.3, z0: 1.3, z1: 2.4, c: C.sky },
    { wall: 'b', u0: 7.8, u1: 8.9, z0: 0, z1: 2.1, c: C.dark }] });
  box(S, 3.9, -.25, 1.3, .6, .25, .14, C.wood, { d: -790, lw: .3 });
  ledge(S, 'a', 7.6, 9.6, 1.5, 181); ledge(S, 'b', 1, 3.4, 1.5, 182); hangCloth(S, 'b', 4.3, 2.6, 1, .9, C.olive, R_);
  jars(S, 9.2, .5, 3, 183);
  for (let i = 0; i < 3; i++) box(S, .2, 1 + i * .55, 0, .5, .5, .3, [C.wool, C.ochre, C.madder][i], { lw: .35 });   // bedding rolled by the wall
  dz(S, .2, 1, .7, 2.65);
}

/* ── the scenes ── */
const SCENES = [
/* I · THE PROMISE */
{ id: 'annunciation', act: 'The Promise', title: 'The Annunciation', cite: 'Luke 1:28', tint: 'day',
  quote: 'And the angel came in unto her, and said, Hail, thou that art highly favoured, the Lord is with thee: blessed art thou among women.',
  build(S) {
    floor(S, C.stoneL, { grid: 1.4 });
    walls(S, 3.3, C.plaster, { tex: stoneTex(C.plaster, .46), open: [
      { wall: 'a', u0: 5.4, u1: 7, z0: 1.3, z1: 2.5, c: C.sky, paint: (pr, q) => pr.push(fp(pp([q(5.4, 1.3, 0), q(7, 1.3, 0), q(7, 1.7, 0), q(6.2, 1.95, 0), q(5.4, 1.75, 0)]), C.sage, { lw: .3 })) },
      { wall: 'b', u0: 5.6, u1: 6.9, z0: 0, z1: 2.2, c: C.sky, paint: (pr, q) => pr.push(fp(pp([q(5.6, 0, 0), q(6.9, 0, 0), q(6.9, .8, 0), q(5.6, 1, 0)]), C.olive, { lw: .3 })) }] });
    star(S, 6.6, 0, 2.25, .45, { d: -790 });
    rug(S, 3.6, 2, 3.4, 2.6, C.madder);
    box(S, 5.7, 2.6, 0, .55, .45, .42, C.wood, { lw: .35 });          // stool
    lathe(S, 8.6, .8, 0, [[0, .15], [.1, .24], [.4, .26], [.6, .14], [.7, .12]], C.clay, { bands: [.35] });
    jar(S, 9.3, 1.2, .8);
    box(S, 1.2, .1, 1.5, .5, .3, .1, C.wood, { d: -795, lw: .3 });   // wall ledge and lamp
    lamp(S, 1.45, .25, 1.6, { pool: false, hr: .5 });
    basket(S, 7.2, 3.6, 0, 1, C.ochre, { fill: C.linen });
    ledge(S, 'a', 2.2, 5, 1.55, 201); ledge(S, 'b', 7.3, 9.6, 1.45, 202);
    hangCloth(S, 'b', 1.3, 2.5, 1.2, .9, C.madder, B_); hangCloth(S, 'a', 7.6, 2.3, .8, 1.1, C.olive);
    box(S, .2, 4.3, 0, .7, 1.1, .55, C.wood, { lw: .35 }); dz(S, .2, 4.3, .9, 5.4);                 // a chest
    sacks(S, 8.6, 5.4, 4, 203); jars(S, 8.8, 8.2, 3, 204); potPlant(S, .6, 7.6); potPlant(S, .6, 9.2, 0, .8);
    patRug(S, 5, 6.4, 2.8, 2, C.olive, C.ochre); flagTint(S, C.stone, .18, 205, 1.4);
    box(S, .1, 1.2, 0, 1.4, 2.6, .3, C.wool, { lw: .35 });           // bedding rolled against the wall
    halo(S, 2.6, 6.2, 1.1, 1.4, { d: 50, sq: 1.25, n: 5, add: [.08, 0, 0, 0], lift: [0, .2, .2, .22] });
    pool(S, 2.6, 6.2, 0, 2.2, { n: 4 });
    F(S, 'gabriel', 2.6, 6.2, 'talk', [1, -1]);
    F(S, 'mary', 5.95, 2.85, 'seatBow', [-1, 1]);
  } },
{ id: 'visitation', act: 'The Promise', title: 'The Visitation', cite: 'Luke 1:42', tint: 'day',
  quote: 'And she spake out with a loud voice, and said, Blessed art thou among women, and blessed is the fruit of thy womb.',
  build(S) {
    slab(S, C.grass, { bands: [C.soil, C.soilD, C.stoneD] });
    backdrop(S, 4, C.sky, pr => { hills(pr, 1.8, 1.4, C.sage, 21); for (let i = 0; i < 5; i++) pr.push(bdLine([[0, 1 + i * .3], [20, 1.2 + i * .3]], .3, { li: G_, ld: .6 })); hills(pr, .8, .9, C.olive, 22); town(pr, 2, 5, 1.3, C.plaster, 23); });
    tufts(S, 50, 0, [0, 0, 10, 10], 24); flowers(S, 18, [C.madder, C.linen], [0, 4, 10, 10], 25);
    path3(S, [[0, 9.6], [2.4, 8], [4.2, 6.6], [5.6, 5.4], [6.4, 4.1]], 1.1, C.sand);
    house(S, 4.6, .3, 4.6, 3.1, 2.8, C.stone, { door: ['y', 1.3, .95, 1.9], win: [['x', 1, 1.6, .5, .45]] });
    box(S, 4.6, .3, 2.8, 4.6, 3.1, .08, C.earth, { lw: .3 });
    olive(S, 1.4, 2, 1.1); olive(S, 2.8, .9, .9); olive(S, 9, 6.8, 1); bush(S, 1, 5, 1); bush(S, 8, 8.8, .9);
    rock(S, 7.4, 8.6, .8, .6, .4, C.stone);
    jar(S, 4.4, 3.6, .9);
    jars(S, 8.3, 3.7, 3, 211); bench(S, 7, 3.55, 1, 'x'); potPlant(S, 4.8, 3.8); potPlant(S, 5.2, .8, 2.88, .8); potPlant(S, 8.6, .8, 2.88, .9);
    woodpile(S, 3.7, 1.6, 1.2); lowWall(S, [[0, 4.4], [3.2, 4.4]], .45); lowWall(S, [[7.2, 6.2], [9.8, 6.2]], .45);
    stones(S, 8, [6.5, 4.6, 9.8, 5.8], 212);
    star(S, 6.3, 3.43, 2.35, .45);
    const T = 17;
    Wk(S, 'mary', [0, 9.8], [{ go: [4.6, 6.2], clip: 'walk', v: .9 }, { do: 'embrace', t: 6, face: [1, -1] }, { go: [6.1, 3.5], clip: 'walk', v: .9 }], { fade: true, T });
    Wk(S, 'elisabeth', [6.1, 3.45], [{ do: 'stand', t: 4.7, face: [1, 1] }, { go: [6, 4.9], clip: 'walk', v: .8 }, { do: 'embrace', t: 6.3, face: [-1, 1] }, { go: [6.1, 3.5], clip: 'walk', v: .8 }], { fade: true, T });
  } },
{ id: 'nativity', act: 'The Promise', title: 'The Nativity', cite: 'Luke 2:7', tint: 'night',
  quote: 'And she brought forth her firstborn son, and wrapped him in swaddling clothes, and laid him in a manger; because there was no room for them in the inn.',
  build(S) {
    floor(S, C.earth, { flags: false, bands: [C.soil, C.soilD, C.stoneD] });
    walls(S, 3.1, C.stone, { tex: stoneTex(C.stone, .4), open: [{ wall: 'b', u0: 6.4, u1: 7.8, z0: 0, z1: 2.1, c: C.night, paint: (pr, q) => { pr.push(fp(pp([q(6.4, 0, 0), q(7.8, 0, 0), q(7.8, 1.1, 0), q(7.4, 1.1, 0), q(7.4, 1.5, 0), q(6.9, 1.5, 0), q(6.9, .9, 0), q(6.4, .9, 0)]), C.stoneD, { lw: .3 })); } }] });
    tufts(S, 26, 0, [1, 1, 9, 9], 33);
    const r = mul32(34), straw = []; for (let i = 0; i < 90; i++) { const x = 2 + r() * 5, y = 1.5 + r() * 4, b = P(x, y, 0), a = r() * PI; straw.push(lp([b[0], b[1], b[0] + Math.cos(a) * 4, b[1] + Math.sin(a) * 2], .35, { li: O, ld: .9 })); } S.push(-845, straw);
    // the manger: a feeding trough
    box(S, 3.6, 2.3, 0, 1.9, .9, .72, C.stone, { tex: stoneTex(C.stone, .24) });
    box(S, 3.75, 2.45, .72, 1.6, .6, .02, C.dark, { d: 7.6, lw: .2 });
    const m = P(4.55, 2.75, .74), pr = [];
    for (let i = 0; i < 16; i++) pr.push(lp([m[0] - 14 + i * 1.8, m[1] + 1, m[0] - 12 + i * 1.8, m[1] - 3], .4, { li: O, ld: 1 }));
    pr.push(fp(ellPts(m[0], m[1] - 2.5, 7, 3, 14, -.46), C.linen, { lw: .38 }));
    for (let i = -1; i <= 1; i++) pr.push(lp([m[0] + i * 2.4 - 1, m[1] - 5, m[0] + i * 2.4 + 1, m[1] + .3], .3, { ld: .45 }));
    pr.push(fp(ellPts(m[0] + 6, m[1] - 5.6, 2.3, 2.1, 10), C.skin, { lw: .3 }), fp(ellPts(m[0] + 5.5, m[1] - 6.6, 1.5, 1, 8), C.hair, { lw: 0 }));
    S.push(7.7, pr);
    box(S, 8.2, .2, 0, 1.5, .8, .5, C.ochre, { lw: .35 });           // fodder
    const bale = (pr, x, y, z, w, d, h) => { for (let k = 1; k < 4; k++) pr.push(lp(pp([[x + w, y, z + h * k / 4], [x + w, y + d, z + h * k / 4]]), .2, { ld: .4 })); };
    for (let i = 0; i < 3; i++) box(S, 8.3 - i * .05, 1.2 + i * .75, 0, 1.3, .7, .45 - i * .06, C.ochre, { lw: .35, tex: bale }); dz(S, 8.2, 1.2, 9.6, 3.7);
    box(S, .2, 3.2, 0, .7, 1.8, .6, C.stone, { tex: stoneTex(C.stone, .3), lw: .35 }); dz(S, .2, 3.2, .9, 5);   // a second trough
    ledge(S, 'a', 4.4, 7.4, 1.6, 221); hangCloth(S, 'b', 1.2, 2.4, .9, 1, C.wool);
    sacks(S, 2.4, .45, 3, 222); woodpile(S, 8.9, 5.2, 1.2); jars(S, 8.4, 7.6, 3, 223);
    basket(S, 7.4, 6.8, 0, 1.1, C.ochre, { fill: C.linen }); dz(S, 7.1, 6.5, 7.7, 7.1);
    jar(S, 1, 1.2, 1); star(S, 1, 1.2, .38, .35, { glow: false, d: 3 });
    box(S, 1.6, -.25, 1.5, .5, .25, .1, C.wood, { d: -790, lw: .3 });
    lamp(S, 1.85, -.1, 1.6, { pool: false, hr: .7 });
    pool(S, 4.5, 3, 0, 3.6, { n: 6, add: [.14, 0, .05, 0], lift: [0, .2, .15, .38] });
    halo(S, 4.55, 2.75, 1, 1.2, { d: 7.8, n: 4, add: [.1, 0, .02, 0], lift: [0, .2, .15, .3] });
    F(S, 'mary', 4.4, 4.1, 'kneel', [0, -1]);
    F(S, 'joseph', 6.4, 3.4, 'staff', [-1, 0], { prop: 'staff' });
  } },
{ id: 'shepherds', act: 'The Promise', title: 'The Shepherds', cite: 'Luke 2:9', tint: 'night',
  quote: 'And, lo, the angel of the Lord came upon them, and the glory of the Lord shone round about them: and they were sore afraid.',
  build(S) {
    slab(S, C.grassD);
    backdrop(S, 4, C.sky, pr => {
      starsSky(pr, 70, 41, 1.6);
      hills(pr, 1.3, 1.1, C.olive, 42); town(pr, 13, 17.5, 1.9, C.stone, 43, true);
      for (let i = 0; i < 16; i++) { const s = 3 + i * .9 + Math.sin(i * 7) * .3, w = 3 + Math.sin(i * 3.7) * .45; const q = P(...bd(s, w)); const p = fp([q[0] - 1.2, q[1] + 3.4, q[0] - .5, q[1], q[0], q[1] - 1.4, q[0] + .5, q[1], q[0] + 1.2, q[1] + 3.4], [0, 0, 0, 0], { lw: .25 }); p.nt = 1; pr.push(p); const g = gp(q[0], q[1], 4, 4, 2, [.2, 0, 0, 0], [0, .4, .4, .5], .4); pr.push(g); }
    });
    tufts(S, 70, 0, [0, 0, 10, 10], 44);
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; rock(S, 1.4 + Math.cos(a) * 1.2, 1.4 + Math.sin(a) * 1.2, .5, .45, .45 + (i % 3) * .1, C.stone); }
    rock(S, 2.8, 3, 1.1, .9, .5, C.stone); rock(S, 8.6, 1.2, 1, .8, .6, C.stone);
    lowWall(S, [[9.7, .3], [9.7, 4.6]], .45); lowWall(S, [[3.2, 9.7], [9.4, 9.7]], .45);
    stones(S, 10, [0, 4.6, 4.4, 6.6], 231); bush(S, .8, 5.4, .8, C.sage); bush(S, 9, 9, .7, C.sage);
    halo(S, 3.4, 3.7, 1.4, 3.2, { d: -600, n: 7, add: [.2, 0, 0, 0], lift: [0, .35, .35, .5], inner: .1 });
    pool(S, 4, 4.4, 0, 5, { n: 6, add: [.2, 0, .02, 0], lift: [0, .3, .3, .45], d: -840 });
    star(S, 9.6, 0, 3.4, .4, { d: -900 });
    const sheep = [[5.2, 2.4, 'sheepLie'], [6.4, 1.8, 'sheepGraze'], [7.4, 3, 'sheepLie'], [6, 3.6, 'sheepGraze'], [8.2, 4.4, 'sheepLie'], [5, 7.6, 'sheepLie'], [6.6, 8.6, 'sheepGraze'], [8, 7, 'sheepLie'], [2.4, 7.4, 'sheepGraze'], [1.6, 8.8, 'sheepLie'], [9, 5.8, 'sheepGraze']];
    sheep.forEach(([x, y, k], i) => A(S, k, x, y, 'still', i % 2 ? [1, -1] : [-1, 1], { ph: i * .7 }));
    F(S, 'angel', 3.2, 3.5, 'bless', [1, 1], { z: .5 });
    F(S, 'shep1', 6.2, 5.8, 'afraid', [-1, -1], { prop: 'staff' });
    F(S, 'shep2', 5.4, 6.8, 'afraidKneel', [-1, -.6]);
    F(S, 'shep3', 7.2, 5.2, 'lookUp', [-1, -.4]);
  } },
{ id: 'presentation', act: 'The Promise', title: 'The Presentation', cite: 'Luke 2:35', tint: 'day',
  quote: '(Yea, a sword shall pierce through thy own soul also,) that the thoughts of many hearts may be revealed.',
  build(S) {
    templeCourt(S);
    star(S, 5.2, 1.3, 3.72, .4, { d: -690 });
    F(S, 'simeon', 6.3, 4.1, 'carry', [-1, 1], { prop: 'baby' });
    F(S, 'mary', 4.3, 6.1, 'listen', [1, -1]);
    F(S, 'joseph', 3.3, 6.8, 'hold', [1, -1], { prop: 'doves' });
    Wk(S, 'anna', [9.8, 2.4], [{ go: [7.6, 4.8], clip: 'walk', v: .5 }, { do: 'bless', t: 8, face: [-1, 1] }], { fade: true, T: 18 });
    Wk(S, 'man2', [.2, 8.5], [{ go: [2, 2.2], clip: 'walk', v: .8 }], { fade: true, ph: 3 });
    F(S, 'priest', 7.1, 1.2, 'stand', [1, 1], { z: .45 });
    // they that sold doves (John 2:14)
    const cage = (x, y) => { box(S, x, y, 0, .7, .5, .45, C.wood, { lw: .3, tex: (pr, x, y, z, w, d, h) => { for (let k = 1; k < 6; k++) pr.push(lp(pp([[x + w * k / 6, y + d, z], [x + w * k / 6, y + d, z + h]]), .22, { ld: .7 })); for (let k = 1; k < 4; k++) pr.push(lp(pp([[x + w, y + d * k / 4, z], [x + w, y + d * k / 4, z + h]]), .22, { ld: .7 })); } }); dz(S, x, y, x + .7, y + .5); };
    cage(8.4, 7.8); cage(8.5, 8.4); cage(9.2, 8.1);
  } },

/* II · THE CHILD */
{ id: 'magi', act: 'The Child', title: 'The Wise Men', cite: 'Matthew 2:11', tint: 'dusk', bigStar: true,
  quote: 'And when they were come into the house, they saw the young child with Mary his mother, and fell down, and worshipped him: and when they had opened their treasures, they presented unto him gifts; gold, and frankincense and myrrh.',
  build(S) {
    floor(S, C.stoneL, { grid: 1.3 });
    walls(S, 3, C.plaster, { tex: stoneTex(C.plaster, .45), open: [{ wall: 'a', u0: 6.8, u1: 8.2, z0: 0, z1: 2.1, c: C.dusk, paint: (pr, q) => pr.push(fp(pp([q(6.8, 0, 0), q(8.2, 0, 0), q(8.2, .6, 0), q(6.8, .9, 0)]), C.sand, { lw: .3 })) }, { wall: 'b', u0: 3.2, u1: 4, z0: 1.4, z1: 2.1, c: C.dusk }] });
    // the star went before them, till it came and stood over where the young child was (Matt 2:9)
    const c = P(1.5, 1.5, 5.6);
    S.push(-600, [gp(c[0], c[1], 44, 44, 7, [.16, 0, 0, 0], [0, .12, .16, .2], .05)]);
    star(S, 1.5, 1.5, 5.6, 4.2, { d: -590 });
    for (let i = 0; i < 6; i++) { const q = P(1.5, 1.5, 5.3 - i * .45); S.push(-589, [lp([q[0] - .3, q[1], q[0] + .3, q[1] + 5], .5, { li: O, ld: .6 - i * .09 })]); }
    rug(S, 1.4, 2.2, 3, 3.6, C.madder); cushion(S, 2.3, 3.4, C.ochre);
    box(S, 1.6, 3, 0, .8, .6, .42, C.wood, { lw: .35 });
    jar(S, .7, .8, 1); jar(S, 1.2, .6, .8);
    lamp(S, 5, .3, 0, { r: 1.6 });
    // the treasures
    const t = P(4.4, 4.2, 0); S.push(8.6, [fp([t[0] - 5, t[1] - 3, t[0] + 5, t[1] - 3, t[0] + 5, t[1] + 1, t[0] - 5, t[1] + 1], C.gold, { lw: .35 }), fp([t[0] - 5, t[1] - 3, t[0] - 3, t[1] - 6, t[0] + 7, t[1] - 6, t[0] + 5, t[1] - 3], C.bronze, { lw: .35 })]);
    lathe(S, 4.9, 5, 0, [[0, .12], [.15, .14], [.3, .1], [.36, .06]], C.stoneL, { bands: [.18] });
    ledge(S, 'a', 1.9, 6.2, 1.5, 251); ledge(S, 'b', 5, 8.6, 1.45, 252);
    hangCloth(S, 'b', .9, 2.5, 1.1, 1, C.olive, R_); hangCloth(S, 'a', 8.6, 2.4, .9, 1.1, C.madder);
    jars(S, 8.8, 1.6, 4, 253); sacks(S, 8.4, 8.4, 3, 254); potPlant(S, .6, 8.8); bench(S, .2, 6, 1.6, 'y');
    patRug(S, 6, 6.6, 2.6, 2.2, C.ochre, C.madder); flagTint(S, C.stone, .15, 255, 1.3);
    F(S, 'mary', 2.05, 3.25, 'seat', [1, 1]);
    F(S, 'jesusToddler', 2.8, 3.7, 'stand', [1, .4]);
    F(S, 'magus1', 4.3, 5.3, 'prostrate', [-1, -.6]);
    F(S, 'magus2', 5.5, 4.2, 'offer', [-1, -.3], { prop: 'box' });
    Wk(S, 'magus3', [7.5, .6], [{ go: [6.6, 5], clip: 'walk', v: .6 }, { do: 'offer', t: 9, face: [-1, -.5] }], { prop: 'box', fade: true, T: 18 });
  } },
{ id: 'flight', act: 'The Child', title: 'The Flight into Egypt', cite: 'Matthew 2:14', tint: 'night',
  quote: 'When he arose, he took the young child and his mother by night, and departed into Egypt:',
  build(S) {
    slab(S, C.sandG, { bands: [C.earth, C.soil, C.stoneD] });
    backdrop(S, 4, C.sky, pr => { starsSky(pr, 90, 51, 1.3); hills(pr, 1, .8, C.sandG, 52); town(pr, 12.5, 19.5, 1.2, C.stone, 53, false); const q = P(...bd(4.2, 3.2)); const p = fp(ellPts(q[0], q[1], 1.1, 1.1, 6), C.gold, { lw: 0 }); p.nt = 1; pr.push(p); });
    star(S, 0, 5.8, 3.2, .35, { d: -950, glow: false });
    path3(S, [[10, 1.4], [7, 3.4], [4.6, 5.8], [2.2, 8], [0, 9.2]], 1.3, C.sand);
    rock(S, 2, 3, 1.2, 1, .7, C.stone); rock(S, 7.6, 7.6, 1.3, 1, .6, C.stone); rock(S, 8.8, 6, .6, .5, .4, C.stone);
    olive(S, 5.2, 2, .9, { night: false }); olive(S, 1.4, 5.2, .8); palm(S, 7.6, .9, .9); bush(S, 5, 8.4, .8, C.sage);
    tufts(S, 30, 0, [0, 0, 10, 10], 54);
    stones(S, 8, [0, 0, 4.5, 4.5], 261); stones(S, 8, [5.5, 5.5, 10, 10], 262); bush(S, 9, 9.2, .7, C.sage);
    const T = 16;
    Wk(S, 'joseph', [10.2, 1.2], [{ go: [0, 9.3], clip: 'walk', v: .9 }], { prop: 'bundle', fade: true, T });
    Wk(S, 'mary', [10.2, .6], [{ go: [9.6, 1.1], clip: 'carryWalk', v: .9 }, { go: [0, 8.7], clip: 'carryWalk', v: .9 }], { prop: 'child', fade: true, T, ph: -1.2 });
  } },
{ id: 'nazareth', act: 'The Child', title: 'Nazareth', cite: 'Luke 2:40', tint: 'day',
  quote: 'And the child grew, and waxed strong in spirit, filled with wisdom: and the grace of God was upon him.',
  build(S) {
    nazarethYard(S);
    star(S, 3.1, 3.02, 2.2, .4);
    F(S, 'joseph', 7.2, 2.35, 'work', [1, 0], { prop: 'adze' });
    F(S, 'mary', 3, 6.9, 'grind', [1, -.3]);
    Wk(S, 'jesusChild', [4.4, 6], [{ go: [6.6, 3.2], clip: 'carryWalk', v: .7 }, { do: 'listen', t: 3.5, face: [1, -.4] }, { go: [4.4, 6], clip: 'walk', v: .7 }, { do: 'talk', t: 3.5, face: [-1, .6] }], { prop: 'plank' });
    A(S, 'dove', 4.6, 1.2, 'perch', [1, 1], { z: 2.75, noShadow: true });
  } },
{ id: 'search', act: 'The Child', title: 'The Search', cite: 'Luke 2:44', tint: 'dusk',
  quote: 'But they, supposing him to have been in the company, went a day’s journey; and they sought him among their kinsfolk and acquaintance.',
  build(S) {
    slab(S, C.sandG, { bands: [C.earth, C.soil, C.stoneD] });
    backdrop(S, 4, C.sky, pr => { hills(pr, 1.3, .9, C.sage, 61); cityWall(pr, 13.5, 19, 1.4, .6, C.stoneL); temple(pr, 16.2, 2, C.stoneL); hills(pr, .6, .5, C.sandG, 62); const q = P(...bd(6, 3.3)); pr.push(gp(q[0], q[1], 30, 30, 5, [.18, 0, .1, 0], [0, .1, .1, .1], .1)); });
    star(S, 0, 4.8, 3.6, .35, { d: -950 });
    path3(S, [[10, 1.2], [6.8, 3.6], [4, 6.8], [1.6, 9.6]], 1.3, C.sand);
    // tents of goat hair
    const tent = (x, y) => { const pr = [fp(pp([[x, y, 0], [x + 1.6, y, 1.2], [x + 3.2, y, 0]]), C.dark, { lw: .35 }), fp(pp([[x + 3.2, y, 0], [x + 1.6, y, 1.2], [x + 1.6, y + 1.6, 1.2], [x + 3.2, y + 1.6, 0]]), shade(C.brown, .2), { lw: .35 })]; S.push(x + y + 2, pr); };
    tent(.6, 1); tent(6.8, 6.2);
    fire(S, 2.6, 5.2); fire(S, 7.8, 3.4);
    sacks(S, 4.1, 1.1, 3, 91, C.wool); sacks(S, .3, 2.9, 2, 92); jars(S, 8.9, 8.3, 3, 93); jars(S, 4.2, 2.8, 2, 95);
    stones(S, 6, [4.6, .2, 6.2, 1.4], 94);
    F(S, 'man4', 1.8, 4.4, 'sit', [1, .6]); F(S, 'woman4', 3.4, 4.3, 'sitTalk', [-.4, 1]); F(S, 'man1', 3.2, 6.2, 'sit', [-.2, -1]); F(S, 'boy', 1.6, 6, 'sit', [1, -.3]);
    F(S, 'woman1', 7.2, 2.6, 'sitTalk', [1, .6]); F(S, 'man3', 8.8, 3, 'sit', [-1, .3]); F(S, 'man2', 8.6, 4.4, 'sitListen', [-1, -.6]);
    F(S, 'woman3', 5.6, 8.4, 'stand', [1, -1], { prop: 'jar' }); F(S, 'girl', 6.4, 8.8, 'stand', [-1, -.2]);
    const T = 26;
    Wk(S, 'joseph', [0, 9.4], [{ go: [4.2, 5.6], clip: 'walk', v: .9 }, { do: 'talk', t: 4, face: [-1, .1] }, { go: [6.4, 3.6], clip: 'walk', v: .9 }, { do: 'talk', t: 4, face: [1, -.3] }, { go: [10, 1.2], clip: 'walk', v: 1 }], { fade: true, T });
    Wk(S, 'mary', [-.3, 9.9], [{ go: [4, 6.2], clip: 'walk', v: .9 }, { do: 'talk2', t: 4, face: [-1, .2] }, { go: [6.2, 4.3], clip: 'walk', v: .9 }, { do: 'weep', t: 4, face: [1, -.3] }, { go: [9.8, 1.6], clip: 'walk', v: 1 }], { fade: true, T });
  } },
{ id: 'doctors', act: 'The Child', title: 'Among the Doctors', cite: 'Luke 2:46', tint: 'day',
  quote: 'And it came to pass, that after three days they found him in the temple, sitting in the midst of the doctors, both hearing them, and asking them questions.',
  build(S) {
    templeCourt(S);
    star(S, 1.3, 7.3, 3.72, .4, { d: -690 });
    rug(S, 2.6, 2.6, 4.4, 4, C.ochre);
    box(S, 2.2, 2.4, 0, 3.2, .7, .42, C.stone, { lw: .38 });           // stone bench
    box(S, 2.2, 3.1, 0, .7, 2.2, .42, C.stone, { lw: .38 });
    F(S, 'jesusBoy', 4.6, 4.8, 'sitTalk', [1, 1]);
    F(S, 'doctor1', 3.2, 2.75, 'seatTalk', [.6, 1]);
    F(S, 'doctor2', 4.8, 2.75, 'seatHold', [0, 1], { prop: 'scroll' });
    F(S, 'doctor3', 2.55, 4.4, 'seat', [1, .1]);
    F(S, 'pharisee', 6.6, 4, 'sitAmazed', [-1, .3]);
    F(S, 'doctor1', 6.2, 6.4, 'sitListen', [-.8, -1]);
    F(S, 'man4', 3.8, 6.7, 'sitAmazed', [.2, -1]);
    F(S, 'doctor2', 2.55, 5.8, 'seatTalk', [1, -.3]);
    jars(S, .35, 6.4, 2, 101);
    const T = 22;
    Wk(S, 'joseph', [9.8, 8.8], [{ do: 'stand', t: 6 }, { go: [7.8, 7.4], clip: 'walk', v: .7 }, { do: 'listen', t: 12, face: [-1, -.8] }], { fade: true, T });
    Wk(S, 'mary', [9.8, 9.6], [{ do: 'stand', t: 6 }, { go: [7, 8], clip: 'walk', v: .8 }, { do: 'talk', t: 12, face: [-1, -1] }], { fade: true, T });
  } },

/* III · THE CALLING */
{ id: 'carpenter', act: 'The Calling', title: 'The Carpenter’s Son', cite: 'Luke 2:52', tint: 'day',
  quote: 'And Jesus increased in wisdom and stature, and in favour with God and man.',
  build(S) {
    nazarethYard(S);
    star(S, 9.7, .9, 2.05, .35);
    F(S, 'jesus', 7.2, 2.35, 'work', [1, 0], { prop: 'adze' });
    F(S, 'mary', 2.3, 3.4, 'stand', [1, 1]);
    F(S, 'man1', 8.2, 3.6, 'hold', [-1, -.8], { look: Object.assign({}, LOOK.man1, { s: .98, beard: C.hairL }) });
    Wk(S, 'youth', [9.2, 4.6], [{ go: [6.6, 6.4], clip: 'carryWalk', v: .8 }, { do: 'stand', t: 3 }, { go: [9.2, 4.6], clip: 'walk', v: .8 }, { do: 'stand', t: 3 }], { prop: 'plank' });
    F(S, 'man3', 5.8, 7.6, 'sit', [1, -1], { look: Object.assign({}, LOOK.man3, { s: .96 }) });
    F(S, 'shep2', 6.6, 8.3, 'sitTalk', [-1, -.2]);
    F(S, 'woman2', 3, 6.9, 'grind', [1, -.3], { look: Object.assign({}, LOOK.woman2, { s: .88 }) });
    F(S, 'girl', 1.9, 6.1, 'stand', [.4, -1], { prop: 'jar' });
  } },
{ id: 'baptism', act: 'The Calling', title: 'The Baptism', cite: 'Matthew 3:16', tint: 'day',
  quote: 'And Jesus, when he was baptized, went up straightway out of the water: and, lo, the heavens were opened unto him, and he saw the Spirit of God descending like a dove, and lighting upon him:',
  build(S) {
    slab(S, C.grass, { bands: [C.soil, C.soilD, C.stoneD] });
    backdrop(S, 4, C.sky, pr => {
      hills(pr, 1.4, 1.3, C.sandG, 71); hills(pr, .5, .6, C.sage, 72);
      const q = P(...bd(10, 3.9)); pr.push(gp(q[0], q[1] + 10, 60, 50, 7, [.14, 0, 0, 0], [0, .2, .2, .35], .05));
    });
    // the river Jordan across the slab, with its water showing in the cut
    const y0 = 3.4, y1 = 6.4;
    const bank = []; for (let x = 0; x <= 10.001; x += .5) bank.push([x, y0 + Math.sin(x * .8) * .2, .005]); for (let x = 10; x >= -.001; x -= .5) bank.push([x, y1 + Math.sin(x * .7 + 1) * .2, .005]);
    S.push(-858, [fp(pp(bank), C.water, { lw: .4 })]);
    const wv = [], r = mul32(73); for (let i = 0; i < 30; i++) { const x = r() * 9.6, y = y0 + .3 + r() * (y1 - y0 - .6); wv.push(lp(pp([[x, y, .01], [x + .5, y - .12, .01], [x + .9, y, .01]]), .3, { ld: .7 })); } S.push(-857, wv);
    S.push(-856, [fp(pp([[10, y0, 0], [10, y1, 0], [10, y1, -.7], [10, y0, -.7]]), C.waterD, { lw: .35 })]);
    reeds(S, 40, [0, 6.5, 10, 7.3], 74); reeds(S, 30, [0, 2.6, 10, 3.3], 75);
    tufts(S, 40, 0, [0, 7, 10, 10], 76); tufts(S, 30, 0, [0, 0, 10, 3.2], 77);
    palm(S, 1.4, 1.2, 1); olive(S, 8.8, 8.8, .9); bush(S, 9.2, 1.4, 1, C.sage);
    stones(S, 8, [0, 7.4, 4.4, 9.8], 121); stones(S, 5, [7.6, 2, 9.8, 3.2], 122);
    star(S, 9.62, 8.42, 1.9, .35);
    halo(S, 5, 4.6, 2.8, 1.6, { d: 40, n: 5, add: [.1, 0, 0, 0], lift: [0, .2, .2, .3], sq: 1.4 });
    F(S, 'john', 5.6, 5.2, 'bless', [-1, -.2], { wade: .5 });
    Wk(S, 'jesus', [4.4, 4.4], [{ do: 'kneel', t: 3, face: [1, .4], wade: 1.05 }, { do: 'lookUp', t: 9, face: [1, .4], wade: .55 }]);
    S.fig({ kind: 'dove', start: [4.4, 4.4, 6], path: [{ hide: 3 }, { go: [4.4, 4.4, 2.3], clip: 'fly', v: .9 }, { do: 'fly', t: 4.3 }], fade: true, noShadow: true });
    F(S, 'man2', 3.4, 1.8, 'stand', [1, 1]); F(S, 'woman1', 4.4, 1.6, 'listen', [.4, 1]); F(S, 'man4', 6, 1.9, 'talk', [-.6, 1]); F(S, 'woman3', 7, 2.4, 'stand', [-1, .8]);
    F(S, 'man1', 7.6, 7.8, 'lookUp', [-1, -1]); F(S, 'pharisee', 5.4, 8.8, 'listen', [-.4, -1]);
  } },
{ id: 'cana', act: 'The Calling', title: 'The Wedding at Cana', cite: 'John 2:5', tint: 'day',
  quote: 'His mother saith unto the servants, Whatsoever he saith unto you, do it.',
  build(S) {
    floor(S, C.stoneL, { grid: 1.5 });
    walls(S, 3, C.plaster, { tex: stoneTex(C.plaster, .5), open: [{ wall: 'b', u0: 7.4, u1: 8.6, z0: 0, z1: 2.1, c: C.dark }] });
    // an awning over the feast
    for (const [x, y] of [[.3, 3.8], [5.2, 3.8], [5.2, .3]]) box(S, x, y, 0, .15, .15, 2.4, C.woodD, { lw: .35 });
    S.push(-650, [fp(pp([[0, 0, 2.6], [5.4, 0, 2.6], [5.4, 3.95, 2.4], [0, 3.95, 2.4]]), C.linen, { lw: .4 }), lp(pp([[0, 3.95, 2.4], [5.4, 3.95, 2.4]]), .9, { li: R_, ld: .7 })]);
    box(S, .8, 1.1, 0, 3.8, .8, .4, C.wood, { lw: .4 });
    for (let i = 0; i < 5; i++) { const q = P(1.2 + i * .75, 1.5, .41); S.push(3.1, [fp(ellPts(q[0], q[1], 3.2, 1.6, 10), C.bronze, { lw: .3 }), fp(ellPts(q[0], q[1] - .5, 2, .9, 8), i % 2 ? [.55, 0, .2, .08] : C.madder, { lw: .2 })]); }
    F(S, 'man1', 1.3, .7, 'seat', [0, 1]); F(S, 'woman2', 2.2, .7, 'seatTalk', [.3, 1]); F(S, 'man2', 3.1, .7, 'seat', [0, 1], { look: Object.assign({}, LOOK.man2, { mantle: C.madder }) });
    F(S, 'woman1', 4, .7, 'seat', [-.3, 1]); F(S, 'priest', .4, 2.4, 'seatTalk', [1, -.2], { prop: 'cup' });
    // six waterpots of stone (John 2:6), filled to the brim (2:7)
    for (let i = 0; i < 6; i++) stonePot(S, 6.4 + (i % 3) * .75, 5 + Math.floor(i / 3) * .75 + (i % 3) * .1);
    star(S, 8.05, 5.9, .84, .35, { glow: false });
    olive(S, 9.2, .8, .9); jar(S, 9.2, 2.6, 1);
    jars(S, 6.2, .35, 4, 131); ledge(S, 'a', 5.8, 9.6, 1.7, 132); hangCloth(S, 'b', 4.4, 2.5, 1.2, 1, C.madder, O);
    bench(S, .25, 4.4, 2.4, 'y'); patRug(S, 1.4, 4.8, 2.4, 2, C.ochre, C.madder); potPlant(S, 9.5, 4.2); potPlant(S, 9.5, 5.4);
    flagTint(S, C.stone, .2, 133, 1.5);
    F(S, 'jesus', 5.6, 3.6, 'point', [.6, .8]);
    F(S, 'mary', 4.6, 6, 'talk', [1, .2]);
    F(S, 'servant', 7.2, 7.2, 'pour', [-.2, -1], { prop: 'jar' });
    Wk(S, 'servant', [9.8, 8.4], [{ go: [8.4, 7.2], clip: 'walk', v: .7 }, { do: 'listen', t: 5, face: [-1, -.4] }, { go: [9.8, 8.4], clip: 'walk', v: .7 }, { do: 'stand', t: 1 }], { prop: 'jarShoulder', look: Object.assign({}, LOOK.servant, { tunic: C.sand }) });
    F(S, 'youth', 5.8, 7.4, 'hold', [1, -.4], { prop: 'jar' });
  } },
{ id: 'fishers', act: 'The Calling', title: 'The Great Catch', cite: 'Luke 5:10', tint: 'day',
  quote: 'And so was also James, and John, the sons of Zebedee, which were partners with Simon. And Jesus said unto Simon, Fear not; from henceforth thou shalt catch men.',
  build(S) {
    waterSlab(S, { depth: 1.3 });
    backdrop(S, 4, C.sky, pr => { hills(pr, 1.5, 1.1, C.sage, 81); hills(pr, .7, .7, C.olive, 82); town(pr, 3.5, 7, .7, C.stone, 83); pr.push(bdPoly([[0, 0], [20, 0], [20, .5], [0, .5]], C.sandG, { lw: .3 })); });
    star(S, 0, 2, 2.9, .35, { d: -950 });
    boat(S, 1.2, 3, 4.6, 1.6, .7, { catch: 14, water: true });
    boat(S, 4.6, 6.4, 4.4, 1.6, .7, { catch: 18, water: true, c: C.wood });
    // the net between the boats, full, breaking (Luke 5:6)
    const pr = [];
    const corners = pp([[5.7, 3.8, .02], [7.4, 4.3, .02], [7.2, 5.7, .02], [5.2, 5.4, .02]]);
    pr.push(fp(corners, [0, .3, 0, .55], { lw: .4 }));
    const r = mul32(84);
    for (let i = 0; i < 40; i++) { const u = r(), v = r(), x = lerp(lerp(5.7, 7.4, u), lerp(5.2, 7.2, u), v), y = lerp(lerp(3.8, 4.3, u), lerp(5.4, 5.7, u), v), q = P(x, y, .03); pr.push(fishShape(q[0], q[1], .9 + r() * .3, r() < .5, r() < .3 ? [.1, .15, .1, .55] : [.25, .06, .1, .45])); }
    for (let i = 0; i <= 6; i++) { const t = i / 6; pr.push(lp(pp([[lerp(5.7, 5.2, t), lerp(3.8, 5.4, t), .04], [lerp(7.4, 7.2, t), lerp(4.3, 5.7, t), .04]]), .25, { ld: .6 }), lp(pp([[lerp(5.7, 7.4, t), lerp(3.8, 4.3, t), .04], [lerp(5.2, 7.2, t), lerp(5.4, 5.7, t), .04]]), .25, { ld: .6 })); }
    S.push(-100, pr);
    F(S, 'jesus', 2, 3, 'talk', [1, .6], { z: -.25 });
    F(S, 'peter', 3, 3.2, 'pray', [-1, -.2], { z: -.25 });
    F(S, 'fisher1', 4.5, 2.8, 'haul', [1, .5], { z: -.25, ph: .6 });
    F(S, 'fisher2', 5.4, 6.4, 'haul', [-.2, -1], { z: -.25 });
    F(S, 'beloved', 6.4, 6.3, 'haul', [-.2, -1], { z: -.25, ph: 1.1, look: Object.assign({}, LOOK.fisher2, { tunic: C.linen, beard: null }) });
    F(S, 'fisher1', 7.8, 6.5, 'haul', [-.5, -1], { z: -.25, ph: .3, look: Object.assign({}, LOOK.fisher1, { hair: C.grey_hair, beard: C.grey_hair }) });
    birdsFly(S, 4, 3, 85);
  } },
{ id: 'mount', act: 'The Calling', title: 'The Sermon on the Mount', cite: 'Matthew 6:28', tint: 'day',
  quote: 'And why take ye thought for raiment? Consider the lilies of the field, how they grow; they toil not, neither do they spin:',
  build(S) {
    slab(S, C.grass, { bands: [C.soil, C.soilD, C.stoneD] });
    backdrop(S, 4, C.sky, pr => { pr.push(bdPoly([[0, 0], [20, 0], [20, 1.4], [0, 1.2]], C.water, { lw: .35 })); hills(pr, 1.6, 1.2, C.sage, 91); for (let s = 1; s < 20; s += 2.7) pr.push(bdLine([[s, 1.35], [s + .8, 1.3]], .3, { ld: .6 })); });
    box(S, 0, 0, 0, 5, 5, .6, C.grass, { d: -820, sx: shade(C.earth, .1), sy: shade(C.earth, .2), tex: stoneTex(C.earth, .3) });
    box(S, 0, 0, .6, 2.8, 2.8, .5, C.grass, { d: -819, sx: shade(C.earth, .1), sy: shade(C.earth, .2) });
    tufts(S, 70, 0, [0, 0, 10, 10], 92);
    flowers(S, 60, [C.madder, C.linen, C.ochre, C.madder], [4.6, 4.6, 10, 10], 93);
    flowers(S, 20, [C.madder, C.linen], [5.2, 0, 10, 4.6], 94);
    olive(S, 8.6, 1.4, 1); olive(S, 1.2, 8.4, .9);
    stones(S, 8, [.2, 5.4, 3.4, 7.4], 141); lowWall(S, [[.3, 9.7], [3.6, 9.7]], .4); bush(S, 9.4, 3.4, .8, C.sage);
    star(S, 9.7, 9.1, .2, .35, { glow: false });
    F(S, 'jesus', 1.9, 1.9, 'sitTalk', [1, 1], { z: 1.1 });
    F(S, 'peter', 3.4, 2.4, 'sitListen', [-1, -.3], { z: .6 }); F(S, 'beloved', 2.3, 3.4, 'sitListen', [-.3, -1], { z: .6 });
    F(S, 'man2', 4, 3.6, 'sitListen', [-1, -1], { z: .6 }); F(S, 'man1', 3.1, 4.3, 'sit', [-.6, -1], { z: .6 }); F(S, 'man3', 4.4, 1.6, 'sit', [-1, .2], { z: .6 });
    const crowd = [['woman1', 6, 5.2], ['man4', 7, 4.6], ['woman3', 5.2, 6.4], ['boy', 6.2, 6.4], ['man2', 7.6, 5.8], ['woman2', 6.8, 7.2], ['man3', 5, 7.8], ['woman4', 8.4, 6.8], ['man1', 7.8, 8.2], ['girl', 6.4, 8.6], ['shep2', 8.8, 4.4], ['woman1', 4.4, 8.8]];
    crowd.forEach(([k, x, y], i) => F(S, k, x, y, i % 3 ? 'sitListen' : 'sit', toward([x, y], [2.1, 2.1]), { ph: i * .5 }));
    birdsFly(S, 5, 3.3, 95);
  } },

/* IV · TOWARD JERUSALEM */
{ id: 'loaves', act: 'Toward Jerusalem', title: 'The Five Thousand', cite: 'John 6:9', tint: 'day',
  quote: 'There is a lad here, which hath five barley loaves, and two small fishes: but what are they among so many?',
  build(S) {
    slab(S, C.grass, { bands: [C.soil, C.soilD, C.stoneD] });
    backdrop(S, 4, C.sky, pr => { pr.push(bdPoly([[0, 0], [20, 0], [20, 1.1], [0, 1.3]], C.water, { lw: .35 })); hills(pr, 1.5, 1.1, C.sage, 101); town(pr, 14, 17, 1.2, C.stone, 102); });
    tufts(S, 110, 0, [0, 0, 10, 10], 103);
    stones(S, 6, [8.6, .2, 9.8, 1.4], 151); bush(S, .6, 9.2, .8, C.sage); bush(S, 9.4, 4.6, .7, C.sage);
    // they sat down in ranks, by hundreds, and by fifties (Mark 6:40)
    const looks = ['man1', 'woman1', 'man2', 'woman3', 'boy', 'man3', 'woman2', 'man4', 'girl', 'woman4', 'shep2', 'youth'];
    let k = 0;
    for (let gx = 0; gx < 3; gx++) for (let gy = 0; gy < 3; gy++) {
      if (gx === 0 && gy === 0) continue;
      const cx = 2.4 + gx * 2.7, cy = 2.4 + gy * 2.7;
      for (let i = 0; i < 4; i++) { const x = cx + (i % 2) * .9 - .45, y = cy + Math.floor(i / 2) * .9 - .45; F(S, looks[k++ % looks.length], x, y, i === 1 ? 'sitTalk' : 'sit', toward([x, y], [1.6, 1.6]), { ph: k * .4 }); }
    }
    for (let i = 0; i < 12; i++) basket(S, 9.4 - (i % 6) * .45, 9.3 - Math.floor(i / 6) * .5 + (i % 6) * .05, 0, .9, C.ochre, { fill: [.5, 0, .18, .08] });
    star(S, 7.15, 8.8, .3, .3, { glow: false });
    F(S, 'jesus', 1.4, 1.6, 'bless', [1, 1], { prop: 'bread' });
    F(S, 'lad', 2.3, 1.2, 'hold', [-.4, 1], { prop: 'loaves' });
    F(S, 'man3', 1.1, 2.6, 'talk', [.4, -1], { look: Object.assign({}, LOOK.man3, { mantle: C.olive }) });
    Wk(S, 'peter', [2.2, 2.6], [{ go: [4.3, 4.4], clip: 'carryWalk', v: .6 }, { go: [7.2, 3.8], clip: 'carryWalk', v: .6 }, { go: [4.4, 7.6], clip: 'carryWalk', v: .6 }, { go: [2.2, 2.6], clip: 'carryWalk', v: .6 }], { prop: 'loaves' });
    Wk(S, 'beloved', [3, 1.8], [{ go: [7.4, 2.8], clip: 'carryWalk', v: .6 }, { go: [7.6, 7.2], clip: 'carryWalk', v: .6 }, { go: [3, 1.8], clip: 'carryWalk', v: .6 }], { prop: 'fish' });
  } },
{ id: 'lazarus', act: 'Toward Jerusalem', title: 'Lazarus', cite: 'John 11:43', tint: 'day',
  quote: 'And when he thus had spoken, he cried with a loud voice, Lazarus, come forth.',
  build(S) {
    slab(S, C.earth);
    backdrop(S, 4, C.sky, pr => { hills(pr, 1.5, 1.2, C.sage, 111); town(pr, 13, 18, 1.4, C.plaster, 112); hills(pr, .5, .5, C.sandG, 113); });
    // a cave, and a stone lay upon it (John 11:38)
    box(S, 0, 0, 0, 1.6, 8, 2.8, C.stone, { d: -700, tex: stoneTex(C.stone, .7) });
    box(S, 0, 0, 0, 6, 1.4, 2.4, C.stone, { d: -701, tex: stoneTex(C.stone, .7) });
    S.push(-699, [fp(pp([[1.6, 3.6, 0], [1.6, 4.9, 0], [1.6, 4.9, 1.6], [1.6, 4.25, 1.85], [1.6, 3.6, 1.6]]), C.dark, { lw: .45 })]);
    const sc = P(1.9, 6.2, .8); S.push(8.1, [fp(ellPts(sc[0], sc[1], 16, 17, 20, -.5), C.stoneL, { lw: .45 }), fp(ellPts(sc[0] + 1, sc[1], 11, 12, 16, -.5), C.stone, { lw: .3 })]);
    olive(S, 7.4, .9, 1); olive(S, 9.2, 2.4, .8); bush(S, 3, 1.6, .9, C.sage); rock(S, 8, 8, 1, .8, .5, C.stone);
    lowWall(S, [[6.4, 9.7], [9.7, 9.7], [9.7, 6.6]], .45); stones(S, 7, [2.2, 7.8, 3.8, 9.6], 161);
    tufts(S, 34, 0, [2, 2, 10, 10], 114);
    star(S, 1.6, 7.4, 2.2, .35, { glow: false });
    Wk(S, 'lazarus', [1.3, 4.25], [{ hide: 2.5 }, { go: [2.9, 4.8], clip: 'shuffle', v: .35 }, { do: 'stand', t: 7, face: [1, .3] }], { fade: true, T: 15 });
    F(S, 'jesus', 6.2, 3.6, 'cry', [-1, .25]);
    F(S, 'woman2', 5.6, 5.4, 'weep', [-1, -.2]);
    F(S, 'woman1', 6.6, 5.2, 'reach', [-1, -.3], { look: Object.assign({}, LOOK.woman1, { veil: C.wool, tunic: C.olive }) });
    F(S, 'man1', 7.4, 4.2, 'lookUp', [-1, 0]); F(S, 'man4', 4.6, 7.2, 'point', [-1, -.4]); F(S, 'woman4', 6.2, 7.2, 'weep', [-1, -.6]); F(S, 'pharisee', 8, 5.6, 'listen', [-1, -.2]); F(S, 'youth', 5.2, 8.4, 'afraid', [-1, -.8]);
  } },
{ id: 'entry', act: 'Toward Jerusalem', title: 'The Entry into Jerusalem', cite: 'Matthew 21:9', tint: 'day',
  quote: 'And the multitudes that went before, and that followed, cried, saying, Hosanna to the son of David: Blessed is he that cometh in the name of the Lord; Hosanna in the highest.',
  build(S) {
    slab(S, C.sandG, { bands: [C.earth, C.soil, C.stoneD] });
    backdrop(S, 4, C.sky, pr => { hills(pr, 1.2, .8, C.sage, 121); temple(pr, 6, 2.3, C.stoneL); });
    // the city wall and a gate at the far end of the road
    box(S, 4.2, -.4, 0, 5.8, .9, 3.2, C.stoneL, { d: -700, tex: stoneTex(C.stoneL, .55) });
    box(S, 0, -.4, 0, 3, .9, 3.2, C.stoneL, { d: -701, tex: stoneTex(C.stoneL, .55) });
    box(S, 3, -.4, 2.3, 1.2, .9, .9, C.stoneL, { d: -699 });
    S.push(-698, [fp(pp([[3, .5, 0], [4.2, .5, 0], [4.2, .5, 2.3], [3, .5, 2.3]]), C.dark, { lw: .4 })]);
    for (let i = 0; i < 14; i++) box(S, i * .72, -.4, 3.2, .4, .9, .25, C.stoneL, { d: -697, lw: .3 });
    const road = [[10.2, 9.4], [7.4, 6.8], [5.2, 4.2], [3.6, .8]];
    path3(S, road, 1.6, C.sand);
    // garments spread in the way, branches strawed (Matt 21:8)
    const r = mul32(122), gar = [C.madder, C.wool, C.olive, C.linen, C.brown, C.russet];
    for (let i = 0; i < 16; i++) { const t = r(), seg = Math.min(2, Math.floor(t * 3)), u = t * 3 - seg, a = road[seg], b = road[seg + 1], x = lerp(a[0], b[0], u) + (r() - .5) * .8, y = lerp(a[1], b[1], u) + (r() - .5) * .8; S.push(-836, [fp(pp([[x, y, .02], [x + .6, y + .1, .02], [x + .5, y + .6, .02], [x - .1, y + .45, .02]]), gar[i % 6], { lw: .3 })]); }
    for (let i = 0; i < 16; i++) { const t = r(), seg = Math.min(2, Math.floor(t * 3)), u = t * 3 - seg, a = road[seg], b = road[seg + 1], x = lerp(a[0], b[0], u) + (r() - .5), y = lerp(a[1], b[1], u) + (r() - .5), q = P(x, y, .02), pr = [lp([q[0] - 8, q[1] + 2, q[0] + 8, q[1] - 2], .5, { li: G_, ld: 1 })]; for (let j = -3; j <= 3; j++) pr.push(lp([q[0] + j * 2, q[1] - j * .5, q[0] + j * 2 - 1, q[1] - j * .5 + 3], .4, { li: G_, ld: .9 })); S.push(-835, pr); }
    palm(S, 1.2, 6, 1.1); palm(S, 9.2, 2.2, 1); olive(S, .9, 9, .8);
    stones(S, 6, [.2, 7.4, 2.2, 8.6], 171);
    star(S, 3.6, .5, 3.05, .35);
    const T = 22;
    const colt = S.fig({ kind: 'donkeyWalk', start: [10.4, 9.6], path: [{ go: [4, 1.2], clip: 'walk', v: .5 }], fade: true, T });
    S.fig({ look: 'jesus', ride: colt, clip: 'ride', fade: true });
    S.fig({ kind: 'donkeyWalk', start: [10.4, 10.4], path: [{ go: [4.2, 2.2], clip: 'walk', v: .5 }], fade: true, T, ph: 1.4 });
    Wk(S, 'peter', [10.6, 10.6], [{ go: [4.6, 2.4], clip: 'walk', v: .5 }], { fade: true, T, ph: 3.2 });
    Wk(S, 'beloved', [10.9, 10.2], [{ go: [4.9, 2], clip: 'walk', v: .5 }], { fade: true, T, ph: 3.6 });
    const crowd = [['man1', 3.4, 5.8, 'wave'], ['woman1', 4.4, 6.6, 'wave2'], ['boy', 5.4, 7.6, 'wave'], ['man3', 6.4, 8.6, 'wave'], ['woman3', 2.8, 4.2, 'wave2'], ['youth', 7.6, 3.2, 'wave'], ['man2', 8.6, 4.4, 'wave2'], ['woman2', 6.8, 2.4, 'wave'], ['man4', 9.6, 5.8, 'bow'], ['girl', 5.8, 1.6, 'wave'], ['shep2', 4.4, 9.2, 'wave2']];
    crowd.forEach(([k, x, y, c], i) => F(S, k, x, y, c, toward([x, y], [lerp(4, 10, .5), lerp(1.2, 9.6, .5)]), { prop: c === 'wave' ? 'palm' : null, ph: i * .31 }));
  } },
{ id: 'supper', act: 'Toward Jerusalem', title: 'The Last Supper', cite: 'Luke 22:19', tint: 'night',
  quote: 'And he took bread, and gave thanks, and brake it, and gave unto them, saying, This is my body which is given for you: this do in remembrance of me.',
  build(S) {
    upperRoom(S);
    star(S, 2.75, 0, 2.1, .35, { d: -770 });
    // a low table in a U, open toward us; they reclined around it (John 13:23)
    box(S, 2.6, 2.6, 0, 5, .9, .42, C.wood, { fg: true, lw: .45 });
    box(S, 2.6, 3.5, 0, .9, 4, .42, C.wood, { fg: true, lw: .45, d: 20 });
    box(S, 6.7, 3.5, 0, .9, 4, .42, C.wood, { lw: .45 });
    const dish = (x, y, c, fg) => { const q = P(x, y, .43); S.push(fg ? 30 : x + y + 1, [fp(ellPts(q[0], q[1], 4, 2, 10), C.bronze, { lw: .3 }), fp(ellPts(q[0], q[1] - .6, 2.5, 1.1, 8), c, { lw: .2 })], fg); };
    dish(4, 3, [.55, 0, .2, .08], true); dish(5.8, 3.05, C.madder, true); dish(3, 5, [.55, 0, .2, .08], true); dish(7.15, 5, C.olive);
    const cq = P(5, 3.1, .43); S.push(31, [fp([cq[0] - 1.5, cq[1] - 4, cq[0] + 1.5, cq[1] - 4, cq[0] + .5, cq[1] - 1, cq[0] + 1, cq[1], cq[0] - 1, cq[1], cq[0] - .5, cq[1] - 1], C.bronze, { lw: .3 })], true);
    lamp(S, 5.2, 3.1, .43, { pd: 32, r: 2.6 }); lamp(S, 7.15, 6.2, .43, { r: 2 });
    // he poureth water into a bason ... and to wipe them with the towel (John 13:5)
    vessel(S, 'bowl', 8.9, 8.5, 0, 2.2, C.bronze, { fill: C.water }); vessel(S, 'jug', 9.5, 8.1, 0, 1.3, C.clay); mat(S, 8.3, 9.1, .9, .45, C.linen); dz(S, 8.3, 7.9, 9.8, 9.6);
    pool(S, 5, 5, 0, 4.5, { n: 6, add: [.12, 0, .04, 0], lift: [0, .2, .15, .32] });
    for (let i = 0; i < 5; i++) cushion(S, 3 + i * 1.1, 1.8, i % 2 ? C.madder : C.ochre);
    const back = [[3.1, 1.9, 'recline', 'man1'], [4.1, 1.9, 'reclineLean', 'beloved'], [5, 1.9, 'reclineLean', 'jesus'], [6.1, 1.9, 'recline', 'peter'], [7.1, 1.9, 'recline', 'man2']];
    back.forEach(([x, y, c, k], i) => F(S, k, x, y, c, [-.3, 1], { ph: i }));
    [[1.9, 4, 'man3'], [1.9, 5.1, 'man4'], [1.9, 6.2, 'fisher2']].forEach(([x, y, k], i) => F(S, k, x, y, 'recline', [1, .2], { ph: i + .5 }));
    [[8.4, 4.1, 'man2'], [8.4, 5.2, 'fisher1'], [8.4, 6.3, 'man1']].forEach(([x, y, k], i) => F(S, k, x, y, 'recline', [-1, -.2], { ph: i + .2, look: Object.assign({}, LOOK[k], { mantle: [C.teal, C.indigo, C.saffron][i] }) }));
    // he then having received the sop went immediately out: and it was night (John 13:30)
    Wk(S, 'man3', [1.9, 7.2], [{ do: 'recline', t: 8, face: [1, .2] }, { go: [.8, 8.3], clip: 'walk', v: .7 }, { go: [-.2, 8.35], clip: 'walk', v: .6 }, { hide: 6 }], { fade: true, look: Object.assign({}, LOOK.man3, { mantle: C.dark, hair: C.hair, beard: C.hair }) });
  } },
{ id: 'gethsemane', act: 'Toward Jerusalem', title: 'Gethsemane', cite: 'Luke 22:42', tint: 'night',
  quote: 'Saying, Father, if thou be willing, remove this cup from me: nevertheless not my will, but thine, be done.',
  build(S) {
    slab(S, C.grassD);
    backdrop(S, 4, C.sky, pr => { starsSky(pr, 60, 131, 2); cityWall(pr, 11, 19.6, 1.1, .8, C.stone); temple(pr, 15.4, 1.9, C.stone); hills(pr, .6, .5, C.olive, 132); });
    for (let i = 0; i < 12; i++) rock(S, 9.2 - i * .02, i * .7 + .1, .5, .5, .55 + (i % 2) * .1, C.stone, { d: 9.7 + i * .7 });
    rock(S, 2.2, 2.6, 1.2, 1, .55, C.stone);
    olive(S, 1.2, 1, 1.1); olive(S, 4.4, .9, 1); olive(S, .9, 4.8, 1); olive(S, 6.8, 2.4, .9); olive(S, 2, 8.6, 1); olive(S, 7.2, 8.8, .8);
    lowWall(S, [[0, 9.75], [8.6, 9.75]], .45);
    tufts(S, 60, 0, [0, 0, 9, 10], 133);
    star(S, 1.2, 1, 2.9, .35, { glow: false });
    halo(S, 3, 4.2, .9, 1.6, { d: 40, n: 5, add: [.12, 0, 0, 0], lift: [0, .25, .25, .35] });
    pool(S, 3, 4.2, 0, 2.4);
    F(S, 'jesus', 3.3, 4, 'prayUp', [1, .1]);
    F(S, 'angel', 2.4, 4.6, 'reach', [1, -.3]);
    F(S, 'peter', 6.4, 5.8, 'sleepSit', [-1, -.2]); F(S, 'beloved', 5.8, 7, 'lie', [-1, .1]); F(S, 'man2', 7.4, 6.6, 'sleepSit', [-1, -.6]);
    const T = 20, band = [['soldier', 'torch'], ['priest', 'lantern'], ['soldier', 'spear'], ['servant', 'torch'], ['pharisee', 'lantern']];
    band.forEach(([k, p], i) => Wk(S, k, [10.6, 1 + i * .5], [{ go: [8.2 - i * .1, 3 + i * .7], clip: 'walk', v: .35 }, { do: 'stand', t: 8 }], { prop: p, fade: true, T, ph: i * .9 }));
  } },

/* V · DEATH AND LIFE */
{ id: 'pilate', act: 'Death and Life', title: 'Behold the Man', cite: 'John 19:5', tint: 'day',
  quote: 'Then came Jesus forth, wearing the crown of thorns, and the purple robe. And Pilate saith unto them, Behold the man!',
  build(S) {
    slab(S, C.stoneL, { bands: [C.stone, C.stoneD, C.soilD] });
    walls(S, 4, C.stoneL, { tex: stoneTex(C.stoneL, .6), open: [{ wall: 'a', u0: 3.6, u1: 5, z0: .8, z1: 3, c: C.dark }, { wall: 'a', u0: 7, u1: 8.4, z0: .8, z1: 3, c: C.dark }] });
    // the Pavement, Gabbatha (John 19:13)
    const pv = [], r = mul32(141);
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) if ((i + j) % 2 === 0 || r() < .15) pv.push(fp(pp([[i, j, .005], [i + 1, j, .005], [i + 1, j + 1, .005], [i, j + 1, .005]]), (i * 3 + j) % 5 ? C.stone : C.sand, { lw: .25 }));
    S.push(-850, pv);
    box(S, 2, 0, 0, 8, 3, .8, C.stone, { tex: stoneTex(C.stone, .4), d: -500 });
    stepsBox(S, 3.5, 3, 3.4, .9, 3, .8, C.stone, 'y');
    for (const x of [2.6, 9.4]) pillar(S, x, .6, 3.4, C.stoneL);
    box(S, 7.6, .6, .8, .9, .7, .5, C.stoneL, { lw: .35 });           // the judgment seat
    // he took water, and washed his hands before the multitude (Matt 27:24)
    vessel(S, 'bowl', 8.2, 2.3, .8, 2, C.bronze, { fill: C.water }); vessel(S, 'jug', 8.7, 2.5, .8, 1.2, C.clay);
    star(S, 9.4, .6, 3.2, .35, { d: -490 });
    F(S, 'pilate', 6.4, 1.8, 'point', [-1, 1], { z: .8 });
    F(S, 'jesusPurple', 4.6, 2, 'listen', [1, 1], { z: .8 });
    F(S, 'soldier', 3.4, 1.2, 'stand', [1, 1], { z: .8, prop: 'spear' }); F(S, 'soldier', 8.8, 1.6, 'stand', [-1, 1], { z: .8, prop: 'spear' });
    const crowd = [['priest', 4.2, 6.2], ['pharisee', 5.4, 6.8], ['man1', 3.2, 7.4], ['man3', 6.6, 7.2], ['servant', 4.6, 8.2], ['man2', 7.6, 8], ['man4', 2.4, 5.8], ['pharisee', 8.4, 6.2], ['youth', 5.8, 9]];
    crowd.forEach(([k, x, y], i) => F(S, k, x, y, i % 3 === 1 ? 'point' : 'wave2', toward([x, y], [5, 2]), { ph: i * .37 }));
  } },
{ id: 'cross', act: 'Death and Life', title: 'The Cross', cite: 'John 19:26', tint: 'dark',
  quote: 'When Jesus therefore saw his mother, and the disciple standing by, whom he loved, he saith unto his mother, Woman, behold thy son!',
  build(S) {
    slab(S, C.earth, { bands: [C.stone, C.soil, C.stoneD] });
    backdrop(S, 4, C.skyD, pr => { cityWall(pr, 11.5, 20, 1, 1.1, C.stone); temple(pr, 16, 2, C.stone); hills(pr, .7, .5, C.earth, 151); });
    box(S, 0, 0, 0, 5.6, 5.6, .5, C.earth, { d: -820, tex: stoneTex(C.stone, .25) });
    rock(S, 6.4, 1, 1.4, 1, .6, C.stone); rock(S, .8, 6.8, 1, 1.2, .5, C.stone); rock(S, 8.4, 8.4, .8, .7, .4, C.stone);
    tufts(S, 20, 0, [5, 5, 10, 10], 152);
    const crossAt = (x, y, H, title) => {
      box(S, x - .1, y - .1, .5, .2, .2, H, C.woodD, { lw: .4 });
      const c = P(x, y, .5 + H - .75), w = 17;
      S.push(x + y + .15, [fp([c[0] - w, c[1] - 1.6, c[0] + w, c[1] - 1.6, c[0] + w, c[1] + 1.6, c[0] - w, c[1] + 1.6], C.woodD, { lw: .4 })]);
      if (title) { const t = P(x, y, .5 + H + .05), pr = [fp([t[0] - 6, t[1] - 3, t[0] + 6, t[1] - 3.4, t[0] + 6, t[1] + 2.4, t[0] - 6, t[1] + 2.6], C.linen, { lw: .3 })]; for (let i = 0; i < 3; i++) pr.push(lp([t[0] - 5, t[1] - 1.6 + i * 1.6, t[0] + 5, t[1] - 1.8 + i * 1.6], .28, { ld: .7 })); S.push(x + y + .16, pr); }
      S.fig({ cross: true, look: title ? 'jesus' : (x < 3 ? 'man2' : 'man4'), at: [x, y, .5 + H - .75 - (FH * .82) / K + .1], face: [1, 1], dep: x + y + .2, noShadow: true });
    };
    crossAt(2.6, 2.6, 3.2, true); crossAt(1.2, 4.8, 2.9); crossAt(4.8, 1.2, 2.9);
    star(S, 2.5, 2.5, .9, .3, { glow: false });
    halo(S, 2.6, 2.6, 2.6, 1.6, { d: -560, n: 4, add: [.05, 0, 0, 0], lift: [0, .06, .08, .14] });
    // his mother, his mother's sister, Mary the wife of Cleophas, and Mary Magdalene (John 19:25)
    F(S, 'mary', 4.6, 5, 'weep', [-1, -1], { z: 0 });
    F(S, 'beloved', 5.3, 4.5, 'embrace', [-1, .1]);
    F(S, 'woman4', 3.6, 5.8, 'weep', [-.6, -1]); F(S, 'woman1', 4.4, 6.4, 'listen', [-.6, -1]); F(S, 'magdalene', 3.2, 6.8, 'kneelWeep', [-.6, -1]);
    // they parted my raiment, and for my vesture they did cast lots (John 19:24)
    const cq = P(8, 6.6, .01); S.push(-830, [fp([cq[0] - 12, cq[1] - 3, cq[0] + 10, cq[1] - 5, cq[0] + 13, cq[1] + 3, cq[0] - 9, cq[1] + 5], C.undyed, { lw: .38 })]);
    F(S, 'soldier', 7.2, 6, 'sit', [1, .5], { prop: 'dice' }); F(S, 'soldier', 8.8, 7.2, 'sit', [-1, -.5]); F(S, 'soldier', 8.4, 5.6, 'sitTalk', [-.4, 1]);
    F(S, 'soldier', 6.4, 3, 'stand', [-1, -.2], { prop: 'spear', look: Object.assign({}, LOOK.soldier, { tunic: C.madder }) });
  } },
{ id: 'tomb', act: 'Death and Life', title: 'The Garden Tomb', cite: 'John 20:16', tint: 'dawn',
  quote: 'Jesus saith unto her, Mary. She turned herself, and saith unto him, Rabboni; which is to say, Master.',
  build(S) {
    slab(S, C.grass, { bands: [C.soil, C.soilD, C.stoneD] });
    backdrop(S, 4, C.sky, pr => { pr.push(bdPoly([[0, 0], [20, 0], [20, 1.6], [0, 1.6]], C.dawn, { lw: 0 })); const q = P(...bd(15, 1.2)); pr.push(gp(q[0], q[1], 60, 30, 6, [.22, 0, .08, 0], [0, .1, .1, .2], .1)); hills(pr, 1.1, .9, C.sage, 161); cityWall(pr, 2, 8, 1.4, .6, C.stoneL); });
    // a new sepulchre hewn in stone, in a garden (John 19:41)
    box(S, 0, 0, 0, 2.2, 7, 2.9, C.stone, { d: -700, tex: stoneTex(C.stone, .8) });
    box(S, 0, 0, 0, 7, 1.6, 2.4, C.stone, { d: -701, tex: stoneTex(C.stone, .8) });
    S.push(-699, [fp(pp([[2.2, 3.3, 0], [2.2, 4.9, 0], [2.2, 4.9, 1.5], [2.2, 3.3, 1.5]]), C.dark, { lw: .45 })]);
    pool(S, 2.3, 4.1, .2, 1.1, { d: -698, n: 3, add: [.04, 0, 0, 0], lift: [0, .2, .2, .35] });
    const sc = P(2.4, 5.8, .82); S.push(8.3, [fp(ellPts(sc[0], sc[1], 16, 17, 22, -.5), C.stoneL, { lw: .45 }), fp(ellPts(sc[0] + 1, sc[1], 9, 10, 16, -.5), C.stone, { lw: .3 })]);
    olive(S, 5.6, 2.8, 1); olive(S, 9, 1.6, .9); olive(S, 8.6, 8.6, .8); bush(S, 4, 1.9, .9); bush(S, 9.2, 5, 1, C.leafL);
    flowers(S, 40, [C.madder, C.linen, C.ochre], [3, 2, 10, 10], 162); tufts(S, 40, 0, [2.4, 2, 10, 10], 163);
    // bringing the spices which they had prepared (Luke 24:1)
    vessel(S, 'jug', 3.9, 5.5, 0, .9, C.stoneL); vessel(S, 'jar', 4.25, 5.7, 0, .7, C.clay);
    lowWall(S, [[3.2, 9.75], [8, 9.75]], .45);
    path3(S, [[2.4, 4.1], [4.6, 5.6], [7, 6.4], [10, 7]], .9, C.sand);
    star(S, 5.6, 2.8, 2.6, .35, { glow: false });
    // two angels in white sitting, the one at the head, the other at the feet (John 20:12)
    F(S, 'angel', 1.7, 3.6, 'seat', [1, .4], { noShadow: true });
    F(S, 'angel', 1.7, 4.6, 'seat', [1, .1], { noShadow: true });
    Wk(S, 'magdalene', [3.3, 4.5], [{ do: 'weep', t: 6, face: [-1, -.2] }, { do: 'weep', t: 3, face: [1, .3] }, { do: 'reach', t: 6, face: [1, .3] }]);
    F(S, 'jesus', 5.9, 5.3, 'talk', [-1, -.3]);
  } },
{ id: 'ascension', act: 'Death and Life', title: 'The Ascension', cite: 'Acts 1:9', tint: 'day',
  quote: 'And when he had spoken these things, while they beheld, he was taken up; and a cloud received him out of their sight.',
  build(S) {
    slab(S, C.grass, { bands: [C.soil, C.soilD, C.stoneD] });
    backdrop(S, 4, C.sky, pr => { cityWall(pr, 9, 18, .8, 1, C.stoneL); temple(pr, 13.4, 1.8, C.stoneL); hills(pr, .5, .4, C.sage, 171); });
    olive(S, 1.2, 1.4, 1.1); olive(S, 8.6, 1.2, .9); olive(S, 1, 7.8, .9); olive(S, 9, 8.8, .8);
    stones(S, 6, [8, 2.4, 9.8, 4.2], 271); lowWall(S, [[.3, 9.75], [7.6, 9.75]], .45);
    tufts(S, 60, 0, [0, 0, 10, 10], 172); flowers(S, 20, [C.linen, C.madder], [0, 0, 10, 10], 173);
    star(S, 9, 8.8, 2.3, .35, { glow: false });
    halo(S, 4, 4, 4.8, 1.8, { d: -600, n: 5, add: [.12, 0, 0, 0], lift: [0, .15, .15, .2], sq: .8 });
    cloud(S, 4, 4, 5.2, 1.5, { d: 900, fg: true });
    cloud(S, 3.2, 4.8, 5.05, 1, { d: 901, fg: true });
    Wk(S, 'jesus', [4, 4], [{ do: 'bless', t: 4, face: [1, 1] }, { go: [4, 4, 5.2], clip: 'bless', v: .55 }, { hide: 6 }], { fade: true, T: 20 });
    const ring = [['peter', 5.8, 4.6], ['beloved', 5.2, 5.6], ['man1', 4, 6.2], ['man2', 6.6, 3.2], ['man3', 2.8, 6], ['man4', 6.4, 5.8], ['fisher1', 3.2, 7.2], ['fisher2', 7.2, 4.6], ['shep2', 5.4, 7], ['man1', 7, 6.6], ['man2', 4.4, 7.6]];
    ring.forEach(([k, x, y], i) => F(S, k, x, y, i % 4 === 0 ? 'lookUpReach' : i % 5 === 2 ? 'pray' : 'lookUp', toward([x, y], [4, 4]), { ph: i * .4, look: Object.assign({}, LOOK[k], { mantle: [C.teal, C.madder, C.indigo, C.saffron, C.olive][i % 5] }) }));
    // two men stood by them in white apparel (Acts 1:10)
    Wk(S, 'angel', [8, 7.4], [{ hide: 13 }, { do: 'talk', t: 7, face: [-1, -.4] }], { fade: true, T: 20 });
    Wk(S, 'angel', [8.6, 6.6], [{ hide: 13.4 }, { do: 'stand', t: 6.6, face: [-1, -.2] }], { fade: true, T: 20 });
  } },
{ id: 'upper', act: 'Death and Life', title: 'The Upper Room', cite: 'Acts 1:14', tint: 'day',
  quote: 'These all continued with one accord in prayer and supplication, with the women, and Mary the mother of Jesus, and with his brethren.',
  build(S) {
    upperRoom(S);
    star(S, 6.75, 0, 2.1, .35, { d: -770 });
    beam(S, [[2.2, 0, 2.4], [3.3, 0, 2.4], [5.8, 3, 0], [4.6, 3, 0]], [.1, 0, 0, 0], -845);
    beam(S, [[6.2, 0, 2.4], [7.3, 0, 2.4], [9.8, 3, 0], [8.6, 3, 0]], [.1, 0, 0, 0], -845);
    rug(S, 2.6, 2.6, 4.8, 4.8, C.madder);
    for (let i = 0; i < 6; i++) cushion(S, 1.2 + i * 1.4, 1.1, i % 2 ? C.ochre : C.wool);
    F(S, 'maryOld', 5, 4.9, 'pray', [1, 1]);
    const ring = [['peter', 6.6, 4.4, 'pray'], ['beloved', 5.9, 6.4, 'pray'], ['woman1', 3.8, 6, 'pray'], ['magdalene', 4.3, 3.7, 'pray'], ['man1', 7.2, 6, 'bow'], ['man2', 3.2, 4.6, 'sitListen'],
      ['man3', 6.8, 2.6, 'prayUp'], ['woman4', 2.6, 7.2, 'kneel'], ['man4', 8.2, 4.2, 'sit'], ['fisher1', 5, 8, 'pray'], ['man1', 1.8, 5.8, 'sit'], ['woman3', 3.2, 2.6, 'pray'],
      ['fisher2', 8.4, 7.4, 'sit'], ['man2', 1.6, 3.4, 'pray'], ['shep2', 6.8, 8.4, 'prayUp']];
    ring.forEach(([k, x, y, c], i) => F(S, k, x, y, c, toward([x, y], [5, 4.9]), { ph: i * .33, look: Object.assign({}, LOOK[k], { mantle: LOOK[k].mantle ? [C.teal, C.madder, C.indigo, C.saffron, C.olive][i % 5] : null }) }));
  } },
];
