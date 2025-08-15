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
   * Son de victoire épique
   */
  victory() {
    // Fanfare de victoire en plusieurs accords
    setTimeout(() => this.playChord([523, 659, 784, 1047], 0.8, 0.4), 0);
    setTimeout(() => this.playChord([659, 784, 988, 1319], 0.8, 0.4), 400);
    setTimeout(() => this.playChord([784, 988, 1175, 1568], 0.9, 0.5), 800);
    setTimeout(() => this.playChord([523, 784, 1047, 1568], 1.0, 0.8), 1200);
    
    // Notes individuelles pour la mélodie
    setTimeout(() => this.playTone(1047, 0.5, 0.15), 1600);
    setTimeout(() => this.playTone(1319, 0.5, 0.15), 1750);
    setTimeout(() => this.playTone(1568, 0.5, 0.15), 1900);
    setTimeout(() => this.playTone(2093, 0.8, 0.6), 2050);
  }
}

// Export de l'instance unique
export const sfx = new SoundEffects();
