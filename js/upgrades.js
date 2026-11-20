// ============================================================================
// 7. SISTEMA POTENZIAMENTI & LEVEL UP
// ============================================================================
const UPGRADE_POOL = [
  {
    id: 'drill',
    title: 'TRIVELLA QUANTICA',
    desc: '+35% DANNO DI SCAVO SUGLI STRATI INTERNI',
    color: '#ff2e43',
    apply: () => { player.drillDamage *= 1.35; }
  },
  {
    id: 'radius',
    title: 'CRATERE ESPANSO',
    desc: '+0.6 PIXEL RAGGIO SCAVO COLPI',
    color: '#26e666',
    apply: () => { player.blastRadius += 0.6; }
  },
  {
    id: 'firerate',
    title: 'RAFFICA ACCELERATA',
    desc: '+22% VELOCITA DI FUOCO',
    color: '#38e8ff',
    apply: () => { player.fireRate *= 0.80; }
  },
  {
    id: 'multishot',
    title: 'CANNONE MULTIPLO',
    desc: '+1 BOCCHETTA DI FUOCO SIMULTANEA',
    color: '#ffae2b',
    apply: () => { player.multiShot = Math.min(5, player.multiShot + 1); }
  },
  {
    id: 'speed',
    title: 'PROPULSORI IONICI',
    desc: '+20% VELOCITA DI MOVIMENTO NEL VUOTO',
    color: '#8ee3ff',
    apply: () => { player.moveSpeed *= 1.20; }
  },
  {
    id: 'magnet',
    title: 'POZZO GRAVITAZIONALE',
    desc: '+40% RAGGIO E VELOCITA ASSORBIMENTO',
    color: '#b469ff',
    apply: () => {
      player.magnetRadius *= 1.40;
      player.magnetForce *= 1.30;
    }
  },
  {
    id: 'hull',
    title: 'SCAFO RINFORZATO',
    desc: '+30 HP MASSIMI E RIPARAZIONE TOTALE',
    color: '#ff5277',
    apply: () => {
      player.maxHp += 30;
      player.hp = player.maxHp;
    }
  },
  {
    id: 'nova',
    title: 'ONDA D\'URTO NOVA',
    desc: player => player.novaUnlocked ? 'POTENZIA RAGGIO E RICARICA NOVA [SPAZIO]' : 'SBLOCCA ESPLOSIONE RADIALE [SPAZIO]',
    color: '#ffae2b',
    apply: () => {
      if (!player.novaUnlocked) {
        player.novaUnlocked = true;
        player.novaTimer = 0;
        document.getElementById('nova-bar-wrap').style.display = 'flex';
      } else {
        player.novaRadius += 24;
        player.novaCooldown = Math.max(2.5, player.novaCooldown * 0.82);
      }
    }
  }
];

let currentUpgradeChoices = [];

function triggerLevelUp() {
  gameState.paused = true;
  audio.playLevelUp();

  const shuffled = [...UPGRADE_POOL].sort(() => Math.random() - 0.5);
  currentUpgradeChoices = shuffled.slice(0, 3);

  const container = document.getElementById('upgrade-cards');
  container.innerHTML = '';

  currentUpgradeChoices.forEach((upg, index) => {
    const descText = typeof upg.desc === 'function' ? upg.desc(player) : upg.desc;
    const card = document.createElement('div');
    card.className = 'upgrade-card';
    card.innerHTML = `
      <span class="upgrade-key">[TASTO ${index + 1}]</span>
      <div class="upgrade-icon" style="background:${upg.color}; border:2px solid #fff;"></div>
      <div class="upgrade-title" style="color:${upg.color};">${upg.title}</div>
      <div class="upgrade-desc">${descText}</div>
    `;
    card.addEventListener('click', () => selectUpgrade(index));
    container.appendChild(card);
  });

  document.getElementById('levelup-screen').classList.remove('hidden');
}

function selectUpgrade(index) {
  if (!gameState.paused || !currentUpgradeChoices[index]) return;
  const chosen = currentUpgradeChoices[index];
  chosen.apply();
  currentUpgradeChoices = []; // altrimenti i tasti 1-3 riapplicano l'upgrade durante il quiz
  addFloatingText(player.x, player.y - 16, chosen.title, chosen.color);

  document.getElementById('levelup-screen').classList.add('hidden');
  gameState.paused = false;
  updateHUD();
}

