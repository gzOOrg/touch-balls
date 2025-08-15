/**
 * JavaScript pour le site Epic Billiards
 */

// Smooth scrolling pour les liens d'ancrage
document.addEventListener('DOMContentLoaded', function() {
  // Navigation mobile toggle (si on ajoute un menu burger plus tard)
  setupNavigation();
  
  // Animations au scroll
  setupScrollAnimations();
  
  // Navbar sticky behavior
  setupNavbar();
  
  // Parallax effects
  setupParallax();
});

/**
 * Configuration de la navigation
 */
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Si c'est un lien d'ancrage
      if (href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        scrollToSection(targetId);
        
        // Mettre à jour les liens actifs
        updateActiveNavLink(this);
      }
    });
  });
}

/**
 * Scroll vers une section
 */
function scrollToSection(sectionId) {
  const target = document.getElementById(sectionId);
  if (target) {
    const navbarHeight = document.querySelector('.navbar').offsetHeight;
    const targetPosition = target.offsetTop - navbarHeight - 20;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
}

/**
 * Met à jour le lien de navigation actif
 */
function updateActiveNavLink(activeLink) {
  // Retirer la classe active de tous les liens
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Ajouter la classe active au lien cliqué
  activeLink.classList.add('active');
}

/**
 * Configuration de la navbar sticky
 */
function setupNavbar() {
  const navbar = document.querySelector('.navbar');
  let lastScrollY = window.scrollY;
  
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    // Navbar background opacity based on scroll
    if (currentScrollY > 50) {
      navbar.style.background = 'rgba(0,0,0,0.98)';
    } else {
      navbar.style.background = 'rgba(0,0,0,0.95)';
    }
    
    // Auto-update active nav link based on scroll position
    updateActiveNavOnScroll();
    
    lastScrollY = currentScrollY;
  });
}

/**
 * Met à jour le lien actif selon la position de scroll
 */
function updateActiveNavOnScroll() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const navbarHeight = document.querySelector('.navbar').offsetHeight;
  
  let currentSection = '';
  
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= navbarHeight + 100 && rect.bottom >= navbarHeight + 100) {
      currentSection = section.getAttribute('id');
    }
  });
  
  // Mettre à jour les liens de navigation
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    }
  });
}

/**
 * Configuration des animations au scroll
 */
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observer les éléments à animer
  const animatedElements = document.querySelectorAll('.feature-card, .game-mode, .tech-feature');
  
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

/**
 * Configuration des effets parallax
 */
function setupParallax() {
  const heroBg = document.querySelector('.hero-bg');
  const mockup = document.querySelector('.game-mockup');
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const windowHeight = window.innerHeight;
    
    // Parallax pour le background du hero
    if (heroBg && scrolled < windowHeight) {
      const yPos = scrolled * 0.5;
      heroBg.style.transform = `translateY(${yPos}px)`;
    }
    
    // Animation du mockup au scroll
    if (mockup && scrolled < windowHeight) {
      const rotation = scrolled * 0.1;
      mockup.style.transform = `translateY(${scrolled * 0.2}px) rotateY(${-10 + rotation}deg)`;
    }
  });
}

/**
 * Animation des statistiques (compteur)
 */
function animateStats() {
  const stats = document.querySelectorAll('.stat-number');
  
  stats.forEach(stat => {
    const finalValue = stat.textContent;
    if (finalValue === '∞') return; // Skip infinity symbol
    
    const finalNumber = parseInt(finalValue);
    if (isNaN(finalNumber)) return;
    
    let currentValue = 0;
    const increment = finalNumber / 50;
    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= finalNumber) {
        currentValue = finalNumber;
        clearInterval(timer);
      }
      stat.textContent = Math.floor(currentValue);
    }, 50);
  });
}

/**
 * Effets de particules pour le background (optionnel)
 */
function createParticles() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '-1';
  canvas.style.opacity = '0.1';
  
  document.body.appendChild(canvas);
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  const particles = [];
  const particleCount = 50;
  
  // Créer les particules
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2
    });
  }
  
  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
      // Mettre à jour la position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Rebond sur les bords
      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
      
      // Dessiner la particule
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 255, ${particle.opacity})`;
      ctx.fill();
    });
    
    requestAnimationFrame(animateParticles);
  }
  
  animateParticles();
}

/**
 * Easter egg - Konami code
 */
function setupEasterEgg() {
  const konamiCode = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
  ];
  
  let userInput = [];
  
  document.addEventListener('keydown', (e) => {
    userInput.push(e.code);
    
    if (userInput.length > konamiCode.length) {
      userInput.shift();
    }
    
    if (userInput.length === konamiCode.length) {
      if (userInput.every((key, index) => key === konamiCode[index])) {
        activateEasterEgg();
        userInput = [];
      }
    }
  });
}

/**
 * Active l'easter egg
 */
function activateEasterEgg() {
  // Créer des particules spéciales
  const body = document.body;
  
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      createConfetti();
    }, i * 100);
  }
  
  // Message secret
  setTimeout(() => {
    alert('🎱 Konami Code activé ! Tu es un vrai gamer ! 🎮');
  }, 1000);
}

/**
 * Crée des confettis animés
 */
function createConfetti() {
  const confetti = document.createElement('div');
  confetti.style.position = 'fixed';
  confetti.style.top = '-10px';
  confetti.style.left = Math.random() * window.innerWidth + 'px';
  confetti.style.width = '10px';
  confetti.style.height = '10px';
  confetti.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
  confetti.style.pointerEvents = 'none';
  confetti.style.zIndex = '9999';
  confetti.textContent = ['🎱', '🎮', '⚡', '💎', '🏆'][Math.floor(Math.random() * 5)];
  confetti.style.fontSize = '20px';
  
  document.body.appendChild(confetti);
  
  const animation = confetti.animate([
    { transform: 'translateY(-10px) rotate(0deg)', opacity: 1 },
    { transform: `translateY(${window.innerHeight + 50}px) rotate(360deg)`, opacity: 0 }
  ], {
    duration: 3000,
    easing: 'ease-in'
  });
  
  animation.onfinish = () => {
    confetti.remove();
  };
}

/**
 * Mode sombre/clair (pour plus tard)
 */
function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
  });
  
  // Restaurer le thème sauvegardé
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  }
}

// Initialiser les fonctionnalités optionnelles
document.addEventListener('DOMContentLoaded', () => {
  // Animer les stats quand elles entrent dans la vue
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStats();
        statsObserver.unobserve(entry.target);
      }
    });
  });
  
  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }
  
  // Particules de fond (optionnel - peut ralentir sur mobile)
  if (window.innerWidth > 768) {
    createParticles();
  }
  
  // Easter egg
  setupEasterEgg();
});

// Fonction globale pour le bouton hero
window.scrollToSection = scrollToSection;
