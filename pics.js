// Cluas ar Luas: every picture, drawn in code (SVG) so they look the same on every phone.
// PIC(id) returns an <svg> for a phrase id. HARE(mood, outfit) draws Giorria the hare.
(function () {
'use strict';
const INK = '#2b2b2b';
const CAST = {
  nora:   { skin: '#f3c9a8', hair: '#c4542f', top: '#2f8f6f', style: 'bob' },
  peadar: { skin: '#e3ad86', hair: '#8f8f8f', top: '#3b5b8c', style: 'cap', beard: true },
  mamo:   { skin: '#f1d3bd', hair: '#efefef', top: '#a8577c', style: 'bun', glasses: true },
  cian:   { skin: '#c98d65', hair: '#2a1d15', top: '#e0a526', style: 'spiky' },
};

// ---------- people ----------
// hand positions for a right arm (dx from body centre, y). Left arms use the mirror (-dx).
const POSE = {
  down: [24, 142], wave: [36, 54], self: [2, 114], point: [50, 98], present: [48, 112],
  thumbs: [34, 96], flat: [44, 108], heart: [0, 110], give: [46, 106], tap: [54, 92],
  yawn: [5, 80], open: [46, 82], raise: [26, 42], cross: [-12, 116], sip: [9, 86],
  shake: [42, 122], head: [12, 48], stop: [36, 84], hip: [24, 130],
};
function arm(x, side, pose, c) {
  const [dx, hy] = POSE[pose] || POSE.down;
  const sx = x + side * 17, sy = 102, hx = x + side * dx;
  const cx = (sx + hx) / 2 + side * 9, cy = (sy + hy) / 2 + 12;
  let hand = `<circle cx="${hx}" cy="${hy}" r="6.5" fill="${c.skin}" stroke="${INK}" stroke-width="1.5"/>`;
  if (pose === 'thumbs') hand += `<rect x="${hx - 2.5}" y="${hy - 15}" width="5" height="11" rx="2.5" fill="${c.skin}" stroke="${INK}" stroke-width="1.5"/>`;
  if (pose === 'flat') hand = `<ellipse cx="${hx + side * 3}" cy="${hy}" rx="10" ry="4.5" fill="${c.skin}" stroke="${INK}" stroke-width="1.5"/>`;
  if (pose === 'stop' || pose === 'wave' || pose === 'raise') hand = `<ellipse cx="${hx}" cy="${hy - 2}" rx="6.5" ry="9" fill="${c.skin}" stroke="${INK}" stroke-width="1.5"/>`;
  if (pose === 'present') hand = `<ellipse cx="${hx + side * 3}" cy="${hy}" rx="9" ry="4" fill="${c.skin}" stroke="${INK}" stroke-width="1.5"/>`;
  let extra = '';
  if (pose === 'wave') extra = `<path d="M${hx + side * 12} ${hy - 14} q${side * 6} 8 0 16 M${hx + side * 18} ${hy - 18} q${side * 8} 12 0 24" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  if (pose === 'flat') extra = `<path d="M${hx - 6} ${hy - 12} l4 -4 4 4 4 -4 M${hx - 6} ${hy + 12} l4 4 4 -4 4 4" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  return `<path d="M${sx} ${sy} Q${cx} ${cy} ${hx} ${hy}" stroke="${c.top}" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M${sx} ${sy} Q${cx} ${cy} ${hx} ${hy}" stroke="${INK}" stroke-width="13" fill="none" stroke-linecap="round" opacity=".12"/>${hand}${extra}`;
}
function hair(x, c) {
  switch (c.style) {
    case 'bob': return `<path d="M${x - 23} 84 Q${x - 26} 44 ${x} 44 Q${x + 26} 44 ${x + 23} 84 Q${x + 17} 84 ${x + 17} 70 Q${x + 12} 57 ${x - 3} 56 Q${x - 15} 59 ${x - 17} 70 Q${x - 17} 84 ${x - 23} 84 Z" fill="${c.hair}" stroke="${INK}" stroke-width="1.5"/>`;
    case 'cap': return `<path d="M${x - 20} 74 Q${x - 22} 62 ${x - 18} 58 L${x - 16} 72 Z" fill="${c.hair}"/><path d="M${x - 22} 62 Q${x - 21} 44 ${x + 1} 44 Q${x + 22} 45 ${x + 22} 60 Z" fill="#5a4a3d" stroke="${INK}" stroke-width="1.5"/><path d="M${x + 4} 58 Q${x + 28} 55 ${x + 33} 61 Q${x + 20} 64 ${x + 4} 62 Z" fill="#4a3d32" stroke="${INK}" stroke-width="1.5"/>`;
    case 'bun': return `<circle cx="${x}" cy="41" r="9" fill="${c.hair}" stroke="${INK}" stroke-width="1.5"/><path d="M${x - 21} 68 Q${x - 21} 46 ${x} 46 Q${x + 21} 46 ${x + 21} 68 Q${x + 13} 56 ${x} 56 Q${x - 13} 56 ${x - 21} 68 Z" fill="${c.hair}" stroke="${INK}" stroke-width="1.5"/>`;
    case 'spiky': return `<path d="M${x - 21} 65 L${x - 21} 50 L${x - 13} 53 L${x - 9} 42 L${x - 2} 51 L${x + 5} 40 L${x + 10} 50 L${x + 18} 45 L${x + 21} 63 Q${x} 54 ${x - 21} 65 Z" fill="${c.hair}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`;
  }
  return '';
}
function face(x, mood, c) {
  const e = (dx) => x + dx + 2; // eyes look slightly to the right (the way the person faces)
  let eyes = `<circle cx="${e(-7)}" cy="67" r="2.6" fill="${INK}"/><circle cx="${e(7)}" cy="67" r="2.6" fill="${INK}"/>`;
  let mouth = `<path d="M${e(-6)} 77 Q${e(0)} 83 ${e(6)} 77" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  let brows = '', more = '';
  switch (mood) {
    case 'big': mouth = `<path d="M${e(-8)} 75 Q${e(0)} 89 ${e(8)} 75 Z" fill="#7a2b2b" stroke="${INK}" stroke-width="1.8"/>`; break;
    case 'delight': eyes = `<path d="M${e(-10)} 68 Q${e(-7)} 63 ${e(-4)} 68 M${e(4)} 68 Q${e(7)} 63 ${e(10)} 68" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`; mouth = `<path d="M${e(-8)} 75 Q${e(0)} 89 ${e(8)} 75 Z" fill="#7a2b2b" stroke="${INK}" stroke-width="1.8"/>`; break;
    case 'sad': mouth = `<path d="M${e(-6)} 81 Q${e(0)} 75 ${e(6)} 81" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`; brows = `<path d="M${e(-11)} 60 L${e(-4)} 62 M${e(4)} 62 L${e(11)} 60" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`; break;
    case 'tired': eyes = `<path d="M${e(-10)} 68 L${e(-4)} 68 M${e(4)} 68 L${e(10)} 68" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`; mouth = `<ellipse cx="${e(0)}" cy="79" rx="4" ry="5.5" fill="#7a2b2b" stroke="${INK}" stroke-width="1.6"/>`; break;
    case 'neutral': mouth = `<path d="M${e(-5)} 79 L${e(5)} 79" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`; break;
    case 'ask': brows = `<path d="M${e(-11)} 60 Q${e(-7)} 56 ${e(-3)} 60 M${e(3)} 59 L${e(11)} 59" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`; mouth = `<ellipse cx="${e(0)}" cy="79" rx="3" ry="3.5" fill="#7a2b2b"/>`; break;
    case 'hope': brows = `<path d="M${e(-11)} 60 Q${e(-7)} 56 ${e(-3)} 59 M${e(3)} 59 Q${e(7)} 56 ${e(11)} 60" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`; break;
    case 'cold': mouth = `<path d="M${e(-7)} 79 l2.5 -2 2.5 2 2.5 -2 2.5 2 2.5 -2" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`; more = `<path d="M${x - 32} 70 l-6 0 M${x - 32} 80 l-6 2 M${x + 34} 70 l6 0 M${x + 34} 80 l6 2" stroke="#5aa0d6" stroke-width="2.5" stroke-linecap="round"/>`; break;
    case 'blow': mouth = `<circle cx="${e(1)}" cy="79" r="3" fill="none" stroke="${INK}" stroke-width="2"/>`; more = `<circle cx="${x - 12}" cy="76" r="4" fill="#e88" opacity=".6"/><circle cx="${x + 15}" cy="76" r="4" fill="#e88" opacity=".6"/>`; break;
  }
  const cheeks = ['happy', 'big', 'delight', 'hope', undefined].includes(mood) ? `<circle cx="${x - 11}" cy="75" r="3.6" fill="#e77" opacity=".3"/><circle cx="${x + 14}" cy="75" r="3.6" fill="#e77" opacity=".3"/>` : '';
  const glasses = c.glasses ? `<g stroke="#555" stroke-width="1.8" fill="none"><circle cx="${e(-7)}" cy="67" r="6"/><circle cx="${e(7)}" cy="67" r="6"/><path d="M${e(-1)} 67 L${e(1)} 67"/></g>` : '';
  const beard = c.beard ? `<path d="M${x - 16} 74 Q${x - 14} 94 ${x + 1} 94 Q${x + 16} 94 ${x + 17} 74 Q${x + 9} 84 ${x + 1} 84 Q${x - 8} 84 ${x - 16} 74 Z" fill="${c.hair}" stroke="${INK}" stroke-width="1.3"/>` : '';
  return cheeks + eyes + brows + glasses + beard + mouth + more;
}
// p: { who, x, mood, L, R, flip (true = faces left), pj (pyjamas), hold (svg drawn at right hand), tag (name tag) }
function person(p) {
  const c = CAST[p.who], x = p.x;
  const top = p.pj ? '#8fb6e0' : c.top;
  const cc = Object.assign({}, c, { top });
  const L = arm(x, -1, p.L || 'down', cc), R = arm(x, 1, p.R || 'down', cc);
  const stripes = p.pj ? `<path d="M${x - 20} 108 H${x + 21} M${x - 21} 120 H${x + 21} M${x - 21} 132 H${x + 22} M${x - 22} 144 H${x + 22}" stroke="#fff" stroke-width="3" opacity=".8"/>` : '';
  const tag = p.tag ? `<rect x="${x - 15}" y="106" width="16" height="11" rx="2" fill="#fff" stroke="${INK}" stroke-width="1.5"/><path d="M${x - 12} 110 h10 M${x - 12} 113.5 h7" stroke="${INK}" stroke-width="1.5"/>` : '';
  const g = `
    <rect x="${x - 16}" y="146" width="12" height="20" rx="3" fill="#3d4250"/><rect x="${x + 4}" y="146" width="12" height="20" rx="3" fill="#3d4250"/>
    <ellipse cx="${x - 10}" cy="168" rx="9" ry="4.5" fill="#222"/><ellipse cx="${x + 12}" cy="168" rx="9" ry="4.5" fill="#222"/>
    <path d="M${x - 20} 104 Q${x - 22} 97 ${x - 13} 95 L${x + 13} 95 Q${x + 22} 97 ${x + 20} 104 L${x + 23} 150 L${x - 23} 150 Z" fill="${top}" stroke="${INK}" stroke-width="1.5"/>${stripes}${tag}
    <rect x="${x - 5}" y="84" width="10" height="13" fill="${c.skin}"/>
    <circle cx="${x}" cy="67" r="20" fill="${c.skin}" stroke="${INK}" stroke-width="1.5"/>
    ${hair(x, c)}${face(x, p.mood || 'happy', c)}
    ${L}${R}${p.hold ? p.hold(x + (POSE[p.R || 'down'][0]), POSE[p.R || 'down'][1]) : ''}`;
  return p.flip ? `<g transform="translate(${2 * x} 0) scale(-1 1)">${g}</g>` : `<g>${g}</g>`;
}

// ---------- things ----------
const T = {
  mug: (x, y, s = 1, steam = true) => `<g transform="translate(${x} ${y}) scale(${s})">${steam ? `<path d="M-8 -34 q-5 -7 0 -14 q5 -7 0 -14 M6 -34 q-5 -7 0 -14 q5 -7 0 -14" stroke="#9aa" stroke-width="3" fill="none" stroke-linecap="round"/>` : ''}
    <path d="M18 -20 q16 0 16 12 q0 12 -16 12" stroke="${INK}" stroke-width="5" fill="none"/><path d="M-20 -28 h38 v36 q0 10 -10 10 h-18 q-10 0 -10 -10 z" fill="#fbf6ec" stroke="${INK}" stroke-width="2.2"/>
    <ellipse cx="-1" cy="-27" rx="18" ry="4" fill="#b8763a"/><path d="M6 -27 L10 -6" stroke="#777" stroke-width="1.5"/><rect x="5" y="-8" width="10" height="11" rx="1.5" fill="#e45c4a" stroke="${INK}" stroke-width="1.2"/></g>`,
  cup: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-6 -30 q-5 -7 0 -14 q5 -7 0 -14 M8 -30 q-5 -7 0 -14 q5 -7 0 -14" stroke="#9aa" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="0" cy="6" rx="34" ry="7" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M19 -14 q13 0 13 9 q0 9 -13 9" stroke="${INK}" stroke-width="4.5" fill="none"/>
    <path d="M-22 -22 h42 q0 26 -21 26 q-21 0 -21 -26 z" fill="#fff" stroke="${INK}" stroke-width="2.2"/><ellipse cx="-1" cy="-22" rx="21" ry="4.5" fill="#5a3218"/><path d="M-6 -23 q5 -4 5 1 q0 -5 5 -1 q-1 4 -5 5 q-4 -1 -5 -5 z" fill="#f4e3c9"/>
    <ellipse cx="44" cy="2" rx="6" ry="8" fill="#5a3218" transform="rotate(30 44 2)"/><path d="M40 -3 q4 5 8 10" stroke="#2e180a" stroke-width="1.5" fill="none"/></g>`,
  glass: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-18 -40 h36 l-5 52 h-26 z" fill="#e8f5fc" stroke="#4f86b0" stroke-width="2.5"/><path d="M-16.5 -24 h33 l-3.6 36 h-25.8 z" fill="#8cc9ee" opacity=".85"/>
    <path d="M-10 -18 v22" stroke="#fff" stroke-width="3" opacity=".7" stroke-linecap="round"/><path d="M30 -30 q-7 10 0 14 q7 -4 0 -14 z" fill="#5fb0e6" stroke="#2f6f9f" stroke-width="1.5"/></g>`,
  milk: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-11 -52 h22 v10 l8 12 v44 q0 4 -4 4 h-30 q-4 0 -4 -4 v-44 l8 -12 z" fill="#fff" stroke="${INK}" stroke-width="2.2"/><rect x="-12" y="-60" width="24" height="9" rx="3" fill="#2f6fd6" stroke="${INK}" stroke-width="1.5"/>
    <rect x="-17" y="-18" width="34" height="22" rx="3" fill="#cfe2ff" stroke="#2f6fd6" stroke-width="1.5"/><path d="M-6 -8 q6 -10 12 0 q0 6 -6 6 q-6 0 -6 -6z" fill="#fff" stroke="#2f6fd6" stroke-width="1.2"/><circle cx="-9" cy="-34" r="3" fill="${INK}"/><circle cx="7" cy="-28" r="4" fill="${INK}"/></g>`,
  sugar: (x, y, s = 1) => { const cube = (cx, cy) => `<g transform="translate(${cx} ${cy})"><path d="M0 -12 l14 -7 14 7 -14 7 z" fill="#fff" stroke="#888" stroke-width="1.5"/><path d="M0 -12 v16 l14 7 v-16 z" fill="#ececec" stroke="#888" stroke-width="1.5"/><path d="M28 -12 v16 l-14 7 v-16 z" fill="#dcdcdc" stroke="#888" stroke-width="1.5"/></g>`;
    return `<g transform="translate(${x} ${y}) scale(${s})">${cube(-30, 6)}${cube(0, 6)}${cube(-15, -14)}<circle cx="34" cy="8" r="1.6" fill="#ccc"/><circle cx="40" cy="2" r="1.3" fill="#ccc"/></g>`; },
  loaf: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-40 6 q-4 -34 22 -40 q18 -6 36 0 q26 6 22 40 z" fill="#c98a3d" stroke="${INK}" stroke-width="2.2"/><path d="M-22 -24 l-6 12 M-4 -28 l-6 12 M14 -27 l-6 12 M30 -20 l-6 12" stroke="#8a5420" stroke-width="3" stroke-linecap="round"/><path d="M-40 6 h80" stroke="${INK}" stroke-width="2.2"/></g>`,
  sandwich: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-40 8 L0 -38 L40 8 Z" fill="#f2d49a" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M-36 4 q8 -6 14 0 q7 -6 14 0 q7 -6 14 0 q7 -6 14 0 q7 -6 14 0 q4 -2 8 0" stroke="#4ea83a" stroke-width="5" fill="none"/>
    <path d="M-34 10 h68" stroke="#d9443a" stroke-width="5"/><path d="M-40 16 L40 16 L36 10 L-36 10 Z" fill="#f2d49a" stroke="${INK}" stroke-width="2"/></g>`,
  cake: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-38 10 L-38 -14 L34 -30 L34 -6 Z" fill="#f6dfb0" stroke="${INK}" stroke-width="2.2"/><path d="M-38 -2 L34 -18" stroke="#c0446a" stroke-width="5"/><path d="M-38 -14 L34 -30 L38 -32 Q0 -34 -40 -16 Z" fill="#fff" stroke="${INK}" stroke-width="2"/>
    <circle cx="-4" cy="-34" r="7" fill="#d81f3c" stroke="${INK}" stroke-width="1.6"/><path d="M-2 -40 q4 -8 10 -10" stroke="#3a7a2a" stroke-width="2" fill="none"/><ellipse cx="-2" cy="14" rx="48" ry="6" fill="#fff" stroke="${INK}" stroke-width="1.8"/></g>`,
  // scone: a golden round with a cracked top and raisins, with a little jam pot beside it (no filling, so it can't look like a burger)
  scone: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="12" rx="52" ry="8" fill="#fff" stroke="${INK}" stroke-width="1.8"/>
    ${[-20, 14].map((cx) => `<g transform="translate(${cx} 0)"><path d="M-16 10 q-4 -10 -2 -20 q2 -10 18 -11 q16 1 18 11 q2 10 -2 20 z" fill="#e3b064" stroke="${INK}" stroke-width="2"/><path d="M-14 -8 q14 -8 28 0" fill="#c98a3a" opacity=".55"/><path d="M-12 -2 h24" stroke="#fff5e0" stroke-width="2" opacity=".8"/><circle cx="-6" cy="3" r="1.9" fill="#5a2a14"/><circle cx="6" cy="-4" r="1.9" fill="#5a2a14"/></g>`).join('')}
    <g transform="translate(46 -6)"><rect x="-9" y="-8" width="18" height="20" rx="3" fill="#c8213a" stroke="${INK}" stroke-width="1.8"/><rect x="-10" y="-13" width="20" height="6" rx="2" fill="#f4f4f4" stroke="${INK}" stroke-width="1.5"/><path d="M-10 -10 h20" stroke="#d0453a" stroke-width="2" stroke-dasharray="3 2"/></g></g>`,
  biscuits: (x, y, s = 1) => { const b = (cy) => `<ellipse cx="0" cy="${cy}" rx="32" ry="10" fill="#e3b264" stroke="${INK}" stroke-width="2"/><ellipse cx="0" cy="${cy - 3}" rx="28" ry="6" fill="#ecc27c"/><circle cx="-12" cy="${cy - 4}" r="1.6" fill="#a8722a"/><circle cx="2" cy="${cy - 2}" r="1.6" fill="#a8722a"/><circle cx="14" cy="${cy - 5}" r="1.6" fill="#a8722a"/>`;
    return `<g transform="translate(${x} ${y}) scale(${s})">${b(10)}${b(-2)}${b(-14)}</g>`; },
  bill: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 -22 h28 v40 l-4.6 -4 -4.6 4 -4.6 -4 -4.6 4 -4.6 -4 -4.6 4 z" fill="#fff" stroke="${INK}" stroke-width="1.8"/><path d="M-9 -14 h18 M-9 -8 h12 M-9 -2 h18 M-9 4 h10" stroke="#777" stroke-width="1.8"/><path d="M-9 10 h18" stroke="${INK}" stroke-width="2.2"/></g>`,
  note: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-17" y="-10" width="34" height="20" rx="2" fill="#9ed29a" stroke="#2c6b2a" stroke-width="1.8"/><circle cx="0" cy="0" r="6" fill="none" stroke="#2c6b2a" stroke-width="1.8"/><text x="0" y="3.6" font-size="9" font-weight="700" text-anchor="middle" fill="#2c6b2a" font-family="sans-serif">€</text></g>`,
  tag: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-22 -14 h32 l14 14 -14 14 h-32 z" fill="#ffd34d" stroke="${INK}" stroke-width="2"/><circle cx="4" cy="0" r="3" fill="#fff" stroke="${INK}" stroke-width="1.5"/><text x="-10" y="7" font-size="20" font-weight="800" text-anchor="middle" fill="${INK}" font-family="sans-serif">€</text></g>`,
  nametag: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-20" y="-13" width="40" height="26" rx="4" fill="#fff" stroke="${INK}" stroke-width="2"/><rect x="-20" y="-13" width="40" height="8" rx="3" fill="#e45c4a"/><path d="M-12 2 h24 M-12 8 h14" stroke="#555" stroke-width="2.2"/></g>`,
  broken: (x, y) => `<g transform="translate(${x} ${y})"><path d="M-22 0 l6 -14 8 6 -2 8 z" fill="#fbf6ec" stroke="${INK}" stroke-width="1.8"/><path d="M2 0 l4 -16 12 4 -4 12 z" fill="#fbf6ec" stroke="${INK}" stroke-width="1.8"/><ellipse cx="0" cy="3" rx="30" ry="4" fill="#b8763a" opacity=".7"/><path d="M-6 -4 l3 -6" stroke="${INK}" stroke-width="1.5"/></g>`,
};
// symbols for speech bubbles
const S = {
  q: (x, y, s = 1) => `<text x="${x}" y="${y + 9 * s}" font-size="${26 * s}" font-weight="800" text-anchor="middle" fill="${INK}" font-family="sans-serif">?</text>`,
  tick: (x, y, s = 1) => `<path d="M${x - 9 * s} ${y} l${6 * s} ${7 * s} ${12 * s} ${-14 * s}" stroke="#2e9d62" stroke-width="${5 * s}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  cross: (x, y, s = 1) => `<path d="M${x - 8 * s} ${y - 8 * s} l${16 * s} ${16 * s} M${x + 8 * s} ${y - 8 * s} l${-16 * s} ${16 * s}" stroke="#d0453a" stroke-width="${5 * s}" stroke-linecap="round"/>`,
  heart: (x, y, s = 1, col = '#e0465f') => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 9 C-14 0 -12 -12 -5 -12 C-2 -12 0 -9 0 -7 C0 -9 2 -12 5 -12 C12 -12 14 0 0 9 Z" fill="${col}" stroke="${INK}" stroke-width="1.2"/>`,
  clock: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="12" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M0 0 V-8 M0 0 L6 3" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/></g>`,
  sun: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="9" fill="#ffc83d" stroke="#d99a00" stroke-width="1.5"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M0 -13 V-18" stroke="#d99a00" stroke-width="2.4" stroke-linecap="round" transform="rotate(${a})"/>`).join('')}</g>`,
  moon: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M4 -14 A14 14 0 1 0 12 8 A11 11 0 1 1 4 -14 Z" fill="#ffe28a" stroke="#c9a100" stroke-width="1.5"/></g>`,
  star: (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -6 L1.8 -1.8 L6 0 L1.8 1.8 L0 6 L-1.8 1.8 L-6 0 L-1.8 -1.8 Z" fill="#ffe28a"/>`,
  zzz: (x, y) => `<text x="${x}" y="${y}" font-size="16" font-weight="800" fill="#5a6fb0" font-family="sans-serif">z<tspan dx="1" dy="-7" font-size="13">z</tspan><tspan dx="1" dy="-6" font-size="10">z</tspan></text>`,
  faces: (x, y) => [[-15, 'M-3 2 q3 3 6 0'], [0, 'M-3 2 h6'], [15, 'M-3 3 q3 -3 6 0']].map(([dx, m], i) => `<g transform="translate(${x + dx} ${y})"><circle r="6.5" fill="${['#9be0a8', '#ffe08a', '#f5a3a3'][i]}" stroke="${INK}" stroke-width="1.3"/><circle cx="-2.2" cy="-1.5" r="1" fill="${INK}"/><circle cx="2.2" cy="-1.5" r="1" fill="${INK}"/><path d="${m}" stroke="${INK}" stroke-width="1.2" fill="none"/></g>`).join(''),
  back: (x, y) => `<path d="M${x + 12} ${y + 6} q0 -12 -12 -12 h-10 m6 -6 l-6 6 6 6" stroke="#2f6fd6" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  snow: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="#5aa0d6" stroke-width="2.4" stroke-linecap="round">${[0, 60, 120].map((a) => `<path d="M0 -11 V11 M-4 -8 L0 -4 L4 -8 M-4 8 L0 4 L4 8" transform="rotate(${a})" fill="none"/>`).join('')}</g>`,
  steam: (x, y) => `<path d="M${x - 8} ${y} q-5 -7 0 -14 q5 -7 0 -14 M${x + 6} ${y} q-5 -7 0 -14 q5 -7 0 -14" stroke="#c55" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`,
  sparkle: (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -9 Q1 -1 9 0 Q1 1 0 9 Q-1 1 -9 0 Q-1 -1 0 -9 Z" fill="#ffd34d" stroke="#c99a00" stroke-width="1"/>`,
};
function bubble(x, y, w, h, tx, ty, inner) {
  return `<g><path d="M${x + 10} ${y} h${w - 20} q10 0 10 10 v${h - 20} q0 10 -10 10 h-${(w - 20) / 2 - 8} L${tx} ${ty} L${x + w / 2 - 4} ${y + h} h-${(w - 20) / 2 - 4} q-10 0 -10 -10 v-${h - 20} q0 -10 10 -10 z" fill="#fff" stroke="${INK}" stroke-width="2"/>${inner}</g>`;
}
const floor = (col) => `<rect x="0" y="160" width="240" height="20" fill="${col}"/>`;
const counter = `<rect x="150" y="112" width="100" height="56" fill="#9a6a3c" stroke="${INK}" stroke-width="1.5"/><rect x="146" y="106" width="104" height="9" rx="2" fill="#c9925a" stroke="${INK}" stroke-width="1.5"/>`;
const door = (x, open) => `<rect x="${x}" y="58" width="50" height="104" fill="#6b4a2e" stroke="${INK}" stroke-width="2"/>${open ? `<rect x="${x + 3}" y="61" width="44" height="98" fill="#fff6d6"/><path d="M${x + 3} 61 L${x - 14} 52 L${x - 14} 170 L${x + 3} 159 Z" fill="#a8774a" stroke="${INK}" stroke-width="2"/>` : `<rect x="${x + 6}" y="64" width="38" height="92" fill="#8a6040"/><circle cx="${x + 40}" cy="112" r="3" fill="#ffd34d"/>`}`;

// ---------- the scenes, one per phrase ----------
const U1 = '#e3f0ec', U2 = '#f6eadb', NIGHT = '#2c3560';
const SC = {
  hello:   [U1, () => person({ who: 'nora', x: 78, R: 'wave', mood: 'big' }) + person({ who: 'peadar', x: 168, flip: true, mood: 'neutral' })],
  reply:   [U1, () => person({ who: 'nora', x: 70, R: 'wave', mood: 'happy' }) + person({ who: 'peadar', x: 166, flip: true, L: 'wave', mood: 'big' }) + bubble(98, 8, 48, 34, 128, 50, S.back(122, 27))],
  hi:      [U1, () => person({ who: 'cian', x: 120, R: 'raise', L: 'hip', mood: 'big' }) + `<path d="M150 28 q8 6 8 16 M158 22 q11 8 11 22" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`],
  welcome: [U1, () => door(160, true) + person({ who: 'nora', x: 96, L: 'open', R: 'open', mood: 'big' })],
  howareyou: [U1, () => person({ who: 'nora', x: 62, R: 'present', mood: 'ask' }) + person({ who: 'peadar', x: 184, flip: true, mood: 'neutral' }) + bubble(70, 6, 84, 40, 78, 52, S.faces(104, 26) + S.q(140, 16, .8))],
  imwell:  [U1, () => person({ who: 'peadar', x: 120, R: 'thumbs', L: 'thumbs', mood: 'big' }) + S.sun(196, 34, 1.3)],
  notbad:  [U1, () => person({ who: 'peadar', x: 112, R: 'flat', mood: 'neutral' }) + bubble(150, 10, 60, 44, 140, 60, `<g transform="translate(180 32)"><circle r="12" fill="#ffe08a" stroke="${INK}" stroke-width="1.6"/><circle cx="-4" cy="-3" r="1.8" fill="${INK}"/><circle cx="4" cy="-3" r="1.8" fill="${INK}"/><path d="M-5 5 h10" stroke="${INK}" stroke-width="2" stroke-linecap="round"/></g>`)],
  tired:   [U1, () => person({ who: 'mamo', x: 112, R: 'yawn', mood: 'tired' }) + S.zzz(150, 44) + S.zzz(176, 26)],
  whatsname: [U1, () => person({ who: 'mamo', x: 62, R: 'point', mood: 'ask' }) + person({ who: 'nora', x: 184, flip: true, mood: 'happy' }) + bubble(78, 4, 74, 44, 84, 54, T.nametag(102, 26, .8) + S.q(136, 18, .9))],
  isme:    [U1, () => person({ who: 'nora', x: 104, R: 'self', mood: 'big' }) + bubble(140, 8, 76, 54, 126, 66, T.nametag(178, 34, 1.1)) + `<path d="M174 94 q-20 6 -40 16" stroke="#2f6fd6" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M140 104 l-7 6 9 2" stroke="#2f6fd6" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`],
  thisis:  [U1, () => person({ who: 'nora', x: 70, R: 'present', mood: 'happy' }) + person({ who: 'peadar', x: 172, flip: true, mood: 'big' }) + `<path d="M118 76 q20 -14 30 -4" stroke="#2f6fd6" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M144 66 l5 6 -7 3" stroke="#2f6fd6" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`],
  nicetomeet: [U1, () => person({ who: 'mamo', x: 78, R: 'shake', mood: 'big' }) + person({ who: 'peadar', x: 162, flip: true, R: 'shake', mood: 'big' }) + S.heart(120, 50, 1)],
  bye:     [U1, () => door(168, true) + person({ who: 'cian', x: 120, flip: true, R: 'wave', mood: 'happy' })],
  byefornow: [U1, () => person({ who: 'cian', x: 96, R: 'wave', mood: 'happy' }) + bubble(138, 10, 60, 44, 128, 60, S.clock(168, 32, 1.1))],
  seeyou:  [U1, () => person({ who: 'cian', x: 92, R: 'wave', mood: 'big' }) + bubble(132, 6, 96, 48, 124, 60, S.sun(152, 30, .8) + `<path d="M166 30 h18 m-6 -6 l6 6 -6 6" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` + S.moon(206, 30, .8))],
  night:   [NIGHT, () => S.moon(196, 36, 1.4) + S.star(40, 30) + S.star(70, 16) + S.star(150, 22) + S.star(222, 80) + person({ who: 'mamo', x: 110, pj: true, R: 'wave', mood: 'delight' }) + S.zzz(140, 44)],
  please:  [U1, () => person({ who: 'cian', x: 92, R: 'present', L: 'present', mood: 'hope' }) + bubble(140, 12, 64, 46, 128, 64, S.heart(172, 36, 1.1, '#f6a6c1'))],
  thanks:  [U1, () => person({ who: 'nora', x: 70, R: 'give', mood: 'happy', hold: (x, y) => T.mug(x + 8, y + 8, .45, false) }) + person({ who: 'peadar', x: 176, flip: true, R: 'heart', mood: 'big' }) + S.heart(196, 30, 1.1)],
  yourewelcome: [U1, () => person({ who: 'peadar', x: 70, R: 'heart', mood: 'happy', hold: () => '' }) + T.mug(100, 132, .45, false) + person({ who: 'nora', x: 176, flip: true, R: 'present', L: 'down', mood: 'big' }) + bubble(126, 4, 56, 40, 152, 50, S.tick(154, 24, 1))],
  excuseme: [U1, () => person({ who: 'mamo', x: 156, mood: 'neutral' }) + person({ who: 'cian', x: 76, R: 'tap', mood: 'hope' }) + `<path d="M140 76 l6 -6 M146 84 l8 -2" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`],
  sorry:   [U1, () => person({ who: 'peadar', x: 100, R: 'head', mood: 'sad' }) + T.broken(170, 160)],

  tea:      [U2, () => T.mug(118, 130, 1.6)],
  coffee:   [U2, () => T.cup(110, 128, 1.6)],
  water:    [U2, () => T.glass(120, 128, 1.6)],
  milk:     [U2, () => T.milk(120, 140, 1.5)],
  sugar:    [U2, () => T.sugar(118, 120, 1.9)],
  bread:    [U2, () => T.loaf(120, 116, 1.5)],
  sandwich: [U2, () => T.sandwich(120, 112, 1.6)],
  cake:     [U2, () => T.cake(118, 118, 1.5)],
  scone:    [U2, () => T.scone(120, 110, 1.6)],
  biscuits: [U2, () => T.biscuits(120, 112, 1.6)],

  wanttea:   [U2, () => counter + person({ who: 'peadar', x: 80, R: 'point', mood: 'hope' }) + bubble(120, 4, 76, 62, 104, 70, T.mug(156, 52, .55, false))],
  wantcoffee:[U2, () => counter + person({ who: 'cian', x: 80, R: 'point', mood: 'hope' }) + bubble(120, 4, 76, 62, 104, 70, T.cup(154, 48, .55))],
  wantmilk:  [U2, () => person({ who: 'nora', x: 80, R: 'give', mood: 'ask', hold: (x, y) => T.milk(x + 8, y + 14, .5) }) + person({ who: 'peadar', x: 186, flip: true, mood: 'neutral' }) + bubble(110, 4, 56, 44, 104, 56, S.q(138, 22, 1))],
  yes:       [U2, () => person({ who: 'peadar', x: 100, R: 'thumbs', mood: 'big' }) + `<path d="M76 40 q-8 -6 -6 -14 M124 40 q8 -6 6 -14" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` + bubble(146, 12, 60, 46, 132, 62, S.tick(176, 34, 1.4))],
  no:        [U2, () => person({ who: 'peadar', x: 100, R: 'stop', mood: 'neutral' }) + `<path d="M70 62 q-8 6 0 12 M130 62 q8 6 0 12" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` + bubble(146, 12, 60, 46, 132, 62, S.cross(176, 34, 1.3))],
  nice:      [U2, () => person({ who: 'mamo', x: 108, R: 'sip', mood: 'happy', hold: (x, y) => T.mug(x + 4, y + 10, .38, false) }) + S.heart(160, 50, 1.2) + S.heart(178, 30, .9)],
  hot:       [U2, () => person({ who: 'cian', x: 92, R: 'give', mood: 'blow', hold: (x, y) => T.mug(x + 6, y + 10, .5, false) + S.steam(x + 6, y - 14) }) + `<g transform="translate(186 70)"><path d="M0 26 q-16 -12 -6 -28 q2 10 8 10 q-2 -14 10 -24 q-2 14 8 22 q8 10 -2 20 z" fill="#ff8a3d" stroke="${INK}" stroke-width="1.8"/></g>`],
  cold:      [U2, () => person({ who: 'cian', x: 96, L: 'cross', R: 'cross', mood: 'cold' }) + T.mug(184, 150, .6, false) + S.snow(184, 92, 1.3)],
  bill:      [U2, () => person({ who: 'peadar', x: 96, R: 'raise', mood: 'hope' }) + bubble(140, 12, 64, 66, 128, 70, T.bill(172, 46, 1))],
  howmuch:   [U2, () => person({ who: 'cian', x: 82, R: 'point', mood: 'ask' }) + T.scone(186, 140, .6) + T.tag(186, 72, 1.1) + S.q(190, 44, 1.1)],
  hereyougo: [U2, () => person({ who: 'peadar', x: 72, R: 'give', mood: 'happy', hold: (x, y) => T.note(x + 10, y, .9) }) + person({ who: 'nora', x: 178, flip: true, R: 'present', mood: 'happy' })],
  thanksmil: [U2, () => person({ who: 'nora', x: 112, R: 'heart', L: 'heart', mood: 'delight' }) + S.heart(52, 50, 1.2) + S.heart(168, 34, 1.4) + S.heart(190, 70, 1) + S.heart(62, 92, .9) + S.heart(176, 110, .8)],
};
// lovely: sparkles only (a cake in the picture would be confused with 'cake')
SC.lovely =[U2, () => person({ who: 'mamo', x: 104, R: 'heart', L: 'heart', mood: 'delight' }) + S.sparkle(156, 40, 1.4) + S.sparkle(178, 76, 1) + S.sparkle(56, 34, 1.1) + S.sparkle(48, 80, .8)];

function PIC(id) {
  const s = SC[id];
  if (!s) return `<svg viewBox="0 0 240 180" class="pic-svg"><rect width="240" height="180" rx="18" fill="#eee"/></svg>`;
  const [bg, draw] = s;
  return `<svg viewBox="0 0 240 180" class="pic-svg" role="img" aria-hidden="true"><rect width="240" height="180" rx="18" fill="${bg}"/>${bg === NIGHT ? floor('#232a4d') : floor(bg === U2 ? '#ead6bd' : '#cfe3dc')}${draw()}</svg>`;
}

// ---------- Giorria the hare ----------
// mood: happy | cheer | think | sleepy | dance ; outfit: '' | cap | scarf | shades
function HARE(mood = 'happy', outfit = '') {
  const fur = '#b98a5e', light = '#efdcc4', dark = INK;
  const tilt = mood === 'dance' ? 'rotate(-8 60 80)' : '';
  const eyes = mood === 'sleepy' ? `<path d="M48 54 q4 3 8 0 M66 54 q4 3 8 0" stroke="${dark}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
    : mood === 'think' ? `<circle cx="53" cy="52" r="3.4" fill="${dark}"/><circle cx="70" cy="52" r="3.4" fill="${dark}"/><circle cx="54.5" cy="50.5" r="1.1" fill="#fff"/><circle cx="71.5" cy="50.5" r="1.1" fill="#fff"/>`
    : `<circle cx="52" cy="54" r="3.8" fill="${dark}"/><circle cx="69" cy="54" r="3.8" fill="${dark}"/><circle cx="53.4" cy="52.5" r="1.3" fill="#fff"/><circle cx="70.4" cy="52.5" r="1.3" fill="#fff"/>`;
  const mouth = mood === 'think' ? `<path d="M56 68 h8" stroke="${dark}" stroke-width="2" stroke-linecap="round"/>` : mood === 'sleepy' ? `<ellipse cx="60" cy="69" rx="2.5" ry="3" fill="#7a2b2b"/>` : `<path d="M54 66 q6 7 12 0" stroke="${dark}" stroke-width="2" fill="#fff" stroke-linecap="round"/>`;
  const arms = mood === 'cheer' || mood === 'dance'
    ? `<path d="M40 92 q-14 -10 -16 -26" stroke="${fur}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M80 92 q14 -10 16 -26" stroke="${fur}" stroke-width="9" fill="none" stroke-linecap="round"/>`
    : mood === 'think' ? `<path d="M78 96 q6 -14 -10 -26" stroke="${fur}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M40 96 q-6 8 -2 16" stroke="${fur}" stroke-width="9" fill="none" stroke-linecap="round"/>`
    : `<path d="M40 94 q-6 10 -2 18" stroke="${fur}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M80 94 q6 10 2 18" stroke="${fur}" stroke-width="9" fill="none" stroke-linecap="round"/>`;
  const wear = outfit === 'cap' ? `<path d="M40 40 q2 -14 22 -14 q18 0 20 12 z" fill="#5a4a3d" stroke="${dark}" stroke-width="1.5"/><path d="M66 36 q16 -2 22 4 q-10 3 -22 2 z" fill="#4a3d32" stroke="${dark}" stroke-width="1.5"/>`
    : outfit === 'scarf' ? `<path d="M40 78 q20 10 40 0 l2 9 q-22 10 -44 0 z" fill="#d0453a" stroke="${dark}" stroke-width="1.5"/><path d="M70 84 l4 22 8 -2 -4 -20" fill="#d0453a" stroke="${dark}" stroke-width="1.5"/><path d="M46 82 v6 M56 85 v6 M66 85 v6" stroke="#fff" stroke-width="2.5"/>`
    : outfit === 'shades' ? `<path d="M42 50 h36" stroke="${dark}" stroke-width="2.5"/><rect x="43" y="48" width="15" height="10" rx="4" fill="${dark}"/><rect x="62" y="48" width="15" height="10" rx="4" fill="${dark}"/>` : '';
  const zz = mood === 'sleepy' ? S.zzz(84, 30) : '';
  return `<svg viewBox="0 0 120 140" class="hare" aria-hidden="true"><g transform="${tilt}">
    <ellipse cx="60" cy="132" rx="34" ry="5" fill="#000" opacity=".12"/>
    <ellipse cx="44" cy="22" rx="8" ry="26" fill="${fur}" stroke="${dark}" stroke-width="1.6" transform="rotate(-12 44 22)"/><ellipse cx="44" cy="24" rx="3.6" ry="18" fill="#f2b5b5" transform="rotate(-12 44 22)"/>
    <ellipse cx="76" cy="22" rx="8" ry="26" fill="${fur}" stroke="${dark}" stroke-width="1.6" transform="rotate(14 76 22)"/><ellipse cx="76" cy="24" rx="3.6" ry="18" fill="#f2b5b5" transform="rotate(14 76 22)"/>
    <ellipse cx="60" cy="102" rx="26" ry="28" fill="${fur}" stroke="${dark}" stroke-width="1.6"/><ellipse cx="60" cy="106" rx="15" ry="18" fill="${light}"/>
    <ellipse cx="44" cy="128" rx="11" ry="5" fill="${fur}" stroke="${dark}" stroke-width="1.4"/><ellipse cx="76" cy="128" rx="11" ry="5" fill="${fur}" stroke="${dark}" stroke-width="1.4"/>
    ${arms}
    <circle cx="60" cy="58" r="23" fill="${fur}" stroke="${dark}" stroke-width="1.6"/><ellipse cx="60" cy="66" rx="12" ry="9" fill="${light}"/>
    ${eyes}<ellipse cx="60" cy="61" rx="3.6" ry="2.6" fill="#e07a8a"/>${mouth}
    <path d="M47 63 h-12 M47 66 l-11 3 M73 63 h12 M73 66 l11 3" stroke="${dark}" stroke-width="1" opacity=".6"/>
    <circle cx="45" cy="64" r="3.4" fill="#e77" opacity=".3"/><circle cx="75" cy="64" r="3.4" fill="#e77" opacity=".3"/>
    ${wear}${zz}</g></svg>`;
}

self.PIC = PIC;
self.HARE = HARE;
self.CAST = CAST;
self.PERSON_ICON = (who) => `<svg viewBox="40 30 80 80" class="who" aria-hidden="true">${person({ who, x: 80, mood: 'happy' })}</svg>`;
})();
