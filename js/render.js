// ============================================================================
// 11. RENDERING PIXEL ART
// ============================================================================
function render() {
  ctx.fillStyle = '#0d0c14';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  const shakeX = gameState.camera.shake > 0 ? Math.round((Math.random() - 0.5) * gameState.camera.shake) : 0;
  const shakeY = gameState.camera.shake > 0 ? Math.round((Math.random() - 0.5) * gameState.camera.shake) : 0;
  const camX = Math.round(gameState.camera.x + shakeX);
  const camY = Math.round(gameState.camera.y + shakeY);

  // 1. Campo stellare infinito pixelato
  for (const st of stars) {
    let sx = ((st.x - camX * st.depth) % VIEW_W + VIEW_W) % VIEW_W;
    let sy = ((st.y - camY * st.depth) % VIEW_H + VIEW_H) % VIEW_H;
    ctx.fillStyle = `rgba(220, 230, 255, ${st.alpha})`;
    ctx.fillRect(sx | 0, sy | 0, st.size, st.size);
  }

  // 2. Pianeti a strati irregolari + Anelli orbitali sentinelle
  for (const p of planets) {
    if (p.destroyed) continue;
    const drawX = Math.round(p.x - p.half - camX);
    const drawY = Math.round(p.y - p.half - camY);

    if (drawX + p.gridSize < 0 || drawX > VIEW_W || drawY + p.gridSize < 0 || drawY > VIEW_H) continue;

    if (p.hasSentinels) {
      drawPixelCircleOutline(
        Math.round(p.x - camX),
        Math.round(p.y - camY),
        p.baseRadius + 28,
        p.sentinelsSpawned ? 'rgba(38, 230, 102, 0.45)' : 'rgba(92, 99, 150, 0.35)'
      );
    }

    ctx.save();
    ctx.translate(drawX + p.half, drawY + p.half);
    ctx.rotate(p.angle);
    ctx.drawImage(p.canvas, -p.half, -p.half);
    ctx.restore();
  }

  // 3. Particelle scavate/esplose
  for (let i = 0; i < MAX_PARTICLES; i++) {
    if (pActive[i] === 0) continue;
    const sx = Math.round(pX[i] - camX);
    const sy = Math.round(pY[i] - camY);
    if (sx < -2 || sx > VIEW_W + 2 || sy < -2 || sy > VIEW_H + 2) continue;

    ctx.fillStyle = pColor[i];
    const size = pXp[i] >= 8 ? 2 : 1;
    ctx.fillRect(sx, sy, size, size);
  }

  // 4. Sentinelle Orbitali
  for (const s of sentinels) {
    const sx = Math.round(s.x - camX);
    const sy = Math.round(s.y - camY);

    ctx.fillStyle = s.type === 'shuriken' ? 'rgba(80, 110, 255, 0.14)' : 'rgba(255, 110, 60, 0.14)';
    fillPixelDisk(sx, sy, 16);
    ctx.fillStyle = 'rgba(255, 150, 50, 0.12)';
    fillPixelDisk(sx, sy, 10);

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(s.rotAngle);

    if (s.type === 'shuriken') {
      ctx.fillStyle = s.hitFlash > 0 ? '#ffffff' : '#4a69ff';
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(3, -3);
      ctx.lineTo(10, 0);
      ctx.lineTo(3, 3);
      ctx.lineTo(0, 10);
      ctx.lineTo(-3, 3);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-3, -3);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = s.hitFlash > 0 ? '#ffffff' : '#ff7b1c';
      ctx.beginPath();
      ctx.moveTo(0, -11);
      ctx.lineTo(6, -5);
      ctx.lineTo(-5, -6);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(6, -4);
      ctx.lineTo(11, 1);
      ctx.lineTo(5, 5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#0d0c14';
      ctx.fillRect(-1, -1, 2, 2);
    } else if (s.type === 'sniper') {
      ctx.fillStyle = s.hitFlash > 0 ? '#ffffff' : '#b44aff';
      ctx.fillRect(-6, -6, 12, 12);
      ctx.fillStyle = '#38e8ff';
      ctx.fillRect(-3, -3, 6, 6);
    } else {
      ctx.fillStyle = s.hitFlash > 0 ? '#ffffff' : '#ff9924';
      ctx.fillRect(-5, -5, 10, 10);
      ctx.fillStyle = '#ff2e43';
      ctx.fillRect(-2, -2, 4, 4);
    }

    ctx.restore();
  }

  drawBoss(camX, camY);

  // 5. Proiettili del giocatore
  for (const b of bullets) {
    const bx = Math.round(b.x - camX);
    const by = Math.round(b.y - camY);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx - 1, by - 1, 2, 2);
    ctx.fillStyle = 'rgba(142, 227, 255, 0.55)';
    ctx.fillRect(bx - Math.round(b.vx * 0.012), by - Math.round(b.vy * 0.012), 2, 2);
  }

  // 6. Proiettili delle sentinelle
  for (const eb of enemyBullets) {
    const ex = Math.round(eb.x - camX);
    const ey = Math.round(eb.y - camY);
    ctx.fillStyle = eb.boss ? 'rgba(38, 230, 102, 0.35)' : 'rgba(255, 36, 56, 0.35)';
    fillPixelDisk(ex, ey, 5);
    ctx.fillStyle = eb.boss ? 'rgba(38, 230, 102, 0.8)' : 'rgba(255, 50, 70, 0.65)';
    ctx.fillRect(ex - 2, ey - 2, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ex - 1, ey - 1, 2, 2);
  }

  // 7. Onde d'urto pixelate
  for (const sw of shockwaves) {
    drawPixelCircleOutline(
      Math.round(sw.x - camX),
      Math.round(sw.y - camY),
      Math.round(sw.r),
      sw.color
    );
  }

  // 8. Il Personaggio: CURSORE ROSSO
  if (!gameState.gameOver) {
    const px = Math.round(player.x - camX);
    const py = Math.round(player.y - camY);

    if (player.absorbPulse > 0) {
      ctx.strokeStyle = 'rgba(80, 140, 255, 0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(px, py, 12, player.angle - 1.1, player.angle + 1.1);
      ctx.stroke();
    }

    if (player.invuln <= 0 || Math.floor(player.invuln * 20) % 2 === 0) {
      drawRedCursor(px, py, player.angle);
    }
  }

  // 9. Indicatori direzionali sui bordi dello schermo
  drawPlanetRadarArrows(camX, camY);

  // 10. Testi fluttuanti pixelati
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  for (const ft of floatingTexts) {
    const fx = Math.round(ft.x - camX);
    const fy = Math.round(ft.y - camY);
    ctx.fillStyle = '#09080f';
    ctx.fillText(ft.text, fx + 1, fy + 1);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, fx, fy);
  }

  drawBossOverlay();

  // 11. Puntatore/Mirino personalizzato
  if (gameState.running && !gameState.paused) {
    drawCustomCrosshair(Math.round(gameState.mouse.x), Math.round(gameState.mouse.y));
  }
}

/**
 * Disegna il cursore rosso a punta di freccia senza coda rasterizzandolo pixel per pixel.
 */
function drawRedCursor(x, y, angle) {
  const cos = Math.cos(-angle);
  const sin = Math.sin(-angle);

  function inTri(px, py, ax, ay, bx, by, cx, cy) {
    const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
    const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
    const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
    const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
    return !(hasNeg && hasPos);
  }

  for (let dy = -8; dy <= 8; dy++) {
    for (let dx = -8; dx <= 8; dx++) {
      const lx = dx * cos - dy * sin;
      const ly = dx * sin + dy * cos;

      const insideUpper = inTri(lx, ly, 7.2, 0, -5.2, -5.2, -2.0, 0);
      const insideLower = inTri(lx, ly, 7.2, 0, -2.0, 0, -5.2, 5.2);

      if (insideUpper || insideLower) {
        ctx.fillStyle = lx > 3.5 ? '#ff4d5e' : '#ff2438';
        ctx.fillRect(x + dx, y + dy, 1, 1);
      }
    }
  }
}

function drawCustomCrosshair(mx, my) {
  ctx.fillStyle = '#09080f';
  ctx.fillRect(mx - 1, my - 1, 3, 3);
  ctx.fillRect(mx - 1, my - 7, 3, 5);
  ctx.fillRect(mx - 1, my + 3, 3, 5);
  ctx.fillRect(mx - 7, my - 1, 5, 3);
  ctx.fillRect(mx + 3, my - 1, 5, 3);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(mx, my - 6, 1, 4);
  ctx.fillRect(mx, my + 3, 1, 4);
  ctx.fillRect(mx - 6, my, 4, 1);
  ctx.fillRect(mx + 3, my, 4, 1);

  ctx.fillStyle = '#d92b43';
  ctx.fillRect(mx, my, 1, 1);
}

function drawPixelCircleOutline(cx, cy, r, color) {
  if (r <= 0) return;
  ctx.fillStyle = color;
  let x = Math.round(r);
  let y = 0;
  let err = 1 - x;

  while (x >= y) {
    ctx.fillRect(cx + x, cy + y, 1, 1);
    ctx.fillRect(cx + y, cy + x, 1, 1);
    ctx.fillRect(cx - y, cy + x, 1, 1);
    ctx.fillRect(cx - x, cy + y, 1, 1);
    ctx.fillRect(cx - x, cy - y, 1, 1);
    ctx.fillRect(cx - y, cy - x, 1, 1);
    ctx.fillRect(cx + y, cy - x, 1, 1);
    ctx.fillRect(cx + x, cy - y, 1, 1);

    y++;
    if (err < 0) {
      err += 2 * y + 1;
    } else {
      x--;
      err += 2 * (y - x + 1);
    }
  }
}

function fillPixelDisk(cx, cy, r) {
  for (let dy = -r; dy <= r; dy++) {
    const span = Math.floor(Math.sqrt(r * r - dy * dy));
    ctx.fillRect(cx - span, cy + dy, span * 2 + 1, 1);
  }
}

function drawPlanetRadarArrows(camX, camY) {
  const margin = 14;
  for (const p of planets) {
    if (p.destroyed) continue;
    const sx = p.x - camX;
    const sy = p.y - camY;
    if (sx < -p.baseRadius || sx > VIEW_W + p.baseRadius || sy < -p.baseRadius || sy > VIEW_H + p.baseRadius) {
      const ang = Math.atan2(sy - VIEW_H / 2, sx - VIEW_W / 2);
      const ix = Math.max(margin, Math.min(VIEW_W - margin, VIEW_W / 2 + Math.cos(ang) * (VIEW_W / 2 - margin)));
      const iy = Math.max(margin, Math.min(VIEW_H - margin, VIEW_H / 2 + Math.sin(ang) * (VIEW_H / 2 - margin)));

      ctx.fillStyle = p.hasSentinels ? '#ffae2b' : p.palette[0].hex;
      ctx.fillRect(Math.round(ix) - 1, Math.round(iy) - 1, 3, 3);
    }
  }
}

