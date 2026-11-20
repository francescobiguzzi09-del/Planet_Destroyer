// ============================================================================
// 8. AZIONI DEL GIOCATORE (SPARO, NOVA, MOVIMENTO)
// ============================================================================
function firePlayerWeapon() {
  audio.playShoot();
  const count = player.multiShot;
  const spreadStep = 0.09;

  for (let i = 0; i < count; i++) {
    const offsetAngle = (i - (count - 1) / 2) * spreadStep;
    const angle = player.angle + offsetAngle;
    const noseDist = 8;
    bullets.push({
      x: player.x + Math.cos(angle) * noseDist,
      y: player.y + Math.sin(angle) * noseDist,
      vx: Math.cos(angle) * player.bulletSpeed + player.vx * 0.25,
      vy: Math.sin(angle) * player.bulletSpeed + player.vy * 0.25,
      life: 1.1,
      damage: player.drillDamage,
      radius: player.blastRadius
    });
  }
}

function triggerNova() {
  if (!player.novaUnlocked || player.novaTimer > 0 || gameState.paused || !gameState.running) return;
  player.novaTimer = player.novaCooldown;
  audio.playNova();
  gameState.camera.shake = 6;

  shockwaves.push({
    x: player.x,
    y: player.y,
    r: 6,
    maxR: player.novaRadius,
    alpha: 1,
    color: '#ffae2b'
  });

  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const eb = enemyBullets[i];
    if (Math.hypot(eb.x - player.x, eb.y - player.y) <= player.novaRadius) {
      enemyBullets.splice(i, 1);
    }
  }

  for (const s of sentinels) {
    if (Math.hypot(s.x - player.x, s.y - player.y) <= player.novaRadius) {
      s.hp -= player.drillDamage * 8;
      s.hitFlash = 0.15;
    }
  }

  for (const p of planets) {
    if (p.destroyed) continue;
    const d = Math.hypot(p.x - player.x, p.y - player.y);
    if (d <= p.baseRadius + player.novaRadius) {
      const ang = Math.atan2(p.y - player.y, p.x - player.x);
      const impactDist = Math.max(0, d - p.baseRadius * 0.6);
      const reachesCore = (d - player.novaRadius) <= p.baseRadius * 0.34;
      damagePlanet(
        p,
        player.x + Math.cos(ang) * impactDist,
        player.y + Math.sin(ang) * impactDist,
        player.blastRadius + 5,
        player.drillDamage * 4,
        reachesCore
      );
    }
  }
}

function addFloatingText(x, y, text, color = '#ffffff') {
  floatingTexts.push({
    x,
    y,
    text,
    color,
    life: 1.15,
    vy: -18
  });
}

