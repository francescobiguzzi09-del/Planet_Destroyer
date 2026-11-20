// ============================================================================
// 14. BOSS FIGHT CYBERSECURITY: TROJAN.EXE
// Fasi: 'explore' (conto alla rovescia) -> 'cutscene' (schermo bloccato) -> 'boss' -> 'won'
// ============================================================================
const BOSS_COUNTDOWN = 180;
const BOSS_CUTSCENE_TIME = 3.5;
const BOSS_MAX_HP = 600;
const BOSS_WRONG_ANSWER_DAMAGE = 25; // le sentinelle fanno 12

let boss = null;

function resetBoss() {
  boss = null;
  gameState.phase = 'explore';
  gameState.bossTimer = BOSS_COUNTDOWN;
}

function isPlanetOnScreen(p) {
  const cam = gameState.camera;
  return p.x + p.half > cam.x && p.x - p.half < cam.x + VIEW_W &&
         p.y + p.half > cam.y && p.y - p.half < cam.y + VIEW_H;
}

function startBossCutscene() {
  gameState.phase = 'cutscene';
  gameState.camera.shake = 10;

  for (const p of planets) {
    if (!p.destroyed && isPlanetOnScreen(p)) shatterPlanetCompletely(p);
  }
  planets.length = 0;
  sentinels.length = 0;
  enemyBullets.length = 0;

  const cam = gameState.camera;
  boss = {
    x: cam.x + VIEW_W / 2,
    y: cam.y - 60,
    t: 0,
    hp: BOSS_MAX_HP,
    hitFlash: 0,
    aimTimer: 1.0,
    ringTimer: 3.0
  };
}

function fireBossBullet(angle, speed) {
  enemyBullets.push({
    x: boss.x,
    y: boss.y + 12,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 4.0,
    radius: 3,
    boss: true
  });
}

function updateBossPhase(dt) {
  if (gameState.phase === 'explore') {
    gameState.bossTimer -= dt;
    if (gameState.bossTimer <= 0) startBossCutscene();
    return;
  }
  if (!boss) return;

  boss.t += dt;
  if (boss.hitFlash > 0) boss.hitFlash -= dt;

  const cam = gameState.camera;
  const homeY = cam.y + Math.min(70, VIEW_H * 0.25);
  boss.x = cam.x + VIEW_W / 2 + Math.sin(boss.t * 0.6) * VIEW_W * 0.3;

  if (gameState.phase === 'cutscene') {
    boss.y += (homeY - boss.y) * 2 * dt;
    if (boss.t >= BOSS_CUTSCENE_TIME) {
      gameState.phase = 'boss';
      addFloatingText(cam.x + VIEW_W / 2, cam.y + VIEW_H / 2, 'DIFENDITI!', '#26e666');
    }
    return;
  }

  boss.y = homeY + Math.sin(boss.t * 1.3) * 10;

  // Sotto metà vita il trojan attacca più spesso
  const rage = boss.hp < BOSS_MAX_HP / 2 ? 0.65 : 1;

  boss.aimTimer -= dt;
  if (boss.aimTimer <= 0) {
    boss.aimTimer = 1.4 * rage;
    const base = Math.atan2(player.y - (boss.y + 12), player.x - boss.x);
    for (let k = -1; k <= 1; k++) fireBossBullet(base + k * 0.2, 150);
  }

  boss.ringTimer -= dt;
  if (boss.ringTimer <= 0) {
    boss.ringTimer = 5.0 * rage;
    for (let k = 0; k < 14; k++) fireBossBullet(boss.t + (Math.PI * 2 * k) / 14, 95);
  }

  if (boss.hp <= 0) defeatBoss();
}

// Restituisce true se il proiettile del giocatore ha colpito il boss
function hitBossWith(b) {
  if (gameState.phase !== 'boss' || !boss) return false;
  if (Math.abs(b.x - boss.x) > 28 || Math.abs(b.y - boss.y) > 23) return false;
  boss.hp -= b.damage;
  boss.hitFlash = 0.08;
  audio.playSentinelHit();
  return true;
}

function defeatBoss() {
  gameState.phase = 'won';
  gameState.score += 5000;
  gameState.camera.shake = 12;
  enemyBullets.length = 0;
  audio.playPlanetDestroy();

  shockwaves.push({ x: boss.x, y: boss.y, r: 4, maxR: 140, alpha: 1, color: '#26e666' });
  addFloatingText(boss.x, boss.y - 30, 'TROJAN ELIMINATO! +5000', '#26e666');
  for (let i = 0; i < 260; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = 30 + Math.random() * 140;
    spawnParticle(boss.x, boss.y, Math.cos(a) * spd, Math.sin(a) * spd,
      i % 3 === 0 ? '#ff2e43' : '#26e666', 6, 0.3 + Math.random() * 0.3);
  }
  boss = null;

  setTimeout(() => {
    if (gameState.phase === 'won' && !gameState.gameOver) triggerVictory();
  }, 2200);
}
