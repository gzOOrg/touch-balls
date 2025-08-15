/**
 * Module Game - Logique principale du jeu de billard
 */

import { 
  CANVAS_WIDTH, CANVAS_HEIGHT, BALL_RADIUS, FRICTION, 
  RESTITUTION_WALL, RESTITUTION_BALL, STOP_VELOCITY, 
  MAX_PULL_DISTANCE, AIM_EXTEND, AIM_SECONDARY, POWER_MULTIPLIER,
  HOLE_SIZES, BALL_COLORS, GAME_MODE
} from './constants.js';

import { clamp, length, normalize, distance, dotProduct } from './utils.js';
import { sfx } from './sfx.js';
import { showPowerMeter, updateTurnIndicator, updateStats, showComboText } from './ui.js';

// État du jeu
export const gameState = {
  balls: [],
  redBall: null,
  currentTurn: 0,
  isShot: false,
  roundOver: false,
  matchOver: false,
  roundWinner: null,
  roundsWon: [0, 0], // Nombre de manches gagnées par chaque joueur
  dragging: false,
  draggedBall: null,
  drag: { x: 0, y: 0 },  // Vecteur de drag actuel
  fallenBalls: [],
  holeSize: HOLE_SIZES[2], // Pro par défaut
  gameStartTime: 0,
  currentStreak: 0,
  totalShots: 0
};

// Canvas et contexte
let canvas = null;
let ctx = null;

// Fonction pour obtenir le mode de jeu (sera définie par main.js)
let getGameMode = null;

// Callback pour les événements réseau
let onShot = null;
let onTurnChange = null;
let onMatchEnd = null;

/**
 * Définit la fonction pour obtenir le mode de jeu
 */
export function setGameModeGetter(getter) {
  getGameMode = getter;
}

/**
 * Définit les callbacks réseau
 */
export function setNetworkCallbacks(callbacks) {
  onShot = callbacks.onShot || null;
  onTurnChange = callbacks.onTurnChange || null;
  onMatchEnd = callbacks.onMatchEnd || null;
}

/**
 * Initialise le module de jeu
 */
export function initGame(canvasElement) {
  canvas = canvasElement;
  ctx = canvas.getContext('2d');
  
  // Configuration du canvas
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  
  // Événements de souris/touch
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('touchstart', handleTouchStart);
  canvas.addEventListener('touchmove', handleTouchMove);
  canvas.addEventListener('touchend', handleTouchEnd);
  
  // Empêcher le menu contextuel
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

/**
 * Classe Ball - Représente une boule
 */
class Ball {
  constructor(x, y, color, owner = null) {
    this.id = Math.random();
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = BALL_RADIUS;
    this.color = color;
    this.owner = owner; // 0 = player1, 1 = player2, null = red
    this.isActive = true;
    this.trail = [];
  }
  
  update(dt) {
    if (!this.isActive) return;
    
    // Sauvegarder la position pour la traînée
    if (length(this.vx, this.vy) > 50) {
      this.trail.push({ x: this.x, y: this.y, alpha: 1 });
      if (this.trail.length > 8) {
        this.trail.shift();
      }
    }
    
    // Mise à jour de la traînée
    this.trail.forEach(point => {
      point.alpha -= 0.05;
    });
    this.trail = this.trail.filter(point => point.alpha > 0);
    
    // Appliquer la vélocité
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    
    // Friction
    const speed = length(this.vx, this.vy);
    if (speed > 0) {
      const friction = FRICTION * dt;
      const newSpeed = Math.max(0, speed - friction);
      const factor = newSpeed / speed;
      this.vx *= factor;
      this.vy *= factor;
      
      // Arrêt complet si vitesse trop faible
      if (newSpeed < STOP_VELOCITY) {
        this.vx = 0;
        this.vy = 0;
      }
    }
    
    // Collision avec les murs
    if (this.x - this.radius < 0 || this.x + this.radius > CANVAS_WIDTH) {
      this.vx *= -RESTITUTION_WALL;
      this.x = clamp(this.x, this.radius, CANVAS_WIDTH - this.radius);
      const velocity = Math.abs(this.vx) / 100;
      sfx.wall(velocity);
    }
    
    if (this.y - this.radius < 0 || this.y + this.radius > CANVAS_HEIGHT) {
      this.vy *= -RESTITUTION_WALL;
      this.y = clamp(this.y, this.radius, CANVAS_HEIGHT - this.radius);
      const velocity = Math.abs(this.vy) / 100;
      sfx.wall(velocity);
    }
  }
  
  draw() {
    if (!this.isActive) return;
    
    // Dessiner la traînée avec effet amélioré
    this.trail.forEach(point => {
      ctx.globalAlpha = point.alpha * 0.6;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, this.radius * 0.8, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    
    // Boule principale avec gradient sophistiqué
    const grad = ctx.createRadialGradient(
      this.x - this.radius * 0.3, 
      this.y - this.radius * 0.3, 
      1, 
      this.x, 
      this.y, 
      this.radius
    );
    
    if (this.color === 'white') {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.7, '#e0e0e0');
      grad.addColorStop(1, '#c0c0c0');
    } else if (this.color === '#111827' || this.color === 'black') {
      grad.addColorStop(0, '#4a4a4a');
      grad.addColorStop(0.7, '#2a2a2a');
      grad.addColorStop(1, '#111827');
    } else {
      // Boule rouge
      grad.addColorStop(0, '#ff6b9d');
      grad.addColorStop(0.7, '#e11d48');
      grad.addColorStop(1, '#be185d');
    }
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight brillant
    const hgrad = ctx.createRadialGradient(
      this.x - this.radius * 0.4, 
      this.y - this.radius * 0.4, 
      1, 
      this.x, 
      this.y, 
      this.radius
    );
    hgrad.addColorStop(0, 'rgba(255,255,255,0.8)');
    hgrad.addColorStop(0.3, 'rgba(255,255,255,0.3)');
    hgrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hgrad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Glow spécial pour la boule rouge
    if (this.color === '#e11d48') {
      ctx.shadowColor = '#ff0080';
      ctx.shadowBlur = 20;
      ctx.strokeStyle = '#ff0080';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    // Reflet
    ctx.save();
    ctx.translate(this.x - this.radius * 0.3, this.y - this.radius * 0.3);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Bordure
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius - 0.5, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/**
 * Réinitialise les boules
 */
export function resetBalls() {
  gameState.balls = [];
  const centerX = CANVAS_WIDTH / 2;
  const centerY = CANVAS_HEIGHT / 2;
  
  // Boules blanches (joueur 1)
  gameState.balls.push(
    new Ball(centerX - 180, centerY - 40, BALL_COLORS.WHITE, 0),
    new Ball(centerX - 180, centerY + 40, BALL_COLORS.WHITE, 0)
  );
  
  // Boules noires (joueur 2)
  gameState.balls.push(
    new Ball(centerX + 180, centerY - 40, BALL_COLORS.BLACK, 1),
    new Ball(centerX + 180, centerY + 40, BALL_COLORS.BLACK, 1)
  );
  
  // Boule rouge
  const yBottom = CANVAS_HEIGHT - BALL_RADIUS;
  const yMid = centerY + (yBottom - centerY) / 2;
  gameState.redBall = new Ball(centerX, yMid, BALL_COLORS.RED, null);
  gameState.balls.push(gameState.redBall);
}

/**
 * Vérifie les collisions entre boules
 */
function checkBallCollisions() {
  for (let i = 0; i < gameState.balls.length; i++) {
    for (let j = i + 1; j < gameState.balls.length; j++) {
      const ball1 = gameState.balls[i];
      const ball2 = gameState.balls[j];
      
      if (!ball1.isActive || !ball2.isActive) continue;
      
      const dist = distance(ball1.x, ball1.y, ball2.x, ball2.y);
      const minDist = ball1.radius + ball2.radius;
      
      if (dist < minDist) {
        // Collision détectée
        const dx = ball2.x - ball1.x;
        const dy = ball2.y - ball1.y;
        const normal = normalize(dx, dy);
        
        // Séparer les boules
        const overlap = minDist - dist;
        ball1.x -= normal.x * overlap * 0.5;
        ball1.y -= normal.y * overlap * 0.5;
        ball2.x += normal.x * overlap * 0.5;
        ball2.y += normal.y * overlap * 0.5;
        
        // Calculer les nouvelles vitesses
        const v1n = dotProduct({ x: ball1.vx, y: ball1.vy }, normal);
        const v2n = dotProduct({ x: ball2.vx, y: ball2.vy }, normal);
        
        const v1t = { x: ball1.vx - v1n * normal.x, y: ball1.vy - v1n * normal.y };
        const v2t = { x: ball2.vx - v2n * normal.x, y: ball2.vy - v2n * normal.y };
        
        // Échange des vitesses normales
        ball1.vx = v1t.x + v2n * normal.x * RESTITUTION_BALL;
        ball1.vy = v1t.y + v2n * normal.y * RESTITUTION_BALL;
        ball2.vx = v2t.x + v1n * normal.x * RESTITUTION_BALL;
        ball2.vy = v2t.y + v1n * normal.y * RESTITUTION_BALL;
        
        // Son de collision
        const relativeVelocity = Math.abs(v1n - v2n) / 100;
        sfx.ball(relativeVelocity);
      }
    }
  }
}

/**
 * Vérifie si une boule tombe dans le trou
 */
function checkHoles() {
  const holeX = CANVAS_WIDTH / 2;
  const holeY = CANVAS_HEIGHT / 2;
  
  gameState.balls.forEach(ball => {
    if (!ball.isActive) return;
    
    const dist = distance(ball.x, ball.y, holeX, holeY);
    
    if (dist < gameState.holeSize) {
      // La boule tombe !
      ball.isActive = false;
      gameState.fallenBalls.push(ball);
      
      if (ball === gameState.redBall) {
        sfx.fallRed();
        showComboText('RED BALL! 🎯');
      } else {
        sfx.fall();
        // Message spécial si on fait tomber une boule adverse
        if (ball.owner !== null && ball.owner !== gameState.currentTurn) {
          showComboText('NICE SHOT! 💀');
        }
      }
    }
  });
}

/**
 * Met à jour la physique du jeu
 */
export function updatePhysics(deltaTime) {
  const dt = Math.min(deltaTime, 0.016); // Cap à 60 FPS
  
  // Mettre à jour toutes les boules
  gameState.balls.forEach(ball => ball.update(dt));
  
  // Vérifier les collisions
  checkBallCollisions();
  
  // Vérifier les trous
  checkHoles();
  
  // Vérifier si toutes les boules sont arrêtées
  if (gameState.isShot && allBallsStopped()) {
    gameState.isShot = false;
    checkRoundEnd();
  }
}

/**
 * Vérifie si toutes les boules sont arrêtées
 */
function allBallsStopped() {
  return gameState.balls.every(ball => 
    !ball.isActive || length(ball.vx, ball.vy) <= STOP_VELOCITY
  );
}

/**
 * Vérifie la fin du round
 */
function checkRoundEnd() {
  const player1Balls = gameState.balls.filter(b => b.isActive && b.owner === 0).length;
  const player2Balls = gameState.balls.filter(b => b.isActive && b.owner === 1).length;
  
  // Vérifier les conditions de victoire
  if (!gameState.redBall.isActive) {
    // La boule rouge est tombée - le joueur actuel gagne la manche !
    gameState.roundOver = true;
    gameState.roundWinner = gameState.currentTurn;
    showComboText(`🏆 ${gameState.currentTurn === 0 ? 'JOUEUR 1' : 'JOUEUR 2'} GAGNE LA MANCHE !`);
    sfx.victory();
  } else if (player1Balls === 0) {
    // Le joueur 1 n'a plus de boules - le joueur 2 gagne
    gameState.roundOver = true;
    gameState.roundWinner = 1;
    showComboText('🏆 JOUEUR 2 GAGNE LA MANCHE !');
    sfx.victory();
  } else if (player2Balls === 0) {
    // Le joueur 2 n'a plus de boules - le joueur 1 gagne
    gameState.roundOver = true;
    gameState.roundWinner = 0;
    showComboText('🏆 JOUEUR 1 GAGNE LA MANCHE !');
    sfx.victory();
  }
  
  if (!gameState.roundOver) {
    // Changer de tour
    gameState.currentTurn = 1 - gameState.currentTurn;
    gameState.totalShots++;
    updateStats(gameState.totalShots, gameState.currentStreak, gameState.gameStartTime);
    
    // Envoyer le changement de tour en réseau si nécessaire
    if (onTurnChange && getGameMode && (getGameMode() === GAME_MODE.HOST || getGameMode() === GAME_MODE.GUEST)) {
      onTurnChange(gameState.currentTurn);
    }
  } else {
    // La manche est terminée, gérer la fin
    handleRoundEnd();
  }
}

/**
 * Dessine la table de jeu
 */
function drawTable() {
  // Fond sombre
  ctx.fillStyle = '#0a2818';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // Grille cyberpunk
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  
  // Lignes verticales
  for (let i = 0; i < CANVAS_WIDTH; i += 50) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, CANVAS_HEIGHT);
    ctx.stroke();
  }
  
  // Lignes horizontales
  for (let i = 0; i < CANVAS_HEIGHT; i += 50) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(CANVAS_WIDTH, i);
    ctx.stroke();
  }
  
  // Trou central avec effet lumineux
  const cx = CANVAS_WIDTH / 2;
  const cy = CANVAS_HEIGHT / 2;
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, gameState.holeSize);
  gradient.addColorStop(0, '#000');
  gradient.addColorStop(0.7, '#1a0a0a');
  gradient.addColorStop(1, '#2a1a1a');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, gameState.holeSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Bordure lumineuse du trou
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(cx, cy, gameState.holeSize, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

/**
 * Dessine la ligne de visée améliorée
 */
function drawAimLine(ball, dragVector) {
  // La ligne de visée pointe dans la direction opposée au drag
  const dx = -dragVector.x;
  const dy = -dragVector.y;
  const distance = length(dx, dy);
  
  if (distance < 5) return;
  
  const normalized = normalize(dx, dy);
  const maxLength = distance * AIM_EXTEND;
  
  // Trouver le premier point d'impact
  const hit = findFirstHit(ball, normalized, maxLength);
  
  // Ligne principale avec effet néon
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
  ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(ball.x, ball.y);
  
  if (hit) {
    ctx.lineTo(hit.x, hit.y);
    ctx.stroke();
    
    // Point d'impact lumineux
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(hit.x, hit.y, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Ligne de rebond si applicable
    if (hit.type === 'wall') {
      const reflect = reflectVector(normalized, hit.normal);
      ctx.strokeStyle = 'rgba(255, 0, 128, 0.7)';
      ctx.shadowColor = 'rgba(255, 0, 128, 0.7)';
      ctx.beginPath();
      ctx.moveTo(hit.x, hit.y);
      ctx.lineTo(
        hit.x + reflect.x * maxLength * AIM_SECONDARY,
        hit.y + reflect.y * maxLength * AIM_SECONDARY
      );
      ctx.stroke();
    }
  } else {
    ctx.lineTo(
      ball.x + normalized.x * maxLength,
      ball.y + normalized.y * maxLength
    );
    ctx.stroke();
  }
  
  ctx.setLineDash([]);
  ctx.shadowBlur = 0;
}

/**
 * Trouve le premier point d'impact
 */
function findFirstHit(ball, direction, maxDistance) {
  let closestHit = null;
  let minDistance = maxDistance;
  
  // Vérifier les murs
  // Mur gauche
  if (direction.x < 0) {
    const t = (ball.radius - ball.x) / direction.x;
    if (t > 0 && t < minDistance) {
      const y = ball.y + direction.y * t;
      if (y >= ball.radius && y <= CANVAS_HEIGHT - ball.radius) {
        minDistance = t;
        closestHit = {
          x: ball.radius,
          y: y,
          type: 'wall',
          normal: { x: 1, y: 0 }
        };
      }
    }
  }
  
  // Mur droit
  if (direction.x > 0) {
    const t = (CANVAS_WIDTH - ball.radius - ball.x) / direction.x;
    if (t > 0 && t < minDistance) {
      const y = ball.y + direction.y * t;
      if (y >= ball.radius && y <= CANVAS_HEIGHT - ball.radius) {
        minDistance = t;
        closestHit = {
          x: CANVAS_WIDTH - ball.radius,
          y: y,
          type: 'wall',
          normal: { x: -1, y: 0 }
        };
      }
    }
  }
  
  // Mur haut
  if (direction.y < 0) {
    const t = (ball.radius - ball.y) / direction.y;
    if (t > 0 && t < minDistance) {
      const x = ball.x + direction.x * t;
      if (x >= ball.radius && x <= CANVAS_WIDTH - ball.radius) {
        minDistance = t;
        closestHit = {
          x: x,
          y: ball.radius,
          type: 'wall',
          normal: { x: 0, y: 1 }
        };
      }
    }
  }
  
  // Mur bas
  if (direction.y > 0) {
    const t = (CANVAS_HEIGHT - ball.radius - ball.y) / direction.y;
    if (t > 0 && t < minDistance) {
      const x = ball.x + direction.x * t;
      if (x >= ball.radius && x <= CANVAS_WIDTH - ball.radius) {
        minDistance = t;
        closestHit = {
          x: x,
          y: CANVAS_HEIGHT - ball.radius,
          type: 'wall',
          normal: { x: 0, y: -1 }
        };
      }
    }
  }
  
  // TODO: Vérifier les collisions avec les autres boules
  
  return closestHit;
}

/**
 * Calcule le vecteur de réflexion
 */
function reflectVector(direction, normal) {
  const dot = direction.x * normal.x + direction.y * normal.y;
  return {
    x: direction.x - 2 * dot * normal.x,
    y: direction.y - 2 * dot * normal.y
  };
}

/**
 * Rendu principal
 */
export function render() {
  // Effacer le canvas
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // Dessiner la table
  drawTable();
  
  // Dessiner toutes les boules
  gameState.balls.forEach(ball => ball.draw());
  
  // Dessiner la ligne de visée si on fait glisser
  if (gameState.dragging && gameState.draggedBall) {
    // Dessiner la ligne de drag (tirer vers l'arrière)
    if (length(gameState.drag.x, gameState.drag.y) > 5) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(gameState.draggedBall.x, gameState.draggedBall.y);
      ctx.lineTo(
        gameState.draggedBall.x + gameState.drag.x,
        gameState.draggedBall.y + gameState.drag.y
      );
      ctx.stroke();
      ctx.restore();
    }
    
    // Dessiner la ligne de visée (direction du tir)
    drawAimLine(gameState.draggedBall, gameState.drag);
  }
}

/**
 * Gestion de la souris/touch
 */
function handleMouseDown(e) {
  if (gameState.isShot || gameState.roundOver) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  handlePointerDown(x, y);
}

function handleTouchStart(e) {
  e.preventDefault();
  if (gameState.isShot || gameState.roundOver) return;
  
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  
  handlePointerDown(x, y);
}

function handlePointerDown(x, y) {
  // En mode IA, empêcher le joueur de jouer pendant le tour de l'IA
  if (getGameMode && getGameMode() === GAME_MODE.AI && gameState.currentTurn === 1) {
    return;
  }
  
  // Vérifier si on clique sur une boule du joueur actuel
  gameState.balls.forEach(ball => {
    // Ne pas permettre de déplacer la boule rouge ou les boules inactives
    if (!ball.isActive || ball === gameState.redBall || ball.owner !== gameState.currentTurn) return;
    
    const dist = distance(x, y, ball.x, ball.y);
    if (dist < ball.radius + 10) {
      gameState.dragging = true;
      gameState.draggedBall = ball;
      gameState.drag = { x: 0, y: 0 };  // Réinitialiser le drag
      canvas.style.cursor = 'grabbing';
      updateTurnIndicator(null, true); // Cacher l'indicateur de tour
      showPowerMeter(true, 0);
    }
  });
}

function handleMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  handlePointerMove(x, y);
}

function handleTouchMove(e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  
  handlePointerMove(x, y);
}

function handlePointerMove(x, y) {
  if (gameState.dragging && gameState.draggedBall) {
    // Calculer le vecteur depuis la position actuelle vers la balle
    const dx = x - gameState.draggedBall.x;
    const dy = y - gameState.draggedBall.y;
    const dist = length(dx, dy);
    
    // Limiter la distance de drag à MAX_PULL_DISTANCE
    const limitedDist = Math.min(dist, MAX_PULL_DISTANCE);
    
    // Normaliser et appliquer la distance limitée
    if (dist > 0) {
      const normalized = normalize(dx, dy);
      gameState.drag.x = normalized.x * limitedDist;
      gameState.drag.y = normalized.y * limitedDist;
    }
    
    // Mettre à jour la jauge de puissance
    const power = (limitedDist / MAX_PULL_DISTANCE) * 100;
    showPowerMeter(true, power);
  } else {
    // En mode IA, pas de curseur spécial pendant le tour de l'IA
    if (getGameMode && getGameMode() === GAME_MODE.AI && gameState.currentTurn === 1) {
      canvas.style.cursor = 'default';
      return;
    }
    
    // Vérifier si on survole une boule jouable
    let hoveringBall = false;
    gameState.balls.forEach(ball => {
      // Ne pas permettre de survoler la boule rouge ou les boules inactives
      if (!ball.isActive || ball === gameState.redBall || ball.owner !== gameState.currentTurn) return;
      
      const d = distance(x, y, ball.x, ball.y);
      if (d < ball.radius + 10) {
        hoveringBall = true;
      }
    });
    
    canvas.style.cursor = hoveringBall ? 'grab' : 'default';
  }
}

function handleMouseUp(e) {
  handlePointerUp();
}

function handleTouchEnd(e) {
  e.preventDefault();
  handlePointerUp();
}

function handlePointerUp() {
  if (gameState.dragging && gameState.draggedBall) {
    const dist = length(gameState.drag.x, gameState.drag.y);
    
    if (dist > 10) {
      // Calculer la puissance basée sur la distance de drag
      const power = Math.min(dist / MAX_PULL_DISTANCE, 1);
      
      // Appliquer la vélocité dans la direction opposée au drag
      // (on tire vers l'arrière pour propulser vers l'avant)
      const normalized = normalize(-gameState.drag.x, -gameState.drag.y);
      
      gameState.draggedBall.vx = normalized.x * power * POWER_MULTIPLIER * 100;
      gameState.draggedBall.vy = normalized.y * power * POWER_MULTIPLIER * 100;
      
      gameState.isShot = true;
      gameState.fallenBalls = [];
      gameState.totalShots++;
      
      updateStats(gameState.totalShots, gameState.currentStreak, gameState.gameStartTime);
      
      // Effets spéciaux selon la puissance
      if (power > 0.95) {
        showComboText('MEGA SHOT! 🔥');
        sfx.epic();
      } else if (power > 0.8) {
        showComboText('POWER SHOT!');
        sfx.epic();
      }
      
      // Envoyer le tir en réseau si nécessaire
      if (onShot && getGameMode && (getGameMode() === GAME_MODE.HOST || getGameMode() === GAME_MODE.GUEST)) {
        onShot(gameState.draggedBall.id, gameState.draggedBall.vx, gameState.draggedBall.vy);
      }
    }
  }
  
  gameState.dragging = false;
  gameState.draggedBall = null;
  gameState.drag = { x: 0, y: 0 };
  canvas.style.cursor = 'default';
  showPowerMeter(false);
}

/**
 * Définit la difficulté
 */
export function setDifficulty(level) {
  gameState.holeSize = HOLE_SIZES[level];
}

/**
 * Démarre une nouvelle partie
 */
export function startMatch() {
  gameState.gameStartTime = Date.now();
  gameState.totalShots = 0;
  gameState.currentStreak = 0;
  gameState.roundsWon = [0, 0];
  gameState.matchOver = false;
  gameState.roundOver = false;
  gameState.roundWinner = null;
  resetBalls();
}

/**
 * Démarre une nouvelle manche
 */
export function startNewRound() {
  gameState.roundOver = false;
  gameState.roundWinner = null;
  gameState.isShot = false;
  gameState.fallenBalls = [];
  gameState.currentTurn = 0; // Les blancs commencent toujours
  resetBalls();
  updateTurnIndicator({name: 'JOUEUR 1', color: 'white'}, false);
}

/**
 * Gère la fin d'une manche
 */
export function handleRoundEnd() {
  if (gameState.roundWinner !== null) {
    // Incrémenter le score du gagnant
    gameState.roundsWon[gameState.roundWinner]++;
    
    // Mettre à jour l'affichage des scores
    if (window.updateGameScores) {
      window.updateGameScores(gameState.roundsWon);
    }
    
    // Vérifier si la partie est terminée (2 manches gagnantes)
    if (gameState.roundsWon[gameState.roundWinner] >= 2) {
      gameState.matchOver = true;
      showComboText(`🏆🏆🏆 ${gameState.roundWinner === 0 ? 'JOUEUR 1' : 'JOUEUR 2'} GAGNE LA PARTIE ! 🏆🏆🏆`);
      sfx.victory();
      
      // Afficher un bouton pour recommencer
      setTimeout(() => {
        if (onMatchEnd) onMatchEnd(gameState.roundWinner);
      }, 3000);
    } else {
      // Continuer avec une nouvelle manche
      showComboText(`Manche ${gameState.roundsWon[0] + gameState.roundsWon[1] + 1} !`);
      setTimeout(() => {
        startNewRound();
      }, 3000);
    }
  }
}

/**
 * Obtient le nombre de boules actives pour un joueur
 */
export function getActiveBallsCount(player) {
  return gameState.balls.filter(b => b.isActive && b.owner === player).length;
}
