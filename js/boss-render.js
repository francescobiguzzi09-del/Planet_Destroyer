// ============================================================================
// 17. RENDERING BOSS TROJAN.EXE & ARENA
// ============================================================================
// Teschio pixel art: X = osso verde, E = occhio rosso
const BOSS_SKULL = [
  '....XXXXXXXX....',
  '..XXXXXXXXXXXX..',
  '.XXXXXXXXXXXXXX.',
  'XXXXXXXXXXXXXXXX',
  'XXX....XX....XXX',
  'XXX.EE.XX.EE.XXX',
  'XXX....XX....XXX',
  'XXXXXXX..XXXXXXX',
  '.XXXXXX..XXXXXX.',
  '..XXXXXXXXXXXX..',
  '...X.X.X.X.X.X..',
  '...XXXXXXXXXXXX.',
  '....X.X.X.X.X...'
];

function drawBoss(camX, camY) {
  if (!boss) return;
  const bx = Math.round(boss.x - camX);
  const by = Math.round(boss.y - camY);
  const flash = boss.hitFlash > 0;

  ctx.fillStyle = 'rgba(38, 230, 102, 0.10)';
  fillPixelDisk(bx, by, 42);

  // Finestra di un programma maligno, con glitch orizzontale casuale
  const w = 56;
  const h = 46;
  const left = bx - w / 2 + (Math.random() < 0.08 ? (Math.random() < 0.5 ? -3 : 3) : 0);
  const top = by - h / 2;

  ctx.fillStyle = '#07140c';
  ctx.fillRect(left, top, w, h);
  ctx.fillStyle = flash ? '#ffffff' : '#26e666';
  ctx.fillRect(left, top, w, 2);
  ctx.fillRect(left, top + h - 2, w, 2);
  ctx.fillRect(left, top, 2, h);
  ctx.fillRect(left + w - 2, top, 2, h);

  // Barra del titolo rossa con i tre tasti finestra
  ctx.fillStyle = flash ? '#ffffff' : '#ff2e43';
  ctx.fillRect(left + 2, top + 2, w - 4, 7);
  ctx.fillStyle = '#ffffff';
  for (let k = 0; k < 3; k++) ctx.fillRect(left + w - 8 - k * 5, top + 4, 3, 3);

  // Teschio
  const eyesOn = Math.floor(boss.t * 4) % 2 === 0;
  const skullX = left + (w - BOSS_SKULL[0].length * 2) / 2;
  const skullY = top + 13;
  for (let row = 0; row < BOSS_SKULL.length; row++) {
    for (let col = 0; col < BOSS_SKULL[row].length; col++) {
      const cell = BOSS_SKULL[row][col];
      if (cell === '.') continue;
      ctx.fillStyle = cell === 'E'
        ? (eyesOn ? '#ff2e43' : '#5a0d18')
        : (flash ? '#ffffff' : '#26e666');
      ctx.fillRect(skullX + col * 2, skullY + row * 2, 2, 2);
    }
  }

  // Codice binario che orbita intorno al trojan
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  for (let k = 0; k < 8; k++) {
    const ang = boss.t * 1.2 + (k * Math.PI) / 4;
    ctx.fillStyle = k % 2 ? 'rgba(38, 230, 102, 0.8)' : 'rgba(255, 46, 67, 0.8)';
    ctx.fillText(k % 2 ? '1' : '0', bx + Math.cos(ang) * 44, by + Math.sin(ang) * 36 + 3);
  }
}

function drawBossOverlay() {
  if (gameState.phase === 'explore') return;

  // Bordo dell'arena: lo schermo è bloccato
  const pulse = Math.floor(gameState.time * 3) % 2 === 0;
  ctx.fillStyle = pulse ? '#ff2e43' : '#7a0f1f';
  ctx.fillRect(0, 0, VIEW_W, 2);
  ctx.fillRect(0, VIEW_H - 2, VIEW_W, 2);
  ctx.fillRect(0, 0, 2, VIEW_H);
  ctx.fillRect(VIEW_W - 2, 0, 2, VIEW_H);

  ctx.textAlign = 'center';

  if (gameState.phase === 'cutscene') {
    ctx.fillStyle = 'rgba(8, 7, 14, 0.45)';
    ctx.fillRect(0, VIEW_H / 2 - 26, VIEW_W, 46);
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillStyle = pulse ? '#ff2e43' : '#ffffff';
    ctx.fillText('INTRUSIONE RILEVATA', VIEW_W / 2, VIEW_H / 2 - 4);
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#26e666';
    ctx.fillText('TROJAN.EXE STA PRENDENDO IL CONTROLLO...', VIEW_W / 2, VIEW_H / 2 + 12);
    return;
  }

  // Barra vita del boss in basso
  if (boss && gameState.phase === 'boss') {
    const barW = Math.round(VIEW_W * 0.5);
    const barX = Math.round((VIEW_W - barW) / 2);
    const barY = VIEW_H - 14;
    ctx.fillStyle = '#08080d';
    ctx.fillRect(barX - 2, barY - 2, barW + 4, 8);
    ctx.fillStyle = '#26e666';
    ctx.fillRect(barX, barY, Math.round(barW * Math.max(0, boss.hp / BOSS_MAX_HP)), 4);
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('TROJAN.EXE', VIEW_W / 2, barY - 5);
  }
}
