// ============================================================================
// 3. STATO DEL GIOCO & GIOCATORE (CURSORE ROSSO)
// ============================================================================
const gameState = {
  running: false,
  paused: false,
  gameOver: false,
  score: 0,
  planetsDestroyed: 0,
  time: 0,
  phase: 'explore',
  bossTimer: 0,
  camera: { x: 0, y: 0, shake: 0 },
  mouse: { x: VIEW_W / 2, y: VIEW_H / 2, worldX: 0, worldY: 0, down: false },
  keys: {}
};

const player = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  angle: 0,
  hp: 100,
  maxHp: 100,
  xp: 0,
  xpToNext: 450,
  level: 1,
  invuln: 0,
  absorbPulse: 0,

  moveSpeed: 135,
  fireRate: 0.095,
  fireTimer: 0,
  drillDamage: 1.0,
  blastRadius: 1.6,
  multiShot: 1,
  magnetRadius: 130,
  magnetForce: 420,
  bulletSpeed: 370,

  novaUnlocked: false,
  novaCooldown: 6.0,
  novaTimer: 0,
  novaRadius: 65
};

