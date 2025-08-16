/**
 * Module Network - Gestion du multijoueur P2P
 */

import { MESSAGE_TYPE, GAME_MODE } from './constants.js';
import { showAchievement, updateStatus } from './ui.js';
import { gameState } from './game.js';
import { sfx } from './sfx.js';

/**
 * Classe Network - Gère les connexions P2P
 */
export class Network {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.myPeerId = null;
    this.isHost = false;
    this.isMyTurn = true;
    this.lastPingTime = 0;
    this.pingLatency = 0;
    this.connectionStatus = 'disconnected';
    this.reconnectionAttempts = 0;
    this.maxReconnectionAttempts = 3;
    this.lastKnownHostId = null;
    
    // Callbacks
    this.onChatMessage = null;
    this.onGameStateUpdate = null;
    this.onShot = null;
    this.onTurnChange = null;
    this.onGameStart = null;
    this.onPlayerNamesUpdate = null;
    this.onGameSettingsUpdate = null;
    this.onSyncPositionsUpdate = null;
  }
  
  /**
   * Initialise un serveur (host)
   */
  async initHost() {
    console.log('Initialisation du serveur P2P...');
    this.isHost = true;
    
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    
    try {
      this.peer = new Peer({
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });
      
      this.peer.on('open', (id) => {
        console.log('Serveur P2P ouvert avec ID:', id);
        this.myPeerId = id;
        updateStatus('connected', 'Prêt à recevoir des connexions');
        showAchievement('SERVEUR PRÊT!');
        
        // Callback pour mettre à jour l'UI
        if (this.onPeerIdReady) {
          this.onPeerIdReady(id);
        }
      });
      
      this.peer.on('connection', (connection) => {
        console.log('Connexion reçue:', connection);
        this.handleConnection(connection);
      });
      
      this.peer.on('error', (err) => {
        console.error('Erreur peer:', err);
        updateStatus('error', `Erreur: ${err.type || err.message}`);
        showAchievement('ERREUR DE CONNEXION!');
      });
      
      this.peer.on('disconnected', () => {
        console.log('Peer déconnecté');
        updateStatus('error', 'Connexion perdue');
        this.connectionStatus = 'disconnected';
      });
      
    } catch(e) {
      console.error('Erreur lors de l\'initialisation:', e);
      updateStatus('error', 'Impossible d\'initialiser la connexion');
      showAchievement('ERREUR DE CONNEXION!');
      throw e;
    }
  }
  
  /**
   * Se connecte à un hôte
   */
  async connectToHost(hostPeerId) {
    console.log('Connexion à l\'hôte:', hostPeerId);
    this.isHost = false;
    this.lastKnownHostId = hostPeerId.trim(); // Sauvegarder pour reconnexion
    
    if (!this.peer) {
      try {
        this.peer = new Peer();
        
        await new Promise((resolve, reject) => {
          this.peer.on('open', (id) => {
            console.log('Client initialisé avec ID:', id);
            this.myPeerId = id;
            resolve();
          });
          
          this.peer.on('error', (err) => {
            console.error('Erreur peer:', err);
            reject(err);
          });
          
          // Timeout après 5 secondes
          setTimeout(() => reject(new Error('Timeout')), 5000);
        });
      } catch(e) {
        updateStatus('error', 'Erreur d\'initialisation');
        throw e;
      }
    }
    
    updateStatus('connecting', 'Connexion en cours...');
    
    try {
      const connection = this.peer.connect(this.lastKnownHostId);
      this.handleConnection(connection);
      
      // Attendre que la connexion soit ouverte
      await new Promise((resolve, reject) => {
        connection.on('open', resolve);
        connection.on('error', reject);
        setTimeout(() => reject(new Error('Timeout de connexion')), 10000);
      });
      
      // Réinitialiser le compteur de reconnexion en cas de succès
      this.reconnectionAttempts = 0;
      
    } catch(e) {
      console.error('Erreur de connexion:', e);
      updateStatus('error', 'Impossible de se connecter');
      throw e;
    }
  }
  
  /**
   * Gère une connexion établie
   */
  handleConnection(connection) {
    this.conn = connection;
    
    // Timeout de connexion
    const connectionTimeout = setTimeout(() => {
      if (!connection.open) {
        console.warn('⏰ Timeout connexion P2P');
        updateStatus('error', 'Timeout - Vérifiez l\'ID');
        showComboText('💡 VÉRIFIEZ L\'ID!');
      }
    }, 15000);
    
    connection.on('open', () => {
      clearTimeout(connectionTimeout);
      console.log('Connexion P2P établie!');
      this.connectionStatus = 'connected';
      updateStatus('connected', 'Connecté avec l\'adversaire!');
      showAchievement('CONNEXION ÉTABLIE!');
      
      // Activer le chat
      if (this.onConnectionReady) {
        this.onConnectionReady();
      }
      
      // Démarrer le ping
      this.startPingInterval();
      
      // Si on est l'hôte, envoyer l'état initial et les paramètres
      if (this.isHost) {
        this.syncGameState();
        // L'hôte enverra les paramètres quand il sera prêt
      }
    });
    
    connection.on('data', (data) => {
      console.log('Message reçu:', data.type);
      this.handleMessage(data);
    });
    
    connection.on('close', () => {
      console.log('🔌 Connexion fermée');
      this.connectionStatus = 'disconnected';
      updateStatus('error', 'Connexion fermée');
      this.stopPingInterval();
      
      // Notification de déconnexion avec son
      showAchievement('ADVERSAIRE DÉCONNECTÉ!');
      if (typeof sfx !== 'undefined' && sfx.error) {
        sfx.error();
      }
      
      // Essayer de se reconnecter automatiquement (3 tentatives max)
      this.attemptReconnection();
      
      if (this.onConnectionClosed) {
        this.onConnectionClosed();
      }
    });
    
    connection.on('error', (err) => {
      console.error('Erreur de connexion:', err);
      updateStatus('error', `Erreur: ${err.type || err.message}`);
    });
  }
  
  /**
   * Gère les messages reçus
   */
  handleMessage(data) {
    switch(data.type) {
      case MESSAGE_TYPE.PING:
        this.sendMessage({ type: MESSAGE_TYPE.PONG, timestamp: data.timestamp });
        break;
        
      case MESSAGE_TYPE.PONG:
        this.pingLatency = Date.now() - data.timestamp;
        if (this.onPingUpdate) {
          this.onPingUpdate(this.pingLatency);
        }
        break;
        
      case MESSAGE_TYPE.CHAT:
        if (this.onChatMessage) {
          this.onChatMessage(data.message);
        }
        sfx.epic();
        break;
        
      case MESSAGE_TYPE.SHOT:
        if (this.onShot) {
          this.onShot(data);
        }
        break;
        
      case MESSAGE_TYPE.GAME_STATE:
        console.log('🔄 Réception état de jeu:', data);
        if (this.onGameStateUpdate) {
          this.onGameStateUpdate(data);
        }
        // Auto-synchroniser l'état si on est l'hôte et qu'il y a eu des changements
        if (this.isHost && data.timestamp) {
          setTimeout(() => this.syncGameState(), 100);
        }
        break;
        
      case MESSAGE_TYPE.TURN_CHANGE:
        console.log('🔄 Changement de tour reçu:', data);
        this.isMyTurn = (this.isHost && data.turn === 0) || (!this.isHost && data.turn === 1);
        
        if (this.onTurnChange) {
          this.onTurnChange(data.turn, this.isMyTurn);
        }
        
        // Synchroniser l'état après changement de tour si on est l'hôte
        if (this.isHost) {
          setTimeout(() => this.syncGameState(), 50);
        }
        
        console.log(`✅ Tour ${data.turn}, Mon tour: ${this.isMyTurn}`);
        break;
        
      case MESSAGE_TYPE.GAME_START:
        console.log('🎮 Démarrage du jeu reçu!');
        if (this.onGameStart) {
          this.onGameStart(data);
        }
        break;
        
      case MESSAGE_TYPE.PLAYER_NAMES:
        console.log('👥 Noms des joueurs reçus:', data);
        if (this.onPlayerNamesUpdate) {
          this.onPlayerNamesUpdate(data);
        }
        break;
        
      case MESSAGE_TYPE.GAME_SETTINGS:
        console.log('⚙️ Paramètres du jeu reçus:', data);
        if (this.onGameSettingsUpdate) {
          this.onGameSettingsUpdate(data);
        }
        break;
        
      case MESSAGE_TYPE.SYNC_POSITIONS:
        console.log('🔄 Synchronisation positions reçue:', data);
        if (this.onSyncPositionsUpdate) {
          this.onSyncPositionsUpdate(data);
        }
        break;
    }
  }
  
  /**
   * Envoie un message
   */
  sendMessage(data) {
    if (this.conn?.open) {
      try {
        this.conn.send(data);
        console.log('Message envoyé:', data.type);
        return true;
      } catch(e) {
        console.error('Erreur envoi message:', e);
        return false;
      }
    } else {
      console.warn('Connexion fermée, impossible d\'envoyer:', data.type);
      return false;
    }
  }
  
  /**
   * Envoie un message de chat
   */
  sendChatMessage(message) {
    return this.sendMessage({
      type: MESSAGE_TYPE.CHAT,
      message: message.trim()
    });
  }
  
  /**
   * Envoie les données d'un tir (amélioré)
   */
  sendShot(ballId, vx, vy, shotData = {}) {
    const shotMessage = {
      type: MESSAGE_TYPE.SHOT,
      ballId,
      vx,
      vy,
      timestamp: Date.now(),
      playerIndex: this.isHost ? 0 : 1,
      ...shotData
    };
    
    console.log('🎯 Envoi tir:', shotMessage);
    return this.sendMessage(shotMessage);
  }
  
  /**
   * Synchronise l'état du jeu (amélioré)
   */
  syncGameState() {
    if (!this.isHost) return false;
    
    // Obtenir les données à synchroniser avec plus de détails
    const syncData = {
      type: MESSAGE_TYPE.GAME_STATE,
      balls: gameState.balls.map(ball => ({
        id: ball.id,
        x: ball.x,
        y: ball.y,
        vx: ball.vx,
        vy: ball.vy,
        color: ball.color,
        owner: ball.owner,
        isActive: ball.isActive,
        radius: ball.radius
      })),
      currentTurn: gameState.currentTurn,
      roundOver: gameState.roundOver,
      matchOver: gameState.matchOver,
      roundsWon: gameState.roundsWon || [0, 0],
      totalShots: gameState.totalShots || 0,
      currentStreak: gameState.currentStreak || 0,
      isShot: gameState.isShot || false,
      fallenBalls: gameState.fallenBalls || [],
      timestamp: Date.now()
    };
    
    console.log('🔄 Synchronisation état de jeu:', syncData);
    return this.sendMessage(syncData);
  }
  
  /**
   * Envoie un changement de tour (amélioré)
   */
  sendTurnChange(turn) {
    const turnMessage = {
      type: MESSAGE_TYPE.TURN_CHANGE,
      turn,
      timestamp: Date.now(),
      hostTurn: this.isHost ? (turn === 0) : (turn === 1)
    };
    
    console.log('🔄 Envoi changement de tour:', turnMessage);
    return this.sendMessage(turnMessage);
  }
  
  /**
   * Envoie le signal de démarrage du jeu
   */
  sendGameStart(gameData) {
    return this.sendMessage({
      type: MESSAGE_TYPE.GAME_START,
      ...gameData
    });
  }
  
  /**
   * Envoie les noms des joueurs
   */
  sendPlayerNames(player1Name, player2Name) {
    return this.sendMessage({
      type: MESSAGE_TYPE.PLAYER_NAMES,
      player1: player1Name,
      player2: player2Name
    });
  }
  
  /**
   * Envoie les paramètres du jeu
   */
  sendGameSettings(settings) {
    return this.sendMessage({
      type: MESSAGE_TYPE.GAME_SETTINGS,
      ...settings
    });
  }
  
  /**
   * Envoie les positions finales des balles pour synchronisation
   */
  sendFinalPositions(positions) {
    return this.sendMessage({
      type: MESSAGE_TYPE.SYNC_POSITIONS,
      positions: positions,
      timestamp: Date.now()
    });
  }
  
  /**
   * Démarre l'intervalle de ping et synchronisation
   */
  startPingInterval() {
    // Premier ping après 1 seconde
    setTimeout(() => {
      if (this.conn?.open) {
        this.lastPingTime = Date.now();
        this.sendMessage({ type: MESSAGE_TYPE.PING, timestamp: this.lastPingTime });
        
        // Première synchronisation si on est l'hôte
        if (this.isHost) {
          this.syncGameState();
        }
      }
    }, 1000);
    
    // Puis toutes les 3 secondes pour le ping
    this.pingInterval = setInterval(() => {
      if (this.conn?.open) {
        this.lastPingTime = Date.now();
        this.sendMessage({ type: MESSAGE_TYPE.PING, timestamp: this.lastPingTime });
      }
    }, 3000);
    
    // Synchronisation automatique toutes les 5 secondes si on est l'hôte
    this.syncInterval = setInterval(() => {
      if (this.conn?.open && this.isHost) {
        this.syncGameState();
      }
    }, 5000);
  }
  
  /**
   * Arrête l'intervalle de ping et synchronisation
   */
  stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
  
  /**
   * Vérifie si c'est notre tour
   */
  isOurTurn() {
    return this.isMyTurn;
  }
  
  /**
   * Ferme la connexion
   */
  disconnect() {
    this.stopPingInterval();
    
    if (this.conn) {
      this.conn.close();
      this.conn = null;
    }
    
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    
    this.connectionStatus = 'disconnected';
    this.myPeerId = null;
  }
  
  /**
   * Obtient le statut de connexion
   */
  getStatus() {
    if (!this.peer) return 'disconnected';
    if (!this.conn) return 'waiting';
    return this.connectionStatus;
  }
  
  /**
   * Obtient la latence
   */
  getPing() {
    return this.pingLatency;
  }
  
  /**
   * Tentative de reconnexion automatique
   */
  attemptReconnection() {
    // Ne pas essayer de se reconnecter si on est l'hôte ou si on a dépassé le max
    if (this.isHost || this.reconnectionAttempts >= this.maxReconnectionAttempts || !this.lastKnownHostId) {
      console.log('🚫 Reconnexion automatique annulée');
      return;
    }
    
    this.reconnectionAttempts++;
    console.log(`🔄 Tentative de reconnexion ${this.reconnectionAttempts}/${this.maxReconnectionAttempts}...`);
    
    // Attendre un délai progressif avant de se reconnecter
    const delay = this.reconnectionAttempts * 2000; // 2s, 4s, 6s
    
    setTimeout(async () => {
      try {
        updateStatus('connecting', `Reconnexion... (${this.reconnectionAttempts}/${this.maxReconnectionAttempts})`);
        showAchievement(`RECONNEXION ${this.reconnectionAttempts}/${this.maxReconnectionAttempts}`);
        
        await this.connectToHost(this.lastKnownHostId);
        
        console.log('✅ Reconnexion réussie!');
        showAchievement('RECONNECTÉ!');
        
      } catch(e) {
        console.error(`❌ Échec reconnexion ${this.reconnectionAttempts}:`, e);
        
        if (this.reconnectionAttempts >= this.maxReconnectionAttempts) {
          console.log('💀 Abandon reconnexion après maximum de tentatives');
          updateStatus('error', 'Reconnexion impossible');
          showAchievement('CONNEXION PERDUE!');
        }
      }
    }, delay);
  }
}

// Export d'une instance unique
export const network = new Network();
