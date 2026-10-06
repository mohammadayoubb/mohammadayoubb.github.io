(function () {
  'use strict';

  /* =======================================================
     World constants (SVG units). Ground (sidewalk top) is y=500.
     ======================================================= */
  var W = 6200, H = 600, FAR_W = 2600, MID_W = 3900;
  var STOPS = [
    { id: 'start',       x: 300,  label: 'Start' },
    { id: 'soukpilot',   x: 1150, label: 'SoukPilot AI' },
    { id: 'maintainers', x: 2060, label: "Maintainer's Copilot" },
    { id: 'decision',    x: 2950, label: 'Decision Intelligence' },
    { id: 'realestate',  x: 3850, label: 'AI Real Estate Agent' },
    { id: 'campus',      x: 4800, label: 'Experience' },
    { id: 'contact',     x: 5720, label: 'Contact' }
  ];
  var NEAR = 190; // how close (units) the hero must be to "arrive" at a stop

  var svgNS = 'http://www.w3.org/2000/svg';
  function svg(vbW, vbH, inner, cls) {
    return '<svg xmlns="' + svgNS + '" viewBox="0 0 ' + vbW + ' ' + vbH + '" preserveAspectRatio="xMinYMax meet"' + (cls ? ' class="' + cls + '"' : '') + '>' + inner + '</svg>';
  }
  function r(x, y, w, h, cls, extra) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" class="' + cls + '"' + (extra || '') + '/>'; }
  function p(d, cls, extra) { return '<path d="' + d + '" class="' + cls + '"' + (extra || '') + '/>'; }
  function c(cx, cy, rr, cls, extra) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + rr + '" class="' + cls + '"' + (extra || '') + '/>'; }
  function t(x, y, size, cls, txt, extra) { return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" class="' + cls + '" text-anchor="middle"' + (extra || '') + '>' + txt + '</text>'; }
  function g(x, y, inner, extra) { return '<g transform="translate(' + x + ',' + y + ')"' + (extra || '') + '>' + inner + '</g>'; }

  // Deterministic pseudo-random so the skyline looks the same every visit
  var seed = 7;
  function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

  /* ---------- Props ---------- */
  function lamp(x) {
    return g(x, 0,
      c(22, 338, 70, 'glow', ' fill="url(#lampglow)"') +
      r(-4, 330, 8, 170, 'f-pole') +
      p('M0 340 Q0 316 22 316', 'f-none s-pole', ' stroke-width="7" stroke-linecap="round"') +
      p('M10 318 h24 l-5 16 h-14 Z', 'lamp-head st2') +
      r(-10, 492, 20, 8, 'f-pole'));
  }
  function palm(x) {
    var top = 'M0 0';
    return g(x, 0,
      p('M0 500 Q14 420 6 330', 'f-none s-trunk', ' stroke-width="14" stroke-linecap="round"') +
      p('M0 500 Q14 420 6 330', 'f-none', ' stroke="var(--ink)" stroke-width="3" stroke-dasharray="2 12" stroke-linecap="round"') +
      g(6, 330,
        p('M0 0 Q-40 -30 -78 6 Q-40 -12 0 4 Z', 'f-green st2') +
        p('M0 0 Q40 -34 80 4 Q40 -12 0 4 Z', 'f-green st2') +
        p('M0 0 Q-20 -50 -54 -52 Q-26 -30 -2 2 Z', 'f-green2 st2') +
        p('M0 0 Q24 -52 58 -48 Q28 -28 2 2 Z', 'f-green2 st2') +
        p('M0 2 Q-30 10 -48 42 Q-22 18 2 6 Z', 'f-green2 st2') +
        p('M0 2 Q30 10 50 40 Q24 18 -2 6 Z', 'f-green st2') +
        c(-4, 6, 6, 'f-trunk st2') + c(6, 8, 6, 'f-trunk st2')));
  }
  function cedar(x, s) {
    s = s || 1;
    var tiers = '';
    // Lebanese cedar: wide, flat, layered tiers
    var widths = [78, 70, 60, 42], offs = [0, 8, -6, 4];
    for (var i = 0; i < 4; i++) {
      var w = widths[i] * s, y = 462 - i * 26 * s, o = offs[i] * s;
      tiers += p('M' + (o - w) + ' ' + y + ' Q' + (o - w * .5) + ' ' + (y - 20 * s) + ' ' + o + ' ' + (y - 22 * s) + ' Q' + (o + w * .5) + ' ' + (y - 20 * s) + ' ' + (o + w) + ' ' + y + ' Q' + o + ' ' + (y - 6 * s) + ' ' + (o - w) + ' ' + y + ' Z', (i % 2 ? 'f-green2' : 'f-green') + ' st2');
    }
    return g(x, 0, r(-7, 430, 14, 70, 'f-trunk st2') + p('M0 452 L-30 440 M0 430 L26 418', 'f-none s-trunk', ' stroke-width="6" stroke-linecap="round"') + tiers);
  }
  function bench(x) {
    return g(x, 0, r(0, 474, 80, 8, 'f-wood st2') + r(0, 460, 80, 7, 'f-wood st2') + r(8, 482, 6, 18, 'f-pole') + r(66, 482, 6, 18, 'f-pole'));
  }
  function railing(x0, x1) {
    var out = r(x0, 466, x1 - x0, 6, 'f-cream st2');
    for (var x = x0 + 10; x < x1; x += 34) out += r(x, 470, 5, 30, 'f-cream st2');
    return out;
  }
  function cat(x) {
    return '<g class="cat" transform="translate(' + x + ',0)" role="button" tabindex="0" aria-label="A Beirut street cat. Pet it.">' +
      p('M-22 500 Q-30 480 -12 470 Q-2 462 8 470 Q16 478 14 500 Z', 'f-cat') +
      c(6, 458, 11, 'f-cat') +
      p('M-2 452 L-2 438 L6 448 Z', 'f-cat') + p('M10 448 L16 437 L16 452 Z', 'f-cat') +
      c(3, 457, 1.8, 'f-accent') + c(10, 457, 1.8, 'f-accent') +
      p('M-22 496 Q-44 494 -40 476', 'f-none', ' stroke="var(--cat)" stroke-width="6" stroke-linecap="round"') +
      '<g class="meow">' + r(-10, 400, 64, 30, 'f-cream st2', ' rx="12"') + t(22, 421, 14, 't-ink', 'meow') + '</g>' +
      '</g>';
  }
  function streetSign(x) {
    return g(x, 0,
      r(-4, 380, 8, 120, 'f-pole') +
      r(-74, 352, 148, 58, 'st2', ' rx="6" fill="#1F4FA0"') +
      r(-68, 358, 136, 46, 'f-none', ' rx="3" stroke="#FFFFFF" stroke-width="2"') +
      '<text x="0" y="378" font-size="17" fill="#FFFFFF" text-anchor="middle" font-family="Segoe UI, Tahoma, sans-serif" font-weight="700" direction="rtl">شارع أيوب</text>' +
      '<text x="0" y="397" font-size="12" fill="#FFFFFF" text-anchor="middle" class="t-sans">Rue Ayoub</text>');
  }
  function billboard(x) {
    return g(x, 0,
      r(-4, 420, 8, 80, 'f-pole') +
      p('M-62 392 h112 l18 20 -18 20 h-112 Z', 'f-sign st2') +
      t(-6, 418, 16, 't-sign', 'PROJECTS'));
  }
  function crate(x, y, fruit) {
    var out = r(x, y, 64, 42, 'f-wood st2') + p('M' + x + ' ' + (y + 14) + ' h64 M' + x + ' ' + (y + 28) + ' h64', 'f-none s-ink', ' stroke-width="2"');
    var cls = fruit === 'cans' ? 'f-coral st2' : 'f-accent st2';
    for (var i = 0; i < 4; i++) {
      out += fruit === 'cans' ? r(x + 6 + i * 14, y - 18, 11, 18, cls, ' rx="2"') : c(x + 10 + i * 15, y - 6, 8, cls);
    }
    return out;
  }
  function archWin(x, y, w, h, cls) {
    var rr = w / 2;
    return p('M' + x + ' ' + (y + h) + ' V' + (y + rr) + ' A' + rr + ' ' + rr + ' 0 0 1 ' + (x + w) + ' ' + (y + rr) + ' V' + (y + h) + ' Z', (cls || 'f-win') + ' st');
  }

  /* ---------- Buildings (local coords, ground y=500) ---------- */
  function soukShop() {
    var o = '';
    o += r(-10, 206, 500, 24, 'f-roof st');
    o += r(0, 228, 480, 272, 'f-sand st');
    // Lebanese triple-arch window
    o += r(160, 244, 160, 84, 'f-wd st', ' rx="4"');
    o += archWin(172, 252, 40, 70) + archWin(220, 252, 40, 70) + archWin(268, 252, 40, 70);
    o += archWin(40, 252, 56, 70) + archWin(384, 252, 56, 70);
    o += r(34, 322, 68, 8, 'f-wood st2') + r(378, 322, 68, 8, 'f-wood st2');
    // sign
    o += r(70, 334, 340, 40, 'f-sign st', ' rx="6"') + t(240, 364, 25, 't-sign', 'SOUKPILOT AI');
    // shop interior
    o += r(36, 392, 408, 108, 'f-dark st');
    for (var s = 0; s < 2; s++) {
      o += r(52, 420 + s * 24, 376, 4, 'f-wood');
      for (var j = 0; j < 12; j++) o += r(60 + j * 30, 404 + s * 24, 14, 16, ['f-coral', 'f-teal', 'f-accent', 'f-cream'][(j + s) % 4] + ' st2', ' rx="2"');
    }
    o += r(36, 456, 408, 44, 'f-wood st');
    o += g(120, 448, r(0, 0, 44, 12, 'f-cream st2', ' transform="rotate(-6)"') + r(36, -2, 44, 12, 'f-white st2', ' transform="rotate(5)"'));
    o += r(320, 432, 46, 24, 'f-concrete st2', ' rx="3"') + r(330, 438, 26, 6, 'f-teal');
    // awning
    for (var i = 0; i < 11; i++) {
      o += r(20 + i * 40, 376, 40, 24, i % 2 ? 'f-cream' : 'f-coral');
      o += p('M' + (20 + i * 40) + ' 400 a20 18 0 0 0 40 0 Z', (i % 2 ? 'f-cream' : 'f-coral') + ' st2');
    }
    o += r(20, 376, 440, 24, 'f-none st');
    // crates
    o += crate(-52, 458, 'fruit') + crate(468, 458, 'cans');
    // chat bubble -> structured order tag
    o += '<g class="bob">' +
      r(230, 108, 270, 58, 'f-white st', ' rx="18"') + p('M262 164 l-8 22 24 -20 Z', 'f-white st2') +
      t(365, 143, 17, 't-sans', 'Bddi 2 Pepsi w 1 chips', ' fill="#1C2238"') + '</g>';
    o += '<g class="bob-slow">' + r(290, 178, 196, 30, 'f-accent st2', ' rx="8"') + t(388, 198, 13, 't-mono', 'intent: new_order ✓', ' fill="#1B1406"') + '</g>';
    return o;
  }

  function workshop() {
    var o = '';
    o += r(-10, 226, 540, 22, 'f-roof st');
    o += r(0, 246, 520, 254, 'f-wc st');
    o += r(28, 262, 336, 46, 'f-sign st', ' rx="6"') + t(196, 295, 24, 't-sign', 'ISSUE TRIAGE');
    // garage
    o += r(30, 324, 334, 176, 'f-dark st');
    o += '<clipPath id="garageclip"><rect x="33" y="327" width="328" height="170"/></clipPath>';
    var tickets = '';
    for (var k = -2; k < 7; k++) tickets += g(40 + k * 60, 0, r(0, 372, 34, 22, 'f-cream st2', ' rx="3"') + r(5, 379, 20, 3, 'f-ink') + r(5, 385, 14, 3, 'f-ink'));
    o += '<g clip-path="url(#garageclip)"><g class="belt">' + tickets + '</g></g>';
    o += r(40, 396, 314, 10, 'f-ink', ' rx="5"') + c(52, 401, 6, 'f-concrete st2') + c(342, 401, 6, 'f-concrete st2');
    var bins = [['BUG', 'f-coral'], ['FEATURE', 'f-teal'], ['DOCS', 'f-cream'], ['QUESTION', 'f-accent']];
    bins.forEach(function (b, i) {
      var bx = 46 + i * 78;
      o += r(bx, 440, 70, 60, b[1] + ' st', ' rx="4"') + t(bx + 35, 476, b[0].length > 5 ? 9.5 : 13, 't-ink', b[0]);
    });
    // roll-up door slats
    o += r(30, 324, 334, 34, 'f-concrete st');
    for (var d = 0; d < 3; d++) o += r(30, 332 + d * 9, 334, 2, 'f-ink');
    // gear, window, door
    o += '<g class="spin">' + c(442, 286, 26, 'f-accent st') + c(442, 286, 10, 'f-wc st2');
    for (var a = 0; a < 8; a++) o += r(438, 252, 8, 12, 'f-accent st2', ' transform="rotate(' + a * 45 + ' 442 286)"');
    o += '</g>';
    o += r(392, 330, 100, 60, 'f-win st') + p('M442 330 V390 M392 360 H492', 'f-none s-ink', ' stroke-width="3"');
    o += r(406, 410, 72, 90, 'f-wood st') + c(466, 456, 3, 'f-ink');
    // panda on the roof, reading a laptop (pandas-dev)
    o += g(150, 0,
      p('M-26 228 Q-30 190 0 186 Q30 190 26 228 Z', 'f-white st') +
      p('M-20 226 Q-24 244 -10 248 Q-4 240 -6 226 Z', 'f-ink') + p('M20 226 Q24 244 10 248 Q4 240 6 226 Z', 'f-ink') +
      c(0, 166, 22, 'f-white st') + c(-15, 148, 8, 'f-ink') + c(15, 148, 8, 'f-ink') +
      p('M-12 162 q-6 4 -4 10 q6 2 9 -4 Z', 'f-ink') + p('M12 162 q6 4 4 10 q-6 2 -9 -4 Z', 'f-ink') +
      c(0, 174, 3.5, 'f-ink') +
      r(-24, 204, 48, 28, 'f-concrete st2', ' rx="3"') + r(-18, 208, 36, 20, 'f-glass') +
      p('M-24 200 q-8 10 2 14 M24 200 q8 10 -2 14', 'f-none s-ink', ' stroke-width="8" stroke-linecap="round"'));
    return o;
  }

  function dispatch() {
    var o = '';
    o += r(0, 400, 66, 100, 'f-wa st') + r(14, 424, 38, 30, 'f-win st');
    o += r(298, 372, 70, 128, 'f-wa st') + r(314, 396, 38, 30, 'f-win st') + r(314, 440, 38, 30, 'f-win st');
    o += r(60, 140, 240, 360, 'f-wb st');
    o += r(50, 122, 260, 22, 'f-roof st');
    o += p('M180 122 V74', 'f-none s-ink', ' stroke-width="5"');
    o += p('M146 96 Q180 128 214 96 Z', 'f-cream st');
    o += c(180, 70, 6, 'f-accent st2');
    o += '<g class="pulse">' +
      p('M196 58 A20 20 0 0 1 196 82', 'f-none s-accent', ' stroke-width="4" stroke-linecap="round"') +
      p('M206 48 A34 34 0 0 1 206 92', 'f-none s-accent', ' stroke-width="4" stroke-linecap="round"') +
      p('M216 38 A48 48 0 0 1 216 102', 'f-none s-accent', ' stroke-width="4" stroke-linecap="round"') + '</g>';
    o += r(88, 164, 184, 108, 'f-sign st', ' rx="12"');
    o += c(138, 204, 24, 'lamp-red st') + c(222, 204, 24, 'lamp-green st');
    o += t(138, 254, 12, 't-sign', 'URGENT') + t(222, 254, 12, 't-sign', 'NORMAL');
    o += r(72, 290, 216, 36, 'f-sign st', ' rx="6"') + t(180, 315, 17, 't-sign', 'SUPPORT DESK');
    for (var row = 0; row < 2; row++) for (var col = 0; col < 3; col++) o += r(88 + col * 66, 342 + row * 46, 52, 32, 'f-win st');
    o += r(148, 440, 64, 60, 'f-wood st') + p('M180 440 V500', 'f-none s-ink', ' stroke-width="3"');
    return o;
  }

  function house() {
    var o = '';
    o += r(262, 246, 32, 62, 'f-tile st');
    o += r(40, 336, 300, 164, 'f-wd st');
    o += p('M8 342 L190 222 L372 342 Z', 'f-tile st');
    o += p('M60 309 L320 309 M100 283 L280 283 M140 257 L240 257', 'f-none s-ink', ' stroke-width="2" opacity=".35"');
    o += c(190, 300, 18, 'f-win st') + p('M190 282 V318 M172 300 H208', 'f-none s-ink', ' stroke-width="2.5"');
    [70, 250].forEach(function (wx) {
      o += r(wx, 364, 62, 52, 'f-win st') + p('M' + (wx + 31) + ' 364 V416 M' + wx + ' 390 H' + (wx + 62), 'f-none s-ink', ' stroke-width="2.5"');
      o += r(wx - 4, 416, 70, 10, 'f-wood st2');
      for (var f = 0; f < 4; f++) o += c(wx + 6 + f * 17, 412, 6, f % 2 ? 'f-coral st2' : 'f-accent st2');
    });
    o += r(160, 420, 60, 80, 'f-wood st') + c(208, 462, 3.5, 'f-ink');
    o += r(0, 478, 400, 6, 'f-cream st2');
    for (var x = 4; x < 400; x += 22) { if (x > 150 && x < 226) continue; o += p('M' + x + ' 500 V472 l5 -6 5 6 V500 Z', 'f-cream st2'); }
    // for-sale sign
    o += r(398, 400, 8, 100, 'f-wood st2');
    o += g(0, 0, r(350, 388, 104, 62, 'f-cream st', ' rx="6"') + t(402, 414, 15, 't-ink', 'FOR SALE', ' fill="var(--coral)"') + t(402, 436, 12, 't-sans', 'price? ask the AI', ' fill="#1C2238"'), ' class="bob-slow"');
    return o;
  }

  function campus() {
    var o = '';
    o += r(0, 196, 360, 304, 'f-concrete st');
    o += r(26, 212, 308, 42, 'f-sign st', ' rx="6"') + t(180, 243, 24, 't-sign', 'SE FACTORY');
    for (var row = 0; row < 2; row++) for (var col = 0; col < 4; col++) o += r(26 + col * 78, 272 + row * 62, 64, 46, 'f-glass st');
    o += r(26, 410, 100, 50, 'f-glass st') + r(234, 410, 100, 50, 'f-glass st');
    o += r(140, 404, 80, 96, 'f-glass st') + p('M180 404 V500', 'f-none s-ink', ' stroke-width="3"');
    o += r(340, 200, 6, 120, 'f-pole') + p('M346 204 h46 l-10 14 10 14 h-46 Z', 'f-accent st2');
    // BAU gate
    o += r(450, 352, 236, 148, 'f-sand st');
    for (var w = 0; w < 3; w++) o += archWin(472 + w * 72, 380, 44, 60);
    o += r(420, 318, 38, 182, 'f-cream st') + r(676, 318, 38, 182, 'f-cream st');
    o += p('M420 322 Q567 236 714 322 L714 342 Q567 262 420 342 Z', 'f-cream st');
    o += r(472, 268, 190, 30, 'f-sign st', ' rx="6"') + t(567, 289, 10.5, 't-sign', 'BEIRUT ARAB UNIVERSITY');
    // graduation cap
    o += '<g class="bob">' + p('M528 196 L567 180 L606 196 L567 212 Z', 'f-ink') + r(549, 198, 36, 16, 'f-ink', ' rx="3"') + p('M603 197 V222', 'f-none s-accent', ' stroke-width="3"') + c(603, 224, 4, 'f-accent') + '</g>';
    return o;
  }

  function postOffice() {
    var o = '';
    o += r(-10, 250, 420, 22, 'f-roof st');
    o += r(0, 270, 400, 230, 'f-wb st');
    o += r(36, 286, 328, 50, 'f-sign st', ' rx="6"') + t(200, 322, 30, 't-sign', 'CONTACT');
    o += r(124, 346, 152, 26, 'f-cream st2', ' rx="4"') + t(200, 364, 12, 't-ink', 'POST OFFICE');
    o += archWin(40, 384, 62, 76) + archWin(298, 384, 62, 76);
    o += r(160, 400, 80, 100, 'f-wood st') + c(226, 452, 3.5, 'f-ink');
    // mailbox
    o += r(436, 452, 10, 48, 'f-pole') + r(410, 392, 62, 64, 'f-accent st', ' rx="12"') + r(422, 410, 38, 7, 'f-ink', ' rx="3"');
    o += '<g class="bob">' + r(414, 326, 54, 34, 'f-cream st2', ' rx="3"') + p('M414 326 L441 346 L468 326', 'f-none s-ink', ' stroke-width="2"') + '</g>';
    // end of street barrier
    o += g(520, 0, r(0, 440, 8, 60, 'f-pole') + r(150, 440, 8, 60, 'f-pole') + r(-6, 426, 170, 22, 'f-white st2', ' rx="4"') +
      [0, 1, 2, 3, 4].map(function (i) { return p('M' + (8 + i * 34) + ' 428 l14 0 -10 18 -14 0 Z', 'f-coral'); }).join('') +
      r(10, 368, 140, 46, 'f-sign st2', ' rx="6"') + t(80, 388, 12, 't-sign', 'END OF STREET') + t(80, 405, 10, 't-sans', 'scroll on: quick view', ' fill="var(--cream)"'));
    return o;
  }

  function building(id, x, inner, label) {
    return '<g class="building" data-open="' + id + '" transform="translate(' + x + ',0)" role="button" tabindex="-1" aria-label="' + label + '">' + inner + '</g>';
  }

  /* ---------- Assemble layers ---------- */
  function buildFar() {
    var o = '';
    o += p('M0 470 L0 380 L120 330 L230 372 L380 300 L520 352 L660 286 L820 346 L980 296 L1130 344 L1290 268 L1450 330 L1600 300 L1780 348 L1950 280 L2110 336 L2270 300 L2450 340 L2600 310 L2600 470 Z', 'f-mount2');
    o += p('M0 470 L0 420 L180 372 L320 404 L470 350 L640 398 L800 356 L960 402 L1120 360 L1300 410 L1460 366 L1640 404 L1820 372 L2000 410 L2180 368 L2380 404 L2600 380 L2600 470 Z', 'f-mount');
    [[660, 286], [1290, 268], [1950, 280], [380, 300]].forEach(function (pk) {
      var x = pk[0], y = pk[1];
      o += p('M' + (x - 30) + ' ' + (y + 22) + ' L' + x + ' ' + y + ' L' + (x + 30) + ' ' + (y + 20) + ' L' + (x + 14) + ' ' + (y + 15) + ' L' + x + ' ' + (y + 24) + ' L' + (x - 14) + ' ' + (y + 15) + ' Z', 'f-snow');
    });
    // Mediterranean + Raouche rocks
    o += r(0, 426, 1500, 80, 'f-sea');
    o += '<g class="wave">';
    for (var i = 0; i < 26; i++) o += r(20 + (i * 137) % 1460, 436 + (i * 23) % 56, 30 + (i * 17) % 40, 3, 'f-sea-hi', ' rx="1.5" opacity=".7"');
    o += '</g>';
    o += '<g transform="translate(-200,0)">';
    o += p('M690 470 L700 382 Q708 342 738 338 Q756 348 760 380 L764 470 Z', 'f-rock');
    o += p('M780 470 L790 396 Q808 344 852 346 Q884 356 886 420 L888 470 L864 470 Q860 432 838 428 Q816 432 812 470 Z', 'f-rock');
    o += '</g>';
    return svg(FAR_W, H, o);
  }

  function buildMid() {
    var o = '', x = 980;
    seed = 11;
    while (x < MID_W) {
      var w = 60 + Math.floor(rnd() * 110), h = 90 + Math.floor(rnd() * 180), cls = rnd() > .5 ? 'f-skyline' : 'f-skyline2';
      o += r(x, 500 - h, w, h + 10, cls);
      for (var wy = 500 - h + 14; wy < 470; wy += 20) for (var wx = x + 10; wx < x + w - 10; wx += 16) if (rnd() > .62) o += r(wx, wy, 7, 9, 'f-skwin');
      if (rnd() > .86) { // construction crane, very Beirut
        var cx = x + w / 2, top = 500 - h - 110;
        o += r(cx - 3, top, 6, 112, 'f-skyline') + r(cx - 70, top, 150, 6, 'f-skyline') + r(cx + 60, top + 6, 2, 40, 'f-skyline') + r(cx + 54, top + 46, 14, 10, 'f-skyline');
      }
      x += w + Math.floor(rnd() * 26);
    }
    return svg(MID_W, H, o);
  }

  function buildWorld() {
    var o = '<defs><radialGradient id="lampglow"><stop offset="0" stop-color="#FFD27A" stop-opacity=".55"/><stop offset="1" stop-color="#FFD27A" stop-opacity="0"/></radialGradient></defs>';
    // back props
    o += railing(0, 860);
    o += palm(110) + palm(860);
    o += billboard(600);
    o += lamp(760) + lamp(1580) + lamp(2490) + lamp(3400) + lamp(4320) + lamp(5280);
    o += cedar(1650) + cedar(3330, .9) + cedar(4330, 1.1) + cedar(5200, .85);
    // buildings
    o += building('soukpilot', 910, soukShop(), 'SoukPilot AI shop. Open the case study.');
    o += building('maintainers', 1800, workshop(), "Maintainer's Copilot workshop. Open the case study.");
    o += building('decision', 2770, dispatch(), 'Decision Intelligence support desk. Open the case study.');
    o += building('realestate', 3640, house(), 'AI Real Estate Agent house. Open the case study.');
    o += building('campus', 4440, campus(), 'Campus. Open experience and skills.');
    o += building('contact', 5490, postOffice(), 'Post office. Contact details.');
    // ground
    o += r(0, 500, W, 30, 'f-sidewalk');
    for (var x = 0; x < W; x += 64) o += r(x, 500, 2, 28, 'f-curb', ' opacity=".7"');
    o += r(0, 528, W, 8, 'f-curb');
    o += r(0, 536, W, 64, 'f-road');
    for (var lx = 20; lx < W; lx += 120) o += r(lx, 566, 56, 5, 'f-lane', ' rx="2"');
    // front props
    o += streetSign(150);
    o += bench(2380) + bench(4180);
    o += cat(2640);
    return svg(W, H, o);
  }

  /* ---------- Stars ---------- */
  function buildStars() {
    var el = document.querySelector('.stars');
    el.setAttribute('viewBox', '0 0 1000 600');
    seed = 3;
    var o = '';
    for (var i = 0; i < 110; i++) o += '<circle cx="' + (rnd() * 1000).toFixed(1) + '" cy="' + (rnd() * 600).toFixed(1) + '" r="' + (rnd() * 1.6 + .5).toFixed(2) + '"' + (i % 4 === 0 ? ' class="tw"' : '') + '/>';
    el.innerHTML = o;
  }

  var far = document.querySelector('.layer-far');
  var mid = document.querySelector('.layer-mid');
  var world = document.querySelector('.layer-world');
  far.innerHTML = buildFar();
  mid.innerHTML = buildMid();
  world.querySelector('.world-svg').innerHTML = buildWorld();
  buildStars();

  /* =======================================================
     Layout + camera
     ======================================================= */
  var game = document.getElementById('game');
  var hero = document.querySelector('.hero');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  var enterBtn = document.querySelector('[data-enter]');
  var fill = document.querySelector('.minimap-fill');
  var me = document.querySelector('.minimap-me');
  var S = 1, vw = 0, vh = 0;

  // scroll progress (0..1) -> hero x, with plateaus at each stop so it's easy to stop there
  var PLATEAU = 0.032;
  var pts = [];
  STOPS.forEach(function (s, i) {
    var pc = i / (STOPS.length - 1);
    pts.push([Math.max(0, pc - PLATEAU), s.x - (i ? 18 : 0)]);
    pts.push([Math.min(1, pc + PLATEAU), s.x + (i < STOPS.length - 1 ? 18 : 0)]);
  });
  function heroX(pr) {
    for (var i = 1; i < pts.length; i++) {
      if (pr <= pts[i][0]) {
        var a = pts[i - 1], b = pts[i], f = (b[0] - a[0]) ? (pr - a[0]) / (b[0] - a[0]) : 0;
        return a[1] + (b[1] - a[1]) * f;
      }
    }
    return pts[pts.length - 1][1];
  }
  function stopScrollY(i) {
    var range = game.offsetHeight - vh;
    return game.offsetTop + range * (i / (STOPS.length - 1));
  }

  function layout() {
    var stage = document.querySelector('.stage');
    vw = window.innerWidth; vh = stage.clientHeight;
    var lift = parseFloat(getComputedStyle(stage).getPropertyValue('--lift')) || 0;
    S = Math.min((vh - lift) / 620, vw / 420);
    var wh = H * S;
    world.style.width = (W * S) + 'px'; world.style.height = wh + 'px';
    far.style.width = (FAR_W * S) + 'px'; far.style.height = wh + 'px';
    mid.style.width = (MID_W * S) + 'px'; mid.style.height = wh + 'px';
    hero.style.width = (64 * S * 1.15) + 'px'; hero.style.height = (112 * S * 1.15) + 'px';
    hero.style.bottom = ((H - 512) * S) + 'px';
    var mobile = vw <= 860;
    // place the hero left of centre on desktop (cards sit on the right), centred on phones
    anchor = mobile ? 0.5 : 0.36;
    game.style.height = (STOPS.length * (mobile ? 95 : 110)) + 'vh';
    var stopsEl = document.querySelector('.minimap-stops');
    Array.prototype.forEach.call(stopsEl.children, function (li, i) { li.style.left = (STOPS[i].x / W * 100) + '%'; });
    update(true);
  }
  var anchor = 0.36;

  var lastX = null, walkTimer = null, activeId = null, ticking = false, visited = {};
  function update(force) {
    ticking = false;
    var range = Math.max(1, game.offsetHeight - vh);
    var pr = Math.min(1, Math.max(0, (window.scrollY - game.offsetTop) / range));
    var x = heroX(pr);
    var cam = Math.min(Math.max(0, x * S - vw * anchor), W * S - vw);
    world.style.transform = 'translate3d(' + (-cam) + 'px,0,0)';
    mid.style.transform = 'translate3d(' + (-cam * 0.42) + 'px,0,0)';
    far.style.transform = 'translate3d(' + (-cam * 0.16) + 'px,0,0)';
    hero.style.transform = '';
    hero.style.left = (x * S - parseFloat(hero.style.width) / 2) + 'px';

    if (lastX !== null && Math.abs(x - lastX) > 0.3) {
      hero.classList.add('is-walking');
      hero.querySelector('.hero-body').style.transform = '';
      hero.classList.toggle('is-left', x < lastX);
      clearTimeout(walkTimer);
      walkTimer = setTimeout(function () { hero.classList.remove('is-walking'); }, 140);
    }
    lastX = x;

    // which stop are we at?
    var at = null;
    STOPS.forEach(function (s) { if (Math.abs(s.x - x) < NEAR) at = s.id; });
    if (at !== activeId || force) {
      activeId = at;
      cards.forEach(function (cd) { cd.hidden = cd.getAttribute('data-stop') !== at; });
      document.querySelector('.cards').classList.toggle('is-hidden', !at);
      var openable = at && at !== 'start';
      enterBtn.disabled = !openable;
      enterBtn.textContent = at === 'contact' ? 'Email me' : 'Go inside';
      if (at) visited[at] = true;
      Array.prototype.forEach.call(document.querySelectorAll('.minimap-stops button'), function (b) {
        b.classList.toggle('is-visited', !!visited[b.getAttribute('data-id')]);
      });
    }
    document.body.classList.toggle('past-game', window.scrollY > game.offsetTop + game.offsetHeight - vh * 0.6);
    var frac = x / W;
    fill.style.width = (frac * 100) + '%';
    me.style.left = (frac * 100) + '%';
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { update(false); }); } }

  /* ---------- Minimap ---------- */
  var stopsEl = document.querySelector('.minimap-stops');
  stopsEl.innerHTML = STOPS.map(function (s, i) {
    return '<li><button type="button" data-go="' + i + '" data-id="' + s.id + '" aria-label="Walk to ' + s.label + '"><span class="tip">' + s.label + '</span></button></li>';
  }).join('');

  /* ---------- Navigation ---------- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function goTo(i) {
    i = Math.max(0, Math.min(STOPS.length - 1, i));
    window.scrollTo({ top: stopScrollY(i), behavior: reduce ? 'auto' : 'smooth' });
  }
  function currentIndex() {
    var x = lastX || 0, best = 0;
    STOPS.forEach(function (s, i) { if (Math.abs(s.x - x) < Math.abs(STOPS[best].x - x)) best = i; });
    return best;
  }
  function step(dir) {
    var x = lastX || 0, i = currentIndex();
    if (Math.abs(STOPS[i].x - x) > NEAR) i = dir > 0 ? STOPS.findIndex(function (s) { return s.x > x; }) : (function () { var k = 0; STOPS.forEach(function (s, j) { if (s.x < x) k = j; }); return k; })();
    else i += dir;
    if (i < 0) i = 0;
    goTo(i);
  }
  document.addEventListener('click', function (e) {
    var go = e.target.closest('[data-go]');
    if (go) { e.preventDefault(); goTo(+go.getAttribute('data-go')); return; }
    var st = e.target.closest('[data-step]');
    if (st) { step(+st.getAttribute('data-step')); return; }
    if (e.target.closest('[data-enter]')) { enter(); return; }
    var op = e.target.closest('[data-open]');
    if (op) { openCase(op.getAttribute('data-open')); return; }
    var kitty = e.target.closest('.cat');
    if (kitty) meow(kitty);
  });

  function enter() {
    if (!activeId || activeId === 'start') return;
    if (activeId === 'contact') { window.location.href = 'mailto:mhmdayyoub5@gmail.com'; return; }
    openCase(activeId);
  }

  document.addEventListener('keydown', function (e) {
    if (document.querySelector('dialog[open]')) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    var inGame = window.scrollY < game.offsetTop + game.offsetHeight - vh + 4;
    if (!inGame) return;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); step(-1); }
    else if ((e.key === 'Enter' || e.key === 'e' || e.key === 'E') && (e.target === document.body || e.target.closest('.stage'))) {
      if (e.target.closest && e.target.closest('button, a')) return;
      e.preventDefault(); enter();
    }
  });

  /* ---------- Case studies ---------- */
  var lastFocus = null;
  function openCase(id) {
    if (id === 'contact') { window.location.href = 'mailto:mhmdayyoub5@gmail.com'; return; }
    var d = document.getElementById('case-' + id);
    if (!d) return;
    lastFocus = document.activeElement;
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
    d.scrollTop = 0;
  }
  Array.prototype.forEach.call(document.querySelectorAll('dialog.case'), function (d) {
    d.addEventListener('click', function (e) {
      if (e.target === d || e.target.closest('.case-close')) d.close();
    });
    d.addEventListener('close', function () { if (lastFocus && lastFocus.focus) lastFocus.focus(); });
  });

  /* ---------- Cat ---------- */
  function meow(el) {
    el.classList.add('is-meowing');
    setTimeout(function () { el.classList.remove('is-meowing'); }, 1400);
  }
  Array.prototype.forEach.call(document.querySelectorAll('.cat'), function (el) {
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); meow(el); } });
  });

  /* ---------- Theme (day / night) ---------- */
  var root = document.documentElement, toggle = document.querySelector('.theme-toggle');
  function syncToggle() { toggle.setAttribute('aria-label', root.getAttribute('data-theme') === 'light' ? 'Switch to night' : 'Switch to day'); }
  toggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncToggle();
  });
  syncToggle();

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', layout);
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { update(true); });
})();
