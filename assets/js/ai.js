/**
 * Module AI - Intelligence artificielle pour le jeu de billard
 */

import { AI_LEVEL, CANVAS_WIDTH, CANVAS_HEIGHT, POWER_MULTIPLIER, BALL_RADIUS } from './constants.js';
import { length, normalize, distance, dotProduct } from './utils.js';
import { gameState } from './game.js';
import { showComboText } from './ui.js';
import { t } from './translations.js';
import { sfx } from './sfx.js';

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
    angleStep: 2,       // Angles testés tous les 2° (ULTRA précis)
    powerStep: 0.025,   // 40 niveaux de puissance (précision extrême)
    randomness: 0,      // Aucun aléatoire
    thinkingTime: 3000, // Réflexion approfondie
    accuracy: 1.0,      // Précision parfaite
    maxSimSteps: 1000,  // Simulation très profonde
    wallBounces: 5,     // Peut calculer jusqu'à 5 rebonds
    comboThreshold: 700,// Score minimum pour un combo
    oneShotBonus: 2000, // Bonus énorme pour les one-shots
    perfectShotRange: 0.95 // Recherche de tirs parfaits
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
    
    // Message de réflexion selon le niveau
    if (this.level === AI_LEVEL.TERMINATOR) {
      // Introduction dramatique pour TERMINATOR
      showComboText(t('aiTerminatorMode'));
      setTimeout(() => {
        if (this.isThinking) showComboText(t('aiAnalyzing'));
      }, 500);
      setTimeout(() => {
        if (this.isThinking) showComboText(t('aiCalculating'));
      }, 1200);
      setTimeout(() => {
        if (this.isThinking) showComboText(t('aiOptimizing'));
      }, 2000);
    } else {
      showComboText(`${this.config.name} ${t('aiThinking')}`);
    }
    
    // Simuler le temps de réflexion
    await this.think();
    
    // Calculer le meilleur coup
    const bestShot = this.calculateBestShot();
    
    if (bestShot) {
      // Pour TERMINATOR, afficher des infos sur le coup calculé
      if (this.level === AI_LEVEL.TERMINATOR && bestShot.score > 600) {
        console.log('🤖 TERMINATOR - Coup optimal trouvé:', {
          angle: Math.round(bestShot.angle * 180 / Math.PI) + '°',
          power: Math.round(bestShot.power * 100) + '%',
          score: Math.round(bestShot.score),
          prediction: bestShot.score > 900 ? 'VICTOIRE PROBABLE' : 'COUP STRATÉGIQUE'
        });
      }
      
      // Ajouter de l'imprécision selon le niveau
      const finalShot = this.addInaccuracy(bestShot);
      
      // Afficher la visée de l'IA pendant un temps variable selon le niveau
      gameState.aiAiming = {
        ball: finalShot.ball,
        angle: finalShot.angle,
        power: finalShot.power
      };
      
      // Temps d'affichage de la visée selon le niveau
      const aimDisplayTime = this.level === AI_LEVEL.DUMB ? 1500 : 
                           this.level === AI_LEVEL.SMART ? 1200 : 
                           800; // TERMINATOR vise plus vite
      
      // Attendre un peu pour montrer la visée
      await new Promise(resolve => setTimeout(resolve, aimDisplayTime));
      
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
    // L'IA peut maintenant utiliser TOUTES les boules actives (sauf la rouge)
    const playableBalls = gameState.balls.filter(b => b.isActive && b !== gameState.redBall);
    if (!playableBalls.length) return null;
    
    let bestShot = null;
    let bestScore = -Infinity;
    let shotsEvaluated = 0;
    
    // Pour TERMINATOR, d'abord chercher des one-shots parfaits
    if (this.level === AI_LEVEL.TERMINATOR && gameState.redBall && gameState.redBall.isActive) {
      const oneShotAttempts = this.findPerfectOneShot(playableBalls);
      if (oneShotAttempts) {
        console.log('🎯 TERMINATOR: One-shot parfait trouvé!');
        return oneShotAttempts;
      }
    }
    
    // Tester toutes les boules disponibles
    for (const ball of playableBalls) {
      // Tester différents angles
      for (let angle = 0; angle < 360; angle += this.config.angleStep) {
        // Pour TERMINATOR, tester plus de puissances autour des valeurs optimales
        const powerRange = this.level === AI_LEVEL.TERMINATOR ? 
          [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 0.98, 1.0] : 
          this.getPowerRange();
          
        for (const power of powerRange) {
          const score = this.evaluateShot(ball, angle * Math.PI / 180, power);
          shotsEvaluated++;
          
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
    
    if (this.level === AI_LEVEL.TERMINATOR) {
      console.log(`🤖 TERMINATOR: ${shotsEvaluated} tirs évalués, meilleur score: ${Math.round(bestScore)}`);
    }
    
    return bestShot;
  }
  
  /**
   * Obtient la gamme de puissances à tester selon le niveau
   */
  getPowerRange() {
    const range = [];
    for (let power = 0.3; power <= 1; power += this.config.powerStep) {
      range.push(power);
    }
    return range;
  }
  
  /**
   * Cherche un one-shot parfait pour TERMINATOR
   */
  findPerfectOneShot(playableBalls) {
    const redBall = gameState.redBall;
    if (!redBall || !redBall.isActive) return null;
    
    const holeX = CANVAS_WIDTH / 2;
    const holeY = CANVAS_HEIGHT / 2;
    let bestOneShot = null;
    let bestOneShotScore = 0;
    
    // Pour chaque boule jouable
    for (const ball of playableBalls) {
      // 1. Tir direct sur la rouge
      const toRedAngle = Math.atan2(redBall.y - ball.y, redBall.x - ball.x);
      const redToHoleAngle = Math.atan2(holeY - redBall.y, holeX - redBall.x);
      let angleDiff = Math.abs(toRedAngle - redToHoleAngle);
      // Normaliser l'angle entre 0 et PI
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
      
      if (angleDiff < Math.PI / 4) { // Alignement proche (45 degrés)
        // Tester plusieurs puissances pour un one-shot direct
        for (let power = 0.5; power <= 1; power += 0.05) {
          const vx = Math.cos(toRedAngle) * power * POWER_MULTIPLIER * 100;
          const vy = Math.sin(toRedAngle) * power * POWER_MULTIPLIER * 100;
          
          const simResult = this.simulateFullShot(ball, vx, vy);
          
          // Vérifier si c'est un one-shot
          const redInHoleEvent = simResult.events.find(e => e.type === 'redInHole');
          if (redInHoleEvent && redInHoleEvent.step < 200) {
            const shotScore = simResult.score + this.config.oneShotBonus;
            if (shotScore > bestOneShotScore) {
              bestOneShotScore = shotScore;
              bestOneShot = {
                ball,
                angle: toRedAngle,
                power,
                score: shotScore
              };
            }
          }
        }
      }
      
      // 2. Tirs avec rebonds calculés (pour TERMINATOR uniquement)
      // Tester des angles variés pour des rebonds
      for (let angle = 0; angle < 360; angle += 15) {
        const testAngle = angle * Math.PI / 180;
        
        // Simuler pour voir si on peut toucher la rouge après rebond
        for (let power = 0.7; power <= 1; power += 0.1) {
          const vx = Math.cos(testAngle) * power * POWER_MULTIPLIER * 100;
          const vy = Math.sin(testAngle) * power * POWER_MULTIPLIER * 100;
          
          const simResult = this.simulateFullShot(ball, vx, vy);
          
          // Vérifier si on touche la rouge et qu'elle tombe dans le trou
          const hitRedEvent = simResult.events.find(e => e.type === 'hitRed');
          const redInHoleEvent = simResult.events.find(e => e.type === 'redInHole');
          
          if (hitRedEvent && redInHoleEvent && redInHoleEvent.step < 300) {
            const shotScore = simResult.score + this.config.oneShotBonus / 2; // Moins de bonus pour les rebonds
            if (shotScore > bestOneShotScore) {
              bestOneShotScore = shotScore;
              bestOneShot = {
                ball,
                angle: testAngle,
                power,
                score: shotScore
              };
            }
          }
        }
      }
    }
    
    // Ne retourner que si on a trouvé un très bon one-shot
    if (bestOneShot && bestOneShotScore > 3000) {
      console.log('💀 TERMINATOR: One-shot calculé avec score:', Math.round(bestOneShotScore));
      return bestOneShot;
    }
    
    return null;
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
    
    // Bonus si on utilise une boule adverse (tactique)
    if (ball.owner === 0) {
      score += 50; // Bonus tactique pour utiliser les boules du joueur
    }
    
    // Pour TERMINATOR, utiliser la simulation avancée
    if (this.level === AI_LEVEL.TERMINATOR) {
      const simResult = this.simulateFullShot(ball, vx, vy);
      let finalScore = simResult.score + (ball.owner === 0 ? 100 : 0); // Bonus supplémentaire pour TERMINATOR
      
      // Analyse spéciale pour les one-shots directs sur la rouge
      if (simResult.events.some(e => e.type === 'redInHole' && e.step < 100)) {
        finalScore += this.config.oneShotBonus; // Bonus énorme pour un one-shot
        console.log('🎯 TERMINATOR: One-shot potentiel détecté!');
      }
      
      return finalScore;
    }
    
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
   * Simule un tir complet pour TERMINATOR (avec collisions et rebonds)
   */
  simulateFullShot(ball, vx, vy) {
    const simulation = {
      balls: gameState.balls.map(b => ({
        x: b.x,
        y: b.y,
        vx: b === ball ? vx : 0,
        vy: b === ball ? vy : 0,
        radius: b.radius,
        owner: b.owner,
        isActive: b.isActive,
        isRed: b === gameState.redBall,
        original: b
      })),
      score: 0,
      events: []
    };
    
    const holeX = CANVAS_WIDTH / 2;
    const holeY = CANVAS_HEIGHT / 2;
    const holeRadius = gameState.holeSize;
    const friction = 0.985;
    const wallRestitution = 0.88;
    const ballRestitution = 0.9;
    
    // Simuler la physique
    for (let step = 0; step < this.config.maxSimSteps; step++) {
      let hasMovement = false;
      
      // Mettre à jour les positions
      simulation.balls.forEach(simBall => {
        if (!simBall.isActive) return;
        
        // Appliquer la vitesse
        simBall.x += simBall.vx * 0.016;
        simBall.y += simBall.vy * 0.016;
        
        // Appliquer la friction
        simBall.vx *= friction;
        simBall.vy *= friction;
        
        // Vérifier le mouvement
        if (Math.abs(simBall.vx) > 0.5 || Math.abs(simBall.vy) > 0.5) {
          hasMovement = true;
        }
        
        // Collisions avec les murs
        if (simBall.x - simBall.radius < 0) {
          simBall.x = simBall.radius;
          simBall.vx = Math.abs(simBall.vx) * wallRestitution;
        }
        if (simBall.x + simBall.radius > CANVAS_WIDTH) {
          simBall.x = CANVAS_WIDTH - simBall.radius;
          simBall.vx = -Math.abs(simBall.vx) * wallRestitution;
        }
        if (simBall.y - simBall.radius < 0) {
          simBall.y = simBall.radius;
          simBall.vy = Math.abs(simBall.vy) * wallRestitution;
        }
        if (simBall.y + simBall.radius > CANVAS_HEIGHT) {
          simBall.y = CANVAS_HEIGHT - simBall.radius;
          simBall.vy = -Math.abs(simBall.vy) * wallRestitution;
        }
      });
      
      // Collisions entre boules
      for (let i = 0; i < simulation.balls.length; i++) {
        for (let j = i + 1; j < simulation.balls.length; j++) {
          const b1 = simulation.balls[i];
          const b2 = simulation.balls[j];
          
          if (!b1.isActive || !b2.isActive) continue;
          
          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = b1.radius + b2.radius;
          
          if (dist < minDist) {
            // Collision détectée
            const nx = dx / dist;
            const ny = dy / dist;
            
            // Séparer les boules
            const overlap = minDist - dist;
            b1.x -= nx * overlap * 0.5;
            b1.y -= ny * overlap * 0.5;
            b2.x += nx * overlap * 0.5;
            b2.y += ny * overlap * 0.5;
            
            // Calculer les nouvelles vitesses
            const v1n = b1.vx * nx + b1.vy * ny;
            const v2n = b2.vx * nx + b2.vy * ny;
            
            const v1t = -b1.vx * ny + b1.vy * nx;
            const v2t = -b2.vx * ny + b2.vy * nx;
            
            // Échange des vitesses normales
            b1.vx = (v2n * nx - v1t * ny) * ballRestitution;
            b1.vy = (v2n * ny + v1t * nx) * ballRestitution;
            b2.vx = (v1n * nx - v2t * ny) * ballRestitution;
            b2.vy = (v1n * ny + v2t * nx) * ballRestitution;
            
            // Enregistrer l'événement
            if (b1.original === ball && b2.isRed) {
              simulation.events.push({ type: 'hitRed', step });
            } else if (b1.original === ball && b2.owner === 0) {
              simulation.events.push({ type: 'hitEnemy', step });
            }
          }
        }
      }
      
      // Vérifier les boules dans le trou
      simulation.balls.forEach((simBall, idx) => {
        if (!simBall.isActive) return;
        
        const holeDist = distance(simBall.x, simBall.y, holeX, holeY);
        if (holeDist < holeRadius) {
          simBall.isActive = false;
          
          if (simBall.isRed) {
            simulation.events.push({ type: 'redInHole', step });
            simulation.score += 1000; // Victoire !
            
            // Bonus supplémentaire pour les one-shots rapides
            if (step < 50) {
              simulation.score += 2000; // One-shot ultra rapide
            } else if (step < 100) {
              simulation.score += 1000; // One-shot rapide
            } else if (step < 200) {
              simulation.score += 500; // One-shot normal
            }
          } else if (simBall.owner === 0) {
            simulation.events.push({ type: 'enemyInHole', step });
            simulation.score += 400;
          } else if (simBall.owner === 1) {
            simulation.events.push({ type: 'selfInHole', step });
            simulation.score -= 500; // Pénalité
          }
        }
      });
      
      if (!hasMovement) break;
    }
    
    // Calculer le score final basé sur les événements
    let comboMultiplier = 1;
    let hitRedEarly = false;
    
    simulation.events.forEach(event => {
      if (event.type === 'hitRed' && event.step < 50) {
        hitRedEarly = true;
        simulation.score += 200;
      }
      if (event.type === 'hitEnemy') {
        simulation.score += 150 * comboMultiplier;
        comboMultiplier += 0.2;
      }
      if (event.type === 'redInHole' && hitRedEarly) {
        simulation.score += 500; // Bonus combo
      }
    });
    
    // Bonus pour les positions finales stratégiques
    const finalRedBall = simulation.balls.find(b => b.isRed && b.isActive);
    if (finalRedBall) {
      const finalHoleDist = distance(finalRedBall.x, finalRedBall.y, holeX, holeY);
      if (finalHoleDist < 100) {
        simulation.score += 300; // Boule rouge proche du trou
      }
    }
    
    // Stratégie défensive : éloigner la rouge du trou si on ne peut pas gagner
    if (simulation.score < 500 && finalRedBall) {
      // Calculer si la rouge s'est éloignée du trou
      const initialRedDist = distance(gameState.redBall.x, gameState.redBall.y, holeX, holeY);
      const finalRedDist = distance(finalRedBall.x, finalRedBall.y, holeX, holeY);
      
      if (finalRedDist > initialRedDist + 50) {
        simulation.score += 250; // Bonus défensif
      }
    }
    
    // Pénalité si on laisse nos boules trop proches du trou
    const myFinalBalls = simulation.balls.filter(b => b.owner === 1 && b.isActive);
    myFinalBalls.forEach(myBall => {
      const dist = distance(myBall.x, myBall.y, holeX, holeY);
      if (dist < 80) {
        simulation.score -= 100; // Danger !
      }
    });
    
    return simulation;
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
    gameState.aiAiming = null; // Effacer la visée de l'IA
    
    // Message selon le niveau et le score
    if (ball.owner === 0 && this.level === AI_LEVEL.TERMINATOR) {
      // TERMINATOR utilise une boule du joueur pour un coup parfait
      showComboText('🤖 ' + t('aiTactical'));
    } else if (ball.owner === 0) {
      // L'IA utilise une boule du joueur
      showComboText(t('aiUsingPlayerBall'));
    } else if (this.level === AI_LEVEL.TERMINATOR) {
      if (shot.score > 3000) {
        showComboText(t('aiOneShot'));
        // Effet sonore spécial pour les one-shots
        setTimeout(() => sfx.epic(), 100);
        setTimeout(() => sfx.victory(), 300);
      } else if (shot.score > this.config.comboThreshold) {
        showComboText(t('aiQuantum'));
      } else if (shot.score > 500) {
        showComboText(t('aiComplete'));
      }
    } else if (this.level === AI_LEVEL.SMART && shot.score > 300) {
      showComboText(t('aiGoodShot'));
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
