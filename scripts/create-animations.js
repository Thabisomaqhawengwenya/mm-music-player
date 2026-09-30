const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'assets', 'lordicon');

// Helper to create cubic easing
const easeInOut = {
  i: { x: [0.4], y: [1] },
  o: { x: [0.2], y: [0] }
};
const springEase = {
  i: { x: [0.175], y: [1] },
  o: { x: [0.885], y: [0.32] }
};

// 1. MUSIC / EQUALIZER (Library Tab)
// 3 animated equalizer bars with bouncing heights + music note accent
const musicLottie = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "lordicon-music-equalizer",
  ddd: 0,
  assets: [],
  layers: [
    // Bar 1 (Left)
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Bar 1",
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: { a: 0, k: 0, ix: 10 },
        p: { a: 0, k: [32, 68, 0], ix: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 40, 100], ...easeInOut },
            { t: 15, s: [100, 85, 100], ...easeInOut },
            { t: 30, s: [100, 30, 100], ...easeInOut },
            { t: 45, s: [100, 70, 100], ...easeInOut },
            { t: 60, s: [100, 40, 100] }
          ],
          ix: 6
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [8, 48], ix: 2 },
              p: { a: 0, k: [0, -24], ix: 3 },
              r: { a: 0, k: 4, ix: 4 },
              nm: "Bar Shape",
              mn: "ADBE Vector Shape - Rect",
              hd: false
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.1, 0.5, 0.95, 1], ix: 4 },
              o: { a: 0, k: 100, ix: 5 },
              r: 1,
              bm: 0,
              nm: "Fill",
              mn: "ADBE Vector Graphic - Fill",
              hd: false
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0], ix: 2 },
              a: { a: 0, k: [0, 0], ix: 1 },
              s: { a: 0, k: [100, 100], ix: 3 },
              r: { a: 0, k: 0, ix: 6 },
              o: { a: 0, k: 100, ix: 7 },
              sk: { a: 0, k: 0, ix: 4 },
              sa: { a: 0, k: 0, ix: 5 },
              nm: "Transform"
            }
          ],
          nm: "Bar Group",
          np: 3,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false
        }
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    },
    // Bar 2 (Center)
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Bar 2",
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: { a: 0, k: 0, ix: 10 },
        p: { a: 0, k: [50, 68, 0], ix: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 90, 100], ...easeInOut },
            { t: 20, s: [100, 35, 100], ...easeInOut },
            { t: 40, s: [100, 100, 100], ...easeInOut },
            { t: 60, s: [100, 90, 100] }
          ],
          ix: 6
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [8, 48], ix: 2 },
              p: { a: 0, k: [0, -24], ix: 3 },
              r: { a: 0, k: 4, ix: 4 },
              nm: "Bar Shape",
              mn: "ADBE Vector Shape - Rect",
              hd: false
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.1, 0.5, 0.95, 1], ix: 4 },
              o: { a: 0, k: 100, ix: 5 },
              r: 1,
              bm: 0,
              nm: "Fill",
              mn: "ADBE Vector Graphic - Fill",
              hd: false
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0], ix: 2 },
              a: { a: 0, k: [0, 0], ix: 1 },
              s: { a: 0, k: [100, 100], ix: 3 },
              r: { a: 0, k: 0, ix: 6 },
              o: { a: 0, k: 100, ix: 7 },
              sk: { a: 0, k: 0, ix: 4 },
              sa: { a: 0, k: 0, ix: 5 },
              nm: "Transform"
            }
          ],
          nm: "Bar Group",
          np: 3,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false
        }
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    },
    // Bar 3 (Right)
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: "Bar 3",
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: { a: 0, k: 0, ix: 10 },
        p: { a: 0, k: [68, 68, 0], ix: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 50, 100], ...easeInOut },
            { t: 18, s: [100, 95, 100], ...easeInOut },
            { t: 36, s: [100, 45, 100], ...easeInOut },
            { t: 60, s: [100, 50, 100] }
          ],
          ix: 6
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [8, 48], ix: 2 },
              p: { a: 0, k: [0, -24], ix: 3 },
              r: { a: 0, k: 4, ix: 4 },
              nm: "Bar Shape",
              mn: "ADBE Vector Shape - Rect",
              hd: false
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.1, 0.5, 0.95, 1], ix: 4 },
              o: { a: 0, k: 100, ix: 5 },
              r: 1,
              bm: 0,
              nm: "Fill",
              mn: "ADBE Vector Graphic - Fill",
              hd: false
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0], ix: 2 },
              a: { a: 0, k: [0, 0], ix: 1 },
              s: { a: 0, k: [100, 100], ix: 3 },
              r: { a: 0, k: 0, ix: 6 },
              o: { a: 0, k: 100, ix: 7 },
              sk: { a: 0, k: 0, ix: 4 },
              sa: { a: 0, k: 0, ix: 5 },
              nm: "Transform"
            }
          ],
          nm: "Bar Group",
          np: 3,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false
        }
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    }
  ],
  markers: []
};

// 2. PLAYLIST / MIXES (Vinyl Disc + Tone Arm)
const playlistLottie = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "lordicon-playlist-disc",
  ddd: 0,
  assets: [],
  layers: [
    // Vinyl Disc (Rotates 360 deg)
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Vinyl Disc",
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], ...easeInOut },
            { t: 60, s: [360] }
          ],
          ix: 10
        },
        p: { a: 0, k: [50, 50, 0], ix: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: { a: 0, k: [100, 100, 100], ix: 6 }
      },
      ao: 0,
      shapes: [
        // Outer vinyl edge
        {
          ty: "el",
          d: 1,
          p: { a: 0, k: [0, 0], ix: 3 },
          s: { a: 0, k: [68, 68], ix: 2 },
          nm: "Outer Disc",
          mn: "ADBE Vector Shape - Ellipse",
          hd: false
        },
        {
          ty: "st",
          c: { a: 0, k: [0.1, 0.5, 0.95, 1], ix: 3 },
          o: { a: 0, k: 100, ix: 4 },
          w: { a: 0, k: 5, ix: 5 },
          lc: 2,
          lj: 2,
          nm: "Disc Stroke",
          mn: "ADBE Vector Graphic - Stroke",
          hd: false
        },
        // Inner groove ring 1
        {
          ty: "el",
          d: 1,
          p: { a: 0, k: [0, 0], ix: 3 },
          s: { a: 0, k: [46, 46], ix: 2 },
          nm: "Groove Ring 1",
          mn: "ADBE Vector Shape - Ellipse",
          hd: false
        },
        {
          ty: "st",
          c: { a: 0, k: [0.1, 0.5, 0.95, 0.5], ix: 3 },
          o: { a: 0, k: 60, ix: 4 },
          w: { a: 0, k: 2, ix: 5 },
          lc: 2,
          lj: 2,
          nm: "Groove Stroke",
          mn: "ADBE Vector Graphic - Stroke",
          hd: false
        },
        // Center label filled circle
        {
          ty: "el",
          d: 1,
          p: { a: 0, k: [0, 0], ix: 3 },
          s: { a: 0, k: [22, 22], ix: 2 },
          nm: "Center Label",
          mn: "ADBE Vector Shape - Ellipse",
          hd: false
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.1, 0.5, 0.95, 1], ix: 4 },
          o: { a: 0, k: 100, ix: 5 },
          r: 1,
          nm: "Center Label Fill",
          mn: "ADBE Vector Graphic - Fill",
          hd: false
        },
        // Spindle hole
        {
          ty: "el",
          d: 1,
          p: { a: 0, k: [0, 0], ix: 3 },
          s: { a: 0, k: [6, 6], ix: 2 },
          nm: "Spindle Hole",
          mn: "ADBE Vector Shape - Ellipse",
          hd: false
        },
        {
          ty: "fl",
          c: { a: 0, k: [1, 1, 1, 1], ix: 4 },
          o: { a: 0, k: 100, ix: 5 },
          r: 1,
          nm: "Hole Fill",
          mn: "ADBE Vector Graphic - Fill",
          hd: false
        }
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    }
  ],
  markers: []
};

// 3. SPARKLES / VIBES (Four-Point Shimmering Star)
const sparklesLottie = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "lordicon-sparkles",
  ddd: 0,
  assets: [],
  layers: [
    // Main Star
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Main Star",
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], ...easeInOut },
            { t: 30, s: [90], ...easeInOut },
            { t: 60, s: [180] }
          ],
          ix: 10
        },
        p: { a: 0, k: [48, 52, 0], ix: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: {
          a: 1,
          k: [
            { t: 0, s: [85, 85, 100], ...springEase },
            { t: 30, s: [115, 115, 100], ...springEase },
            { t: 60, s: [85, 85, 100] }
          ],
          ix: 6
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ind: 0,
              ty: "sh",
              ix: 1,
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [-10, 0], [0, 0], [0, 10], [0, 0], [10, 0], [0, 0], [0, -10]],
                  o: [[0, 10], [0, 0], [10, 0], [0, 0], [0, -10], [0, 0], [-10, 0], [0, 0]],
                  v: [[0, -28], [5, -5], [28, 0], [5, 5], [0, 28], [-5, 5], [-28, 0], [-5, -5]],
                  c: true
                },
                ix: 2
              },
              nm: "Star Path",
              mn: "ADBE Vector Shape - Group",
              hd: false
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.1, 0.5, 0.95, 1], ix: 4 },
              o: { a: 0, k: 100, ix: 5 },
              r: 1,
              nm: "Star Fill",
              mn: "ADBE Vector Graphic - Fill",
              hd: false
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0], ix: 2 },
              a: { a: 0, k: [0, 0], ix: 1 },
              s: { a: 0, k: [100, 100], ix: 3 },
              r: { a: 0, k: 0, ix: 6 },
              o: { a: 0, k: 100, ix: 7 },
              sk: { a: 0, k: 0, ix: 4 },
              sa: { a: 0, k: 0, ix: 5 },
              nm: "Transform"
            }
          ],
          nm: "Star Group",
          np: 3,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false
        }
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    },
    // Mini Satellite Sparkle (Top-Right)
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Mini Star",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [30], ...easeInOut },
            { t: 30, s: [100], ...easeInOut },
            { t: 60, s: [30] }
          ],
          ix: 11
        },
        r: {
          a: 1,
          k: [
            { t: 0, s: [45], ...easeInOut },
            { t: 60, s: [-135] }
          ],
          ix: 10
        },
        p: { a: 0, k: [74, 26, 0], ix: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: {
          a: 1,
          k: [
            { t: 0, s: [40, 40, 100], ...easeInOut },
            { t: 30, s: [75, 75, 100], ...easeInOut },
            { t: 60, s: [40, 40, 100] }
          ],
          ix: 6
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ind: 0,
              ty: "sh",
              ix: 1,
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [-5, 0], [0, 0], [0, 5], [0, 0], [5, 0], [0, 0], [0, -5]],
                  o: [[0, 5], [0, 0], [5, 0], [0, 0], [0, -5], [0, 0], [-5, 0], [0, 0]],
                  v: [[0, -16], [3, -3], [16, 0], [3, 3], [0, 16], [-3, 3], [-16, 0], [-3, -3]],
                  c: true
                },
                ix: 2
              },
              nm: "Mini Star Path",
              mn: "ADBE Vector Shape - Group",
              hd: false
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.1, 0.5, 0.95, 1], ix: 4 },
              o: { a: 0, k: 100, ix: 5 },
              r: 1,
              nm: "Mini Star Fill",
              mn: "ADBE Vector Graphic - Fill",
              hd: false
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0], ix: 2 },
              a: { a: 0, k: [0, 0], ix: 1 },
              s: { a: 0, k: [100, 100], ix: 3 },
              r: { a: 0, k: 0, ix: 6 },
              o: { a: 0, k: 100, ix: 7 },
              sk: { a: 0, k: 0, ix: 4 },
              sa: { a: 0, k: 0, ix: 5 },
              nm: "Transform"
            }
          ],
          nm: "Mini Star Group",
          np: 3,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false
        }
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    }
  ],
  markers: []
};

// 4. HEART / FAVORITE (Heart Spring Burst)
const heartLottie = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 40,
  w: 100,
  h: 100,
  nm: "lordicon-heart",
  ddd: 0,
  assets: [],
  layers: [
    // Heart Body
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Heart Shape",
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: { a: 0, k: 0, ix: 10 },
        p: { a: 0, k: [50, 52, 0], ix: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: {
          a: 1,
          k: [
            { t: 0, s: [95, 95, 100], ...springEase },
            { t: 8, s: [75, 75, 100], ...springEase },
            { t: 18, s: [122, 122, 100], ...springEase },
            { t: 28, s: [94, 94, 100], ...springEase },
            { t: 40, s: [100, 100, 100] }
          ],
          ix: 6
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ind: 0,
              ty: "sh",
              ix: 1,
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [-8, -8], [-12, 0], [-6, 12], [0, 0], [6, 12], [12, 0], [8, -8]],
                  o: [[0, 0], [8, -8], [12, 0], [6, 12], [0, 0], [-6, 12], [-12, 0], [-8, -8]],
                  v: [
                    [0, 24],
                    [-22, 2],
                    [-22, -14],
                    [-8, -24],
                    [0, -16],
                    [8, -24],
                    [22, -14],
                    [22, 2]
                  ],
                  c: true
                },
                ix: 2
              },
              nm: "Heart Path",
              mn: "ADBE Vector Shape - Group",
              hd: false
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.98, 0.2, 0.35, 1], ix: 4 },
              o: { a: 0, k: 100, ix: 5 },
              r: 1,
              nm: "Heart Fill",
              mn: "ADBE Vector Graphic - Fill",
              hd: false
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0], ix: 2 },
              a: { a: 0, k: [0, 0], ix: 1 },
              s: { a: 0, k: [100, 100], ix: 3 },
              r: { a: 0, k: 0, ix: 6 },
              o: { a: 0, k: 100, ix: 7 },
              sk: { a: 0, k: 0, ix: 4 },
              sa: { a: 0, k: 0, ix: 5 },
              nm: "Transform"
            }
          ],
          nm: "Heart Group",
          np: 3,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false
        }
      ],
      ip: 0,
      op: 40,
      st: 0,
      bm: 0
    }
  ],
  markers: []
};

// 5. PLAY / PAUSE
const playLottie = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 30,
  w: 100,
  h: 100,
  nm: "lordicon-play-pulse",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Play Triangle",
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: { a: 0, k: 0, ix: 10 },
        p: { a: 0, k: [52, 50, 0], ix: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100, 100], ...springEase },
            { t: 12, s: [85, 85, 100], ...springEase },
            { t: 20, s: [112, 112, 100], ...springEase },
            { t: 30, s: [100, 100, 100] }
          ],
          ix: 6
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ind: 0,
              ty: "sh",
              ix: 1,
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0]],
                  v: [[-18, -24], [22, 0], [-18, 24]],
                  c: true
                },
                ix: 2
              },
              nm: "Triangle",
              mn: "ADBE Vector Shape - Group",
              hd: false
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.1, 0.5, 0.95, 1], ix: 4 },
              o: { a: 0, k: 100, ix: 5 },
              r: 1,
              nm: "Fill",
              mn: "ADBE Vector Graphic - Fill",
              hd: false
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0], ix: 2 },
              a: { a: 0, k: [0, 0], ix: 1 },
              s: { a: 0, k: [100, 100], ix: 3 },
              r: { a: 0, k: 0, ix: 6 },
              o: { a: 0, k: 100, ix: 7 },
              sk: { a: 0, k: 0, ix: 4 },
              sa: { a: 0, k: 0, ix: 5 },
              nm: "Transform"
            }
          ],
          nm: "Play Group",
          np: 3,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false
        }
      ],
      ip: 0,
      op: 30,
      st: 0,
      bm: 0
    }
  ],
  markers: []
};

// Write files
fs.writeFileSync(path.join(targetDir, 'music.json'), JSON.stringify(musicLottie, null, 2));
fs.writeFileSync(path.join(targetDir, 'playlist.json'), JSON.stringify(playlistLottie, null, 2));
fs.writeFileSync(path.join(targetDir, 'sparkles.json'), JSON.stringify(sparklesLottie, null, 2));
fs.writeFileSync(path.join(targetDir, 'heart.json'), JSON.stringify(heartLottie, null, 2));
fs.writeFileSync(path.join(targetDir, 'play.json'), JSON.stringify(playLottie, null, 2));

console.log('Successfully generated all Lordicon Lottie icon assets in assets/lordicon/');
