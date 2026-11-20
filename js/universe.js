// ============================================================================
// 9. POPOLAMENTO MONDO SPAZIALE INFINITO
// ============================================================================
function maintainUniverse() {
  for (let i = planets.length - 1; i >= 0; i--) {
    const p = planets[i];
    const dist = Math.hypot(p.x - player.x, p.y - player.y);
    if (p.destroyed || dist > 1100) {
      planets.splice(i, 1);
    }
  }

  const targetPlanets = 9;
  let attempts = 0;
  while (planets.length < targetPlanets && attempts < 40) {
    attempts++;
    const angle = Math.random() * Math.PI * 2;
    const dist = planets.length === 0 ? 115 : (170 + Math.random() * 480);
    const cx = player.x + Math.cos(angle) * dist;
    const cy = player.y + Math.sin(angle) * dist;

    if (Math.hypot(cx - player.x, cy - player.y) < 95) continue;

    let overlaps = false;
    for (const other of planets) {
      if (Math.hypot(cx - other.x, cy - other.y) < other.baseRadius + 135) {
        overlaps = true;
        break;
      }
    }
    if (!overlaps) {
      planets.push(createPlanet(cx, cy));
    }
  }
}

