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
    
    // Callbacks
    this.onChatMessage = null;
    this.onGameStateUpdate = null;
    this.onShot = null;
    this.onTurnChange = null;
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
      const connection = this.peer.connect(hostPeerId.trim());
      this.handleConnection(connection);
      
      // Attendre que la connexion soit ouverte
      await new Promise((resolve, reject) => {
        connection.on('open', resolve);
        connection.on('error', reject);
        setTimeout(() => reject(new Error('Timeout de connexion')), 10000);
      });
      
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
      
      // Si on est l'hôte, envoyer l'état initial
      if (this.isHost) {
        this.syncGameState();
      }
    });
    
    connection.on('data', (data) => {
      console.log('Message reçu:', data.type);
      this.handleMessage(data);
    });
    
    connection.on('close', () => {
      console.log('Connexion fermée');
      this.connectionStatus = 'disconnected';
      updateStatus('error', 'Connexion fermée');
      this.stopPingInterval();
      
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
        if (this.onGameStateUpdate) {
          this.onGameStateUpdate(data);
        }
        break;
        
      case MESSAGE_TYPE.TURN_CHANGE:
        this.isMyTurn = (this.isHost && data.turn === 0) || (!this.isHost && data.turn === 1);
        if (this.onTurnChange) {
          this.onTurnChange(data.turn, this.isMyTurn);
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
   * Envoie les données d'un tir
   */
  sendShot(ballId, vx, vy) {
    return this.sendMessage({
      type: MESSAGE_TYPE.SHOT,
      ballId,
      vx,
      vy
    });
  }
  
  /**
   * Synchronise l'état du jeu
   */
  syncGameState() {
    if (!this.isHost) return;
    
    // Obtenir les données à synchroniser
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
        isActive: ball.isActive
      })),
      currentTurn: gameState.currentTurn,
      roundOver: gameState.roundOver,
      matchOver: gameState.matchOver
    };
    
    return this.sendMessage(syncData);
  }
  
  /**
   * Envoie un changement de tour
   */
  sendTurnChange(turn) {
    return this.sendMessage({
      type: MESSAGE_TYPE.TURN_CHANGE,
      turn
    });
  }
  
  /**
   * Démarre l'intervalle de ping
   */
  startPingInterval() {
    // Premier ping après 1 seconde
    setTimeout(() => {
      if (this.conn?.open) {
        this.lastPingTime = Date.now();
        this.sendMessage({ type: MESSAGE_TYPE.PING, timestamp: this.lastPingTime });
      }
    }, 1000);
    
    // Puis toutes les 3 secondes
    this.pingInterval = setInterval(() => {
      if (this.conn?.open) {
        this.lastPingTime = Date.now();
        this.sendMessage({ type: MESSAGE_TYPE.PING, timestamp: this.lastPingTime });
      }
    }, 3000);
  }
  
  /**
   * Arrête l'intervalle de ping
   */
  stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
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
}

// Export d'une instance unique
export const network = new Network();
