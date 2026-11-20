// ============================================================================
// 6. SENTINELLE ORBITALI
// ============================================================================
function spawnSentinelsForPlanet(planet) {
  planet.sentinelsSpawned = true;
  addFloatingText(planet.x, planet.y - planet.baseRadius - 12, 'ALLERTA SENTINELLE!', '#ffae2b');

  const count = planet.type === 'giant' ? 3 : 2;
  const types = ['shuriken', 'sniper', 'swarm'];

  for (let i = 0; i < count; i++) {
    const sType = i === 0 ? 'shuriken' : types[i % types.length];
    const orbitAngle = (Math.PI * 2 * i) / count;
    const orbitDist = planet.baseRadius + 28;
    sentinels.push({
      planet,
      type: sType,
      x: planet.x + Math.cos(orbitAngle) * orbitDist,
      y: planet.y + Math.sin(orbitAngle) * orbitDist,
      orbitAngle,
      orbitDist,
      rotAngle: 0,
      hp: sType === 'shuriken' ? 38 : sType === 'sniper' ? 28 : 20,
      maxHp: sType === 'shuriken' ? 38 : sType === 'sniper' ? 28 : 20,
      fireTimer: 1.0 + i * 0.6,
      burstCount: 0,
      burstTimer: 0,
      hitFlash: 0
    });
  }
}

function updateSentinels(dt) {
  for (let i = sentinels.length - 1; i >= 0; i--) {
    const s = sentinels[i];
    if (s.hitFlash > 0) s.hitFlash -= dt;

    if (!s.planet.destroyed) {
      s.orbitAngle += (s.type === 'swarm' ? 1.4 : 0.75) * dt;
      const targetX = s.planet.x + Math.cos(s.orbitAngle) * s.orbitDist;
      const targetY = s.planet.y + Math.sin(s.orbitAngle) * s.orbitDist;
      s.x += (targetX - s.x) * 4 * dt;
      s.y += (targetY - s.y) * 4 * dt;
    } else {
      const angToPlayer = Math.atan2(player.y - s.y, player.x - s.x);
      s.x += Math.cos(angToPlayer) * 48 * dt;
      s.y += Math.sin(angToPlayer) * 48 * dt;
    }

    s.rotAngle += (s.type === 'shuriken' ? 3.2 : 1.8) * dt;

    const distToPlayer = Math.hypot(player.x - s.x, player.y - s.y);
    if (distToPlayer < 260) {
      s.fireTimer -= dt;

      if (s.type === 'shuriken') {
        if (s.fireTimer <= 0) {
          s.fireTimer = 2.4;
          s.burstCount = 5;
          s.burstTimer = 0;
        }
        if (s.burstCount > 0) {
          s.burstTimer -= dt;
          if (s.burstTimer <= 0) {
            s.burstTimer = 0.08;
            const baseAng = Math.atan2(player.y - s.y, player.x - s.x);
            const spread = (s.burstCount - 3) * 0.18;
            const ang = baseAng + spread;
            enemyBullets.push({
              x: s.x,
              y: s.y,
              vx: Math.cos(ang) * 135,
              vy: Math.sin(ang) * 135,
              life: 3.0,
              radius: 3
            });
            s.burstCount--;
          }
        }
      } else if (s.type === 'sniper') {
        if (s.fireTimer <= 0) {
          s.fireTimer = 2.1;
          const ang = Math.atan2(player.y - s.y, player.x - s.x);
          enemyBullets.push({
            x: s.x,
            y: s.y,
            vx: Math.cos(ang) * 205,
            vy: Math.sin(ang) * 205,
            life: 2.5,
            radius: 2
          });
        }
      } else if (s.type === 'swarm') {
        if (s.fireTimer <= 0) {
          s.fireTimer = 1.9;
          for (let k = 0; k < 3; k++) {
            const ang = s.rotAngle + (Math.PI * 2 * k) / 3;
            enemyBullets.push({
              x: s.x,
              y: s.y,
              vx: Math.cos(ang) * 120,
              vy: Math.sin(ang) * 120,
              life: 2.8,
              radius: 2
            });
          }
        }
      }
    }

    if (s.hp <= 0) {
      audio.playSentinelHit();
      gameState.score += 350;
      addFloatingText(s.x, s.y, '+350 SENTINELLA', '#ffae2b');
      for (let p = 0; p < 38; p++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 25 + Math.random() * 80;
        spawnParticle(
          s.x,
          s.y,
          Math.cos(a) * spd,
          Math.sin(a) * spd,
          p % 2 === 0 ? '#5c7aff' : '#ff8c24',
          8,
          0.15
        );
      }
      sentinels.splice(i, 1);
    }
  }
}

