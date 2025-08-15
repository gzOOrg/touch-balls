/**
 * Module de confettis pour célébrer les victoires
 */

class Confetti {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 15;
    this.vy = (Math.random() - 0.5) * 15 - 10;
    this.gravity = 0.5;
    this.color = color;
    this.size = Math.random() * 8 + 5;
    this.angle = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.3;
    this.opacity = 1;
    this.fadeSpeed = 0.01;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.angle += this.rotationSpeed;
    this.opacity -= this.fadeSpeed;
    
    // Rebond sur les bords
    if (this.x < 0 || this.x > window.innerWidth) {
      this.vx *= -0.7;
    }
    
    return this.opacity > 0 && this.y < window.innerHeight;
  }
  
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    
    // Forme de confetti rectangulaire
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size * 0.6);
    
    // Reflet brillant
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(-this.size/2, -this.size/2, this.size * 0.3, this.size * 0.2);
    
    ctx.restore();
  }
}

class ConfettiSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.confettis = [];
    this.isRunning = false;
    this.colors = [
      '#ff0080', '#00ff80', '#80ff00', '#ff8000',
      '#0080ff', '#8000ff', '#ff0040', '#40ff00',
      '#00ffff', '#ffff00', '#ff00ff', '#ffffff'
    ];
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  createBurst(x, y, count = 50) {
    for (let i = 0; i < count; i++) {
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      this.confettis.push(new Confetti(x, y, color));
    }
  }
  
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.confettis = [];
    
    // Créer plusieurs explosions de confettis
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // Explosion centrale
    this.createBurst(centerX, centerY - 100, 100);
    
    // Explosions latérales
    setTimeout(() => {
      this.createBurst(centerX - 200, centerY, 60);
      this.createBurst(centerX + 200, centerY, 60);
    }, 300);
    
    // Explosions supplémentaires
    setTimeout(() => {
      this.createBurst(centerX - 100, centerY - 150, 40);
      this.createBurst(centerX + 100, centerY - 150, 40);
    }, 600);
    
    // Pluie continue de confettis
    let rainCount = 0;
    const rainInterval = setInterval(() => {
      if (rainCount++ > 20 || !this.isRunning) {
        clearInterval(rainInterval);
        return;
      }
      
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * this.canvas.width;
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const confetti = new Confetti(x, -20, color);
        confetti.vy = Math.random() * 5 + 2;
        this.confettis.push(confetti);
      }
    }, 200);
    
    this.animate();
  }
  
  stop() {
    this.isRunning = false;
    this.confettis = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  animate() {
    if (!this.isRunning) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Mettre à jour et dessiner les confettis
    this.confettis = this.confettis.filter(confetti => {
      const alive = confetti.update();
      if (alive) {
        confetti.draw(this.ctx);
      }
      return alive;
    });
    
    // Continuer l'animation s'il reste des confettis
    if (this.confettis.length > 0 || this.isRunning) {
      requestAnimationFrame(() => this.animate());
    }
  }
}

// Exporter le système de confettis
export const confettiSystem = new ConfettiSystem('confettiCanvas');
