/**
 * Module principal - Point d'entrée de l'application
 */

import { ui, showAchievement, updateStatus, toggleGameView, updateScores, updateTurnIndicator } from './ui.js';
import { sfx } from './sfx.js';
import { GAME_MODE, DIFFICULTY, AI_LEVEL } from './constants.js';
import { copyToClipboard } from './utils.js';
import { initGame, render, updatePhysics, startMatch, setDifficulty, gameState, setGameModeGetter, setNetworkCallbacks } from './game.js';
import { aiPlayer } from './ai.js';
import { network } from './network.js';

// Variables globales du jeu
let gameMode = GAME_MODE.LOCAL;
let difficulty = DIFFICULTY.PRO;
let aiLevel = AI_LEVEL.DUMB;
let players = [
  {id: 0, name: 'Player 1', color: 'white', assist: true, wins: 0, shots: 0, streak: 0},
  {id: 1, name: 'Player 2', color: 'black', assist: true, wins: 0, shots: 0, streak: 0}
];

// Variables d'animation
let animationId = null;
let lastTime = 0;

/**
 * Mode local
 */
function localGameMode() {
  console.log('Mode local sélectionné');
  gameMode = GAME_MODE.LOCAL;
  ui.multiplayerSection.style.display = 'none';
  ui.aiSection.style.display = 'none';
  ui.gameMode.textContent = 'LOCAL';
  
  document.getElementById('p1').placeholder = 'Joueur 1';
  document.getElementById('p2').placeholder = 'Joueur 2';
  document.getElementById('p2').disabled = false;
  document.getElementById('assistP2').disabled = false;
  
  resetButtonStyles();
  ui.localBtn.style.background = 'linear-gradient(45deg,var(--neon-green),var(--neon-cyan))';
}

/**
 * Mode IA
 */
function aiGameMode() {
  console.log('Mode IA sélectionné');
  gameMode = GAME_MODE.AI;
  ui.multiplayerSection.style.display = 'none';
  ui.aiSection.style.display = 'block';
  ui.gameMode.textContent = 'vs IA';
  
  const aiLevelInput = document.querySelector('input[name="aiLevel"]:checked');
  aiLevel = aiLevelInput ? parseInt(aiLevelInput.value) : AI_LEVEL.DUMB;
  
  // Configurer l'IA
  aiPlayer.setLevel(aiLevel);
  
  players[1].name = aiLevel === AI_LEVEL.DUMB ? 'IA DUMB' : 
                    aiLevel === AI_LEVEL.SMART ? 'IA SMART' : 'TERMINATOR';
  
  resetButtonStyles();
  ui.aiBtn.style.background = 'linear-gradient(45deg,var(--neon-green),var(--neon-cyan))';
  
  showAchievement(`DÉFI ${players[1].name}!`);
}

/**
 * Mode hébergement
 */
async function hostGameMode() {
  console.log('Mode hébergement sélectionné');
  gameMode = GAME_MODE.HOST;
  ui.multiplayerSection.style.display = 'block';
  ui.aiSection.style.display = 'none';
  ui.hostSection.style.display = 'block';
  ui.joinSection.style.display = 'none';
  updateStatus('connecting', 'Initialisation du serveur...');
  
  resetButtonStyles();
  ui.hostBtn.style.background = 'linear-gradient(45deg,var(--neon-green),var(--neon-cyan))';
  
  try {
    // Configurer les callbacks réseau
    setupNetworkCallbacks();
    
    // Callback pour l'ID du peer
    network.onPeerIdReady = (id) => {
      ui.myPeerId.textContent = id;
    };
    
    // Initialiser le serveur
    await network.initHost();
  } catch(e) {
    console.error('Erreur lors de l\'hébergement:', e);
    updateStatus('error', 'Erreur de connexion');
    showAchievement('ERREUR DE CONNEXION!');
  }
}

/**
 * Mode rejoindre
 */
function joinGameMode() {
  console.log('Mode rejoindre sélectionné');
  gameMode = GAME_MODE.GUEST;
  ui.multiplayerSection.style.display = 'block';
  ui.aiSection.style.display = 'none';
  ui.hostSection.style.display = 'none';
  ui.joinSection.style.display = 'block';
  updateStatus('connecting', 'Initialisation...');
  
  resetButtonStyles();
  ui.joinBtn.style.background = 'linear-gradient(45deg,var(--neon-green),var(--neon-cyan))';
  
  // Configurer les callbacks réseau
  setupNetworkCallbacks();
}

/**
 * Annuler mode IA
 */
function cancelAI() {
  console.log('Annulation IA');
  gameMode = GAME_MODE.LOCAL;
  ui.aiSection.style.display = 'none';
  ui.gameMode.textContent = 'LOCAL';
  resetButtonStyles();
}

/**
 * Annuler mode multijoueur
 */
function cancelMultiplayer() {
  console.log('Annulation multijoueur');
  network.disconnect();
  gameMode = GAME_MODE.LOCAL;
  ui.multiplayerSection.style.display = 'none';
  updateStatus('', 'Déconnecté');
  ui.gameMode.textContent = 'LOCAL';
  ui.toggleChat.style.display = 'none';
  ui.chatPanel.style.display = 'none';
  resetButtonStyles();
}

/**
 * Configure les callbacks réseau
 */
function setupNetworkCallbacks() {
  // Quand la connexion est prête
  network.onConnectionReady = () => {
    ui.toggleChat.style.display = 'block';
    ui.gameMode.textContent = gameMode.toUpperCase();
  };
  
  // Quand la connexion est fermée
  network.onConnectionClosed = () => {
    ui.toggleChat.style.display = 'none';
    ui.chatPanel.style.display = 'none';
    ui.syncStatus.textContent = 'LOST';
  };
  
  // Mise à jour du ping
  network.onPingUpdate = (latency) => {
    ui.ping.textContent = `${latency}ms`;
    ui.syncStatus.textContent = latency < 100 ? 'GOOD' : latency < 200 ? 'OK' : 'LAG';
  };
  
  // Message de chat reçu
  network.onChatMessage = (message) => {
    displayChatMessage(message, 'received');
  };
  
  // Tir reçu
  network.onShot = (data) => {
    const ball = gameState.balls.find(b => b.id === data.ballId);
    if (ball) {
      ball.vx = data.vx;
      ball.vy = data.vy;
      gameState.isShot = true;
      gameState.fallenBalls = [];
      gameState.totalShots++;
      updateStats(gameState.totalShots, gameState.currentStreak, gameState.gameStartTime);
    }
  };
  
  // État de jeu synchronisé
  network.onGameStateUpdate = (data) => {
    // Synchroniser les boules
    gameState.balls = data.balls.map(ballData => {
      const ball = Object.create(gameState.balls[0].__proto__); // Copier le prototype
      Object.assign(ball, ballData);
      return ball;
    });
    
    gameState.redBall = gameState.balls.find(b => b.color === '#e11d48');
    gameState.currentTurn = data.currentTurn;
    gameState.roundOver = data.roundOver;
    gameState.matchOver = data.matchOver;
    
    updateScores(players);
    updateTurnIndicator(players[gameState.currentTurn], gameState.isShot);
  };
  
  // Changement de tour
  network.onTurnChange = (turn, isMyTurn) => {
    gameState.currentTurn = turn;
    updateTurnIndicator(players[turn], gameState.isShot);
  };
}

/**
 * Réinitialise les styles des boutons
 */
function resetButtonStyles() {
  const defaultStyle = 'linear-gradient(45deg,var(--neon-cyan),var(--neon-pink))';
  ui.localBtn.style.background = defaultStyle;
  ui.aiBtn.style.background = defaultStyle;
  ui.hostBtn.style.background = defaultStyle;
  ui.joinBtn.style.background = defaultStyle;
}

/**
 * Démarre une partie
 */
function startGame() {
  console.log('🚀 DÉMARRAGE du jeu !');
  sfx.init();
  
  // Récupération des paramètres
  players[0].name = document.getElementById('p1').value.trim() || 'Player 1';
  players[1].name = document.getElementById('p2').value.trim() || 'Player 2';
  
  const diffInput = document.querySelector('input[name="difficulty"]:checked');
  difficulty = diffInput ? parseInt(diffInput.value) : DIFFICULTY.PRO;
  
  if (difficulty === DIFFICULTY.LEGEND) {
    players[0].assist = players[1].assist = false;
  } else {
    players[0].assist = document.getElementById('assistP1').checked;
    players[1].assist = document.getElementById('assistP2').checked;
  }
  
  // Initialiser le canvas
  const canvas = document.getElementById('game');
  initGame(canvas);
  
  // Configurer le getter pour le mode de jeu
  setGameModeGetter(() => gameMode);
  
  // Configurer les callbacks réseau
  setNetworkCallbacks(
    (ballId, vx, vy) => network.sendShot(ballId, vx, vy),
    (turn) => network.sendTurnChange(turn)
  );
  
  // Configurer la difficulté
  setDifficulty(difficulty);
  
  // Afficher l'interface de jeu
  toggleGameView(true);
  updateScores(players);
  updateTurnIndicator(players[gameState.currentTurn], false);
  
  // Démarrer la partie
  startMatch();
  showAchievement('PARTIE LANCÉE!');
  
  // Démarrer la boucle d'animation
  startGameLoop();
}

/**
 * Boucle d'animation principale
 */
function gameLoop(currentTime) {
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;
  
  // Mettre à jour la physique
  updatePhysics(deltaTime);
  
  // Mettre à jour l'UI
  updateTurnIndicator(players[gameState.currentTurn], gameState.isShot);
  
  // Vérifier si l'IA doit jouer
  if (gameMode === GAME_MODE.AI && aiPlayer.shouldPlay()) {
    aiPlayer.play();
  }
  
  // Rendu
  render();
  
  // Continuer la boucle
  animationId = requestAnimationFrame(gameLoop);
}

/**
 * Démarre la boucle de jeu
 */
function startGameLoop() {
  lastTime = performance.now();
  animationId = requestAnimationFrame(gameLoop);
}

/**
 * Arrête la boucle de jeu
 */
function stopGameLoop() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

/**
 * Retour à l'accueil
 */
function goHome() {
  console.log('🏠 RETOUR À L\'ACCUEIL');
  
  // Arrêter la boucle de jeu
  stopGameLoop();
  
  // Déconnecter le réseau si nécessaire
  network.disconnect();
  
  ui.victory.classList.add('hidden');
  ui.nextOverlay.classList.add('hidden');
  toggleGameView(false);
  
  // Réinitialisation des paramètres
  document.getElementById('diff2').checked = true;
  document.getElementById('assistP1').checked = true;
  document.getElementById('assistP2').checked = true;
  
  gameMode = GAME_MODE.LOCAL;
  ui.multiplayerSection.style.display = 'none';
  ui.aiSection.style.display = 'none';
  ui.gameMode.textContent = 'LOCAL';
  ui.toggleChat.style.display = 'none';
  ui.chatPanel.style.display = 'none';
  ui.networkPanel.style.display = 'block';
}

/**
 * Manche suivante
 */
function nextRound() {
  ui.nextOverlay.classList.add('hidden');
  // TODO: Démarrer la manche suivante
  console.log('TODO: Démarrer la manche suivante');
}

/**
 * Copier l'ID peer
 */
async function copyPeerId() {
  const peerIdText = ui.myPeerId.textContent;
  console.log('Copy peer ID:', peerIdText);
  
  if (peerIdText !== 'Génération en cours...') {
    const success = await copyToClipboard(peerIdText);
    if (success) {
      showAchievement('ID COPIÉ!');
    } else {
      showAchievement('ERREUR DE COPIE');
    }
  }
}

/**
 * Connexion à un peer
 */
async function connectToPeer() {
  const friendId = ui.friendId.value.trim();
  if (friendId) {
    console.log('Connexion vers:', friendId);
    try {
      await network.connectToHost(friendId);
    } catch(e) {
      console.error('Erreur de connexion:', e);
      showAchievement('ERREUR DE CONNEXION!');
    }
  }
}

/**
 * Basculer le chat
 */
function toggleChat() {
  const isVisible = ui.chatPanel.style.display === 'flex';
  
  if (isVisible) {
    ui.chatPanel.style.display = 'none';
    ui.networkPanel.style.display = 'block';
  } else {
    ui.chatPanel.style.display = 'flex';
    ui.networkPanel.style.display = 'none';
    ui.chatInput.focus();
  }
}

/**
 * Envoyer un message chat
 */
function sendChatMessage() {
  const message = ui.chatInput.value.trim();
  
  if (message && network.getStatus() === 'connected') {
    console.log('Message chat:', message);
    if (network.sendChatMessage(message)) {
      displayChatMessage(message, 'sent');
      ui.chatInput.value = '';
    }
  }
}

/**
 * Affiche un message dans le chat
 */
function displayChatMessage(message, type) {
  const chatMessages = ui.chatMessages;
  if (!chatMessages) {
    console.error('Chat messages container not found');
    return;
  }
  
  // Retirer le message de bienvenue
  const welcome = chatMessages.querySelector('.chat-welcome');
  if (welcome) {
    welcome.remove();
  }
  
  // Créer le message
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${type}`;
  messageDiv.textContent = message;
  
  // Ajouter au chat
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Animation
  messageDiv.style.opacity = '0';
  messageDiv.style.transform = 'translateY(10px)';
  setTimeout(() => {
    messageDiv.style.transition = 'all 0.3s ease';
    messageDiv.style.opacity = '1';
    messageDiv.style.transform = 'translateY(0)';
  }, 10);
}

/**
 * Initialisation des événements
 */
function initializeEvents() {
  console.log('🎮 Initialisation des événements...');
  
  // Boutons de mode de jeu
  ui.localBtn.addEventListener('click', localGameMode);
  ui.aiBtn.addEventListener('click', aiGameMode);
  ui.hostBtn.addEventListener('click', hostGameMode);
  ui.joinBtn.addEventListener('click', joinGameMode);
  
  // Boutons de contrôle
  ui.startBtn.addEventListener('click', startGame);
  ui.restartBtn.addEventListener('click', goHome);
  ui.nextBtn.addEventListener('click', nextRound);
  ui.playAgain.addEventListener('click', goHome);
  
  // Boutons multijoueur
  ui.cancelAI.addEventListener('click', cancelAI);
  ui.cancelMultiplayer.addEventListener('click', cancelMultiplayer);
  ui.connectBtn.addEventListener('click', connectToPeer);
  ui.copyPeerBtn.addEventListener('click', copyPeerId);
  
  // Boutons de chat
  ui.toggleChat.addEventListener('click', toggleChat);
  ui.closeChat.addEventListener('click', () => {
    ui.chatPanel.style.display = 'none';
    ui.networkPanel.style.display = 'block';
  });
  ui.sendChat.addEventListener('click', sendChatMessage);
  ui.chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  });
  
  // Radio buttons IA
  document.querySelectorAll('input[name="aiLevel"]').forEach(radio => {
    radio.addEventListener('change', function() {
      aiLevel = parseInt(this.value);
      aiPlayer.setLevel(aiLevel);
      const names = {
        [AI_LEVEL.DUMB]: 'IA DUMB',
        [AI_LEVEL.SMART]: 'IA SMART',
        [AI_LEVEL.TERMINATOR]: 'TERMINATOR'
      };
      players[1].name = names[aiLevel];
    });
  });
  
  console.log('✅ Événements initialisés avec succès !');
}

// Fonctions exportées pour les autres modules
export function getCurrentGameMode() {
  return gameMode;
}

export function getPlayers() {
  return players;
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎮 DOM chargé, initialisation des événements...');
  initializeEvents();
});

// Fallback si le DOM est déjà chargé
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  console.log('🎮 DOM déjà prêt, initialisation immédiate...');
  initializeEvents();
}
