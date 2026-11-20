// ============================================================================
// 5. SISTEMA PIANETI PROCEDURALI A STRATI IRREGOLARI & NUCLEO CORRODIBILE
// ============================================================================
const planets = [];
const sentinels = [];
const bullets = [];
const enemyBullets = [];
const floatingTexts = [];
const shockwaves = [];

const stars = [];
for (let i = 0; i < 160; i++) {
  stars.push({
    x: (Math.random() - 0.5) * 2000,
    y: (Math.random() - 0.5) * 2000,
    size: Math.random() < 0.2 ? 2 : 1,
    depth: 0.2 + Math.random() * 0.6,
    alpha: 0.35 + Math.random() * 0.65
  });
}

/**
 * Genera un pianeta irregolare a strati concentrici su una griglia di pixel reali.
 * Gli strati esterni sono ondulati mentre il nucleo rosso è un cerchio perfetto
 * in modo che possa essere corroso dall'interno fino all'ultimo pixel prima di esplodere.
 */
function createPlanet(worldX, worldY, forcedType = null) {
  const distFromOrigin = Math.hypot(worldX, worldY);
  let type = forcedType;
  if (!type) {
    const r = Math.random();
    if (distFromOrigin < 250) {
      type = r < 0.65 ? 'small' : 'medium';
    } else {
      if (r < 0.32) type = 'small';
      else if (r < 0.72) type = 'medium';
      else if (r < 0.88) type = 'exotic';
      else type = 'giant';
    }
  }

  const palette = PLANET_PALETTES[type];
  let baseRadius = 32;
  if (type === 'small') baseRadius = 24 + Math.floor(Math.random() * 10);
  else if (type === 'medium') baseRadius = 46 + Math.floor(Math.random() * 14);
  else if (type === 'exotic') baseRadius = 38 + Math.floor(Math.random() * 12);
  else if (type === 'giant') baseRadius = 74 + Math.floor(Math.random() * 16);

  const gridSize = (baseRadius + 14) * 2;
  const half = gridSize >> 1;

  const offCanvas = document.createElement('canvas');
  offCanvas.width = gridSize;
  offCanvas.height = gridSize;
  const offCtx = offCanvas.getContext('2d');
  const imgData = offCtx.createImageData(gridSize, gridSize);
  const data = imgData.data;

  const layerGrid = new Uint8Array(gridSize * gridSize); // 0 = vuoto, 1..N = strato
  const hpGrid = new Float32Array(gridSize * gridSize);
  const corrodedGrid = new Uint8Array(gridSize * gridSize); // 1 = pixel del nucleo corroso dall'interno

  const harmonics = [];
  const numLayers = palette.length;
  for (let l = 0; l < numLayers; l++) {
    harmonics.push({
      f1: 3 + Math.floor(Math.random() * 3),
      p1: Math.random() * Math.PI * 2,
      a1: (0.045 + Math.random() * 0.035) * baseRadius,
      f2: 5 + Math.floor(Math.random() * 4),
      p2: Math.random() * Math.PI * 2,
      a2: (0.025 + Math.random() * 0.025) * baseRadius
    });
  }

  let totalCorePixels = 0;
  let totalPixels = 0;
  const exactCoreRadius = baseRadius * 0.34;

  for (let py = 0; py < gridSize; py++) {
    const dy = py - half;
    for (let px = 0; px < gridSize; px++) {
      const dx = px - half;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      let assignedLayer = -1;
      for (let l = numLayers - 1; l >= 0; l--) {
        // Il nucleo rosso è un cerchio perfetto (deformazione 0), mentre gli strati esterni sono ondulati
        const isCoreLayer = l === numLayers - 1;
        const adjustedFrac = isCoreLayer ? 0.34 : 0.34 + (1 - 0.34) * ((numLayers - 1 - l) / (numLayers - 1));
        const h = harmonics[l];
        const wave = isCoreLayer
          ? 0
          : (Math.sin(angle * h.f1 + h.p1) * h.a1 + Math.cos(angle * h.f2 + h.p2) * h.a2);
        const layerRadius = isCoreLayer ? exactCoreRadius : (baseRadius * adjustedFrac + wave);

        if (dist <= layerRadius) {
          assignedLayer = l;
          break;
        }
      }

      if (assignedLayer !== -1) {
        const idx = py * gridSize + px;
        const layerInfo = palette[assignedLayer];
        layerGrid[idx] = assignedLayer + 1;
        hpGrid[idx] = layerInfo.hp;
        totalPixels++;
        if (layerInfo.isCore) {
          totalCorePixels++;
        }

        const pIdx = idx * 4;
        data[pIdx] = layerInfo.rgb[0];
        data[pIdx + 1] = layerInfo.rgb[1];
        data[pIdx + 2] = layerInfo.rgb[2];
        data[pIdx + 3] = 255;
      }
    }
  }

  offCtx.putImageData(imgData, 0, 0);

  // Essendo il nucleo un cerchio perfetto, la corrosione può espandersi fino all'ultimo anello di 1px
  const coreMaxHp = Math.max(8, Math.round(Math.pow(exactCoreRadius, 1.32) * 0.72));
  const maxCorrosionRadius = Math.max(1.0, exactCoreRadius - 0.95);

  return {
    x: worldX,
    y: worldY,
    type,
    baseRadius,
    gridSize,
    half,
    canvas: offCanvas,
    ctx: offCtx,
    imgData,
    layerGrid,
    hpGrid,
    corrodedGrid,
    palette,
    totalPixels,
    totalCorePixels,
    remainingCorePixels: totalCorePixels,
    coreDamage: 0,
    coreMaxHp,
    corrosionRadius: 0,
    maxCorrosionRadius,
    hasSentinels: type === 'giant' || (type === 'exotic' && Math.random() < 0.45),
    sentinelsSpawned: false,
    aggroRadius: baseRadius + 95,
    hitFlash: 0,
    destroyed: false,
    angle: 0,
    spin: (Math.random() < 0.5 ? -1 : 1) * (0.06 + Math.random() * 0.08) // rad/s, segno = orario/antiorario
  };
}

// Converte coordinate mondo -> griglia del pianeta (che ruota di planet.angle)
function planetToLocal(planet, wx, wy) {
  const dx = wx - planet.x;
  const dy = wy - planet.y;
  const c = Math.cos(planet.angle);
  const s = Math.sin(planet.angle);
  return { x: dx * c + dy * s + planet.half, y: -dx * s + dy * c + planet.half };
}

// Converte griglia del pianeta -> coordinate mondo
function planetToWorld(planet, px, py) {
  const dx = px - planet.half;
  const dy = py - planet.half;
  const c = Math.cos(planet.angle);
  const s = Math.sin(planet.angle);
  return { x: planet.x + dx * c - dy * s, y: planet.y + dx * s + dy * c };
}

/**
 * Corrode il nucleo dall'interno verso l'esterno creando un buco nero (#0d0c14)
 * che si allarga ad ogni colpo diretto fino alla detonazione finale del pianeta.
 */
function corrodePlanetCore(planet, hitWorldX, hitWorldY, damageAmount) {
  if (planet.destroyed) return;

  planet.coreDamage += damageAmount;
  audio.playDig(0.05);

  const ratio = Math.min(1, planet.coreDamage / planet.coreMaxHp);
  if (ratio >= 1) {
    shatterPlanetCompletely(planet);
    return;
  }

  // Espansione fluida del raggio nero interno proporzionale al danno accumulato
  const targetR = Math.pow(ratio, 0.75) * planet.maxCorrosionRadius;
  if (targetR <= planet.corrosionRadius) return;

  planet.corrosionRadius = targetR;
  const half = planet.half;
  const bound = Math.ceil(targetR);
  const minX = Math.max(0, half - bound);
  const maxX = Math.min(planet.gridSize - 1, half + bound);
  const minY = Math.max(0, half - bound);
  const maxY = Math.min(planet.gridSize - 1, half + bound);

  const toPlayerAngle = Math.atan2(player.y - hitWorldY, player.x - hitWorldX);
  let dirty = false;

  for (let py = minY; py <= maxY; py++) {
    const dy = py - half;
    for (let px = minX; px <= maxX; px++) {
      const dx = px - half;
      if (Math.hypot(dx, dy) > targetR) continue;

      const idx = py * planet.gridSize + px;
      const layerId = planet.layerGrid[idx];
      if (layerId === 0) continue;

      const layerInfo = planet.palette[layerId - 1];
      if (layerInfo.isCore && planet.corrodedGrid[idx] === 0) {
        planet.corrodedGrid[idx] = 1;
        planet.remainingCorePixels--;

        // Dipinge il pixel corroso del colore nero del vuoto spaziale (#0d0c14)
        const pIdx = idx * 4;
        planet.imgData.data[pIdx] = 13;
        planet.imgData.data[pIdx + 1] = 12;
        planet.imgData.data[pIdx + 2] = 20;
        planet.imgData.data[pIdx + 3] = 255;
        dirty = true;

        // Espelle frammenti scuri/incandescenti lungo il tunnel di scavo
        if (Math.random() < 0.25) {
          const { x: wx, y: wy } = planetToWorld(planet, px, py);
          const spreadAngle = toPlayerAngle + (Math.random() - 0.5) * 0.9;
          const ejectSpeed = 45 + Math.random() * 55;
          spawnParticle(
            wx,
            wy,
            Math.cos(spreadAngle) * ejectSpeed,
            Math.sin(spreadAngle) * ejectSpeed,
            Math.random() < 0.5 ? '#ff2e43' : '#3a151e',
            layerInfo.xp,
            0.06 + Math.random() * 0.06
          );
        }
      }
    }
  }

  if (dirty) {
    planet.ctx.putImageData(planet.imgData, 0, 0, minX, minY, maxX - minX + 1, maxY - minY + 1);
  }
}

/**
 * Scava pixel per pixel il pianeta nel punto di impatto (hitWorldX, hitWorldY).
 * Gli strati esterni vengono scavati normalmente; il nucleo rosso viene corroso
 * SOLO quando un colpo lo impatta direttamente (o tramite onda Nova che lo raggiunge).
 */
function damagePlanet(planet, hitWorldX, hitWorldY, radius, damage, allowSplashCore = false) {
  if (planet.destroyed) return;

  const local = planetToLocal(planet, hitWorldX, hitWorldY);
  const localX = Math.round(local.x);
  const localY = Math.round(local.y);
  const r = Math.ceil(radius);

  const minX = Math.max(0, localX - r);
  const maxX = Math.min(planet.gridSize - 1, localX + r);
  const minY = Math.max(0, localY - r);
  const maxY = Math.min(planet.gridSize - 1, localY + r);

  // Verifica se il colpo ha impattato direttamente un pixel del nucleo rosso
  let directCoreHit = false;
  if (localX >= 0 && localX < planet.gridSize && localY >= 0 && localY < planet.gridSize) {
    const directIdx = localY * planet.gridSize + localX;
    const directLayer = planet.layerGrid[directIdx];
    if (directLayer > 0 && planet.corrodedGrid[directIdx] === 0 && planet.palette[directLayer - 1].isCore) {
      directCoreHit = true;
    }
  }

  let dirty = false;
  let dugCount = 0;
  let deepestLayerRatio = 1.0;
  let coreHit = false;
  let maxCoreImpactFactor = 0;

  const toPlayerAngle = Math.atan2(player.y - hitWorldY, player.x - hitWorldX);

  for (let py = minY; py <= maxY; py++) {
    const dy = py - localY;
    for (let px = minX; px <= maxX; px++) {
      const dx = px - localX;
      const distSq = dx * dx + dy * dy;
      if (distSq > radius * radius) continue;

      const idx = py * planet.gridSize + px;
      const layerId = planet.layerGrid[idx];
      if (layerId === 0 || planet.corrodedGrid[idx] === 1) continue;

      const layerInfo = planet.palette[layerId - 1];
      const layerRatio = 1 - (layerId - 1) / planet.palette.length;
      if (layerRatio < deepestLayerRatio) deepestLayerRatio = layerRatio;

      const distNorm = Math.sqrt(distSq) / Math.max(0.5, radius);
      const pixelFactor = (1.0 - distNorm * 0.55) * (0.85 + Math.random() * 0.3);

      // Il nucleo si corrode dall'interno SOLO se il colpo lo ha impattato direttamente (o con Nova)
      if (layerInfo.isCore) {
        if (directCoreHit || allowSplashCore) {
          coreHit = true;
          if (pixelFactor > maxCoreImpactFactor) {
            maxCoreImpactFactor = pixelFactor;
          }

          if (Math.random() < 0.35) {
            const sparkAng = toPlayerAngle + (Math.random() - 0.5) * 1.8;
            const sparkSpd = 40 + Math.random() * 60;
            spawnParticle(
              hitWorldX,
              hitWorldY,
              Math.cos(sparkAng) * sparkSpd,
              Math.sin(sparkAng) * sparkSpd,
              Math.random() < 0.55 ? '#ffffff' : '#ff2e43',
              0,
              0.14
            );
          }
        }
        continue;
      }

      planet.hpGrid[idx] -= damage * pixelFactor;

      if (planet.hpGrid[idx] <= 0) {
        planet.layerGrid[idx] = 0;
        const pIdx = idx * 4;
        planet.imgData.data[pIdx + 3] = 0;
        dirty = true;
        dugCount++;

        const { x: wx, y: wy } = planetToWorld(planet, px, py);
        const sideSign = Math.random() < 0.5 ? -1 : 1;
        const spreadAngle = toPlayerAngle + sideSign * (0.35 + Math.random() * 0.75);
        const ejectSpeed = 55 + Math.random() * 65;

        spawnParticle(
          wx,
          wy,
          Math.cos(spreadAngle) * ejectSpeed,
          Math.sin(spreadAngle) * ejectSpeed,
          layerInfo.hex,
          layerInfo.xp,
          0.05 + Math.random() * 0.08
        );
      } else {
        const pIdx = idx * 4;
        const damageRatio = Math.max(0, Math.min(1, 1 - planet.hpGrid[idx] / layerInfo.hp));
        planet.imgData.data[pIdx] = Math.min(255, Math.round(layerInfo.rgb[0] + damageRatio * 55));
        planet.imgData.data[pIdx + 1] = Math.min(255, Math.round(layerInfo.rgb[1] + damageRatio * 55));
        planet.imgData.data[pIdx + 2] = Math.min(255, Math.round(layerInfo.rgb[2] + damageRatio * 55));
        dirty = true;

        if (Math.random() < 0.28) {
          const sparkAng = toPlayerAngle + (Math.random() - 0.5) * 1.8;
          const sparkSpd = 35 + Math.random() * 55;
          spawnParticle(
            hitWorldX,
            hitWorldY,
            Math.cos(sparkAng) * sparkSpd,
            Math.sin(sparkAng) * sparkSpd,
            Math.random() < 0.6 ? '#ffffff' : '#ffbe45',
            0,
            0.14
          );
        }
      }
    }
  }

  if (dirty) {
    planet.ctx.putImageData(planet.imgData, 0, 0, minX, minY, maxX - minX + 1, maxY - minY + 1);
  }

  if (dugCount > 0) {
    audio.playDig(deepestLayerRatio);
  }

  if (planet.hasSentinels && !planet.sentinelsSpawned) {
    spawnSentinelsForPlanet(planet);
  }

  if (coreHit) {
    corrodePlanetCore(planet, hitWorldX, hitWorldY, damage * Math.max(0.65, maxCoreImpactFactor));
  }
}

/**
 * Distruzione catastrofica del pianeta al completamento della corrosione del nucleo:
 * Tutti i pixel superstiti esplodono in una nube sferica e vengono poi risucchiati dal cursore.
 */
function shatterPlanetCompletely(planet) {
  if (planet.destroyed) return;
  planet.destroyed = true;
  gameState.planetsDestroyed++;
  gameState.camera.shake = Math.min(12, gameState.camera.shake + (planet.type === 'giant' ? 9 : 5));
  audio.playPlanetDestroy();

  shockwaves.push({
    x: planet.x,
    y: planet.y,
    r: 4,
    maxR: planet.baseRadius * 1.9,
    alpha: 1,
    color: '#ffffff'
  });

  const step = planet.type === 'giant' ? 2 : 1;
  let bonusScore = 0;

  for (let py = 0; py < planet.gridSize; py += step) {
    for (let px = 0; px < planet.gridSize; px += step) {
      const idx = py * planet.gridSize + px;
      const layerId = planet.layerGrid[idx];
      if (layerId === 0 || planet.corrodedGrid[idx] === 1) continue;

      const layerInfo = planet.palette[layerId - 1];
      const { x: wx, y: wy } = planetToWorld(planet, px, py);
      const angle = Math.atan2(wy - planet.y, wx - planet.x) + (Math.random() - 0.5) * 0.4;
      const distRatio = Math.hypot(wx - planet.x, wy - planet.y) / Math.max(1, planet.baseRadius);
      const burstSpeed = (45 + distRatio * 130) * (0.7 + Math.random() * 0.6);

      spawnParticle(
        wx,
        wy,
        Math.cos(angle) * burstSpeed,
        Math.sin(angle) * burstSpeed,
        layerInfo.hex,
        layerInfo.xp * step,
        0.35 + Math.random() * 0.25
      );

      bonusScore += layerInfo.xp * step * 5;
    }
  }

  gameState.score += bonusScore;
  addFloatingText(planet.x, planet.y, `+${bonusScore.toLocaleString()}`, '#38e8ff');
}

