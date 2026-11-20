// ============================================================================
// 4. POOL PARTICELLARE AD ALTE PRESTAZIONI (PER ASSORBIMENTO & ESPLOSIONI)
// ============================================================================
const MAX_PARTICLES = 4500;
const pX = new Float32Array(MAX_PARTICLES);
const pY = new Float32Array(MAX_PARTICLES);
const pVx = new Float32Array(MAX_PARTICLES);
const pVy = new Float32Array(MAX_PARTICLES);
const pDelay = new Float32Array(MAX_PARTICLES);
const pXp = new Uint8Array(MAX_PARTICLES);
const pColor = new Array(MAX_PARTICLES).fill('#ffffff');
const pActive = new Uint8Array(MAX_PARTICLES);
let particleCursor = 0;

function spawnParticle(x, y, vx, vy, colorHex, xpVal = 2, delay = 0.08) {
  for (let tries = 0; tries < 60; tries++) {
    const idx = particleCursor;
    particleCursor = (particleCursor + 1) % MAX_PARTICLES;
    if (pActive[idx] === 0) {
      pActive[idx] = 1;
      pX[idx] = x;
      pY[idx] = y;
      pVx[idx] = vx;
      pVy[idx] = vy;
      pColor[idx] = colorHex;
      pXp[idx] = xpVal;
      pDelay[idx] = delay;
      return;
    }
  }
  const idx = particleCursor;
  particleCursor = (particleCursor + 1) % MAX_PARTICLES;
  pActive[idx] = 1;
  pX[idx] = x;
  pY[idx] = y;
  pVx[idx] = vx;
  pVy[idx] = vy;
  pColor[idx] = colorHex;
  pXp[idx] = xpVal;
  pDelay[idx] = delay;
}

