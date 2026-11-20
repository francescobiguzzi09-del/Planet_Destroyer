// ============================================================================
// 12. GESTIONE INPUT (MOUSE, TASTIERA WASD, TOUCH) & HUD
// ============================================================================
window.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  gameState.mouse.x = ((e.clientX - rect.left) / rect.width) * VIEW_W;
  gameState.mouse.y = ((e.clientY - rect.top) / rect.height) * VIEW_H;
});

window.addEventListener('mousedown', (e) => {
  if (e.button === 0) {
    gameState.mouse.down = true;
  } else if (e.button === 2) {
    triggerNova();
  }
});

window.addEventListener('mouseup', (e) => {
  if (e.button === 0) gameState.mouse.down = false;
});

window.addEventListener('contextmenu', (e) => e.preventDefault());

window.addEventListener('keydown', (e) => {
  gameState.keys[e.code] = true;

  if (e.code === 'Space') {
    e.preventDefault();
    triggerNova();
  }

  if (gameState.paused) {
    if (e.code === 'Digit1') selectUpgrade(0);
    if (e.code === 'Digit2') selectUpgrade(1);
    if (e.code === 'Digit3') selectUpgrade(2);
  }
});

window.addEventListener('keyup', (e) => {
  gameState.keys[e.code] = false;
});

const touchState = { joyActive: false, joyX: 0, joyY: 0, firing: false };
const joystickEl = document.getElementById('joystick');
const knobEl = document.getElementById('joystick-knob');

joystickEl.addEventListener('touchstart', (e) => {
  e.preventDefault();
  touchState.joyActive = true;
  handleJoystickTouch(e.touches[0]);
}, { passive: false });

joystickEl.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (touchState.joyActive) handleJoystickTouch(e.touches[0]);
}, { passive: false });

joystickEl.addEventListener('touchend', () => {
  touchState.joyActive = false;
  touchState.joyX = 0;
  touchState.joyY = 0;
  knobEl.style.left = '35px';
  knobEl.style.top = '35px';
});

function handleJoystickTouch(touch) {
  const rect = joystickEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const maxR = 36;
  let dx = touch.clientX - cx;
  let dy = touch.clientY - cy;
  const dist = Math.hypot(dx, dy);
  if (dist > maxR) {
    dx = (dx / dist) * maxR;
    dy = (dy / dist) * maxR;
  }
  touchState.joyX = dx / maxR;
  touchState.joyY = dy / maxR;
  knobEl.style.left = `${35 + dx}px`;
  knobEl.style.top = `${35 + dy}px`;
}

canvas.addEventListener('touchstart', (e) => {
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];
  gameState.mouse.x = ((t.clientX - rect.left) / rect.width) * VIEW_W;
  gameState.mouse.y = ((t.clientY - rect.top) / rect.height) * VIEW_H;
  touchState.firing = true;
}, { passive: true });

canvas.addEventListener('touchmove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];
  gameState.mouse.x = ((t.clientX - rect.left) / rect.width) * VIEW_W;
  gameState.mouse.y = ((t.clientY - rect.top) / rect.height) * VIEW_H;
}, { passive: true });

canvas.addEventListener('touchend', () => {
  touchState.firing = false;
});

document.getElementById('touch-fire').addEventListener('touchstart', (e) => {
  e.preventDefault();
  touchState.firing = true;
});
document.getElementById('touch-fire').addEventListener('touchend', () => {
  touchState.firing = false;
});
document.getElementById('touch-nova').addEventListener('touchstart', (e) => {
  e.preventDefault();
  triggerNova();
});

