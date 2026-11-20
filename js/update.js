// ============================================================================
// 10. AGGIORNAMENTO FISICA & LOGICA DI GIOCO
// ============================================================================
function update(dt) {
  if (!gameState.running || gameState.paused || gameState.gameOver) return;
  gameState.time += dt;
  updateBossPhase(dt);

  // 1. Input movimento
  let moveX = 0;
  let moveY = 0;
  if (gameState.keys['KeyW'] || gameState.keys['ArrowUp']) moveY -= 1;
  if (gameState.keys['KeyS'] || gameState.keys['ArrowDown']) moveY += 1;
  if (gameState.keys['KeyA'] || gameState.keys['ArrowLeft']) moveX -= 1;
  if (gameState.keys['KeyD'] || gameState.keys['ArrowRight']) moveX += 1;

  if (touchState.joyActive) {
    moveX += touchState.joyX;
    moveY += touchState.joyY;
  }

  const moveLen = Math.hypot(moveX, moveY);
  if (moveLen > 1) {
    moveX /= moveLen;
    moveY /= moveLen;
  }

  const accel = player.moveSpeed * 7.5;
  player.vx += moveX * accel * dt;
  player.vy += moveY * accel * dt;

  const damping = Math.pow(0.015, dt);
  player.vx *= damping;
  player.vy *= damping;

  player.x += player.vx * dt;
  player.y += player.vy * dt;

  // Collisione elastica con i pixel solidi (non corrosi) dei pianeti
  for (const p of planets) {
    if (p.destroyed) continue;
    p.angle += p.spin * dt;
    const dx = player.x - p.x;
    const dy = player.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist < p.half) {
      const local = planetToLocal(p, player.x, player.y);
      const lx = Math.round(local.x);
      const ly = Math.round(local.y);
      if (lx >= 0 && lx < p.gridSize && ly >= 0 && ly < p.gridSize) {
        const idx = ly * p.gridSize + lx;
        if (p.layerGrid[idx] > 0 && p.corrodedGrid[idx] === 0) {
          const pushAng = Math.atan2(dy, dx);
          player.x += Math.cos(pushAng) * 3;
          player.y += Math.sin(pushAng) * 3;
          player.vx = Math.cos(pushAng) * 65;
          player.vy = Math.sin(pushAng) * 65;
        }
      }
    }
  }

  // 2. Telecamera fluida centrata sul cursore (bloccata durante la boss fight)
  if (gameState.phase === 'explore') {
    const targetCamX = player.x - VIEW_W / 2 + player.vx * 0.14;
    const targetCamY = player.y - VIEW_H / 2 + player.vy * 0.14;
    gameState.camera.x += (targetCamX - gameState.camera.x) * 8 * dt;
    gameState.camera.y += (targetCamY - gameState.camera.y) * 8 * dt;
  } else {
    const cam = gameState.camera;
    player.x = Math.max(cam.x + 6, Math.min(cam.x + VIEW_W - 6, player.x));
    player.y = Math.max(cam.y + 6, Math.min(cam.y + VIEW_H - 6, player.y));
  }
  if (gameState.camera.shake > 0) {
    gameState.camera.shake = Math.max(0, gameState.camera.shake - 28 * dt);
  }

  gameState.mouse.worldX = gameState.mouse.x + gameState.camera.x;
  gameState.mouse.worldY = gameState.mouse.y + gameState.camera.y;
  player.angle = Math.atan2(gameState.mouse.worldY - player.y, gameState.mouse.worldX - player.x);

  if (player.invuln > 0) player.invuln -= dt;
  if (player.absorbPulse > 0) player.absorbPulse -= dt;
  if (player.novaTimer > 0) player.novaTimer = Math.max(0, player.novaTimer - dt);

  // 3. Fuoco giocatore
  player.fireTimer -= dt;
  if ((gameState.mouse.down || touchState.firing) && player.fireTimer <= 0) {
    player.fireTimer = player.fireRate;
    firePlayerWeapon();
  }

  // 4. Aggiornamento proiettili giocatore con sub-stepping ad alta precisione (< 0.65px)
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    const frameDist = Math.hypot(b.vx * dt, b.vy * dt);
    const steps = Math.max(4, Math.ceil(frameDist / 0.65));
    const stepDt = dt / steps;
    let hit = false;

    for (let s = 0; s < steps; s++) {
      b.x += b.vx * stepDt;
      b.y += b.vy * stepDt;

      if (hitBossWith(b)) {
        hit = true;
        break;
      }

      for (const sent of sentinels) {
        if (Math.hypot(b.x - sent.x, b.y - sent.y) <= 10) {
          sent.hp -= b.damage;
          sent.hitFlash = 0.1;
          audio.playSentinelHit();
          hit = true;
          break;
        }
      }
      if (hit) break;

      for (const p of planets) {
        if (p.destroyed) continue;
        if (Math.abs(b.x - p.x) < p.half && Math.abs(b.y - p.y) < p.half) {
          const local = planetToLocal(p, b.x, b.y);
          const lx = Math.round(local.x);
          const ly = Math.round(local.y);
          if (lx >= 0 && lx < p.gridSize && ly >= 0 && ly < p.gridSize) {
            const idx = ly * p.gridSize + lx;
            if (p.layerGrid[idx] > 0 && p.corrodedGrid[idx] === 0) {
              damagePlanet(p, b.x, b.y, b.radius, b.damage, false);
              hit = true;
              break;
            }
          }
        }
      }
      if (hit) break;
    }

    b.life -= dt;
    if (hit || b.life <= 0) {
      bullets.splice(i, 1);
    }
  }

  // 5. Aggiornamento Sentinelle & Proiettili nemici
  updateSentinels(dt);
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const eb = enemyBullets[i];
    eb.x += eb.vx * dt;
    eb.y += eb.vy * dt;
    eb.life -= dt;

    if (Math.hypot(eb.x - player.x, eb.y - player.y) <= eb.radius + 4) {
      if (player.invuln <= 0 && eb.boss) {
        enemyBullets.splice(i, 1);
        askCyberQuestion();
        break;
      }
      if (player.invuln <= 0) {
        player.hp = Math.max(0, player.hp - 12);
        player.invuln = 0.65;
        gameState.camera.shake = 5;
        audio.playPlayerDamage();
        addFloatingText(player.x, player.y - 10, '-12', '#ff2e43');
        if (player.hp <= 0) {
          triggerGameOver();
        }
      }
      enemyBullets.splice(i, 1);
      continue;
    }

    if (eb.life <= 0) {
      enemyBullets.splice(i, 1);
    }
  }

  // 6. Aggiornamento Particelle & Scia Gravitazionale Curva verso il Cursore
  let absorbedThisFrame = 0;
  for (let i = 0; i < MAX_PARTICLES; i++) {
    if (pActive[i] === 0) continue;

    if (pXp[i] === 0) {
      pDelay[i] -= dt;
      pX[i] += pVx[i] * dt;
      pY[i] += pVy[i] * dt;
      pVx[i] *= Math.pow(0.02, dt);
      pVy[i] *= Math.pow(0.02, dt);
      if (pDelay[i] <= 0) pActive[i] = 0;
      continue;
    }

    if (pDelay[i] > 0) {
      pDelay[i] -= dt;
      pX[i] += pVx[i] * dt;
      pY[i] += pVy[i] * dt;
      pVx[i] *= Math.pow(0.18, dt);
      pVy[i] *= Math.pow(0.18, dt);
    } else {
      const dx = player.x - pX[i];
      const dy = player.y - pY[i];
      const dist = Math.hypot(dx, dy);

      if (dist < 7.5) {
        pActive[i] = 0;
        const gainedXp = pXp[i];
        player.xp += gainedXp;
        gameState.score += gainedXp * 10;
        absorbedThisFrame++;
        player.absorbPulse = 0.14;
      } else {
        const nx = dx / dist;
        const ny = dy / dist;

        const inMagnet = dist < player.magnetRadius;
        const accel = inMagnet
          ? player.magnetForce * (1.8 + (1 - dist / player.magnetRadius) * 1.4)
          : player.magnetForce * 1.15;

        const swirl = dist > 18 && dist < 110 ? 42 : 0;
        const tx = -ny * swirl;
        const ty = nx * swirl;

        const drag = dist < 28 ? Math.pow(0.002, dt) : Math.pow(0.12, dt);
        pVx[i] = pVx[i] * drag + (nx * accel + tx) * dt;
        pVy[i] = pVy[i] * drag + (ny * accel + ty) * dt;

        const spd = Math.hypot(pVx[i], pVy[i]);
        const maxSpd = 340;
        if (spd > maxSpd) {
          pVx[i] = (pVx[i] / spd) * maxSpd;
          pVy[i] = (pVy[i] / spd) * maxSpd;
        }

        pX[i] += (pVx[i] + player.vx * 0.25) * dt;
        pY[i] += (pVy[i] + player.vy * 0.25) * dt;
      }
    }
  }

  if (absorbedThisFrame > 0) {
    audio.playPickup();
    if (player.xp >= player.xpToNext) {
      player.xp -= player.xpToNext;
      player.level++;
      player.xpToNext = Math.round(player.xpToNext * 1.48 + 250);
      triggerLevelUp();
    }
  }

  // 7. Onde d'urto e testi fluttuanti
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const sw = shockwaves[i];
    sw.r += (sw.maxR - sw.r) * 7 * dt + 40 * dt;
    sw.alpha -= 1.8 * dt;
    if (sw.alpha <= 0) shockwaves.splice(i, 1);
  }

  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.life -= dt;
    if (ft.life <= 0) floatingTexts.splice(i, 1);
  }

  if (gameState.phase === 'explore') maintainUniverse();
  updateHUD();
}

