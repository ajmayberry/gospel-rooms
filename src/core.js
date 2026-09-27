'use strict';
/* ───────────── core: seeded randomness, noise field, the four inks ───────────── */
const TAU = Math.PI * 2, PI = Math.PI;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function mul32(a) {
  return () => {
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function hsh(a, b, c) {
  let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 1442695041) | 0;
  h = Math.imul(h ^ h >>> 13, 1274126177);
  return ((h ^ h >>> 16) >>> 0) / 4294967296;
}
function strSeed(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

// Smooth tileable value noise, 256×256, two octaves. Drives wobble, dropout and grain.
const NT = 256, NOISE = new Float32Array(NT * NT);
(() => {
  const r = mul32(90210);
  const oct = (G, w) => {
    const g = new Float32Array(G * G);
    for (let i = 0; i < G * G; i++) g[i] = r();
    const s = NT / G;
    for (let y = 0; y < NT; y++) for (let x = 0; x < NT; x++) {
      const gx = x / s, gy = y / s, ix = gx | 0, iy = gy | 0;
      const fx = smooth(gx - ix), fy = smooth(gy - iy), x1 = (ix + 1) % G, y1 = (iy + 1) % G;
      NOISE[y * NT + x] += w * lerp(lerp(g[iy * G + ix], g[iy * G + x1], fx), lerp(g[y1 * G + ix], g[y1 * G + x1], fx), fy);
    }
  };
  oct(32, .6); oct(64, .4);
})();
function noise2(x, y) {
  x -= Math.floor(x / NT) * NT; y -= Math.floor(y / NT) * NT;
  const ix = x | 0, iy = y | 0, fx = x - ix, fy = y - iy, x1 = (ix + 1) & 255, y1 = (iy + 1) & 255;
  return lerp(lerp(NOISE[iy * NT + ix], NOISE[iy * NT + x1], fx), lerp(NOISE[y1 * NT + ix], NOISE[y1 * NT + x1], fx), fy);
}

/* The four spot inks. Every colour on the sheet is one of these as a dot screen,
   or two or more of them overprinted (multiply). Paper shows through everywhere else. */
const PAPER = [246, 238, 220];
const INKS = [
  { name: 'Ochre',  rgb: [238, 174, 50],  ang: 0,  off: [.34, -.22] },
  { name: 'Olive',  rgb: [108, 132, 70],  ang: 45, off: [-.3, .2] },
  { name: 'Madder', rgb: [208, 72, 60],   ang: 75, off: [.2, .32] },
  { name: 'Lapis',  rgb: [36, 60, 138],   ang: 15, off: [-.16, -.3] },
];
const CELL = 1.45;         // halftone cell, paper units
const O = 0, G_ = 1, R_ = 2, B_ = 3;

// Colours are ink densities [ochre, olive, madder, lapis], 0..1 each.
const C = {
  none: [0, 0, 0, 0],
  undyed: [.13, 0, .03, .035],     // Jesus: plain undyed wool/linen
  undyed2: [.09, 0, .02, .02],
  linen: [.05, 0, .01, .02],
  wool: [.34, .06, .16, .12],
  brown: [.5, .1, .36, .3],
  russet: [.3, 0, .38, .14],       // Mary's veil: plain dyed wool, earth red
  rust: [.55, 0, .55, .1],
  madder: [.12, 0, .6, .06],
  olive: [.28, .55, 0, .1],
  sage: [.12, .35, 0, .12],
  ochre: [.62, 0, .07, .03],
  sand: [.34, 0, .08, .03],
  grey: [.05, .05, .05, .32],
  skin: [.42, 0, .27, .05],
  skin2: [.5, 0, .34, .1],
  hair: [.45, .15, .38, .78],
  hairL: [.45, .05, .3, .5],
  grey_hair: [.06, 0, .04, .3],
  stone: [.24, .05, .08, .13],
  stoneL: [.16, .02, .05, .08],
  stoneD: [.3, .1, .14, .32],
  plaster: [.12, 0, .04, .045],
  earth: [.44, .12, .2, .12],
  soil: [.5, .1, .32, .3],
  soilD: [.5, .15, .42, .55],
  sandG: [.36, .06, .08, .05],
  grass: [.28, .6, 0, .05],
  grassD: [.28, .72, 0, .26],
  leaf: [.14, .6, 0, .3],
  leafL: [.1, .45, 0, .16],
  wood: [.52, .1, .3, .22],
  woodD: [.55, .15, .42, .45],
  water: [0, .22, 0, .48],
  waterD: [0, .32, 0, .74],
  sky: [.02, 0, .0, .15],
  skyD: [.1, 0, .06, .3],
  dusk: [.42, 0, .3, .12],
  dawn: [.36, 0, .22, .05],
  night: [0, .1, .12, .82],
  nightG: [.1, .3, .1, .75],
  dark: [.3, .2, .3, .96],
  gold: [.95, 0, .12, 0],
  bronze: [.72, .1, .3, .2],
  fire: [.95, 0, .6, 0],
  purple: [0, 0, .74, .7],         // John 19:2 — madder over lapis, a true overprint
  red: [.2, 0, .8, .1],
  steel: [.05, .05, .05, .45],
  white: [0, 0, 0, 0],
};
function shade(c, k) { return [c[0] * (1 - k * .25), c[1], clamp(c[2] + k * .18, 0, 1), clamp(c[3] + k, 0, 1)]; }
function mix(a, b, t) { return a.map((v, i) => lerp(v, b[i], t)); }
function add(a, b) { return a.map((v, i) => clamp(v + b[i], 0, 1)); }
