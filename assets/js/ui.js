/**
 * Module UI - Gestion de l'interface utilisateur
 */

export const ui = {
  start: document.getElementById('startScreen'), 
  game: document.getElementById('gameUI'), 
  startBtn: document.getElementById('startBtn'), 
  restartBtn: document.getElementById('restartBtn'),
  nextOverlay: document.getElementById('nextOverlay'), 
  nextBtn: document.getElementById('nextBtn'), 
  victory: document.getElementById('victoryOverlay'),
  vTitle: document.getElementById('victoryTitle'), 
  vSub: document.getElementById('victorySubtitle'), 
  playAgain: document.getElementById('playAgainBtn'),
  tBanner: document.getElementById('turnBanner'), 
  tText: document.getElementById('turnText'), 
  tBall: document.getElementById('turnBall'),
  name1: document.getElementById('name1'),
  name2: document.getElementById('name2'),
  score1: document.getElementById('score1'),
  score2: document.getElementById('score2'),
  powerMeter: document.getElementById('powerMeter'), 
  powerFill: document.getElementById('powerFill'),
  statsPanel: document.getElementById('statsPanel'), 
  shotCount: document.getElementById('shotCount'), 
  streak: document.getElementById('streak'), 
  gameTime: document.getElementById('gameTime'),
  networkPanel: document.getElementById('networkPanel'), 
  gameMode: document.getElementById('gameMode'), 
  ping: document.getElementById('ping'), 
  syncStatus: document.getElementById('syncStatus'),
  
  // Multiplayer UI
  localBtn: document.getElementById('localBtn'), 
  aiBtn: document.getElementById('aiBtn'), 
  hostBtn: document.getElementById('hostBtn'), 
  joinBtn: document.getElementById('joinBtn'),
  multiplayerSection: document.getElementById('multiplayerSection'), 
  hostSection: document.getElementById('hostSection'), 
  joinSection: document.getElementById('joinSection'),
  aiSection: document.getElementById('aiSection'), 
  cancelAI: document.getElementById('cancelAI'),
  myPeerId: document.getElementById('myPeerId'), 
  friendId: document.getElementById('friendId'), 
  connectBtn: document.getElementById('connectBtn'),
  statusDot: document.getElementById('statusDot'), 
  statusText: document.getElementById('statusText'), 
  cancelMultiplayer: document.getElementById('cancelMultiplayer'),
  
  // Chat UI
  toggleChat: document.getElementById('toggleChat'), 
  chatPanel: document.getElementById('chatPanel'), 
  closeChat: document.getElementById('closeChat'),
  chatMessages: document.getElementById('chatMessages'), 
  chatInput: document.getElementById('chatInput'), 
  sendChat: document.getElementById('sendChat'),
  copyPeerBtn: document.getElementById('copyPeerBtn')
};

/**
 * Affiche une notification d'achievement
 */
export function showAchievement(text) {
  const div = document.createElement('div');
  div.className = 'achievement';
  div.textContent = text;
  document.body.appendChild(div);
  
  setTimeout(() => {
    div.remove();
  }, 4500);
}

/**
 * Met à jour l'affichage du statut de connexion
 */
export function updateStatus(status, text) {
  ui.statusDot.className = `status-dot ${status}`;
  ui.statusText.textContent = text;
}

/**
 * Met à jour les scores affichés
 */
export function updateScores(players) {
  ui.score1.textContent = players[0].wins;
  ui.score2.textContent = players[1].wins;
  ui.name1.textContent = players[0].name;
  ui.name2.textContent = players[1].name;
}

/**
 * Met à jour l'indicateur de tour
 */
export function updateTurnIndicator(player, hideTurn) {
  if (hideTurn) {
    ui.tBanner.style.display = 'none';
  } else {
    ui.tBanner.style.display = 'flex';
    ui.tText.textContent = `TOUR DE ${player.name}`;
    ui.tBall.className = `turn-ball ${player.color}`;
    
    // Masquer automatiquement après 2 secondes pour ne pas gêner le jeu
    setTimeout(() => {
      if (ui.tBanner && ui.tBanner.style.display === 'flex') {
        ui.tBanner.style.opacity = '0.7';
        setTimeout(() => {
          if (ui.tBanner) {
            ui.tBanner.style.display = 'none';
          }
        }, 300);
      }
    }, 2000);
  }
}

/**
 * Met à jour les statistiques du jeu
 */
export function updateStats(totalShots, currentStreak, gameStartTime) {
  if (ui.shotCount) ui.shotCount.textContent = totalShots;
  if (ui.streak) ui.streak.textContent = currentStreak;
  
  if (gameStartTime > 0 && ui.gameTime) {
    const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    ui.gameTime.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

/**
 * Affiche/cache la jauge de puissance
 */
export function showPowerMeter(visible, power = 0) {
  if (visible) {
    ui.powerMeter.classList.add('visible');
    ui.powerFill.style.width = `${power}%`;
  } else {
    ui.powerMeter.classList.remove('visible');
    ui.powerFill.style.width = '0%';
  }
}

/**
 * Bascule entre l'écran de démarrage et le jeu
 */
export function toggleGameView(showGame) {
  if (showGame) {
    ui.start.style.display = 'none';
    ui.game.style.display = 'block';
  } else {
    ui.start.style.display = 'block';
    ui.game.style.display = 'none';
  }
}

/**
 * Affiche un texte de combo
 */
export function showComboText(text) {
  const existingCombo = document.querySelector('.combo-text');
  if (existingCombo) {
    existingCombo.remove();
  }
  
  const combo = document.createElement('div');
  combo.className = 'combo-text';
  combo.textContent = text;
  combo.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.5);
    font-size: 48px;
    font-weight: 900;
    color: var(--neon-pink);
    text-shadow: 0 0 30px var(--neon-pink);
    pointer-events: none;
    z-index: 10;
    opacity: 0;
    animation: comboAnim 2s ease forwards;
  `;
  
  // Ajouter au canvas parent
  const gameArea = document.querySelector('.felt') || document.querySelector('.board-container') || document.body;
  gameArea.appendChild(combo);
  
  // Animation
  setTimeout(() => {
    combo.style.opacity = '1';
    combo.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 10);
  
  // Supprimer après l'animation
  setTimeout(() => combo.remove(), 2000);
}
