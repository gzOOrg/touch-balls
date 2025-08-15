/**
 * Module SFX - Gestion des effets sonores
 */

class SoundEffects {
  constructor() {
    this.audioContext = null;
    this.lastPlayed = {
      wall: 0,
      ball: 0,
      epic: 0
    };
  }

  /**
   * Initialise le contexte audio
   */
  init() {
    if (!this.audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioContext = new AudioContext();
      }
    }
    return this.audioContext;
  }

  /**
   * Joue un son simple
   */
  playTone(frequency, duration, gain, type = 'sine') {
    const ctx = this.init();
    if (!ctx) return;

    const currentTime = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, currentTime);
    
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(gain, currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + duration);
    
    oscillator.connect(gainNode).connect(ctx.destination);
    oscillator.start(currentTime);
    oscillator.stop(currentTime + duration);
  }

  /**
   * Joue un accord (plusieurs notes)
   */
  playChord(frequencies, duration, gain) {
    frequencies.forEach((freq, index) => {
      setTimeout(() => this.playTone(freq, duration, gain), index * 50);
    });
  }

  /**
   * Son de collision avec le mur
   */
  wall(velocity) {
    const now = Date.now();
    if (!this.init() || now - this.lastPlayed.wall < 30) return;
    
    this.lastPlayed.wall = now;
    const freq = 280 + Math.min(220, velocity * 400);
    const duration = 0.05 + velocity * 0.05;
    const gain = Math.min(0.2, 0.05 + velocity * 0.12);
    
    this.playTone(freq, duration, gain);
  }

  /**
   * Son de collision entre boules
   */
  ball(velocity) {
    const now = Date.now();
    if (!this.init() || now - this.lastPlayed.ball < 20) return;
    
    this.lastPlayed.ball = now;
    const freq = 420 + Math.min(300, velocity * 550);
    const duration = 0.05 + velocity * 0.05;
    const gain = Math.min(0.25, 0.05 + velocity * 0.2);
    
    this.playTone(freq, duration, gain);
  }

  /**
   * Son de chute de la boule rouge
   */
  fallRed() {
    this.playChord([540, 720, 900, 1080], 0.3, 0.25);
  }

  /**
   * Son de chute d'une boule normale
   */
  fall() {
    this.playTone(220, 0.18, 0.2);
    this.playTone(160, 0.22, 0.16);
  }

  /**
   * Son épique (événement spécial)
   */
  epic() {
    const now = Date.now();
    if (now - this.lastPlayed.epic < 1000) return;
    
    this.lastPlayed.epic = now;
    this.playChord([440, 554, 659, 880], 0.5, 0.3);
  }

  /**
   * Son de victoire futuriste néon
   */
  victory() {
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    // Créer un sweep futuriste "wouuuuuuuuaaaaaaaammmmshuuuuuuu"
    const sweep = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    // Configuration du sweep
    sweep.type = 'sawtooth';
    sweep.frequency.setValueAtTime(100, now);
    sweep.frequency.exponentialRampToValueAtTime(2000, now + 0.3);
    sweep.frequency.exponentialRampToValueAtTime(800, now + 0.8);
    sweep.frequency.exponentialRampToValueAtTime(200, now + 1.5);
    
    // Filtre pour l'effet "shuuuu"
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, now);
    filter.frequency.exponentialRampToValueAtTime(5000, now + 0.3);
    filter.frequency.exponentialRampToValueAtTime(1000, now + 1.5);
    filter.Q.value = 15;
    
    // Enveloppe du volume
    sweepGain.gain.setValueAtTime(0, now);
    sweepGain.gain.linearRampToValueAtTime(0.8, now + 0.1);
    sweepGain.gain.linearRampToValueAtTime(0.4, now + 0.8);
    sweepGain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
    
    // Connexions
    sweep.connect(filter);
    filter.connect(sweepGain);
    sweepGain.connect(this.audioContext.destination);
    
    // Démarrer et arrêter
    sweep.start(now);
    sweep.stop(now + 1.6);
    
    // Ajouter des harmoniques néon
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440 * (i + 1), now + 0.2);
      osc.frequency.exponentialRampToValueAtTime(880 * (i + 1), now + 0.8);
      
      gain.gain.setValueAtTime(0, now + 0.2);
      gain.gain.linearRampToValueAtTime(0.2 / (i + 1), now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      osc.start(now + 0.2);
      osc.stop(now + 1.3);
    }
    
    // Impact final
    setTimeout(() => {
      const impact = ctx.createOscillator();
      const impactGain = ctx.createGain();
      const impactFilter = ctx.createBiquadFilter();
      
      impact.type = 'square';
      impact.frequency.value = 60;
      
      impactFilter.type = 'lowpass';
      impactFilter.frequency.value = 200;
      impactFilter.Q.value = 5;
      
      impactGain.gain.setValueAtTime(0.5, ctx.currentTime);
      impactGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      impact.connect(impactFilter);
      impactFilter.connect(impactGain);
      impactGain.connect(this.audioContext.destination);
      
      impact.start(ctx.currentTime);
      impact.stop(ctx.currentTime + 0.3);
    }, 1200);
  }
}

// Export de l'instance unique
export const sfx = new SoundEffects();
