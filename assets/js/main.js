/**
 * Module principal - Point d'entrée de l'application
 */

import { ui, initializeUI, showAchievement, updateStatus, toggleGameView, updateScores, updateTurnIndicator } from './ui.js';
import { sfx } from './sfx.js';
import { GAME_MODE, DIFFICULTY, AI_LEVEL } from './constants.js';
import { copyToClipboard } from './utils.js';
import { initGame, render, updatePhysics, startMatch, setDifficulty, gameState, setGameModeGetter, setPlayersGetter, setNetworkCallbacks } from './game.js';
import { aiPlayer } from './ai.js';
import { network } from './network.js';
import { t, setLanguage, getLanguage } from './translations.js';

// Variables globales du jeu
let gameMode = GAME_MODE.LOCAL;
let difficulty = DIFFICULTY.PRO;
let aiLevel = AI_LEVEL.DUMB;
let players = [
  {id: 0, name: 'Player 1', color: 'white', assist: true, wins: 0, shots: 0, streak: 0},
  {id: 1, name: 'Player 2', color: 'black', assist: true, wins: 0, shots: 0, streak: 0}
];
let lastDisplayedTurn = -1;

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
  
  // Réinitialiser l'état
  updateStatus('connecting', 'Initialisation du serveur P2P...');
  ui.myPeerId.textContent = 'Génération en cours...';
  
  resetButtonStyles();
  ui.hostBtn.style.background = 'linear-gradient(45deg,var(--neon-green),var(--neon-cyan))';
  
  try {
    // Configurer les callbacks réseau
    setupNetworkCallbacks();
    
    // Callback pour l'ID du peer (amélioré)
    network.onPeerIdReady = (id) => {
      ui.myPeerId.textContent = id;
      updateStatus('waiting', 'En attente d\'un adversaire...');
      showAchievement('SERVEUR PRÊT!');
      console.log('🎮 Serveur P2P prêt avec ID:', id);
      
      // Activer le bouton de copie
      ui.copyPeerBtn.disabled = false;
      ui.copyPeerBtn.style.opacity = '1';
      
      // Améliorer la visibilité de l'ID
      ui.myPeerId.style.color = 'var(--neon-green)';
      ui.myPeerId.style.fontWeight = 'bold';
      ui.myPeerId.style.animation = 'pulse 2s infinite';
    };
    
    // Callback pour la connexion établie (amélioré)
    network.onConnectionReady = () => {
      updateStatus('connected', 'Adversaire connecté!');
      showAchievement('ADVERSAIRE CONNECTÉ!');
      console.log('🎮 Adversaire connecté au serveur');
      
      // Arrêter l'animation de l'ID et le colorer en bleu
      ui.myPeerId.style.animation = 'none';
      ui.myPeerId.style.color = 'var(--neon-cyan)';
      
      // Activer automatiquement les contrôles de jeu
      document.getElementById('p1').disabled = false;
      document.getElementById('p2').disabled = false;
      
      // Démarrer une synchronisation initiale des paramètres
      setTimeout(() => {
        if (network.isHost) {
          network.sendPlayerNames(
            document.getElementById('p1').value || 'Player 1',
            document.getElementById('p2').value || 'Player 2'
          );
          
          const diffInput = document.querySelector('input[name=\"difficulty\"]:checked');
          const difficulty = diffInput ? parseInt(diffInput.value) : 2;
          
          network.sendGameSettings({
            difficulty: difficulty,
            player1Assist: document.getElementById('assistP1').checked,
            player2Assist: document.getElementById('assistP2').checked
          });
        }
      }, 500);
    };
    
    // Initialiser le serveur
    await network.initHost();
    
  } catch(e) {
    console.error('Erreur lors de l\'hébergement:', e);
    updateStatus('error', 'Erreur de connexion');
    showAchievement('ERREUR DE CONNEXION!');
    
    // Retourner au mode local en cas d'erreur
    setTimeout(() => {
      localGameMode();
    }, 2000);
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
  
  // Réinitialiser l'état
  updateStatus('waiting', 'Prêt à se connecter...');
  ui.friendId.value = '';
  ui.friendId.focus();
  
  resetButtonStyles();
  ui.joinBtn.style.background = 'linear-gradient(45deg,var(--neon-green),var(--neon-cyan))';
  
  // Configurer les callbacks réseau
  setupNetworkCallbacks();
  
  // Callback pour la connexion établie (amélioré)
  network.onConnectionReady = () => {
    updateStatus('connected', 'Connecté à l\'hôte!');
    showAchievement('CONNEXION ÉTABLIE!');
    console.log('🎮 Connecté à l\'hôte');
    
    // Masquer le champ de saisie de l'ID ami
    ui.friendId.style.opacity = '0.5';
    ui.friendId.disabled = true;
    
    // Mettre à jour le bouton de connexion
    ui.connectBtn.textContent = 'CONNECTÉ!';
    ui.connectBtn.style.background = 'linear-gradient(45deg, var(--neon-green), var(--neon-cyan))';
    ui.connectBtn.disabled = true;
    
    // Effet visuel de succès
    ui.connectBtn.style.animation = 'pulse 1s ease-in-out 3';
    
    // Attendre la synchronisation des paramètres depuis l'hôte
    updateStatus('connected', 'Synchronisation avec l\'hôte...');
  };
  
  console.log('✅ Mode rejoindre initialisé');
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
  
  // Déconnecter du réseau
  network.disconnect();
  
  // Réinitialiser l'état
  gameMode = GAME_MODE.LOCAL;
  ui.multiplayerSection.style.display = 'none';
  ui.hostSection.style.display = 'none';
  ui.joinSection.style.display = 'none';
  
  // Réinitialiser les champs
  ui.myPeerId.textContent = 'Génération en cours...';
  ui.friendId.value = '';
  
  // Réinitialiser le bouton de connexion
  if (ui.connectBtn) {
    ui.connectBtn.disabled = false;
    ui.connectBtn.textContent = 'SE CONNECTER';
  }
  
  // Masquer les éléments de chat
  ui.toggleChat.style.display = 'none';
  ui.chatPanel.style.display = 'none';
  
  // Mettre à jour l'interface
  updateStatus('', 'Déconnecté');
  ui.gameMode.textContent = 'LOCAL';
  
  // Réactiver les contrôles
  document.getElementById('p1').disabled = false;
  document.getElementById('p2').disabled = false;
  document.querySelectorAll('input[name="difficulty"]').forEach(input => input.disabled = false);
  document.getElementById('assistP1').disabled = false;
  document.getElementById('assistP2').disabled = false;
  
  resetButtonStyles();
  
  console.log('✅ Mode multijoueur annulé, retour au mode local');
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
  
  // Tir reçu (amélioré)
  network.onShot = (data) => {
    console.log('🎯 Tir reçu:', data);
    
    const ball = gameState.balls.find(b => b.id === data.ballId);
    if (ball) {
      // Appliquer la vélocité avec précision
      ball.vx = data.vx;
      ball.vy = data.vy;
      
      // Synchroniser l'état de tir
      gameState.isShot = true;
      gameState.fallenBalls = [];
      
      // Mettre à jour les statistiques seulement si on n'est pas l'expéditeur
      if (data.playerIndex !== (network.isHost ? 0 : 1)) {
        gameState.totalShots++;
        updateStats(gameState.totalShots, gameState.currentStreak, gameState.gameStartTime);
      }
      
      console.log('✅ Tir appliqué avec succès');
      
      // Synchroniser l'état après le tir si on est l'hôte
      if (network.isHost) {
        setTimeout(() => network.syncGameState(), 50);
      }
    } else {
      console.warn('⚠️ Balle non trouvée pour le tir:', data.ballId);
    }
  };
  
  // État de jeu synchronisé (amélioré)
  network.onGameStateUpdate = (data) => {
    console.log('🔄 Mise à jour état de jeu reçue:', data);
    
    // Synchroniser les boules avec plus de précision
    if (data.balls && Array.isArray(data.balls)) {
      gameState.balls = data.balls.map(ballData => {
        const ball = Object.create(gameState.balls[0].__proto__); // Copier le prototype
        Object.assign(ball, ballData);
        return ball;
      });
    }
    
    // Synchroniser tous les états de jeu
    gameState.redBall = gameState.balls.find(b => b.color === '#e11d48');
    gameState.currentTurn = data.currentTurn !== undefined ? data.currentTurn : gameState.currentTurn;
    gameState.roundOver = data.roundOver !== undefined ? data.roundOver : gameState.roundOver;
    gameState.matchOver = data.matchOver !== undefined ? data.matchOver : gameState.matchOver;
    
    // Synchroniser les scores et statistiques
    if (data.roundsWon) {
      gameState.roundsWon = data.roundsWon;
      players[0].wins = data.roundsWon[0];
      players[1].wins = data.roundsWon[1];
    }
    
    if (data.totalShots !== undefined) gameState.totalShots = data.totalShots;
    if (data.currentStreak !== undefined) gameState.currentStreak = data.currentStreak;
    if (data.isShot !== undefined) gameState.isShot = data.isShot;
    if (data.fallenBalls) gameState.fallenBalls = data.fallenBalls;
    
    // Mettre à jour l'interface
    updateScores(players);
    updateTurnIndicator(players[gameState.currentTurn], gameState.isShot);
    
    console.log('✅ État de jeu synchronisé avec succès');
  };
  
  // Changement de tour (avec gestion des couleurs multijoueur)
  network.onTurnChange = (turn, isMyTurn) => {
    gameState.currentTurn = turn;
    
    // Mise à jour de l'indicateur de tour avec les bonnes couleurs
    if (gameMode === GAME_MODE.HOST || gameMode === GAME_MODE.GUEST) {
      // En mode multijoueur : tour 0 = hébergeur (blanches), tour 1 = rejoignant (noires)
      const currentPlayer = players[turn];
      console.log(`🔄 Tour ${turn}: ${currentPlayer.name} (${currentPlayer.color || (turn === 0 ? 'blanches' : 'noires')})`);
      
      // Affichage spécial pour indiquer qui joue et avec quelles balles
      if (network.isHost) {
        const message = turn === 0 ? 'VOTRE TOUR (BLANCHES)' : `TOUR DE ${players[1].name} (NOIRES)`;
        if (turn === 0) showComboText(message);
      } else {
        const message = turn === 1 ? 'VOTRE TOUR (NOIRES)' : `TOUR DE ${players[0].name} (BLANCHES)`;
        if (turn === 1) showComboText(message);
      }
    }
    
    updateTurnIndicator(players[turn], gameState.isShot);
  };
  
  // Démarrage du jeu reçu (avec gestion des couleurs)
  network.onGameStart = (data) => {
    console.log('🎮 Démarrage du jeu reçu de l\'hôte!');
    
    // Mettre à jour les noms des joueurs
    players[0].name = data.player1Name || 'Player 1';
    players[1].name = data.player2Name || 'Player 2';
    
    // Mettre à jour la difficulté
    difficulty = data.difficulty || DIFFICULTY.PRO;
    
    // Mettre à jour l'assistance
    players[0].assist = data.player1Assist !== undefined ? data.player1Assist : true;
    players[1].assist = data.player2Assist !== undefined ? data.player2Assist : true;
    
    // Configurer les couleurs côté rejoignant
    if (data.hostHasWhiteBalls) {
      players[0].color = 'white'; // L'hôte (joueur 0)
      players[1].color = 'black'; // Le rejoignant (joueur 1)
      console.log('🎯 Couleurs confirmées: Hôte=Blanches, Rejoignant=Noires');
    }
    
    // Afficher un message de confirmation
    showAchievement('PARTIE DÉMARRÉE!');
    
    // Démarrer automatiquement le jeu
    startGame();
  };
  
  // Mise à jour des noms des joueurs
  network.onPlayerNamesUpdate = (data) => {
    console.log('👥 Noms des joueurs mis à jour:', data);
    players[0].name = data.player1 || 'Player 1';
    players[1].name = data.player2 || 'Player 2';
    
    // Mettre à jour l'UI
    document.getElementById('p1').value = players[0].name;
    document.getElementById('p2').value = players[1].name;
    updateScores(players);
  };
  
  // Mise à jour des paramètres du jeu (amélioré)
  network.onGameSettingsUpdate = (data) => {
    console.log('⚙️ Paramètres du jeu mis à jour:', data);
    
    // Mettre à jour la difficulté
    difficulty = data.difficulty || DIFFICULTY.PRO;
    const diffInput = document.querySelector(`input[name="difficulty"][value="${difficulty}"]`);
    if (diffInput) diffInput.checked = true;
    
    // Mettre à jour l'assistance
    players[0].assist = data.player1Assist !== undefined ? data.player1Assist : true;
    players[1].assist = data.player2Assist !== undefined ? data.player2Assist : true;
    
    document.getElementById('assistP1').checked = players[0].assist;
    document.getElementById('assistP2').checked = players[1].assist;
    
    // Désactiver les contrôles pour le client avec effet visuel
    if (gameMode === GAME_MODE.GUEST) {
      const controlsToDisable = [
        document.getElementById('p1'),
        document.getElementById('p2'),
        document.getElementById('assistP1'),
        document.getElementById('assistP2'),
        ...document.querySelectorAll('input[name="difficulty"]')
      ];
      
      controlsToDisable.forEach(control => {
        if (control) {
          control.disabled = true;
          control.style.opacity = '0.6';
          control.style.cursor = 'not-allowed';
        }
      });
      
      // Afficher un message informatif avec détails
      const diffNames = ['NOOB', 'PRO', 'LEGEND'];
      const diffName = diffNames[difficulty - 1] || 'PRO';
      showAchievement(`PARAMÈTRES REÇUS! DIFFICULTÉ: ${diffName}`);
      
      // Effet visuel sur la synchronisation
      updateStatus('connected', 'Prêt à jouer!');
      
      // Mettre à jour l'affichage des scores
      updateScores(players);
    }
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
  setPlayersGetter(() => players);
  
  // Configurer les callbacks réseau (amélioré)
  setNetworkCallbacks({
    onShot: (ballId, vx, vy) => {
      const success = network.sendShot(ballId, vx, vy, {
        gameMode: gameMode,
        timestamp: Date.now()
      });
      
      // Synchroniser l'état après le tir si on est l'hôte
      if (network.isHost && success) {
        setTimeout(() => network.syncGameState(), 100);
      }
      
      return success;
    },
    onTurnChange: (turn) => {
      const success = network.sendTurnChange(turn);
      
      // Synchroniser l'état après changement de tour si on est l'hôte
      if (network.isHost && success) {
        setTimeout(() => network.syncGameState(), 50);
      }
      
      return success;
    },
    onMatchEnd: (winner) => handleMatchEnd(winner)
  });
  
  // Si on est en mode multijoueur, synchroniser avec l'adversaire
  if (gameMode === GAME_MODE.HOST || gameMode === GAME_MODE.GUEST) {
    // Configurer les couleurs selon le rôle
    if (gameMode === GAME_MODE.HOST) {
      // L'hébergeur a les balles blanches (joueur 0)
      players[0].color = 'white';
      players[1].color = 'black';
      showAchievement('VOUS JOUEZ AVEC LES BALLES BLANCHES!');
    } else {
      // Le rejoignant a les balles noires (joueur 1) 
      players[0].color = 'white'; // L'hôte
      players[1].color = 'black'; // Le rejoignant (vous)
      showAchievement('VOUS JOUEZ AVEC LES BALLES NOIRES!');
    }
    
    // L'hôte envoie le signal de démarrage
    if (gameMode === GAME_MODE.HOST) {
      const gameData = {
        player1Name: players[0].name,
        player2Name: players[1].name,
        difficulty: difficulty,
        player1Assist: players[0].assist,
        player2Assist: players[1].assist,
        hostHasWhiteBalls: true // Confirmation que l'hôte a les blanches
      };
      
      // Envoyer les noms et paramètres
      network.sendPlayerNames(players[0].name, players[1].name);
      network.sendGameSettings({
        difficulty: difficulty,
        player1Assist: players[0].assist,
        player2Assist: players[1].assist,
        hostHasWhiteBalls: true
      });
      
      // Envoyer le signal de démarrage
      setTimeout(() => {
        network.sendGameStart(gameData);
        console.log('🎮 Signal de démarrage envoyé à l\'adversaire');
        showAchievement('PARTIE SYNCHRONISÉE!');
      }, 500);
    }
  }
  
  // Configurer la difficulté
  setDifficulty(difficulty);
  
  // Afficher l'interface de jeu
  toggleGameView(true);
  updateScores(players);
  lastDisplayedTurn = -1; // Forcer l'affichage du premier tour
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
  
  // Mettre à jour l'UI seulement si le tour a changé et pas en train de drag
  if (!gameState.dragging && gameState.currentTurn !== lastDisplayedTurn) {
    updateTurnIndicator(players[gameState.currentTurn], gameState.isShot);
    lastDisplayedTurn = gameState.currentTurn;
  }
  
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
 * Met à jour les scores affichés
 */
window.updateGameScores = function(roundsWon) {
  players[0].wins = roundsWon[0];
  players[1].wins = roundsWon[1];
  updateScores(players);
};

/**
 * Gère la fin d'une partie
 */
async function handleMatchEnd(winner) {
  console.log('🏆 Partie terminée ! Gagnant :', winner);
  
  // Importer dynamiquement le système de confettis
  const { confettiSystem } = await import('./confetti.js');
  
  // Préparer les données de victoire
  const winnerName = players[winner].name;
  const loserName = players[1 - winner].name;
  const finalScore = `${gameState.roundsWon[0]} - ${gameState.roundsWon[1]}`;
  const duration = Date.now() - gameState.gameStartTime;
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // Mettre à jour l'écran de victoire
  document.getElementById('victoryTitle').textContent = '🏆 ' + t('victory') + ' 🏆';
  document.getElementById('victorySubtitle').textContent = `${winnerName} ${t('wins')} ${loserName}!`;
  document.getElementById('finalScore').textContent = finalScore;
  document.getElementById('totalShots').textContent = gameState.totalShots;
  document.getElementById('gameDuration').textContent = timeStr;
  
  // Afficher l'écran de victoire avec animation
  setTimeout(() => {
    document.getElementById('victoryOverlay').classList.remove('hidden');
    confettiSystem.start();
    sfx.victory();
    
    // Sons de célébration supplémentaires
    setTimeout(() => sfx.epic(), 500);
    setTimeout(() => sfx.epic(), 1000);
  }, 1000);
  
  // Gérer les boutons
  const playAgainHandler = () => {
    confettiSystem.stop();
    document.getElementById('victoryOverlay').classList.add('hidden');
    startMatch();
    lastDisplayedTurn = -1;
    players[0].wins = 0;
    players[1].wins = 0;
    updateScores(players);
    ui.playAgain.removeEventListener('click', playAgainHandler);
    ui.homeFromVictory.removeEventListener('click', homeHandler);
  };
  
  const homeHandler = () => {
    confettiSystem.stop();
    document.getElementById('victoryOverlay').classList.add('hidden');
    goHome();
    ui.playAgain.removeEventListener('click', playAgainHandler);
    ui.homeFromVictory.removeEventListener('click', homeHandler);
  };
  
  // Ajouter les écouteurs d'événements temporaires
  ui.playAgain = document.getElementById('playAgainBtn');
  ui.homeFromVictory = document.getElementById('homeFromVictoryBtn');
  
  if (ui.playAgain && ui.homeFromVictory) {
    ui.playAgain.addEventListener('click', playAgainHandler);
    ui.homeFromVictory.addEventListener('click', homeHandler);
  }
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
 * Met à jour tous les textes de l'interface
 */
function updateUITexts() {
  // Titre du jeu
  const gameTitle = document.getElementById('gameTitle');
  if (gameTitle) gameTitle.textContent = t('gameTitle');
  
  // Boutons principaux
  const restartBtn = document.getElementById('restartBtn');
  if (restartBtn) restartBtn.textContent = t('newGame');
  
  ui.localBtn.textContent = t('local');
  ui.aiBtn.textContent = t('vsAI');
  ui.hostBtn.textContent = t('host');
  ui.joinBtn.textContent = t('join');
  
  // Boutons de navigation
  if (ui.homeBtn) ui.homeBtn.textContent = t('home');
  
  // Bouton de démarrage et texte
  const startBtnText = document.getElementById('startBtnText');
  if (startBtnText) startBtnText.textContent = t('startGame');
  
  // Textes d'aide
  const difficultyHelp = document.getElementById('difficultyHelp');
  if (difficultyHelp) difficultyHelp.textContent = t('difficultyHelp');
  
  const gameInstructions = document.getElementById('gameInstructions');
  if (gameInstructions) gameInstructions.innerHTML = t('gameInstructions');
  
  // Labels d'assistance de visée
  const assistP1Label = document.getElementById('assistP1Label');
  if (assistP1Label) assistP1Label.textContent = t('aimAssist');
  
  const assistP2Label = document.getElementById('assistP2Label');
  if (assistP2Label) assistP2Label.textContent = t('aimAssist');
  
  // Labels des joueurs
  const p1Label = document.getElementById('p1Label');
  if (p1Label) p1Label.textContent = t('player1Label');
  
  const p2Label = document.getElementById('p2Label');
  if (p2Label) p2Label.textContent = t('player2Label');
  
  // Labels de mode de jeu
  const gameModeLabel = document.getElementById('gameModeLabel');
  if (gameModeLabel) gameModeLabel.textContent = '🎮 ' + t('gameMode');
  
  const difficultyLabel = document.getElementById('difficultyLabel');
  if (difficultyLabel) difficultyLabel.textContent = '🎯 ' + t('difficulty');
  
  const aiLevelLabel = document.getElementById('aiLevelLabel');
  if (aiLevelLabel) aiLevelLabel.textContent = '🤖 ' + t('aiLevel');
  
  // Niveaux de difficulté
  const diff1Label = document.querySelector('label[for="diff1"]');
  const diff2Label = document.querySelector('label[for="diff2"]');
  const diff3Label = document.querySelector('label[for="diff3"]');
  if (diff1Label) diff1Label.textContent = t('noob');
  if (diff2Label) diff2Label.textContent = t('pro');
  if (diff3Label) diff3Label.textContent = t('legend');
  
  // Niveaux d'IA
  const ai1Label = document.querySelector('label[for="ai1"]');
  const ai2Label = document.querySelector('label[for="ai2"]');
  const ai3Label = document.querySelector('label[for="ai3"]');
  if (ai1Label) ai1Label.textContent = t('dumb');
  if (ai2Label) ai2Label.textContent = t('smart');
  if (ai3Label) ai3Label.textContent = t('terminator');
  
  // Textes multijoueur
  if (ui.cancelHost) ui.cancelHost.textContent = t('cancel');
  if (ui.cancelJoin) ui.cancelJoin.textContent = t('cancel');
  if (ui.cancelAI) ui.cancelAI.textContent = t('cancel');
  if (ui.connectBtn) ui.connectBtn.textContent = t('connect');
  if (ui.copyBtn) ui.copyBtn.textContent = t('copyId');
  
  // Placeholders
  const p1Input = document.getElementById('p1');
  const p2Input = document.getElementById('p2');
  if (p1Input) p1Input.placeholder = t('player1');
  if (p2Input) p2Input.placeholder = t('player2');
  
  // Écran de victoire
  const victoryTitle = document.getElementById('victoryTitle');
  if (victoryTitle) victoryTitle.textContent = '🏆 ' + t('victory') + ' 🏆';
  
  const playAgainBtn = document.getElementById('playAgainBtn');
  if (playAgainBtn) playAgainBtn.textContent = '🎮 ' + t('rematch');
  
  const homeFromVictoryBtn = document.getElementById('homeFromVictoryBtn');
  if (homeFromVictoryBtn) homeFromVictoryBtn.textContent = '🏠 ' + t('menu');
  
  // Labels des stats de victoire
  const statLabels = document.querySelectorAll('.stat-label');
  statLabels.forEach(label => {
    const text = label.textContent;
    // Détecter le type de statistique et appliquer la traduction appropriée
    if (text.includes('Score') || text.includes('score') || text.includes('スコア') || text.includes('得分') || text.includes('النتيجة')) {
      label.textContent = t('finalScore');
    } else if (text.includes('Tirs') || text.includes('schoten') || text.includes('shots') || text.includes('Schüsse') || text.includes('Tiros') || text.includes('ショット') || text.includes('击球') || text.includes('الضربات') || text.includes('Schëss')) {
      label.textContent = t('totalShots');
    } else if (text.includes('Durée') || text.includes('Duur') || text.includes('Duration') || text.includes('Dauer') || text.includes('Duración') || text.includes('時間') || text.includes('时间') || text.includes('المدة')) {
      label.textContent = t('duration');
    }
  });
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
  
  if (!friendId) {
    showAchievement('ENTRE UN ID!');
    ui.friendId.focus();
    return;
  }
  
  console.log('🎯 Tentative de connexion vers:', friendId);
  updateStatus('connecting', 'Connexion en cours...');
  
  try {
    // Désactiver le bouton pendant la connexion
    ui.connectBtn.disabled = true;
    ui.connectBtn.textContent = 'CONNEXION...';
    
    await network.connectToHost(friendId);
    
    // Réactiver le bouton
    ui.connectBtn.disabled = false;
    ui.connectBtn.textContent = 'CONNECTÉ!';
    
    console.log('✅ Connexion réussie!');
    
  } catch(e) {
    console.error('❌ Erreur de connexion:', e);
    
    // Réactiver le bouton
    ui.connectBtn.disabled = false;
    ui.connectBtn.textContent = 'SE CONNECTER';
    
    // Afficher l'erreur
    let errorMessage = 'Erreur de connexion';
    if (e.message.includes('Timeout')) {
      errorMessage = 'Timeout - Vérifiez l\'ID';
    } else if (e.message.includes('not found')) {
      errorMessage = 'ID introuvable';
    } else if (e.message.includes('Connection failed')) {
      errorMessage = 'Échec de connexion';
    }
    
    updateStatus('error', errorMessage);
    showAchievement('ERREUR DE CONNEXION!');
    
    // Retourner au mode local après 3 secondes
    setTimeout(() => {
      if (gameMode === GAME_MODE.GUEST) {
        localGameMode();
      }
    }, 3000);
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
  
  // D'abord initialiser les références UI
  initializeUI();
  
  // Vérifier que les éléments existent
  if (!ui.localBtn || !ui.aiBtn || !ui.hostBtn || !ui.joinBtn) {
    console.error('❌ ERREUR: Certains boutons UI ne sont pas trouvés!');
    console.log('ui.localBtn:', ui.localBtn);
    console.log('ui.aiBtn:', ui.aiBtn);
    console.log('ui.hostBtn:', ui.hostBtn);
    console.log('ui.joinBtn:', ui.joinBtn);
    return;
  }
  
  // Initialiser la langue
  const savedLanguage = localStorage.getItem('billardLanguage') || 'fr';
  setLanguage(savedLanguage);
  updateUITexts();
  
  // Boutons de langue
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    // Activer le bouton de la langue sauvegardée
    if (btn.dataset.lang === savedLanguage) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
    
    btn.addEventListener('click', (e) => {
      const newLang = e.currentTarget.dataset.lang;
      
      // Mettre à jour la langue
      setLanguage(newLang);
      localStorage.setItem('billardLanguage', newLang);
      updateUITexts();
      
      // Mettre à jour l'état actif des boutons
      langButtons.forEach(b => {
        if (b.dataset.lang === newLang) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
      
      // Animation de feedback
      e.currentTarget.style.animation = 'pulse 0.5s ease';
      setTimeout(() => {
        e.currentTarget.style.animation = '';
      }, 500);
      
      // Son de clic
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    });
  });
  
  // Boutons de mode de jeu
  ui.localBtn.addEventListener('click', localGameMode);
  ui.aiBtn.addEventListener('click', aiGameMode);
  ui.hostBtn.addEventListener('click', hostGameMode);
  ui.joinBtn.addEventListener('click', joinGameMode);
  
  console.log('✅ Event listeners ajoutés aux boutons de mode');
  
  // Boutons de contrôle
  if (ui.startBtn) ui.startBtn.addEventListener('click', startGame);
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
  
  // Checkboxes d'assistance de visée
  const assistP1 = document.getElementById('assistP1');
  const assistP2 = document.getElementById('assistP2');
  
  if (assistP1) {
    assistP1.addEventListener('change', (e) => {
      if (players[0]) {
        players[0].assist = e.target.checked;
        console.log('🎯 Assistance joueur 1:', players[0].assist);
      }
    });
  }
  
  if (assistP2) {
    assistP2.addEventListener('change', (e) => {
      if (players[1]) {
        players[1].assist = e.target.checked;
        console.log('🎯 Assistance joueur 2:', players[1].assist);
      }
    });
  }
  
  // Gérer le mode LEGEND qui désactive l'assistance
  const difficultyInputs = document.querySelectorAll('input[name="difficulty"]');
  difficultyInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const selectedDifficulty = parseInt(e.target.value);
      
      if (selectedDifficulty === DIFFICULTY.LEGEND) {
        // Mode LEGEND - désactiver l'assistance
        if (assistP1) {
          assistP1.checked = false;
          assistP1.disabled = true;
        }
        if (assistP2) {
          assistP2.checked = false;
          assistP2.disabled = true;
        }
        players[0].assist = false;
        players[1].assist = false;
        console.log('⚠️ Mode LEGEND - Assistance désactivée');
      } else {
        // Autres modes - réactiver l'assistance
        if (assistP1) {
          assistP1.disabled = false;
          assistP1.checked = true;
        }
        if (assistP2) {
          assistP2.disabled = false;
          assistP2.checked = true;
        }
        players[0].assist = true;
        players[1].assist = true;
      }
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
