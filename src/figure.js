/* ───────────── figures: one skeleton, one scale, every person ─────────────
   A figure is drawn in a canonical three-quarter view facing screen-right and mirrored
   for the other way. Pose angles: 0 = straight down, +π/2 = forward, π = straight up.
   Legs and arms are gravity-referenced; `rot` turns the whole body about the pelvis. */
const FH = 35;                                   // an adult is 1.75 m = 35 pu, in every scene
const Dv = a => [Math.sin(a), Math.cos(a)];
const V = (a, b, s) => [a[0] + b[0] * s, a[1] + b[1] * s];
function capsule(a, b, r0, r1, n) {
  n = n || 6;
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), o = [];
  for (let i = 0; i <= n; i++) { const t = ang - PI / 2 + PI * i / n; o.push(b[0] + Math.cos(t) * r1, b[1] + Math.sin(t) * r1); }
  for (let i = 0; i <= n; i++) { const t = ang + PI / 2 + PI * i / n; o.push(a[0] + Math.cos(t) * r0, a[1] + Math.sin(t) * r0); }
  return o;
}
function hull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p.flat();
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  up.pop(); lo.pop();
  return lo.concat(up).flat();
}

/* ── clips: n frames per cycle, dur seconds per cycle ── */
const POSE0 = { px: 0, py: 0, lean: 0, head: 0, rot: 0, hL: 0, kL: 0, hR: 0, kR: 0, sL: .06, eL: .12, sR: -.04, eR: .16 };
const SIT = { py: -.37, hL: 1.3, kL: 2.35, hR: 1.2, kR: 2.25, lean: .12, sL: .5, eL: .6, sR: .4, eR: .7 };
const SEAT = { py: -.23, hL: 1.5, kL: 1.45, hR: 1.42, kR: 1.38, lean: .04, sL: .4, eL: .5, sR: .35, eR: .55 };
const KNEEL = { py: -.27, hL: .18, kL: 1.75, hR: .06, kR: 1.68, lean: .08, sL: .15, eL: .2, sR: .12, eR: .25 };
const talkArm = (a, side) => side === 'L' ? { sL: .6 + .28 * Math.sin(a), eL: .75 + .25 * Math.sin(2 * a) } : { sR: .55 + .3 * Math.sin(a), eR: .8 + .22 * Math.sin(2 * a) };
const CL = {
  stand: { n: 6, dur: 3.2, f: a => ({ sL: .07 + .02 * Math.sin(a), sR: -.05 - .02 * Math.sin(a), head: .03 * Math.sin(a), lean: .02 }) },
  walk: { n: 12, dur: 1.05, f: a => { const s = Math.sin(a); return { hL: .42 * s, hR: -.42 * s, kL: .08 + .6 * Math.pow(Math.max(0, Math.cos(a)), 1.5), kR: .08 + .6 * Math.pow(Math.max(0, -Math.cos(a)), 1.5), sL: -.3 * s, sR: .3 * s, eL: .25, eR: .25, py: -.014 * s * s, lean: .06 }; } },
  shuffle: { n: 12, dur: 1.6, f: a => { const s = Math.sin(a); return { hL: .14 * s, hR: -.14 * s, kL: .05, kR: .05, sL: .02, sR: .02, eL: .05, eR: .05, py: -.004 * s * s, lean: .02 }; } },
  talk: { n: 12, dur: 2.6, f: a => Object.assign({ sL: .07, head: .05 * Math.sin(2 * a), lean: .03 }, talkArm(a)) },
  talk2: { n: 12, dur: 2.9, f: a => Object.assign({ sR: .05, head: .05 * Math.sin(2 * a + 1), lean: .03 }, talkArm(a + 1, 'L')) },
  listen: { n: 6, dur: 3.4, f: a => ({ head: .12 + .03 * Math.sin(a), sL: .38, eL: .95, sR: .36, eR: .95 }) },
  sit: { n: 6, dur: 3.4, f: a => Object.assign({}, SIT, { head: .04 * Math.sin(a) }) },
  sitTalk: { n: 12, dur: 2.8, f: a => Object.assign({}, SIT, { head: .05 * Math.sin(2 * a) }, talkArm(a)) },
  sitListen: { n: 6, dur: 3.6, f: a => Object.assign({}, SIT, { head: .1 + .04 * Math.sin(a), lean: .2 }) },
  sitAmazed: { n: 12, dur: 3.2, f: a => Object.assign({}, SIT, { head: -.05, lean: -.02, sR: 1.3 + .25 * Math.sin(a), eR: 1.4, sL: .9, eL: 1.2 }) },
  seat: { n: 6, dur: 3.4, f: a => Object.assign({}, SEAT, { head: .04 * Math.sin(a) }) },
  seatTalk: { n: 12, dur: 2.8, f: a => Object.assign({}, SEAT, { head: .05 * Math.sin(2 * a) }, talkArm(a)) },
  seatBow: { n: 6, dur: 3.6, f: a => Object.assign({}, SEAT, { head: .35 + .04 * Math.sin(a), lean: .12, sL: .5, eL: 1.1, sR: .55, eR: 1.1 }) },
  seatHold: { n: 6, dur: 3.6, f: a => Object.assign({}, SEAT, { head: .25 + .04 * Math.sin(a), sL: .8, eL: 1.0, sR: .85, eR: .95 }) },
  kneel: { n: 6, dur: 3.4, f: a => Object.assign({}, KNEEL, { head: .1 + .03 * Math.sin(a) }) },
  pray: { n: 6, dur: 3.6, f: a => Object.assign({}, KNEEL, { sL: .95, eL: 1.7, sR: 1.0, eR: 1.62, head: -.12 + .03 * Math.sin(a) }) },
  prayUp: { n: 6, dur: 4, f: a => Object.assign({}, KNEEL, { sL: 2.25 + .06 * Math.sin(a), eL: .3, sR: 2.4 + .06 * Math.sin(a), eR: .25, head: -.3, lean: -.04 }) },
  prostrate: { n: 6, dur: 4, f: a => ({ py: -.38, hL: 1.0, kL: 2.56, hR: .95, kR: 2.5, lean: 1.28 + .04 * Math.sin(a), head: .2, sL: 1.45, eL: .1, sR: 1.5, eR: .05 }) },
  bow: { n: 6, dur: 3.6, f: a => ({ lean: .42 + .04 * Math.sin(a), head: .25, sL: .12, sR: .18, eL: .5, eR: .55, hL: -.05, kL: .08, hR: .05, kR: .1, px: -.03 }) },
  offer: { n: 6, dur: 3.6, f: a => Object.assign({}, KNEEL, { sL: 1.2, eL: .35, sR: 1.3 + .05 * Math.sin(a), eR: .25, lean: .22, head: .15 }) },
  recline: { n: 6, dur: 3.8, f: a => ({ rot: 1.3, py: -.46, lean: -.6, head: -.15 + .04 * Math.sin(a), hL: .3, kL: .55, hR: .2, kR: .8, sL: 1.5, eL: 1.35, sR: 2.2 + .08 * Math.sin(a), eR: .35 }) },
  reclineLean: { n: 6, dur: 3.8, f: a => ({ rot: 1.3, py: -.46, lean: -.35, head: .2 + .03 * Math.sin(a), hL: .3, kL: .55, hR: .2, kR: .8, sL: 1.45, eL: 1.3, sR: 1.6, eR: .6 }) },
  lie: { n: 6, dur: 4.4, f: a => ({ rot: 1.48, py: -.48, lean: 0, head: .15, hL: .12, kL: .25, hR: .06, kR: .35, sL: .06, eL: .12, sR: .02 + .02 * Math.sin(a), eR: .15 }) },
  sleepSit: { n: 6, dur: 4.4, f: a => Object.assign({}, SIT, { lean: .5, head: .7 + .04 * Math.sin(a), sL: 1.05, eL: .95, sR: 1.1, eR: .9 }) },
  reach: { n: 6, dur: 3.2, f: a => ({ sR: 1.4 + .05 * Math.sin(a), eR: .1, sL: .5, eL: .5, lean: .1 }) },
  embrace: { n: 6, dur: 3.2, f: a => ({ sR: 1.25, eR: .7, sL: 1.2, eL: .75, lean: .12, head: .15 + .03 * Math.sin(a) }) },
  carry: { n: 6, dur: 3.4, f: a => ({ sL: .78, eL: 1.12, sR: .82, eR: 1.05, lean: -.03, head: .2 + .03 * Math.sin(a) }) },
  carryWalk: { n: 12, dur: 1.05, f: a => { const s = Math.sin(a); return { hL: .38 * s, hR: -.38 * s, kL: .08 + .55 * Math.pow(Math.max(0, Math.cos(a)), 1.5), kR: .08 + .55 * Math.pow(Math.max(0, -Math.cos(a)), 1.5), sL: .78, eL: 1.12, sR: .82, eR: 1.05, py: -.012 * s * s, lean: .02 }; } },
  bless: { n: 6, dur: 3.6, f: a => ({ sL: 2.2 + .05 * Math.sin(a), eL: .15, sR: 2.35 + .05 * Math.sin(a), eR: .2, head: -.15 }) },
  cry: { n: 12, dur: 2.4, f: a => ({ sR: 1.95 + .12 * Math.sin(a), eR: .1, sL: .2, eL: .3, head: -.08, lean: .05 }) },
  point: { n: 6, dur: 3.2, f: a => ({ sR: 1.5 + .06 * Math.sin(a), eR: 0, sL: .1, eL: .3, head: .02 }) },
  weep: { n: 6, dur: 3.4, f: a => ({ head: .45 + .05 * Math.sin(a), sR: .55, eR: 2.35, sL: .6, eL: 2.3, lean: .2 }) },
  kneelWeep: { n: 6, dur: 3.4, f: a => Object.assign({}, KNEEL, { head: .45 + .05 * Math.sin(a), sR: .55, eR: 2.35, sL: .6, eL: 2.3, lean: .3 }) },
  haul: { n: 12, dur: 2.2, f: a => { const s = Math.sin(a); return { lean: -.3 + .14 * s, sL: 1.35 + .18 * s, sR: 1.4 + .18 * s, eL: .2, eR: .15, hL: .35, kL: .25, hR: -.25, kR: .1, py: -.03 }; } },
  lookUp: { n: 6, dur: 3.4, f: a => ({ head: -.5 + .04 * Math.sin(a), lean: -.08, sL: .1, sR: .1, eL: .3, eR: .3 }) },
  lookUpReach: { n: 6, dur: 3.4, f: a => ({ head: -.5, lean: -.08, sR: 2.1 + .1 * Math.sin(a), eR: .2, sL: .2, eL: .3 }) },
  ride: { n: 6, dur: 3.2, f: a => ({ py: -.43, hL: 1.0, kL: .9, hR: .95, kR: .85, lean: .02, sL: .7, eL: .6, sR: .9 + .3 * Math.sin(a), eR: .9, head: .05 * Math.sin(a) }) },
  wave: { n: 8, dur: 1.2, f: a => ({ sR: 2.3 + .5 * Math.sin(a), eR: .2, sL: .3, eL: .4, head: -.12, lean: -.03 }) },
  wave2: { n: 8, dur: 1.35, f: a => ({ sR: 2.1 + .45 * Math.sin(a), eR: .3, sL: 2.0 - .4 * Math.sin(a), eL: .3, head: -.15, lean: -.04 }) },
  pour: { n: 6, dur: 3, f: a => ({ sL: 1.2, eL: .7, sR: .95, eR: 1.1, lean: .28 + .04 * Math.sin(a), head: .2, hL: -.05, hR: .1, kR: .1 }) },
  work: { n: 8, dur: 1.3, f: a => { const s = Math.sin(a); return { lean: .38 + .06 * s, head: .2, sR: 1.0 + .8 * s, eR: .5 + .4 * s, sL: 1.0 + .7 * s, eL: .55 + .35 * s, hL: .2, kL: .15, hR: -.15, kR: .1 }; } },
  grind: { n: 8, dur: 1.8, f: a => { const s = Math.sin(a); return Object.assign({}, KNEEL, { lean: .38 + .12 * s, head: .25, sL: 1.2 + .25 * s, eL: .35, sR: 1.25 + .25 * s, eR: .3 }); } },
  sweep: { n: 8, dur: 1.6, f: a => { const s = Math.sin(a); return { lean: .3, head: .2, sR: .7 + .3 * s, eR: .3, sL: .85 + .3 * s, eL: .3 }; } },
  afraid: { n: 6, dur: 2.4, f: a => ({ sR: 2.2, eR: 1.3, sL: .9, eL: 1.0, lean: -.15 + .03 * Math.sin(a), head: .12, hR: .12, kR: .15 }) },
  afraidKneel: { n: 6, dur: 2.6, f: a => Object.assign({}, KNEEL, { sR: 2.1, eR: 1.4, sL: 1.9, eL: 1.3, lean: .3 + .04 * Math.sin(a), head: .4 }) },
  hold: { n: 6, dur: 3.4, f: a => ({ sL: .95, eL: .45, sR: 1.0, eR: .4, lean: .05, head: .1 + .03 * Math.sin(a) }) },
  holdUp: { n: 6, dur: 3.4, f: a => ({ sL: 1.6, eL: .5, sR: 1.65, eR: .45, lean: -.02, head: -.1 + .03 * Math.sin(a) }) },
  staff: { n: 6, dur: 3.4, f: a => ({ sR: .55, eR: .9, sL: .06, eL: .12, head: .03 * Math.sin(a) }) },
  cast: { n: 12, dur: 2.4, f: a => { const s = Math.sin(a); return { lean: .15 + .25 * s, sL: 1.5 + .9 * s, eL: .2, sR: 1.6 + .9 * s, eR: .15, hL: .3, kL: .2, hR: -.2, kR: .1 }; } },
  toddle: { n: 8, dur: .9, f: a => { const s = Math.sin(a); return { hL: .3 * s, hR: -.3 * s, kL: .1, kR: .1, sL: .6 - .2 * s, eL: .3, sR: .6 + .2 * s, eR: .3, py: -.01 * s * s }; } },
};

/* ── the people ── */
const LOOK = {
  jesus:   { skin: C.skin, hair: C.hair, beard: C.hair, tunic: C.undyed, mantle: C.undyed2, tassels: true, sash: C.linen },
  jesusBoy:{ s: .8, skin: C.skin, hair: C.hair, tunic: C.undyed, sash: C.linen, tassels: true },
  jesusChild:{ s: .6, skin: C.skin, hair: C.hair, tunic: C.undyed },
  jesusToddler:{ s: .46, skin: C.skin, hair: C.hair, tunic: C.linen },
  jesusPurple: { skin: C.skin, hair: C.hair, beard: C.hair, tunic: C.undyed, robe: C.purple, thorns: true },
  mary:    { s: .94, skin: C.skin, hair: C.hair, tunic: C.sand, veil: C.russet, sash: C.wool, female: true },
  maryOld: { s: .92, skin: C.skin2, hair: C.grey_hair, tunic: C.sand, veil: C.russet, sash: C.wool, female: true },
  joseph:  { skin: C.skin2, hair: C.hair, beard: C.hair, tunic: C.wool, mantle: C.brown, tassels: true, sash: C.earth },
  gabriel: { skin: C.skin, hair: C.hairL, tunic: C.white, mantle: C.white, shine: true },
  angel:   { skin: C.skin, hair: C.hairL, tunic: C.white, mantle: C.white, shine: true },
  elisabeth:{ s: .92, skin: C.skin2, hair: C.grey_hair, tunic: C.olive, veil: C.wool, sash: C.earth, female: true, old: true },
  simeon:  { skin: C.skin2, hair: C.grey_hair, beard: C.grey_hair, tunic: C.linen, mantle: C.wool, tassels: true, old: true },
  anna:    { s: .9, skin: C.skin2, hair: C.grey_hair, tunic: C.brown, veil: C.stone, female: true, old: true, lean: .12 },
  shep1:   { skin: C.skin2, hair: C.hair, beard: C.hair, tunic: C.wool, sash: C.earth, short: true, mantle: C.brown },
  shep2:   { skin: C.skin, hair: C.hair, beard: C.hairL, tunic: C.brown, sash: C.wool, short: true },
  shep3:   { s: .82, skin: C.skin, hair: C.hair, tunic: C.sand, sash: C.earth, short: true },
  magus1:  { skin: C.skin2, hair: C.hair, beard: C.hair, tunic: C.madder, mantle: C.ochre, headcloth: C.linen },
  magus2:  { skin: C.skin, hair: C.grey_hair, beard: C.grey_hair, tunic: C.olive, mantle: C.lapisL || [0, .1, 0, .5], headcloth: C.ochre },
  magus3:  { skin: [.5, .06, .4, .3], hair: C.hair, beard: C.hair, tunic: C.ochre, mantle: C.rust, headcloth: C.linen },
  john:    { skin: C.skin2, hair: C.hair, beard: C.hair, tunic: [.5, .08, .28, .2], camel: true, short: true, sash: C.soilD },
  doctor1: { skin: C.skin2, hair: C.grey_hair, beard: C.grey_hair, tunic: C.linen, mantle: C.teal, tassels: true, border: true, phyl: true },
  doctor2: { skin: C.skin, hair: C.hair, beard: C.hair, tunic: C.sand, mantle: C.wool, tassels: true, border: true, phyl: true },
  doctor3: { skin: C.skin2, hair: C.grey_hair, beard: C.grey_hair, tunic: C.wool, mantle: C.olive, tassels: true, border: true },
  priest:  { skin: C.skin2, hair: C.hair, beard: C.hair, tunic: C.linen, mantle: C.madder, headcloth: C.linen, tassels: true, border: true },
  man1:    { skin: C.skin, hair: C.hair, beard: C.hair, tunic: C.wool, mantle: C.indigo, tassels: true },
  man2:    { skin: C.skin2, hair: C.hair, beard: C.hair, tunic: C.sand, mantle: C.teal, tassels: true },
  man3:    { skin: C.skin, hair: C.hairL, beard: C.hairL, tunic: C.sand, mantle: C.rust, tassels: true },
  man4:    { skin: C.skin2, hair: C.grey_hair, beard: C.grey_hair, tunic: C.linen, mantle: C.saffron, tassels: true },
  youth:   { s: .88, skin: C.skin, hair: C.hair, tunic: C.sand, sash: C.madder, short: true },
  woman1:  { s: .93, skin: C.skin, hair: C.hair, tunic: C.wool, veil: C.teal, female: true },
  woman2:  { s: .93, skin: C.skin2, hair: C.hair, tunic: C.wool, veil: C.madder, female: true },
  woman3:  { s: .92, skin: C.skin, hair: C.hair, tunic: C.sand, veil: C.indigo, female: true },
  woman4:  { s: .92, skin: C.skin2, hair: C.grey_hair, tunic: C.brown, veil: C.saffron, female: true },
  magdalene:{ s: .93, skin: C.skin, hair: C.hair, tunic: C.wool, veil: C.madder, female: true },
  girl:    { s: .7, skin: C.skin, hair: C.hair, tunic: C.sand, veil: C.madder, female: true },
  boy:     { s: .62, skin: C.skin, hair: C.hair, tunic: C.wool, sash: C.madder, short: true },
  lad:     { s: .72, skin: C.skin, hair: C.hair, tunic: C.sand, sash: C.madder, short: true },
  servant: { skin: C.skin2, hair: C.hair, beard: C.hair, tunic: C.linen, sash: C.brown, short: true },
  fisher1: { skin: C.skin2, hair: C.hair, beard: C.hair, tunic: C.wool, sash: C.earth, short: true },
  fisher2: { skin: C.skin, hair: C.hair, beard: C.hairL, tunic: C.sand, sash: C.brown, short: true },
  peter:   { skin: C.skin2, hair: C.grey_hair, beard: C.grey_hair, tunic: C.wool, sash: C.earth, short: true },
  beloved: { s: .96, skin: C.skin, hair: C.hair, tunic: C.linen, mantle: C.madder, tassels: true },
  soldier: { skin: C.skin2, hair: C.hair, tunic: C.red, armour: true, short: true },
  pilate:  { skin: C.skin2, hair: C.hair, tunic: C.linen, toga: true },
  lazarus: { skin: C.skin, graveclothes: true },
  pharisee:{ skin: C.skin2, hair: C.hair, beard: C.hair, tunic: C.linen, mantle: C.ochre, tassels: true, border: true, phyl: true },
};
const PROP_HAND = { staff: 'R', box: 'R', baby: 'B', doves: 'B', jar: 'B', jarShoulder: 'R', basket: 'B', bread: 'B', loaves: 'B', cup: 'R', scroll: 'B', palm: 'R', torch: 'R', lantern: 'R', spear: 'R', adze: 'B', plank: 'B', broom: 'B', child: 'B', fish: 'B', bundle: 'R', dice: 'R' };

/* ── skeleton → primitives ── */
function skel(L, pose) {
  const h = FH * (L.s || 1);
  const pel = [pose.px * h, -(.53 + pose.py) * h];
  const lean = pose.lean + (L.lean || 0), up = [Math.sin(lean), -Math.cos(lean)], fw = [Math.cos(lean), Math.sin(lean)];
  const neck = V(pel, up, .3 * h), ha = lean + pose.head;
  const head = V(neck, [Math.sin(ha), -Math.cos(ha)], .085 * h);
  const sh = V(neck, up, -.04 * h), shF = V(sh, fw, -.035 * h), shN = V(sh, fw, .025 * h);
  const hipF = V(pel, fw, -.03 * h), hipN = V(pel, fw, .02 * h);
  const leg = (hip, a, k) => { const kn = V(hip, Dv(a), .245 * h); return [hip, kn, V(kn, Dv(a - k), .245 * h)]; };
  const arm = (s0, a, e) => { const el = V(s0, Dv(a), .185 * h); return [s0, el, V(el, Dv(a + e), .155 * h)]; };
  const S = { h, pel, neck, head, sh, shF, shN, up, fw, lean, ha,
    lF: leg(hipF, pose.hL, pose.kL), lN: leg(hipN, pose.hR, pose.kR),
    aF: arm(shF, pose.sL, pose.eL), aN: arm(shN, pose.sR, pose.eR) };
  if (pose.rot) {
    const c = Math.cos(pose.rot), s = Math.sin(pose.rot), o = pel;
    const R = q => { const x = q[0] - o[0], y = q[1] - o[1]; return [o[0] + x * c - y * s, o[1] + x * s + y * c]; };
    for (const k of ['neck', 'head', 'sh', 'shF', 'shN']) S[k] = R(S[k]);
    for (const k of ['lF', 'lN', 'aF', 'aN']) S[k] = S[k].map(R);
    const rv = v => [v[0] * c - v[1] * s, v[0] * s + v[1] * c];
    S.up = rv(S.up); S.fw = rv(S.fw); S.ha += pose.rot; S.lean += pose.rot;
  }
  return S;
}
function figPrims(L, pose, back, prop, tint) {
  const T = tint || (c => c);
  const S = skel(L, pose), h = S.h, pr = [];
  const F = (p, c, o) => pr.push(fp(p, T(c), o));
  const Ln = (p, w, o) => pr.push(lp(p, w, o));
  const lw = .38, dark = shade;
  const tunic = L.tunic || C.linen, skin = L.skin || C.skin;
  const lim = h * .038, arm = h * .034;
  // ground shadow
  if (!pose.rot && L.shadow !== false) F(ellPts(S.pel[0] * .6, 0, h * .2, h * .06, 14), [0, .06, .04, .16], { lw: 0, ko: 0, wa: .2 });
  if (L.graveclothes) return lazarusPrims(S, pr, T);
  const sleeve = L.robe || tunic, mantle = L.robe ? null : L.mantle;
  const hem = L.short ? .55 : .94;
  const legPt = (l, t) => t <= .5 ? V(l[0], [l[1][0] - l[0][0], l[1][1] - l[0][1]], t * 2) : V(l[1], [l[2][0] - l[1][0], l[2][1] - l[1][1]], (t - .5) * 2);
  // far arm
  const armPr = (a, far) => {
    const c = far ? dark(sleeve, .16) : sleeve;
    F(capsule(a[0], a[1], arm * 1.1, arm, 5), c, { lw });
    const cuff = L.short || L.armour ? .45 : .8;
    const wrist = V(a[1], [a[2][0] - a[1][0], a[2][1] - a[1][1]], cuff);
    F(capsule(a[1], wrist, arm * .98, arm * .9, 5), c, { lw });
    if (L.short || L.armour) F(capsule(wrist, a[2], arm * .72, arm * .66, 4), far ? dark(skin, .12) : skin, { lw: .3 });
    F(ellPts(a[2][0], a[2][1], arm * .95, arm * .85, 9), far ? dark(skin, .12) : skin, { lw: .3 });
  };
  // mantle drape behind the body
  if (mantle) {
    const bk = [-S.fw[0], -S.fw[1]];
    const pts = [V(S.shF, bk, h * .035), V(S.neck, bk, h * .05), V(S.pel, bk, h * .13), V(legPt(S.lF, .7), bk, h * .1), legPt(S.lF, .78), V(S.sh, S.fw, h * .02)];
    F(hull(pts), dark(mantle, .1), { lw });
    if (L.tassels) { const q = V(legPt(S.lF, .76), bk, h * .1); Ln([q[0], q[1], q[0] + .2, q[1] + h * .04], .35, { li: B_, ld: 1 }); }
  }
  if (L.robe) { const bk = [-S.fw[0], -S.fw[1]]; F(hull([V(S.shF, bk, h * .04), V(S.neck, bk, h * .05), V(S.pel, bk, h * .12), V(legPt(S.lF, .6), bk, h * .09), legPt(S.lF, .65), S.sh]), dark(L.robe, .12), { lw }); }
  armPr(S.aF, true);
  // far leg / foot
  const foot = (l, far) => {
    const a = l[2], dir = S.fw[0] >= 0 ? 1 : -1, c = far ? C.soilD : C.soil;
    if (L.short || L.armour) F(capsule(l[1], l[2], lim * .9, lim * .7, 4), far ? dark(skin, .14) : skin, { lw: .3 });
    F([a[0] - h * .02, a[1] - h * .015, a[0] + h * .075 * dir, a[1] - h * .006, a[0] + h * .07 * dir, a[1] + h * .012, a[0] - h * .025, a[1] + h * .012], c, { lw: .3 });
  };
  if (L.short || L.armour) F(capsule(S.lF[0], S.lF[1], lim * 1.1, lim * .95, 4), dark(tunic, .2), { lw });
  foot(S.lF, true);
  // body: torso, then skirt as the hull of both legs down to the hem
  const pf = S.fw, torso = [V(S.shF, pf, -h * .045), V(S.shN, pf, h * .04), V(S.pel, pf, h * .085), V(S.pel, pf, -h * .095)];
  const skirt = [V(S.pel, pf, -h * .1), V(S.pel, pf, h * .09)];
  for (const l of [S.lF, S.lN]) { const q = legPt(l, hem); skirt.push(V(q, pf, h * .07), V(q, pf, -h * .07), V(legPt(l, hem * .55), pf, h * .065), V(legPt(l, hem * .55), pf, -h * .065)); }
  if (L.short || L.armour) { foot(S.lN, false); F(capsule(S.lN[0], S.lN[1], lim * 1.1, lim * .95, 4), tunic, { lw }); }
  F(hull(skirt), L.robe ? dark(L.robe, .04) : tunic, { lw });
  F(torso.flat(), L.robe || tunic, { lw });
  if (!L.short && !L.armour) foot(S.lN, false);
  // hem stripe, border, camel hair
  if (L.border) { const a = legPt(S.lF, hem), b = legPt(S.lN, hem); Ln([a[0] - h * .06, a[1] - h * .02, b[0] + h * .07, b[1] - h * .02], .9, { li: B_, ld: .55 }); }
  if (L.camel) for (let i = 0; i < 7; i++) { const q = V(S.pel, S.up, h * (i * .045 - .08)); Ln([q[0] - h * .06, q[1], q[0] + h * .05, q[1] + h * .01], .28, { ld: .6 }); }
  if (L.sash && !L.robe) { const a = V(S.pel, S.up, h * .03); F(capsule(V(a, pf, -h * .095), V(a, pf, h * .085), h * .022, h * .022, 3), L.sash, { lw: .3 }); }
  if (L.armour) {
    F([...V(S.shF, pf, -h * .05), ...V(S.shN, pf, h * .045), ...V(S.pel, pf, h * .09), ...V(S.pel, pf, -h * .1)].concat([]), C.bronze, { lw });
    for (let i = 1; i < 4; i++) { const a = V(S.pel, S.up, h * i * .07); Ln([...V(a, pf, -h * .09), ...V(a, pf, h * .085)], .3, { ld: .7 }); }
    const b = V(S.pel, S.up, -h * .02); for (let i = -2; i <= 2; i++) { const q = V(b, pf, i * h * .04); Ln([q[0], q[1], q[0], q[1] + h * .09], .6, { li: B_, ld: .5 }); }
  }
  if (L.toga) { const bk = [-S.fw[0], -S.fw[1]]; F(hull([V(S.shF, bk, h * .03), S.shN, V(S.pel, pf, h * .1), legPt(S.lN, .8), V(legPt(S.lF, .85), bk, h * .06)]), C.linen, { lw }); Ln([...V(S.shN, pf, h * .02), ...V(S.pel, pf, h * .1), ...legPt(S.lN, .82)], .9, { li: R_, ld: .7 }); }
  // mantle front wrap: diagonal from the far shoulder across to the near hip
  if (mantle) {
    const a = V(S.shF, pf, -h * .03), b = V(S.shF, pf, h * .03), c = V(S.pel, pf, h * .09), d = V(legPt(S.lN, .45), pf, h * .075), e = V(legPt(S.lF, .5), pf, -h * .07);
    F([...a, ...b, ...V(S.pel, S.up, h * .1).map((v, i) => v + pf[i] * h * .085), ...c, ...d, ...e], mantle, { lw });
    if (L.tassels) Ln([d[0], d[1], d[0] + .3, d[1] + h * .045], .35, { li: B_, ld: 1 });
    if (L.border) Ln([...c, ...d], .7, { li: B_, ld: .5 });
  }
  if (L.robe) { F([...V(S.shF, pf, -h * .03), ...V(S.shN, pf, h * .05), ...V(S.pel, pf, h * .1), ...legPt(S.lN, .6), ...V(legPt(S.lF, .6), pf, -h * .06)], L.robe, { lw }); }
  // head
  headPrims(S, L, pr, back, T);
  if (prop && PROP_HAND[prop] !== 'R') propPrims(prop, S, pr, T);
  armPr(S.aN, false);
  if (prop && PROP_HAND[prop] === 'R') propPrims(prop, S, pr, T);
  return pr;
}
function headPrims(S, L, pr, back, T) {
  const h = S.h, hc = S.head, r = h * .062, a = S.ha;
  const F = (p, c, o) => pr.push(fp(p, T(c), o)), Ln = (p, w, o) => pr.push(lp(p, w, o));
  const rt = (x, y) => [hc[0] + x * Math.cos(a) - y * Math.sin(a), hc[1] + x * Math.sin(a) + y * Math.cos(a)];
  const pl = arr => arr.flatMap(q => rt(q[0] * r, q[1] * r));
  const skin = L.skin || C.skin;
  // neck
  F(capsule(S.neck, V(S.neck, [Math.sin(a), -Math.cos(a)], h * .04), h * .026, h * .026, 3), shade(skin, .1), { lw: .3 });
  if (L.veil) {  // hood: over the crown, down the back to the shoulders
    F(pl([[.2, -1.25], [-.6, -1.2], [-1.25, -.4], [-1.5, .6], [-1.6, 1.7], [-.4, 2.0], [.5, 1.7], [.55, .6]]).concat(), shade(L.veil, .12), { lw: .38 });
  }
  F(ellPts(hc[0], hc[1], r * .92, r * 1.02, 14, a), skin, { lw: .38 });
  if (!back) {
    F(pl([[.84, -.15], [1.18, .18], [.86, .32]]), skin, { lw: .3 });            // nose
    pr.push(fp(pl([[.42, -.12], [.54, -.12], [.54, .02], [.42, .02]]), T(C.dark), { lw: 0 }));  // eye
    Ln(pl([[.3, -.36], [.68, -.33]]), .3, { ld: .8 });                             // brow
  }
  if (L.hair && !L.veil) {
    const hr = back ? [[1.0, -.3], [.8, -.9], [0, -1.15], [-.9, -.8], [-1.05, .2], [-.6, .95], [.4, 1.0], [1.0, .3]] : [[.75, -.55], [.5, -1.05], [-.3, -1.15], [-1.0, -.6], [-1.05, .3], [-.75, .95], [-.3, .9], [-.35, .1], [.05, -.35], [.5, -.4]];
    if (!L.headcloth) F(pl(hr), L.hair, { lw: .3 });
  }
  if (L.veil) {  // veil front edge framing the face
    F(pl([[.25, -1.12], [-.2, -1.25], [-1.0, -.9], [-1.2, 0], [-1.1, 1.0], [-.5, 1.3], [-.15, .55], [-.3, -.2], [.05, -.75], [.55, -.75]]), L.veil, { lw: .38 });
  }
  if (L.headcloth) {
    F(pl([[.7, -.35], [.75, -.95], [.1, -1.3], [-.8, -1.1], [-1.25, -.2], [-1.4, 1.2], [-.9, 1.9], [-.45, 1.2], [-.4, .1], [.2, -.4]]), L.headcloth, { lw: .38 });
    Ln(pl([[.72, -.55], [-.3, -.72], [-1.1, -.4]]), .35, { li: R_, ld: .6 });
  }
  if (L.beard && !back) F(pl([[.55, .32], [.9, .55], [.75, 1.15], [.3, 1.45], [-.3, 1.2], [-.55, .4], [-.3, .1]]), L.beard, { lw: .3 });
  if (L.phyl && !back) F(pl([[.05, -1.25], [.35, -1.25], [.35, -.98], [.05, -.98]]), C.dark, { lw: .2 });
  if (L.thorns) for (let i = 0; i < 9; i++) { const t = i / 8 * PI * 1.1 - PI * .05; const p0 = rt(Math.cos(PI + t) * r * 1.02, -r * .55 + Math.sin(t) * -r * .18); Ln([p0[0] - .6, p0[1] + .4, p0[0] + .5, p0[1] - .6], .35, { li: G_, ld: 1 }); Ln([p0[0] - .5, p0[1] - .5, p0[0] + .6, p0[1] + .3], .3, { ld: .9 }); }
}
function lazarusPrims(S, pr, T) {
  // bound hand and foot with graveclothes, face bound about with a napkin (John 11:44)
  const h = S.h, pf = S.fw, lw = .38;
  const body = [V(S.shF, pf, -h * .06), V(S.shN, pf, h * .055), V(S.pel, pf, h * .09), V(S.lN[2], pf, h * .05), V(S.lF[2], pf, -h * .05), V(S.pel, pf, -h * .1)];
  pr.push(fp(hull(body), T(C.linen), { lw }));
  for (let i = 0; i < 11; i++) { const q = V(S.lF[2], S.up, h * (.05 + i * .065)); pr.push(lp([...V(q, pf, -h * .07), ...V(V(q, S.up, h * .03), pf, h * .07)], .3, { ld: .55 })); }
  const hc = S.head, r = h * .062;
  pr.push(fp(ellPts(hc[0], hc[1], r * .95, r * 1.05, 14), T(C.linen), { lw }));
  for (let i = -1; i <= 1; i++) pr.push(lp([hc[0] - r, hc[1] + i * r * .5, hc[0] + r, hc[1] + i * r * .5 - r * .2], .3, { ld: .5 }));
  return pr;
}
function propPrims(prop, S, pr, T) {
  const h = S.h, hN = S.aN[2], hF = S.aF[2], mid = [(hN[0] + hF[0]) / 2, (hN[1] + hF[1]) / 2];
  const F = (p, c, o) => pr.push(fp(p, T(c), o)), Ln = (p, w, o) => pr.push(lp(p, w, o));
  const u = h / FH;
  switch (prop) {
    case 'staff': F(capsule([hN[0] + 1, hN[1] - 12 * u], [hN[0] - 1.5, hN[1] + 22 * u], .6, .55, 3), C.woodD, { lw: .3 }); Ln([hN[0] + 1, hN[1] - 12 * u, hN[0] + 3.5, hN[1] - 14 * u, hN[0] + 4, hN[1] - 11 * u], .8, { li: B_, ld: .7 }); break;
    case 'spear': F(capsule([hN[0] + 1.5, hN[1] - 26 * u], [hN[0] - .8, hN[1] + 14 * u], .45, .45, 3), C.woodD, { lw: .25 }); F([hN[0] + 1.3, hN[1] - 26 * u, hN[0] + 2.8, hN[1] - 31 * u, hN[0] + 2.1, hN[1] - 25.5 * u], C.steel, { lw: .25 }); break;
    case 'box': F(capsule([hN[0] - 2, hN[1] - 1], [hN[0] + 2.5, hN[1] - 1.5], 1.8 * u, 1.8 * u, 3), C.gold, { lw: .3 }); break;
    case 'baby': case 'child': {
      const b = V(mid, [0, -1], 1.2 * u), rx = 5.2 * u, ry = 2.2 * u;
      F(ellPts(b[0] - .5 * u, b[1], rx, ry, 14, -.12), C.linen, { lw: .35 });
      for (let i = -1; i <= 1; i++) Ln([b[0] + i * 1.8 * u - .4, b[1] - ry, b[0] + i * 1.8 * u + .4, b[1] + ry], .3, { ld: .45 });
      F(ellPts(b[0] + 4.6 * u, b[1] - 1 * u, 1.9 * u, 1.8 * u, 10), C.skin, { lw: .3 });
      F(ellPts(b[0] + 4.1 * u, b[1] - 1.9 * u, 1.3 * u, .9 * u, 8), C.hair, { lw: 0 });
      break;
    }
    case 'doves': for (const d of [[-1.5, 0], [1.5, -.8]]) { const q = [mid[0] + d[0] * u, mid[1] + d[1] * u - 1]; F([q[0] - 2.2 * u, q[1], q[0] - .5 * u, q[1] - 1.4 * u, q[0] + 1.3 * u, q[1] - 1.6 * u, q[0] + 2 * u, q[1] - .8 * u, q[0] + .8 * u, q[1] + .9 * u], C.stoneL, { lw: .3 }); } break;
    case 'jar': case 'jarShoulder': {
      const b = prop === 'jar' ? V(mid, [0, 1], 1) : V(S.shN, S.up, h * .06);
      const w = 3.2 * u, H2 = 6.5 * u;
      F([b[0] - w * .6, b[1] + H2 * .5, b[0] - w, b[1], b[0] - w * .7, b[1] - H2 * .4, b[0] - w * .35, b[1] - H2 * .55, b[0] + w * .35, b[1] - H2 * .55, b[0] + w * .7, b[1] - H2 * .4, b[0] + w, b[1], b[0] + w * .6, b[1] + H2 * .5], C.earth, { lw: .35 });
      F(ellPts(b[0], b[1] - H2 * .55, w * .38, w * .15, 8), C.soilD, { lw: .2 });
      break;
    }
    case 'basket': case 'loaves': {
      const b = V(mid, [0, 1], 1.5 * u), w = 4 * u;
      F([b[0] - w, b[1] - 1.5 * u, b[0] + w, b[1] - 1.5 * u, b[0] + w * .78, b[1] + 2.8 * u, b[0] - w * .78, b[1] + 2.8 * u], C.ochre, { lw: .35 });
      for (let i = 0; i < 3; i++) Ln([b[0] - w * .9, b[1] - .4 * u + i * 1.1 * u, b[0] + w * .9, b[1] - .4 * u + i * 1.1 * u], .25, { ld: .5 });
      if (prop === 'loaves') for (let i = 0; i < 3; i++) F(ellPts(b[0] - 2 * u + i * 2 * u, b[1] - 2 * u, 1.4 * u, 1 * u, 8), [.55, 0, .2, .08], { lw: .25 });
      break;
    }
    case 'bread': F(ellPts(mid[0], mid[1] - 1.2 * u, 2.6 * u, 1.4 * u, 10), [.55, 0, .2, .08], { lw: .3 }); Ln([mid[0] - .3, mid[1] - 2.4 * u, mid[0] + .3, mid[1]], .3, { ld: .6 }); break;
    case 'fish': F([mid[0] - 3 * u, mid[1], mid[0], mid[1] - 1.2 * u, mid[0] + 2.4 * u, mid[1], mid[0] + 3.4 * u, mid[1] - 1 * u, mid[0] + 3.4 * u, mid[1] + 1 * u, mid[0] + 2.4 * u, mid[1], mid[0], mid[1] + 1.2 * u], [.2, .1, .06, .45], { lw: .25 }); break;
    case 'cup': F([hN[0] - 1.3 * u, hN[1] - 3 * u, hN[0] + 1.3 * u, hN[1] - 3 * u, hN[0] + .5 * u, hN[1] - .4 * u, hN[0] + .8 * u, hN[1] + .6 * u, hN[0] - .8 * u, hN[1] + .6 * u, hN[0] - .5 * u, hN[1] - .4 * u], C.bronze, { lw: .3 }); break;
    case 'scroll': { const a = V(hF, [0, -1], .5), b = V(hN, [0, -1], .5); F(capsule(a, b, 1.3 * u, 1.3 * u, 4), C.linen, { lw: .3 }); F(ellPts(a[0], a[1], 1.4 * u, 1.9 * u, 8), C.sand, { lw: .3 }); F(ellPts(b[0], b[1], 1.4 * u, 1.9 * u, 8), C.sand, { lw: .3 }); break; }
    case 'palm': { const b = hN, t = [hN[0] + 5 * u, hN[1] - 18 * u]; Ln([b[0], b[1], (b[0] + t[0]) / 2 + 1, (b[1] + t[1]) / 2, t[0], t[1]], .5, { li: G_, ld: 1 }); for (let i = 1; i < 9; i++) { const q = V(b, [t[0] - b[0], t[1] - b[1]], i / 9); Ln([q[0], q[1], q[0] - 4 * u, q[1] + 2.5 * u], .45, { li: G_, ld: .95 }); Ln([q[0], q[1], q[0] + 4 * u, q[1] + 1.2 * u], .45, { li: G_, ld: .95 }); } break; }
    case 'torch': { F(capsule([hN[0], hN[1] + 4 * u], [hN[0] + 1, hN[1] - 8 * u], .6, .8, 3), C.woodD, { lw: .3 }); F([hN[0] - 1.5 * u, hN[1] - 8 * u, hN[0] + 1.5, hN[1] - 14 * u, hN[0] + 3.5 * u, hN[1] - 8 * u], C.fire, { lw: .2, wa: .2 }); pr.push(gp(hN[0] + 1, hN[1] - 10 * u, 7 * u, 7 * u, 3, [.3, 0, .08, 0], [0, .2, .2, .35], .3)); break; }
    case 'lantern': { F([hN[0] - 1.6 * u, hN[1] + 1, hN[0] + 1.6 * u, hN[1] + 1, hN[0] + 1.3 * u, hN[1] + 5 * u, hN[0] - 1.3 * u, hN[1] + 5 * u], C.fire, { lw: .35 }); pr.push(gp(hN[0], hN[1] + 3 * u, 6 * u, 6 * u, 3, [.3, 0, .06, 0], [0, .2, .2, .35], .3)); break; }
    case 'adze': { F(capsule([hN[0] - 1, hN[1] + 2], [hN[0] + 1, hN[1] - 7 * u], .5, .5, 3), C.woodD, { lw: .3 }); F([hN[0], hN[1] - 7 * u, hN[0] + 3.5 * u, hN[1] - 6 * u, hN[0] + 3.2 * u, hN[1] - 5 * u, hN[0], hN[1] - 5.8 * u], C.steel, { lw: .25 }); break; }
    case 'plank': F(capsule([mid[0] - 8 * u, mid[1] + 1], [mid[0] + 8 * u, mid[1] - 2], 1 * u, 1 * u, 2), C.wood, { lw: .3 }); break;
    case 'broom': Ln([hN[0] + 2, hN[1] - 6 * u, hN[0] - 3 * u, hN[1] + 14 * u], .5, { ld: .9 }); break;
    case 'bundle': { const b = V(S.shN, S.fw, -h * .08); F(ellPts(b[0], b[1] + 2 * u, 3.6 * u, 3 * u, 10), C.wool, { lw: .35 }); Ln([b[0] - 2, b[1], b[0] + 2, b[1] + 3], .3, { ld: .6 }); break; }
    case 'dice': F(ellPts(hN[0], hN[1] + 1, 1 * u, .8 * u, 6), C.linen, { lw: .25 }); break;
  }
}

/* ── animals ── */
function animalPrims(kind, u, back, T) {
  T = T || (c => c);
  const pr = [], F = (p, c, o) => pr.push(fp(p, T(c), o)), Ln = (p, w, o) => pr.push(lp(p, w, o));
  const a = TAU * u, s = Math.sin(a);
  if (kind === 'sheep' || kind === 'sheepGraze' || kind === 'sheepLie') {
    const lie = kind === 'sheepLie', graze = kind === 'sheepGraze', by = lie ? -3.2 : -6;
    F(ellPts(0, 0, 5.5, 1.6, 12), [0, .06, .04, .16], { lw: 0, ko: 0 });
    if (!lie) for (const [x, ph] of [[-3, 0], [-1.8, PI], [2.4, PI], [3.4, 0]]) F(capsule([x, by + 2], [x, -.2], .5, .45, 3), C.dark, { lw: .25 });
    F(ellPts(0, by, 6.2, 3.6, 16), C.wool.map((v, i) => v * .6), { lw: .4 });
    for (let i = 0; i < 5; i++) F(ellPts(-4 + i * 2, by - 2.6 + (i % 2) * .6, 1.6, 1.2, 8), C.linen, { lw: .25 });
    const hy = graze ? by + 3.5 + .5 * s : by - 1.5, hx = 6.5;
    F(ellPts(hx, hy, 1.9, 1.35, 10, graze ? .9 : .4), C.dark, { lw: .3 });
    F(ellPts(hx - 1.2, hy - 1, 1.2, .5, 6, -.4), C.dark, { lw: .2 });
  } else if (kind === 'donkey' || kind === 'donkeyWalk') {
    const walk = kind === 'donkeyWalk', c = [.3, .05, .2, .42], cl = [.18, .02, .1, .2];
    F(ellPts(0, 0, 13, 3, 14), [0, .06, .04, .16], { lw: 0, ko: 0 });
    const legs = [[-8, 0], [-6, PI], [6, PI], [8, 0]];
    for (const [x, ph] of legs) { const sw = walk ? Math.sin(a + ph) * 2.2 : 0; F(capsule([x, -12], [x + sw, -.6], 1.1, .8, 3), shade(c, x < 0 ? .1 : 0), { lw: .3 }); F(ellPts(x + sw, -.4, 1.1, .7, 6), C.dark, { lw: 0 }); }
    F(ellPts(0, -15, 11, 5.4, 18), c, { lw: .4 });
    F(ellPts(0, -12.5, 8, 2.6, 12), cl, { lw: 0 });
    Ln([-6, -19.5, 4, -19.8], .4, { ld: .6 });
    const nb = walk ? .6 * s : 0;
    F([8, -19, 12, -27 + nb, 16, -26 + nb, 12, -17], c, { lw: .35 });                         // neck
    F(ellPts(16.5, -24 + nb, 4.3, 2.4, 12, .5), c, { lw: .35 });                              // head
    F(ellPts(19.2, -22.2 + nb, 1.8, 1.5, 8, .5), cl, { lw: .3 });
    F([13.5, -26.5 + nb, 12.2, -33 + nb, 14.6, -27 + nb], c, { lw: .3 }); F([15, -26.5 + nb, 15.5, -33 + nb, 16.4, -26.5 + nb], c, { lw: .3 });
    Ln([-11, -16, -13.5, -8 + s], .5, { ld: .8 });
  } else if (kind === 'dove' || kind === 'doveGlide') {
    const up = kind === 'dove' ? Math.sin(a) : .2;
    F([-3.5, 0, -1, -1.2, 2.5, -1.4, 4, -.6, 2.4, .6, -1, .8], C.white, { lw: .35 });
    F([-.5, -.8, 1.8, -.8, .6 - 1.5, -.8 - 5.5 * up, -1.5, -.8 - 3.5 * up], C.white, { lw: .35 });
    F([-3.5, 0, -6, -1.6, -6, 1.2], C.white, { lw: .3 });
    F([4, -.6, 5.3, -.3, 4, .1], C.ochre, { lw: .15 });
  } else if (kind === 'bird') {
    const up = Math.sin(a);
    Ln([-4, -2.5 * up, -1.6, -.4 * up, 0, 0, 1.6, -.4 * up, 4, -2.5 * up], .55, { ld: .95 });
  }
  return pr;
}

/* ── the crucified: frontal, restrained, static ── */
function crucifiedPrims(L, T) {
  T = T || (c => c);
  const pr = [], h = FH, F = (p, c, o) => pr.push(fp(p, T(c), o)), Ln = (p, w, o) => pr.push(lp(p, w, o));
  const skin = L.skin || C.skin, lw = .38;
  const sy = -h * .82, hy = -h * .92;
  F(capsule([-h * .36, sy - 2], [0, sy + 1], h * .03, h * .038, 4), shade(skin, .06), { lw });
  F(capsule([h * .36, sy - 2], [0, sy + 1], h * .03, h * .038, 4), skin, { lw });
  F([-h * .09, sy, h * .09, sy, h * .075, -h * .5, -h * .08, -h * .5], skin, { lw });
  Ln([-h * .05, sy + h * .08, 0, sy + h * .1, h * .05, sy + h * .08], .3, { ld: .4 });
  F([-h * .1, -h * .52, h * .1, -h * .52, h * .08, -h * .38, -h * .07, -h * .38], C.linen, { lw });
  F(capsule([-h * .04, -h * .38], [-h * .015, -h * .02], h * .035, h * .028, 4), shade(skin, .08), { lw });
  F(capsule([h * .045, -h * .38], [h * .015, -h * .02], h * .035, h * .028, 4), skin, { lw });
  F(ellPts(h * .01, hy + 1.5, h * .058, h * .066, 12, .25), skin, { lw });
  F([-h * .06, hy - 2.2 + 1.5, h * .05, hy - 3 + 1.5, h * .08, hy + 1.5, h * .06, hy + 4.5, h * .02, hy + 1.5, -h * .02, hy + 5, -h * .07, hy + 3], L.hair || C.hair, { lw: .3 });
  F([-h * .02, hy + 3.2, h * .06, hy + 3, h * .04, hy + 6.2, h * .005, hy + 6.8], L.beard || C.hair, { lw: .3 });
  for (const x of [-h * .36, h * .36]) F(ellPts(x, sy - 2, 1.2, 1.1, 6), skin, { lw: .3 });
  return pr;
}

/* ── sprite cache: every pose is printed once, then reused ── */
const SPR = new Map(); let sprBytes = 0;
const SPR_MAX = (window.innerWidth < 700 ? 60 : 160) * 1048576;
function spriteGet(key) { const s = SPR.get(key); if (s) { SPR.delete(key); SPR.set(key, s); } return s; }
function spriteBake(key, prims, r, seed) {
  const b = primsBounds(prims);
  const W = Math.max(1, Math.ceil((b[2] - b[0]) * r)), H = Math.max(1, Math.ceil((b[3] - b[1]) * r));
  const pt = new Print(prims, b[0], b[1], W, H, r, seed, 0, 0);
  pt.rows(Infinity);
  const s = { cv: pt.canvas, x: b[0], y: b[1], w: W / r, h: H / r, bytes: W * H * 4 };
  SPR.set(key, s); sprBytes += s.bytes;
  while (sprBytes > SPR_MAX && SPR.size > 1) { const [k, v] = SPR.entries().next().value; SPR.delete(k); sprBytes -= v.bytes; }
  return s;
}
