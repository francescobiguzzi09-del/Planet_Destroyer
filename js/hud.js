function updateHUD() {
  const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
  document.getElementById('hp-fill').style.width = `${hpPct}%`;
  document.getElementById('hp-text').textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;

  const xpPct = Math.min(100, Math.floor((player.xp / player.xpToNext) * 100));
  document.getElementById('xp-fill').style.width = `${xpPct}%`;
  document.getElementById('xp-text').textContent = `${xpPct}%`;
  document.getElementById('lvl-num').textContent = player.level;

  if (player.novaUnlocked) {
    const novaPct = Math.max(0, (1 - player.novaTimer / player.novaCooldown) * 100);
    document.getElementById('nova-fill').style.width = `${novaPct}%`;
  }

  document.getElementById('score-text').textContent = gameState.score.toLocaleString();
  document.getElementById('planets-text').textContent = gameState.planetsDestroyed;

  const secs = Math.max(0, Math.ceil(gameState.bossTimer));
  document.getElementById('boss-timer-text').textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  document.getElementById('boss-timer-badge').classList.toggle('hidden', gameState.phase !== 'explore');
}

