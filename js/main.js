// ============================================================================
// 13. AVVIO, RESET & GAME LOOP PRINCIPALE
// ============================================================================
function resetGame() {
  planets.length = 0;
  sentinels.length = 0;
  bullets.length = 0;
  enemyBullets.length = 0;
  floatingTexts.length = 0;
  shockwaves.length = 0;
  pActive.fill(0);

  player.x = 0;
  player.y = 0;
  player.vx = 0;
  player.vy = 0;
  player.hp = 100;
  player.maxHp = 100;
  player.xp = 0;
  player.xpToNext = 450;
  player.level = 1;
  player.invuln = 0;
  player.moveSpeed = 135;
  player.fireRate = 0.095;
  player.drillDamage = 1.0;
  player.blastRadius = 1.6;
  player.multiShot = 1;
  player.magnetRadius = 130;
  player.magnetForce = 420;
  player.novaUnlocked = false;
  player.novaTimer = 0;
  player.novaRadius = 65;
  player.novaCooldown = 6.0;

  document.getElementById('nova-bar-wrap').style.display = 'none';

  gameState.score = 0;
  gameState.planetsDestroyed = 0;
  gameState.gameOver = false;
  gameState.paused = false;
  gameState.running = true;
  gameState.camera.x = -VIEW_W / 2;
  gameState.camera.y = -VIEW_H / 2;

  resetBoss();
  document.getElementById('quiz-screen').classList.add('hidden');

  planets.push(createPlanet(105, 0, 'small'));
  planets.push(createPlanet(225, -40, 'medium'));
  maintainUniverse();
  updateHUD();
}

function triggerGameOver() {
  gameState.gameOver = true;
  gameState.running = false;
  audio.playPlanetDestroy();
  document.getElementById('final-score').textContent = gameState.score.toLocaleString();
  document.getElementById('final-planets').textContent = gameState.planetsDestroyed;
  document.getElementById('final-lvl').textContent = player.level;
  document.getElementById('gameover-screen').classList.remove('hidden');
}

function triggerVictory() {
  gameState.running = false;
  audio.playLevelUp();
  document.getElementById('win-score').textContent = gameState.score.toLocaleString();
  document.getElementById('win-planets').textContent = gameState.planetsDestroyed;
  document.getElementById('win-lvl').textContent = player.level;
  document.getElementById('victory-screen').classList.remove('hidden');
}

document.getElementById('start-btn').addEventListener('click', () => {
  audio.init();
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  resetGame();
});

document.getElementById('restart-btn').addEventListener('click', () => {
  document.getElementById('gameover-screen').classList.add('hidden');
  resetGame();
});

document.getElementById('victory-restart-btn').addEventListener('click', () => {
  document.getElementById('victory-screen').classList.add('hidden');
  resetGame();
});

document.getElementById('audio-btn').addEventListener('click', (e) => {
  audio.init();
  const on = audio.toggle();
  e.target.textContent = on ? 'AUDIO: ON' : 'AUDIO: OFF';
});

let lastTimestamp = 0;
function gameLoop(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const dt = Math.min(0.05, (timestamp - lastTimestamp) / 1000);
  lastTimestamp = timestamp;

  update(dt);
  render();

  requestAnimationFrame(gameLoop);
}

window.onload = function () {
  planets.push(createPlanet(95, 0, 'medium'));
  gameState.camera.x = -VIEW_W / 2;
  gameState.camera.y = -VIEW_H / 2;
  requestAnimationFrame(gameLoop);
};
