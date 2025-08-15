/**
 * Module UI - Gestion de l'interface utilisateur
 */

// Objet UI qui sera rempli après le chargement du DOM
export const ui = {};

/**
 * Initialise toutes les références DOM
 */
export function initializeUI() {
  console.log('📋 Initialisation des références UI...');
  
  // Écrans principaux
  ui.start = document.getElementById('startScreen');
  ui.game = document.getElementById('gameUI');
  ui.startBtn = document.getElementById('startBtn');
  ui.restartBtn = document.getElementById('restartBtn');
  ui.nextOverlay = document.getElementById('nextOverlay');
  ui.nextBtn = document.getElementById('nextBtn');
  ui.victory = document.getElementById('victoryOverlay');
  ui.vTitle = document.getElementById('victoryTitle');
  ui.vSub = document.getElementById('victorySubtitle');
  ui.playAgain = document.getElementById('playAgainBtn');
  
  // Indicateurs de tour
  ui.tBanner = document.getElementById('turnBanner');
  ui.tText = document.getElementById('turnText');
  ui.tBall = document.getElementById('turnBall');
  
  // Scores
  ui.name1 = document.getElementById('name1');
  ui.name2 = document.getElementById('name2');
  ui.score1 = document.getElementById('score1');
  ui.score2 = document.getElementById('score2');
  
  // Jauge de puissance
  ui.powerMeter = document.getElementById('powerMeter');
  ui.powerFill = document.getElementById('powerFill');
  
  // Statistiques
  ui.statsPanel = document.getElementById('statsPanel');
  ui.shotCount = document.getElementById('shotCount');
  ui.streak = document.getElementById('streak');
  ui.gameTime = document.getElementById('gameTime');
  
  // Réseau
  ui.networkPanel = document.getElementById('networkPanel');
  ui.gameMode = document.getElementById('gameMode');
  ui.ping = document.getElementById('ping');
  ui.syncStatus = document.getElementById('syncStatus');
  
  // Boutons de mode de jeu
  ui.localBtn = document.getElementById('localBtn');
  ui.aiBtn = document.getElementById('aiBtn');
  ui.hostBtn = document.getElementById('hostBtn');
  ui.joinBtn = document.getElementById('joinBtn');
  
  // Sections multijoueur
  ui.multiplayerSection = document.getElementById('multiplayerSection');
  ui.hostSection = document.getElementById('hostSection');
  ui.joinSection = document.getElementById('joinSection');
  ui.aiSection = document.getElementById('aiSection');
  ui.cancelAI = document.getElementById('cancelAI');
  ui.myPeerId = document.getElementById('myPeerId');
  ui.friendId = document.getElementById('friendId');
  ui.connectBtn = document.getElementById('connectBtn');
  ui.statusDot = document.getElementById('statusDot');
  ui.statusText = document.getElementById('statusText');
  ui.cancelMultiplayer = document.getElementById('cancelMultiplayer');
  
  // Chat
  ui.toggleChat = document.getElementById('toggleChat');
  ui.chatPanel = document.getElementById('chatPanel');
  ui.closeChat = document.getElementById('closeChat');
  ui.chatMessages = document.getElementById('chatMessages');
  ui.chatInput = document.getElementById('chatInput');
  ui.sendChat = document.getElementById('sendChat');
  ui.copyPeerBtn = document.getElementById('copyPeerBtn');
  
  console.log('✅ Références UI initialisées');
  return ui;
}

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
let turnIndicatorTimeout = null;

export function updateTurnIndicator(player, hideTurn) {
  // Annuler tout timeout en cours
  if (turnIndicatorTimeout) {
    clearTimeout(turnIndicatorTimeout);
    turnIndicatorTimeout = null;
  }
  
  if (hideTurn || !player) {
    // Cacher seulement si pas déjà caché
    if (ui.tBanner.style.display !== 'none') {
      ui.tBanner.style.display = 'none';
    }
  } else {
    // Afficher seulement si pas déjà affiché avec le même joueur
    const currentText = ui.tText.textContent;
    const newText = `TOUR DE ${player.name}`;
    
    if (ui.tBanner.style.display === 'none' || currentText !== newText) {
      ui.tBanner.style.display = 'flex';
      ui.tBanner.style.opacity = '1';
      ui.tText.textContent = newText;
      ui.tBall.className = `turn-ball ${player.color}`;
      
      // Masquer automatiquement après 2 secondes pour ne pas gêner le jeu
      turnIndicatorTimeout = setTimeout(() => {
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
