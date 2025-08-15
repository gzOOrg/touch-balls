/**
 * Module AI - Intelligence artificielle pour le jeu de billard
 */

import { AI_LEVEL, CANVAS_WIDTH, CANVAS_HEIGHT, POWER_MULTIPLIER, BALL_RADIUS } from './constants.js';
import { length, normalize, distance, dotProduct } from './utils.js';
import { gameState } from './game.js';
import { showComboText } from './ui.js';

/**
 * Configuration par niveau d'IA
 */
const AI_CONFIG = {
  [AI_LEVEL.DUMB]: {
    name: 'IA DUMB',
    angleStep: 45,      // Angles testés tous les 45°
    powerStep: 0.3,     // 3 niveaux de puissance
    randomness: 200,    // Beaucoup d'aléatoire
    thinkingTime: 1000, // Réflexion rapide
    accuracy: 0.5       // Précision faible
  },
  [AI_LEVEL.SMART]: {
    name: 'IA SMART',
    angleStep: 20,      // Angles testés tous les 20°
    powerStep: 0.2,     // 5 niveaux de puissance
    randomness: 50,     // Un peu d'aléatoire
    thinkingTime: 2000, // Réflexion moyenne
    accuracy: 0.8       // Bonne précision
  },
  [AI_LEVEL.TERMINATOR]: {
    name: 'TERMINATOR',
    angleStep: 10,      // Angles testés tous les 10°
    powerStep: 0.1,     // 10 niveaux de puissance
    randomness: 0,      // Aucun aléatoire
    thinkingTime: 3000, // Réflexion longue
    accuracy: 1.0       // Précision parfaite
  }
};

/**
 * Classe AI - Gère l'intelligence artificielle
 */
export class AI {
  constructor(level = AI_LEVEL.DUMB) {
    this.level = level;
    this.config = AI_CONFIG[level];
    this.isThinking = false;
  }
  
  /**
   * Définit le niveau de l'IA
   */
  setLevel(level) {
    this.level = level;
    this.config = AI_CONFIG[level];
  }
  
  /**
   * Fait jouer l'IA
   */
  async play() {
    if (this.isThinking) return;
    
    this.isThinking = true;
    
    // Afficher que l'IA réfléchit
    showComboText(`${this.config.name} RÉFLÉCHIT...`);
    
    // Simuler le temps de réflexion
    await this.think();
    
    // Calculer le meilleur coup
    const bestShot = this.calculateBestShot();
    
    if (bestShot) {
      // Ajouter de l'imprécision selon le niveau
      const finalShot = this.addInaccuracy(bestShot);
      
      // Exécuter le tir
      this.executeShot(finalShot);
    }
    
    this.isThinking = false;
  }
  
  /**
   * Simule le temps de réflexion
   */
  async think() {
    return new Promise(resolve => {
      setTimeout(resolve, this.config.thinkingTime);
    });
  }
  
  /**
   * Calcule le meilleur coup possible
   */
  calculateBestShot() {
    const myBalls = gameState.balls.filter(b => b.isActive && b.owner === 1);
    if (!myBalls.length) return null;
    
    let bestShot = null;
    let bestScore = -Infinity;
    
    // Tester toutes les boules
    for (const ball of myBalls) {
      // Tester différents angles
      for (let angle = 0; angle < 360; angle += this.config.angleStep) {
        // Tester différentes puissances
        for (let power = 0.3; power <= 1; power += this.config.powerStep) {
          const score = this.evaluateShot(ball, angle * Math.PI / 180, power);
          
          if (score > bestScore) {
            bestScore = score;
            bestShot = {
              ball,
              angle: angle * Math.PI / 180,
              power,
              score
            };
          }
        }
      }
    }
    
    return bestShot;
  }
  
  /**
   * Évalue un coup potentiel
   */
  evaluateShot(ball, angle, power) {
    let score = 0;
    
    // Calculer la vitesse résultante
    const vx = Math.cos(angle) * power * POWER_MULTIPLIER * 100;
    const vy = Math.sin(angle) * power * POWER_MULTIPLIER * 100;
    const shotDirection = normalize(vx, vy);
    
    // 1. Évaluer le tir sur la boule rouge (priorité maximale)
    const redBall = gameState.redBall;
    if (redBall && redBall.isActive) {
      const redDist = distance(ball.x, ball.y, redBall.x, redBall.y);
      const redDirection = normalize(redBall.x - ball.x, redBall.y - ball.y);
      const redAlignment = dotProduct(redDirection, shotDirection);
      
      if (redAlignment > 0.7) {
        // Bon alignement avec la rouge
        score += 300 - redDist * 0.5;
        
        // Bonus si la rouge est alignée avec le trou
        const holeX = CANVAS_WIDTH / 2;
        const holeY = CANVAS_HEIGHT / 2;
        const holeDirection = normalize(holeX - redBall.x, holeY - redBall.y);
        const redPushAlignment = dotProduct(redDirection, holeDirection);
        
        if (redPushAlignment > 0.5) {
          score += 500; // Énorme bonus pour un tir gagnant potentiel
        }
      }
    }
    
    // 2. Évaluer les tirs sur les boules adverses
    const enemyBalls = gameState.balls.filter(b => b.isActive && b.owner === 0);
    for (const enemy of enemyBalls) {
      const enemyDist = distance(ball.x, ball.y, enemy.x, enemy.y);
      const enemyDirection = normalize(enemy.x - ball.x, enemy.y - ball.y);
      const enemyAlignment = dotProduct(enemyDirection, shotDirection);
      
      if (enemyAlignment > 0.7) {
        // Bon alignement avec une boule ennemie
        score += 100 - enemyDist * 0.3;
        
        // Bonus si l'ennemi est aligné avec le trou
        const holeX = CANVAS_WIDTH / 2;
        const holeY = CANVAS_HEIGHT / 2;
        const holeDirection = normalize(holeX - enemy.x, holeY - enemy.y);
        const enemyPushAlignment = dotProduct(enemyDirection, holeDirection);
        
        if (enemyPushAlignment > 0.5) {
          score += 200;
        }
      }
    }
    
    // 3. Pénalité si on risque de tomber dans le trou
    const holeX = CANVAS_WIDTH / 2;
    const holeY = CANVAS_HEIGHT / 2;
    const holeDist = distance(ball.x, ball.y, holeX, holeY);
    const holeDirection = normalize(holeX - ball.x, holeY - ball.y);
    const holeAlignment = dotProduct(holeDirection, shotDirection);
    
    if (holeAlignment > 0.5 && holeDist < 150) {
      score -= 300; // Grosse pénalité pour un suicide potentiel
    }
    
    // 4. Bonus pour les tirs avec rebond (niveau SMART et TERMINATOR)
    if (this.level >= AI_LEVEL.SMART) {
      // Vérifier si le tir peut rebondir utilement
      const wallBonus = this.evaluateWallShot(ball, angle, power);
      score += wallBonus * (this.level === AI_LEVEL.TERMINATOR ? 1.5 : 1.0);
    }
    
    // 5. Ajouter de l'aléatoire selon le niveau
    if (this.config.randomness > 0) {
      score += (Math.random() - 0.5) * this.config.randomness;
    }
    
    return score;
  }
  
  /**
   * Évalue les tirs avec rebond sur les murs
   */
  evaluateWallShot(ball, angle, power) {
    let bonus = 0;
    
    // Simuler rapidement la trajectoire pour voir si elle touche un mur
    const vx = Math.cos(angle) * power * POWER_MULTIPLIER * 100;
    const vy = Math.sin(angle) * power * POWER_MULTIPLIER * 100;
    
    let simX = ball.x;
    let simY = ball.y;
    let simVx = vx;
    let simVy = vy;
    
    // Simuler sur une courte distance
    for (let i = 0; i < 10; i++) {
      simX += simVx * 0.01;
      simY += simVy * 0.01;
      
      // Vérifier les collisions avec les murs
      if (simX - BALL_RADIUS < 0 || simX + BALL_RADIUS > CANVAS_WIDTH) {
        simVx *= -0.88;
        bonus += 50; // Bonus pour utiliser les murs
      }
      if (simY - BALL_RADIUS < 0 || simY + BALL_RADIUS > CANVAS_HEIGHT) {
        simVy *= -0.88;
        bonus += 50;
      }
    }
    
    return bonus;
  }
  
  /**
   * Ajoute de l'imprécision selon le niveau
   */
  addInaccuracy(shot) {
    if (this.config.accuracy >= 1.0) {
      return shot; // TERMINATOR est parfait
    }
    
    const inaccuracy = 1 - this.config.accuracy;
    
    return {
      ...shot,
      angle: shot.angle + (Math.random() - 0.5) * inaccuracy * Math.PI / 6,
      power: Math.max(0.2, Math.min(1, shot.power + (Math.random() - 0.5) * inaccuracy * 0.3))
    };
  }
  
  /**
   * Exécute le tir calculé
   */
  executeShot(shot) {
    const { ball, angle, power } = shot;
    
    // Calculer les vitesses
    const vx = Math.cos(angle) * power * POWER_MULTIPLIER * 100;
    const vy = Math.sin(angle) * power * POWER_MULTIPLIER * 100;
    
    // Appliquer les vitesses à la boule
    ball.vx = vx;
    ball.vy = vy;
    
    // Marquer que le tir est effectué
    gameState.isShot = true;
    gameState.fallenBalls = [];
    gameState.totalShots++;
    
    // Message selon le niveau
    if (this.level === AI_LEVEL.TERMINATOR && shot.score > 500) {
      showComboText('CALCUL PARFAIT!');
    } else if (this.level === AI_LEVEL.SMART && shot.score > 300) {
      showComboText('BON TIR!');
    }
  }
  
  /**
   * Vérifie si l'IA doit jouer
   */
  shouldPlay() {
    return gameState.currentTurn === 1 && 
           !gameState.isShot && 
           !gameState.roundOver && 
           !this.isThinking;
  }
}

// Export d'une instance par défaut
export const aiPlayer = new AI(AI_LEVEL.DUMB);
