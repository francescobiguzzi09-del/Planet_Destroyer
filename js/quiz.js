// ============================================================================
// 16. QUIZ DI CYBERSECURITY (QUANDO IL BOSS TI COLPISCE)
// ============================================================================
const quizScreen = document.getElementById('quiz-screen');
const quizQuestionEl = document.getElementById('quiz-question');
const quizAnswersEl = document.getElementById('quiz-answers');
const quizFeedbackEl = document.getElementById('quiz-feedback');
const quizContinueBtn = document.getElementById('quiz-continue');

let quizDeck = [];
let quizAnsweredCorrectly = false;

function askCyberQuestion() {
  if (quizDeck.length === 0) {
    quizDeck = [...CYBER_QUESTIONS].sort(() => Math.random() - 0.5);
  }
  const question = quizDeck.pop();

  gameState.paused = true;
  audio.playPlayerDamage();

  quizQuestionEl.textContent = question.q;
  quizAnswersEl.innerHTML = '';
  quizFeedbackEl.classList.add('hidden');
  quizContinueBtn.classList.add('hidden');

  const answers = question.answers
    .map((text, i) => ({ text, correct: i === 0 }))
    .sort(() => Math.random() - 0.5);

  for (const answer of answers) {
    const btn = document.createElement('button');
    btn.className = 'pixel-btn quiz-answer';
    btn.textContent = answer.text;
    btn.dataset.correct = answer.correct ? '1' : '';
    btn.addEventListener('click', () => answerCyberQuestion(btn, question));
    quizAnswersEl.appendChild(btn);
  }

  quizScreen.classList.remove('hidden');
}

function answerCyberQuestion(chosenBtn, question) {
  quizAnsweredCorrectly = chosenBtn.dataset.correct === '1';

  for (const btn of quizAnswersEl.children) {
    btn.disabled = true;
    if (btn.dataset.correct) btn.classList.add('correct');
  }
  if (!quizAnsweredCorrectly) chosenBtn.classList.add('wrong');

  quizFeedbackEl.textContent = (quizAnsweredCorrectly
    ? 'GIUSTO! FIREWALL ATTIVO: NESSUN DANNO. '
    : `SBAGLIATO! IL TROJAN TI COLPISCE: -${BOSS_WRONG_ANSWER_DAMAGE} SCAFO. `) + question.why;
  quizFeedbackEl.style.color = quizAnsweredCorrectly ? '#26e666' : '#ff2e43';
  quizFeedbackEl.classList.remove('hidden');
  quizContinueBtn.classList.remove('hidden');
  quizContinueBtn.focus();
}

quizContinueBtn.addEventListener('click', () => {
  quizScreen.classList.add('hidden');
  gameState.paused = false;
  gameState.mouse.down = false;
  player.invuln = 1.2;

  if (quizAnsweredCorrectly) {
    addFloatingText(player.x, player.y - 12, 'PROTETTO!', '#26e666');
    return;
  }

  player.hp = Math.max(0, player.hp - BOSS_WRONG_ANSWER_DAMAGE);
  gameState.camera.shake = 8;
  audio.playPlayerDamage();
  addFloatingText(player.x, player.y - 12, `-${BOSS_WRONG_ANSWER_DAMAGE}`, '#ff2e43');
  if (player.hp <= 0) triggerGameOver();
});
