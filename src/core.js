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
  { name: 'Sunflower', rgb: [248, 200, 46],  ang: 0,  off: [.34, -.22] },
  { name: 'Teal',      rgb: [18, 148, 132],  ang: 45, off: [-.3, .2] },
  { name: 'Coral',     rgb: [238, 86, 112],  ang: 75, off: [.2, .32] },
  { name: 'Federal',   rgb: [38, 60, 136],   ang: 15, off: [-.16, -.3] },
];
const CELL = 1.45;         // halftone cell, paper units
const O = 0, G_ = 1, R_ = 2, B_ = 3;

// Colours are ink densities [sunflower, teal, coral, federal], 0..1 each.
const C = {
  none: [0, 0, 0, 0],
  undyed: [.17, 0, .05, .02],         // Jesus: plain undyed wool/linen
  undyed2: [.11, 0, .03, .02],
  linen: [.04, 0, 0, .02],
  wool: [.3, 0, .24, .08],
  brown: [.42, 0, .42, .3],
  russet: [.14, 0, .56, .1],       // Mary's veil: plain dyed wool, earth red
  rust: [.5, 0, .62, .08],
  madder: [.08, 0, .74, .03],
  olive: [.34, .62, 0, .04],
  sage: [.14, .4, 0, .06],
  ochre: [.78, 0, .05, 0],
  sand: [.4, 0, .07, 0],
  grey: [0, .04, 0, .3],
  skin: [.4, 0, .3, 0],
  skin2: [.5, 0, .38, .06],
  hair: [.3, 0, .3, .8],
  hairL: [.4, 0, .3, .45],
  grey_hair: [0, 0, 0, .28],
  stone: [.14, 0, .04, .2],
  stoneL: [.1, 0, .03, .12],
  stoneD: [.14, .04, .08, .42],
  plaster: [.16, 0, .04, .02],
  earth: [.42, 0, .32, .04],
  clay: [.3, 0, .64, .12],         // fired terracotta: reads against earth floors
  soil: [.46, 0, .44, .14],
  soilD: [.46, .04, .52, .44],
  sandG: [.44, 0, .1, 0],
  grass: [.36, .62, 0, 0],
  grassD: [.3, .76, 0, .18],
  leaf: [.2, .72, 0, .18],
  leafL: [.16, .52, 0, .06],
  wood: [.5, 0, .42, .12],
  woodD: [.5, 0, .52, .4],
  water: [0, .3, 0, .44],
  waterD: [0, .36, 0, .74],
  sky: [0, .06, 0, .16],
  skyD: [.04, 0, .1, .3],
  dusk: [.42, 0, .4, .08],
  dawn: [.42, 0, .28, 0],
  night: [0, .1, .05, .84],
  nightG: [0, .36, 0, .76],
  dark: [.08, .1, .2, .95],
  gold: [1, 0, .08, 0],
  bronze: [.7, 0, .3, .15],
  fire: [1, 0, .7, 0],
  purple: [0, 0, .74, .7],         // John 19:2 — coral over federal, a true overprint
  red: [.14, 0, .9, .05],
  steel: [0, .05, 0, .45],
  white: [0, 0, 0, 0],
};
function shade(c, k) { return [c[0] * (1 - k * .25), c[1], clamp(c[2] + k * .18, 0, 1), clamp(c[3] + k, 0, 1)]; }
function mix(a, b, t) { return a.map((v, i) => lerp(v, b[i], t)); }
function add(a, b) { return a.map((v, i) => clamp(v + b[i], 0, 1)); }
