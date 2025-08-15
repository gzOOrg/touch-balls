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
    angleStep: 1,       // Angles testés tous les 1° (ULTRA-ULTRA précis)
    powerStep: 0.01,    // 100 niveaux de puissance (précision maximale)
    randomness: 0,      // Aucun aléatoire - Machine parfaite
    thinkingTime: 4000, // Réflexion très approfondie
    accuracy: 1.0,      // Précision parfaite
    maxSimSteps: 2000,  // Simulation extrêmement profonde
    wallBounces: 8,     // Peut calculer jusqu'à 8 rebonds complexes
    comboThreshold: 700,// Score minimum pour un combo
    oneShotBonus: 3000, // Bonus ÉNORME pour les one-shots
    perfectShotRange: 0.98, // Recherche de tirs quasi-parfaits
    deepAnalysis: true, // Analyse profonde des séquences
    adaptiveStrategy: true, // Stratégie adaptative
    multiStepPlanning: 3 // Planification sur 3 coups d'avance
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
    
    // Vérifier que c'est le tour de l'IA (player 2 uniquement)
    if (gameState.currentTurn !== 1) {
      console.log('🤖 IA: Pas mon tour ! Je ne joue qu\'en player 2.');
      return;
    }
    
    this.isThinking = true;
    
    // Message de réflexion selon le niveau
    if (this.level === AI_LEVEL.TERMINATOR) {
      // Séquence dramatique améliorée pour TERMINATOR
      showComboText('💀 TERMINATOR ACTIVÉ');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      showComboText('🧠 ANALYSE QUANTUM...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      showComboText('⚡ CALCUL PROBABILITÉS...');
      await new Promise(resolve => setTimeout(resolve, 700));
      
      showComboText('🎯 OPTIMISATION FATALE...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      showComboText('🔥 EXÉCUTION IMMINENTE...');
    } else {
      showComboText(`${this.config.name} ${t('aiThinking')}`);
    }
    
    // Simuler le temps de réflexion
    await this.think();
    
    // Calculer le meilleur coup avec analyse avancée
    const bestShot = this.level === AI_LEVEL.TERMINATOR ? 
      await this.calculateTerminatorShot() : 
      this.calculateBestShot();
    
    if (bestShot) {
      // Pour TERMINATOR, afficher des infos détaillées
      if (this.level === AI_LEVEL.TERMINATOR) {
        console.log('💀 TERMINATOR - ANALYSE COMPLÈTE:', {
          angle: Math.round(bestShot.angle * 180 / Math.PI) + '°',
          power: Math.round(bestShot.power * 100) + '%',
          score: Math.round(bestShot.score),
          stratégie: bestShot.strategy || 'DESTRUCTION',
          probabilité: bestShot.score > 3000 ? '99.9%' : 
                      bestShot.score > 2000 ? '95%' : 
                      bestShot.score > 1000 ? '80%' : '60%',
          type: bestShot.type || 'TERMINATOR_SHOT'
        });
        
        // Messages spéciaux selon le score
        if (bestShot.score > 4000) {
          showComboText('🎯 TIR PARFAIT CALCULÉ');
        } else if (bestShot.score > 3000) {
          showComboText('⚡ ONE-SHOT GARANTI');  
        } else if (bestShot.score > 2000) {
          showComboText('🔥 COUP DÉVASTATEUR');
        }
      }
      
      // TERMINATOR n'a jamais d'imprécision
      const finalShot = this.addInaccuracy(bestShot);
      
      // Afficher la visée avec effet dramatique pour TERMINATOR
      gameState.aiAiming = {
        ball: finalShot.ball,
        angle: finalShot.angle,
        power: finalShot.power
      };
      
      // Temps d'affichage de la visée
      const aimDisplayTime = this.level === AI_LEVEL.TERMINATOR ? 600 : 
                           this.level === AI_LEVEL.SMART ? 1200 : 
                           1500;
      
      if (this.level === AI_LEVEL.TERMINATOR) {
        showComboText('🎯 ACQUISITION CIBLE...');
      }
      
      await new Promise(resolve => setTimeout(resolve, aimDisplayTime));
      
      // Message final pour TERMINATOR
      if (this.level === AI_LEVEL.TERMINATOR) {
        showComboText('💥 ÉLIMINATION !');
      }
      
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
   * Calcule le meilleur coup avec l'algorithme TERMINATOR ultra-avancé
   */
  async calculateTerminatorShot() {
    console.log('💀 TERMINATOR: Lancement de l\'analyse quantique...');
    
    // Analyse de la situation actuelle
    const gameAnalysis = this.analyzeGameSituation();
    console.log('🧠 TERMINATOR: Situation détectée -', gameAnalysis.type, 'Urgence:', gameAnalysis.urgency);
    
    // Vérifier que c'est bien le tour de l'IA (player 2)
    if (gameState.currentTurn !== 1) {
      console.log('💀 TERMINATOR: Ce n\'est pas mon tour ! Je suis player 2 uniquement.');
      return null;
    }
    
    // Phase 1: Analyse immédiate des one-shots parfaits
    // TERMINATOR ne joue qu'avec SES balles (player 2 = owner 1)
    const playableBalls = gameState.balls.filter(b => b.isActive && b !== gameState.redBall && b.owner === 1);
    console.log(`💀 TERMINATOR: Player 2 - balles disponibles:`, playableBalls.length);
    
    if (!playableBalls.length) {
      console.log('💀 TERMINATOR: Aucune balle disponible - Situation critique');
      return null;
    }
    
    // Phase Prioritaire: Adaptation stratégique selon la situation
    const situationalShot = this.adaptStrategyToSituation(gameAnalysis, playableBalls);
    if (situationalShot && situationalShot.score > 2000) {
      console.log('🎯 TERMINATOR: Stratégie situationnelle appliquée avec succès');
      return situationalShot;
    }
    
    // Phase 2: Recherche exhaustive de one-shots avec précision extrême
    const perfectOneShot = await this.findUltimatePerfectShot(playableBalls);
    if (perfectOneShot && perfectOneShot.score > 4000) {
      console.log('🎯 TERMINATOR: One-shot PARFAIT détecté avec certitude absolue');
      return perfectOneShot;
    }
    
    // Phase 3: Planification multi-étapes avec simulation profonde
    const multiStepPlan = this.calculateMultiStepStrategy(playableBalls);
    if (multiStepPlan && multiStepPlan.score > 3500) {
      console.log('🧠 TERMINATOR: Stratégie multi-étapes optimale calculée');
      return multiStepPlan;
    }
    
    // Phase 4: Analyse des combos complexes avec rebonds multiples
    const complexCombo = this.findComplexComboShot(playableBalls);
    if (complexCombo && complexCombo.score > 3000) {
      console.log('⚡ TERMINATOR: Combo complexe identifié');
      return complexCombo;
    }
    
    // Phase 5: Si rien d'extraordinaire, utiliser l'algorithme standard amélioré
    return this.calculateBestShot();
  }

  /**
   * Calcule le meilleur coup possible (algorithme standard)
   */
  calculateBestShot() {
    // Vérifier que c'est le tour de l'IA (player 2 uniquement)
    if (gameState.currentTurn !== 1) {
      console.log('🤖 IA: Ce n\'est pas mon tour ! Je suis player 2 uniquement.');
      return null;
    }
    
    // L'IA utilise SEULEMENT ses propres balles (player 2 = owner 1)
    const playableBalls = gameState.balls.filter(b => b.isActive && b !== gameState.redBall && b.owner === 1);
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
          // Vérifier rapidement si ce tir causerait un suicide
          const testAngle = angle * Math.PI / 180;
          const vx = Math.cos(testAngle) * power * POWER_MULTIPLIER * 100;
          const vy = Math.sin(testAngle) * power * POWER_MULTIPLIER * 100;
          
          const quickSim = this.simulateFullShot(ball, vx, vy);
          const selfKill = quickSim.events.find(e => e.type === 'selfInHole');
          
          if (selfKill) {
            continue; // Ignorer ce tir suicidaire
          }
          
          const score = this.evaluateShot(ball, testAngle, power);
          shotsEvaluated++;
          
          if (score > bestScore) {
            bestScore = score;
            bestShot = {
              ball,
              angle: testAngle,
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
      // Vérifier si le trou est entre la boule et la rouge
      const holeBetweenBalls = this.isHoleBetweenBalls(ball, redBall, holeX, holeY);
      
      if (!holeBetweenBalls) {
        // 1. Tir direct sur la rouge (pas de trou entre les deux)
        const toRedAngle = Math.atan2(redBall.y - ball.y, redBall.x - ball.x);
        const redToHoleAngle = Math.atan2(holeY - redBall.y, holeX - redBall.x);
        let angleDiff = Math.abs(toRedAngle - redToHoleAngle);
        // Normaliser l'angle entre 0 et PI
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
        
        if (angleDiff < Math.PI / 3) { // Alignement plus large (60 degrés)
          // Tester plusieurs puissances pour un one-shot direct
          for (let power = 0.4; power <= 1; power += 0.05) {
            const vx = Math.cos(toRedAngle) * power * POWER_MULTIPLIER * 100;
            const vy = Math.sin(toRedAngle) * power * POWER_MULTIPLIER * 100;
            
            const simResult = this.simulateFullShot(ball, vx, vy);
            
            // Vérifier si c'est un one-shot
            const redInHoleEvent = simResult.events.find(e => e.type === 'redInHole');
            if (redInHoleEvent && redInHoleEvent.step < 250) {
              const shotScore = simResult.score + this.config.oneShotBonus;
              if (shotScore > bestOneShotScore) {
                bestOneShotScore = shotScore;
                bestOneShot = {
                  ball,
                  angle: toRedAngle,
                  power,
                  score: shotScore,
                  type: 'direct'
                };
              }
            }
          }
        }
      }
      
      // 2. Tirs avec rebonds calculés (pour contourner le trou)
      // Tester des angles variés pour des rebonds
      for (let angle = 0; angle < 360; angle += 10) { // Plus précis
        const testAngle = angle * Math.PI / 180;
        
        // Simuler pour voir si on peut toucher la rouge après rebond
        for (let power = 0.6; power <= 1; power += 0.08) {
          const vx = Math.cos(testAngle) * power * POWER_MULTIPLIER * 100;
          const vy = Math.sin(testAngle) * power * POWER_MULTIPLIER * 100;
          
          const simResult = this.simulateFullShot(ball, vx, vy);
          
          // Vérifier si on touche la rouge et qu'elle tombe dans le trou
          const hitRedEvent = simResult.events.find(e => e.type === 'hitRed');
          const redInHoleEvent = simResult.events.find(e => e.type === 'redInHole');
          
          if (hitRedEvent && redInHoleEvent && redInHoleEvent.step < 400) {
            const shotScore = simResult.score + this.config.oneShotBonus / 2; // Moins de bonus pour les rebonds
            if (shotScore > bestOneShotScore) {
              bestOneShotScore = shotScore;
              bestOneShot = {
                ball,
                angle: testAngle,
                power,
                score: shotScore,
                type: 'rebond'
              };
            }
          }
        }
      }
      
      // 3. Si le trou est entre les deux, chercher des tirs tactiques
      if (holeBetweenBalls) {
        // Chercher des tirs qui déplacent la rouge vers une meilleure position
        for (let angle = 0; angle < 360; angle += 20) {
          const testAngle = angle * Math.PI / 180;
          
          for (let power = 0.4; power <= 0.8; power += 0.1) {
            const vx = Math.cos(testAngle) * power * POWER_MULTIPLIER * 100;
            const vy = Math.sin(testAngle) * power * POWER_MULTIPLIER * 100;
            
            const simResult = this.simulateFullShot(ball, vx, vy);
            
            // Bonus pour déplacer la rouge vers une meilleure position
            if (simResult.events.some(e => e.type === 'hitRed')) {
              const shotScore = simResult.score + 200; // Bonus pour déplacer la rouge
              if (shotScore > bestOneShotScore) {
                bestOneShotScore = shotScore;
                bestOneShot = {
                  ball,
                  angle: testAngle,
                  power,
                  score: shotScore,
                  type: 'tactique'
                };
              }
            }
          }
        }
      }
    }
    
    // Ne retourner que si on a trouvé un très bon one-shot
    if (bestOneShot && bestOneShotScore > 2000) {
      console.log(`💀 TERMINATOR: One-shot ${bestOneShot.type} calculé avec score:`, Math.round(bestOneShotScore));
      return bestOneShot;
    }
    
    return null;
  }
  
  /**
   * Vérifie si le trou est entre deux boules
   */
  isHoleBetweenBalls(ball1, ball2, holeX, holeY) {
    // Distance entre les deux boules
    const ballDistance = distance(ball1.x, ball1.y, ball2.x, ball2.y);
    
    // Distance de la boule 1 au trou
    const dist1ToHole = distance(ball1.x, ball1.y, holeX, holeY);
    
    // Distance de la boule 2 au trou
    const dist2ToHole = distance(ball2.x, ball2.y, holeX, holeY);
    
    // Si le trou est plus proche des deux boules que la distance entre elles
    // ET que la somme des distances au trou est proche de la distance entre boules
    const totalDistToHole = dist1ToHole + dist2ToHole;
    const tolerance = ballDistance * 0.3; // Tolérance de 30%
    
    return Math.abs(totalDistToHole - ballDistance) < tolerance;
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
        
        // Vérifier si le trou est entre les deux boules
        const holeBetweenBalls = this.isHoleBetweenBalls(ball, redBall, holeX, holeY);
        
        if (!holeBetweenBalls) {
          // Pas de trou entre les deux - possibilité de tir direct
          const holeDirection = normalize(holeX - redBall.x, holeY - redBall.y);
          const redPushAlignment = dotProduct(redDirection, holeDirection);
          
          if (redPushAlignment > 0.5) {
            score += 800; // Énorme bonus pour un one-shot direct possible
          } else if (redPushAlignment > 0.3) {
            score += 400; // Bonus pour un one-shot difficile
          }
        } else {
          // Trou entre les deux - pénalité mais possibilité de rebond
          score -= 200;
          
          // Bonus pour les positions qui permettent des rebonds
          if (redDist < 150) score += 100; // Proche = rebond plus facile
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
            simulation.score -= 10000; // PÉNALITÉ MASSIVE - Interdit !
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
   * Recherche exhaustive de one-shots parfaits pour TERMINATOR
   */
  async findUltimatePerfectShot(playableBalls) {
    const redBall = gameState.redBall;
    if (!redBall || !redBall.isActive) return null;
    
    let bestShot = null;
    let bestScore = 0;
    let shotsAnalyzed = 0;
    
    console.log('🔍 TERMINATOR: Analyse exhaustive de', playableBalls.length, 'boules...');
    
    for (const ball of playableBalls) {
      // Analyse ultra-précise avec 0.5° d'incrémentation
      for (let angle = 0; angle < 360; angle += 0.5) {
        // Puissances ultra-précises
        for (let power = 0.1; power <= 1; power += 0.005) {
          const testAngle = angle * Math.PI / 180;
          const vx = Math.cos(testAngle) * power * POWER_MULTIPLIER * 100;
          const vy = Math.sin(testAngle) * power * POWER_MULTIPLIER * 100;
          
          const simulation = this.simulateFullShot(ball, vx, vy);
          shotsAnalyzed++;
          
          // VÉRIFICATION ANTI-SUICIDE : Rejeter si mes balles tombent
          const selfKill = simulation.events.find(e => e.type === 'selfInHole');
          if (selfKill) {
            if (shotsAnalyzed % 1000 === 0) {
              console.log('🛡️ TERMINATOR: Suicide évité - recherche alternative...');
            }
            continue; // Passer au tir suivant
          }
          
          // Recherche spécifique de one-shots ultra-rapides
          const redInHoleEvent = simulation.events.find(e => e.type === 'redInHole');
          if (redInHoleEvent) {
            let score = simulation.score;
            
            // Bonus massifs pour rapidité d'exécution
            if (redInHoleEvent.step < 30) {
              score += 5000; // One-shot INSTANTANÉ
            } else if (redInHoleEvent.step < 60) {
              score += 4000; // One-shot ultra-rapide
            } else if (redInHoleEvent.step < 100) {
              score += 3000; // One-shot rapide
            }
            
            // Bonus pour tirs directs sans rebonds excessifs
            const bounceEvents = simulation.events.filter(e => e.type === 'wallBounce');
            if (bounceEvents.length === 0) {
              score += 2000; // Tir direct parfait
            } else if (bounceEvents.length <= 2) {
              score += 1000; // Tir avec rebonds contrôlés
            }
            
            if (score > bestScore) {
              bestScore = score;
              bestShot = {
                ball,
                angle: testAngle,
                power,
                score,
                strategy: 'ULTIMATE_ONESHOT',
                type: 'perfect'
              };
            }
          }
        }
      }
    }
    
    console.log(`💀 TERMINATOR: ${shotsAnalyzed} tirs analysés, meilleur one-shot: ${Math.round(bestScore)}`);
    return bestShot;
  }
  
  /**
   * Calcule une stratégie multi-étapes
   */
  calculateMultiStepStrategy(playableBalls) {
    // Analyser les positions après notre coup pour préparer le coup suivant
    let bestStrategy = null;
    let bestScore = 0;
    
    for (const ball of playableBalls) {
      for (let angle = 0; angle < 360; angle += 5) {
        for (let power = 0.3; power <= 1; power += 0.1) {
          const testAngle = angle * Math.PI / 180;
          const vx = Math.cos(testAngle) * power * POWER_MULTIPLIER * 100;
          const vy = Math.sin(testAngle) * power * POWER_MULTIPLIER * 100;
          
          const firstStepSim = this.simulateFullShot(ball, vx, vy);
          
          // Simuler l'état après notre coup
          const futureState = this.predictFutureGameState(firstStepSim);
          
          // Évaluer les possibilités de coup suivant
          const nextShotPotential = this.evaluateNextShotPotential(futureState);
          
          const totalScore = firstStepSim.score + nextShotPotential;
          
          if (totalScore > bestScore) {
            bestScore = totalScore;
            bestStrategy = {
              ball,
              angle: testAngle,
              power,
              score: totalScore,
              strategy: 'MULTI_STEP_DOMINATION',
              type: 'strategic'
            };
          }
        }
      }
    }
    
    return bestStrategy;
  }
  
  /**
   * Trouve des combos complexes avec rebonds multiples
   */
  findComplexComboShot(playableBalls) {
    let bestCombo = null;
    let bestScore = 0;
    
    for (const ball of playableBalls) {
      // Chercher des angles qui permettent des rebonds créatifs
      for (let angle = 0; angle < 360; angle += 3) {
        for (let power = 0.5; power <= 1; power += 0.05) {
          const testAngle = angle * Math.PI / 180;
          const vx = Math.cos(testAngle) * power * POWER_MULTIPLIER * 100;
          const vy = Math.sin(testAngle) * power * POWER_MULTIPLIER * 100;
          
          const simulation = this.simulateFullShot(ball, vx, vy);
          
          // Chercher des combos spéciaux
          let comboScore = simulation.score;
          
          // Bonus pour toucher plusieurs boules ennemies
          const enemyHits = simulation.events.filter(e => e.type === 'hitEnemy').length;
          if (enemyHits >= 2) {
            comboScore += 1500 * enemyHits; // Super combo !
          }
          
          // Bonus pour séquences complexes
          const redHit = simulation.events.find(e => e.type === 'hitRed');
          const redInHole = simulation.events.find(e => e.type === 'redInHole');
          
          if (redHit && redInHole && enemyHits > 0) {
            comboScore += 2000; // Combo ultime
          }
          
          if (comboScore > bestScore) {
            bestScore = comboScore;
            bestCombo = {
              ball,
              angle: testAngle,
              power,
              score: comboScore,
              strategy: 'COMPLEX_COMBO_DEVASTATION',
              type: 'combo'
            };
          }
        }
      }
    }
    
    return bestCombo;
  }
  
  /**
   * Prédit l'état du jeu après un coup
   */
  predictFutureGameState(simulation) {
    // Retourner les positions finales des boules après le coup simulé
    return simulation.balls.filter(b => b.isActive);
  }
  
  /**
   * Évalue le potentiel du coup suivant
   */
  evaluateNextShotPotential(futureState) {
    const redBall = futureState.find(b => b.isRed);
    if (!redBall) return 0; // La rouge est déjà tombée
    
    const holeX = CANVAS_WIDTH / 2;
    const holeY = CANVAS_HEIGHT / 2;
    const redToHoleDist = distance(redBall.x, redBall.y, holeX, holeY);
    
    // Plus la rouge est proche du trou, meilleur c'est pour le coup suivant
    let potential = Math.max(0, 500 - redToHoleDist);
    
    // Bonus si nos boules sont bien positionnées pour le coup suivant
    const myBalls = futureState.filter(b => !b.isRed && b.owner === 1);
    for (const ball of myBalls) {
      const ballToRedDist = distance(ball.x, ball.y, redBall.x, redBall.y);
      if (ballToRedDist < 200) {
        potential += 200; // Nos boules sont proches de la rouge
      }
    }
    
    return potential;
  }
  
  /**
   * Analyse COMPLÈTE de la situation de jeu - TERMINATOR s'adapte à TOUT
   */
  analyzeGameSituation() {
    const redBall = gameState.redBall;
    const holeX = CANVAS_WIDTH / 2;
    const holeY = CANVAS_HEIGHT / 2;
    
    // Mes balles (IA = player 2 = owner 1)
    const myBalls = gameState.balls.filter(b => b.isActive && b.owner === 1);
    const enemyBalls = gameState.balls.filter(b => b.isActive && b.owner === 0);
    
    let analysis = {
      type: 'STANDARD',
      urgency: 'NORMALE',
      strategy: 'BALANCED',
      factors: []
    };
    
    // Situation 1: CRITIQUE - Rouge très proche du trou
    if (redBall && redBall.isActive) {
      const redToHoleDist = distance(redBall.x, redBall.y, holeX, holeY);
      
      if (redToHoleDist < 50) {
        analysis.type = 'ROUGE_CRITIQUE';
        analysis.urgency = 'EXTRÊME';
        analysis.strategy = 'ONE_SHOT_ONLY';
        analysis.factors.push('Rouge à moins de 50px du trou');
      } else if (redToHoleDist < 100) {
        analysis.type = 'ROUGE_DANGEREUSE';
        analysis.urgency = 'ÉLEVÉE';
        analysis.strategy = 'PRIORITÉ_ONE_SHOT';
        analysis.factors.push('Rouge proche du trou');
      }
    }
    
    // Situation 2: DÉSAVANTAGE - Moins de balles que l'adversaire
    if (myBalls.length < enemyBalls.length) {
      analysis.type = 'DÉSAVANTAGE_NUMÉRIQUE';
      analysis.urgency = 'ÉLEVÉE';
      analysis.strategy = 'AGGRESSIVE_PRECISION';
      analysis.factors.push(`${myBalls.length} vs ${enemyBalls.length} balles`);
    }
    
    // Situation 3: AVANTAGE - Plus de balles que l'adversaire
    if (myBalls.length > enemyBalls.length) {
      analysis.type = 'AVANTAGE_NUMÉRIQUE';
      analysis.urgency = 'FAIBLE';
      analysis.strategy = 'CONTROL_GAME';
      analysis.factors.push('Supériorité numérique');
    }
    
    // Situation 4: DERNIÈRE BALLE - Une seule balle restante
    if (myBalls.length === 1) {
      analysis.type = 'DERNIÈRE_CHANCE';
      analysis.urgency = 'MAXIMALE';
      analysis.strategy = 'PERFECTION_ABSOLUE';
      analysis.factors.push('Dernière balle disponible');
    }
    
    // Situation 5: MES BALLES EN DANGER - Proches du trou
    const dangerousBalls = myBalls.filter(ball => {
      const distToHole = distance(ball.x, ball.y, holeX, holeY);
      return distToHole < 80;
    });
    
    if (dangerousBalls.length > 0) {
      analysis.type = 'MES_BALLES_EN_DANGER';
      analysis.urgency = 'ÉLEVÉE';
      analysis.strategy = 'SAUVETAGE_PRUDENT';
      analysis.factors.push(`${dangerousBalls.length} balles en danger`);
    }
    
    // Situation 6: BALLES ENNEMIES FAVORABLES - Bien positionnées pour nous aider
    const helpfulEnemyBalls = enemyBalls.filter(enemy => {
      if (!redBall) return false;
      
      // Vérifier si l'ennemi peut nous aider à toucher la rouge
      const enemyToRed = distance(enemy.x, enemy.y, redBall.x, redBall.y);
      const redToHole = distance(redBall.x, redBall.y, holeX, holeY);
      
      return enemyToRed < 150 && redToHole > 100;
    });
    
    if (helpfulEnemyBalls.length > 0) {
      analysis.factors.push('Balles ennemies exploitables');
    }
    
    // Situation 7: GÉOMÉTRIE PARFAITE - Alignements favorables
    if (redBall && redBall.isActive) {
      let perfectAlignments = 0;
      
      myBalls.forEach(ball => {
        const ballToRed = distance(ball.x, ball.y, redBall.x, redBall.y);
        const redToHoleAngle = Math.atan2(holeY - redBall.y, holeX - redBall.x);
        const ballToRedAngle = Math.atan2(redBall.y - ball.y, redBall.x - ball.x);
        
        let angleDiff = Math.abs(ballToRedAngle - redToHoleAngle);
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
        
        if (ballToRed < 200 && angleDiff < Math.PI / 6) {
          perfectAlignments++;
        }
      });
      
      if (perfectAlignments > 0) {
        analysis.type = 'GÉOMÉTRIE_PARFAITE';
        analysis.strategy = 'EXPLOIT_GEOMETRY';
        analysis.factors.push(`${perfectAlignments} alignements parfaits`);
      }
    }
    
    // Situation 8: DÉBUT DE PARTIE - Toutes les balles présentes
    if (myBalls.length === 2 && enemyBalls.length === 2) {
      analysis.type = 'DÉBUT_PARTIE';
      analysis.strategy = 'OPENING_ADVANTAGE';
      analysis.factors.push('Début de partie - toutes options ouvertes');
    }
    
    // Situation 9: FIN DE PARTIE - Peu de balles restantes
    const totalBalls = myBalls.length + enemyBalls.length;
    if (totalBalls <= 2) {
      analysis.type = 'FIN_PARTIE';
      analysis.urgency = 'MAXIMALE';
      analysis.strategy = 'ENDGAME_PRECISION';
      analysis.factors.push('Fin de partie critique');
    }
    
    return analysis;
  }
  
  /**
   * Adapte la stratégie selon l'analyse de situation
   */
  adaptStrategyToSituation(analysis, playableBalls) {
    console.log('🎯 TERMINATOR: Adaptation stratégique -', analysis.strategy);
    
    switch (analysis.strategy) {
      case 'ONE_SHOT_ONLY':
        // Mode panique - ne chercher QUE des one-shots
        return this.findEmergencyOneShot(playableBalls);
        
      case 'AGGRESSIVE_PRECISION':
        // Mode agressif - prendre des risques calculés
        return this.findAggressivePrecisionShot(playableBalls);
        
      case 'CONTROL_GAME':
        // Mode contrôle - placer les balles stratégiquement
        return this.findControlShot(playableBalls);
        
      case 'PERFECTION_ABSOLUE':
        // Mode perfection - dernière chance
        return this.findPerfectionShot(playableBalls);
        
      case 'SAUVETAGE_PRUDENT':
        // Mode défensif - sauver nos balles
        return this.findDefensiveShot(playableBalls);
        
      case 'EXPLOIT_GEOMETRY':
        // Mode géométrique - exploiter les alignements
        return this.findGeometryShot(playableBalls);
        
      case 'OPENING_ADVANTAGE':
        // Mode ouverture - prendre l'avantage initial
        return this.findOpeningShot(playableBalls);
        
      case 'ENDGAME_PRECISION':
        // Mode fin de partie - précision maximale
        return this.findEndgameShot(playableBalls);
        
      default:
        return null;
    }
  }
  
  /**
   * Shot d'urgence - One-shot obligatoire
   */
  findEmergencyOneShot(playableBalls) {
    console.log('🚨 TERMINATOR: MODE URGENCE - Recherche one-shot désespéré');
    
    // Analyse ultra-précise avec 0.1° d'incrémentation
    for (const ball of playableBalls) {
      for (let angle = 0; angle < 360; angle += 0.1) {
        for (let power = 0.1; power <= 1; power += 0.002) {
          const testAngle = angle * Math.PI / 180;
          const vx = Math.cos(testAngle) * power * POWER_MULTIPLIER * 100;
          const vy = Math.sin(testAngle) * power * POWER_MULTIPLIER * 100;
          
          const simulation = this.simulateFullShot(ball, vx, vy);
          
          // VÉRIFICATION ANTI-SUICIDE : Rejeter si mes balles tombent
          const selfKill = simulation.events.find(e => e.type === 'selfInHole');
          if (selfKill) {
            continue; // Passer au tir suivant
          }
          
          const redInHole = simulation.events.find(e => e.type === 'redInHole');
          
          if (redInHole && redInHole.step < 200) {
            return {
              ball,
              angle: testAngle,
              power,
              score: 10000, // Score maximum pour sauver la partie
              strategy: 'EMERGENCY_ONESHOT',
              type: 'emergency'
            };
          }
        }
      }
    }
    
    return null;
  }
  
  /**
   * Shot de précision agressive
   */
  findAggressivePrecisionShot(playableBalls) {
    console.log('⚡ TERMINATOR: MODE AGRESSIF - Précision extrême');
    
    let bestShot = null;
    let bestScore = 0;
    
    for (const ball of playableBalls) {
      for (let angle = 0; angle < 360; angle += 0.5) {
        for (let power = 0.7; power <= 1; power += 0.01) { // Puissance élevée
          const testAngle = angle * Math.PI / 180;
          const vx = Math.cos(testAngle) * power * POWER_MULTIPLIER * 100;
          const vy = Math.sin(testAngle) * power * POWER_MULTIPLIER * 100;
          
          const simulation = this.simulateFullShot(ball, vx, vy);
          
          // VÉRIFICATION ANTI-SUICIDE : Rejeter si mes balles tombent
          const selfKill = simulation.events.find(e => e.type === 'selfInHole');
          if (selfKill) {
            continue; // Passer au tir suivant
          }
          
          let score = simulation.score;
          
          // Bonus pour tirs agressifs
          if (simulation.events.find(e => e.type === 'redInHole')) {
            score += 3000;
          }
          if (simulation.events.filter(e => e.type === 'hitEnemy').length > 0) {
            score += 1000; // Bonus pour perturber l'ennemi
          }
          
          if (score > bestScore) {
            bestScore = score;
            bestShot = {
              ball,
              angle: testAngle,
              power,
              score,
              strategy: 'AGGRESSIVE_PRECISION',
              type: 'aggressive'
            };
          }
        }
      }
    }
    
    return bestShot;
  }
  
  /**
   * Shot de contrôle défensif
   */
  findDefensiveShot(playableBalls) {
    console.log('🛡️ TERMINATOR: MODE DÉFENSIF - Protection et contrôle');
    
    const holeX = CANVAS_WIDTH / 2;
    const holeY = CANVAS_HEIGHT / 2;
    let bestShot = null;
    let bestScore = 0;
    
    for (const ball of playableBalls) {
      for (let angle = 0; angle < 360; angle += 2) {
        for (let power = 0.3; power <= 0.8; power += 0.05) { // Puissance modérée
          const testAngle = angle * Math.PI / 180;
          const vx = Math.cos(testAngle) * power * POWER_MULTIPLIER * 100;
          const vy = Math.sin(testAngle) * power * POWER_MULTIPLIER * 100;
          
          const simulation = this.simulateFullShot(ball, vx, vy);
          
          // VÉRIFICATION ANTI-SUICIDE : Rejeter si mes balles tombent
          const selfKill = simulation.events.find(e => e.type === 'selfInHole');
          if (selfKill) {
            continue; // Passer au tir suivant
          }
          
          let score = simulation.score;
          
          // Bonus pour éloigner nos balles du trou
          const finalMyBalls = simulation.balls.filter(b => b.owner === 1 && b.isActive);
          finalMyBalls.forEach(myBall => {
            const distToHole = distance(myBall.x, myBall.y, holeX, holeY);
            if (distToHole > 150) {
              score += 500; // Bonus sécurité
            }
          });
          
          // Bonus pour éloigner la rouge si on ne peut pas la mettre
          const finalRed = simulation.balls.find(b => b.isRed && b.isActive);
          if (finalRed) {
            const initialRedDist = distance(gameState.redBall.x, gameState.redBall.y, holeX, holeY);
            const finalRedDist = distance(finalRed.x, finalRed.y, holeX, holeY);
            
            if (finalRedDist > initialRedDist + 50) {
              score += 800; // Gros bonus défensif
            }
          }
          
          if (score > bestScore) {
            bestScore = score;
            bestShot = {
              ball,
              angle: testAngle,
              power,
              score,
              strategy: 'DEFENSIVE_CONTROL',
              type: 'defensive'
            };
          }
        }
      }
    }
    
    return bestShot;
  }
  
  /**
   * Shot de perfection absolue (dernière chance)
   */
  findPerfectionShot(playableBalls) {
    console.log('💎 TERMINATOR: MODE PERFECTION - Dernière chance');
    
    // Analyse avec précision MAXIMALE
    for (const ball of playableBalls) {
      for (let angle = 0; angle < 360; angle += 0.05) { // Ultra précis
        for (let power = 0.05; power <= 1; power += 0.001) { // Toutes les puissances
          const testAngle = angle * Math.PI / 180;
          const vx = Math.cos(testAngle) * power * POWER_MULTIPLIER * 100;
          const vy = Math.sin(testAngle) * power * POWER_MULTIPLIER * 100;
          
          const simulation = this.simulateFullShot(ball, vx, vy);
          
          // VÉRIFICATION ANTI-SUICIDE : Rejeter si mes balles tombent
          const selfKill = simulation.events.find(e => e.type === 'selfInHole');
          if (selfKill) {
            continue; // Passer au tir suivant
          }
          
          const redInHole = simulation.events.find(e => e.type === 'redInHole');
          
          if (redInHole) {
            return {
              ball,
              angle: testAngle,
              power,
              score: 15000, // Score ultime
              strategy: 'ABSOLUTE_PERFECTION',
              type: 'perfection'
            };
          }
        }
      }
    }
    
    return null;
  }
  
  /**
   * Shots pour les autres stratégies
   */
  findControlShot(playableBalls) { return this.findDefensiveShot(playableBalls); }
  findGeometryShot(playableBalls) { return this.findAggressivePrecisionShot(playableBalls); }
  findOpeningShot(playableBalls) { return this.findAggressivePrecisionShot(playableBalls); }
  findEndgameShot(playableBalls) { return this.findPerfectionShot(playableBalls); }
  
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
    
    // Messages spécialisés selon la stratégie TERMINATOR
    if (this.level === AI_LEVEL.TERMINATOR) {
      // Messages selon la stratégie utilisée
      switch (shot.strategy) {
        case 'EMERGENCY_ONESHOT':
          showComboText('🚨 SAUVETAGE CRITIQUE!');
          setTimeout(() => sfx.epic(), 100);
          break;
        case 'ABSOLUTE_PERFECTION':
          showComboText('💎 PERFECTION ABSOLUE!');
          setTimeout(() => sfx.victory(), 100);
          setTimeout(() => sfx.epic(), 300);
          break;
        case 'AGGRESSIVE_PRECISION':
          showComboText('⚡ DESTRUCTION CALCULÉE!');
          setTimeout(() => sfx.epic(), 100);
          break;
        case 'DEFENSIVE_CONTROL':
          showComboText('🛡️ CONTRÔLE TOTAL!');
          break;
        case 'ULTIMATE_ONESHOT':
          showComboText('🎯 ONE-SHOT ULTIME!');
          setTimeout(() => sfx.epic(), 100);
          setTimeout(() => sfx.victory(), 300);
          break;
        default:
          if (shot.score > 5000) {
            showComboText('💀 TERMINATION!');
            setTimeout(() => sfx.epic(), 100);
            setTimeout(() => sfx.victory(), 300);
          } else if (shot.score > 3000) {
            showComboText('🎯 ÉLIMINATION PRÉCISE!');
            setTimeout(() => sfx.epic(), 100);
          } else if (shot.score > 1000) {
            showComboText('⚡ CALCUL PARFAIT!');
          } else {
            showComboText('🤖 EXÉCUTION TERMINÉE!');
          }
      }
    } else if (this.level === AI_LEVEL.SMART && shot.score > 300) {
      showComboText(t('aiGoodShot'));
    } else if (this.level === AI_LEVEL.DUMB) {
      showComboText(t('aiThinking'));
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
