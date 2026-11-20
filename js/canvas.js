// ============================================================================
// 2. CONFIGURAZIONE CANVAS PIXEL ART & PALETTE STRATI PLANETARI
// ============================================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });

const TARGET_LONG_SIDE = 540;
let VIEW_W = 540;
let VIEW_H = 304;

function resizeCanvas() {
  const aspect = window.innerWidth / Math.max(1, window.innerHeight);
  if (aspect >= 1) {
    VIEW_W = TARGET_LONG_SIDE;
    VIEW_H = Math.round(TARGET_LONG_SIDE / aspect);
  } else {
    VIEW_H = TARGET_LONG_SIDE;
    VIEW_W = Math.round(TARGET_LONG_SIDE * aspect);
  }
  canvas.width = VIEW_W;
  canvas.height = VIEW_H;
  ctx.imageSmoothingEnabled = false;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const PLANET_PALETTES = {
  small: [
    { hex: '#6c738f', rgb: [108, 115, 143], hp: 1.2, xp: 1 },
    { hex: '#49a6ff', rgb: [73, 166, 255],  hp: 2.2, xp: 1 },
    { hex: '#f0cf78', rgb: [240, 207, 120], hp: 3.8, xp: 1 },
    { hex: '#f53131', rgb: [245, 49, 49],   hp: 6.5, xp: 2, isCore: true }
  ],
  medium: [
    { hex: '#1fd655', rgb: [31, 214, 85],   hp: 1.2, xp: 1 },
    { hex: '#383b4d', rgb: [56, 59, 77],    hp: 1.8, xp: 1 },
    { hex: '#1e6bf5', rgb: [30, 107, 245],  hp: 2.6, xp: 1 },
    { hex: '#dff6ff', rgb: [223, 246, 255], hp: 3.6, xp: 1 },
    { hex: '#7ad7ff', rgb: [122, 215, 255], hp: 5.0, xp: 1 },
    { hex: '#edd08a', rgb: [237, 208, 138], hp: 7.0, xp: 2 },
    { hex: '#f53131', rgb: [245, 49, 49],   hp: 10.5, xp: 3, isCore: true }
  ],
  giant: [
    { hex: '#28e868', rgb: [40, 232, 104],  hp: 2.0, xp: 1 },
    { hex: '#2e3147', rgb: [46, 49, 71],    hp: 3.2, xp: 1 },
    { hex: '#6938ff', rgb: [105, 56, 255],  hp: 4.8, xp: 1 },
    { hex: '#26b7ff', rgb: [38, 183, 255],  hp: 6.8, xp: 2 },
    { hex: '#e8fcff', rgb: [232, 252, 255], hp: 9.2, xp: 2 },
    { hex: '#ffbe45', rgb: [255, 190, 69],  hp: 12.5, xp: 2 },
    { hex: '#ff2438', rgb: [255, 36, 56],   hp: 16.5, xp: 3, isCore: true }
  ],
  exotic: [
    { hex: '#ff5277', rgb: [255, 82, 119],  hp: 1.6, xp: 1 },
    { hex: '#3b2d54', rgb: [59, 45, 84],    hp: 2.8, xp: 1 },
    { hex: '#2ce8f5', rgb: [44, 232, 245],  hp: 4.5, xp: 1 },
    { hex: '#fff3b0', rgb: [255, 243, 176], hp: 6.8, xp: 2 },
    { hex: '#ff2e43', rgb: [255, 46, 67],   hp: 10.0, xp: 3, isCore: true }
  ]
};

