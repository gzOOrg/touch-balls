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
  
  // Language system
  setupLanguageButtons();
  
  // Load saved language or default to French
  const savedLang = localStorage.getItem('epic-billiards-language') || 'fr';
  setLanguage(savedLang);
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

// ====================================
// SYSTÈME DE TRADUCTION
// ====================================

// Traductions pour la page d'accueil
const siteTranslations = {
  fr: {
    // Navigation
    'nav-home': 'Accueil',
    'nav-features': 'Fonctionnalités',
    'nav-game': 'Jouer',
    'nav-about': 'À propos',
    
    // Hero Section
    'hero-title': 'EPIC BILLIARDS',
    'hero-subtitle': 'Le billard réinventé',
    'hero-description': 'Découvrez l\'expérience de billard la plus avancée du web ! Affrontez des IA intelligentes, jouez en multijoueur et profitez d\'une physique ultra-réaliste.',
    'hero-play-btn': '🎱 JOUER MAINTENANT',
    
    // Stats
    'stat-languages': 'Langues',
    'stat-ai-levels': 'Niveaux d\'IA',
    'stat-fun': 'Plaisir',
    
    // Features Section
    'features-title': 'Fonctionnalités Épiques',
    'ai-title': 'IA TERMINATOR',
    'ai-desc': 'Affrontez notre IA la plus avancée ! TERMINATOR analyse des millions de trajectoires et s\'adapte à chaque situation de jeu.',
    'ai-highlight': 'Ultra-Intelligent',
    
    'languages-title': '9 LANGUES',
    'languages-desc': 'Jouez dans votre langue préférée ! Français, English, Deutsch, Español, 中文, العربية, Nederlands, Lëtzebuergesch, 日本語.',
    'languages-highlight': 'Multilingue',
    
    'physics-title': 'PHYSIQUE RÉALISTE',
    'physics-desc': 'Profitez d\'une simulation physique ultra-précise avec collisions réalistes, friction authentique et rebonds parfaits.',
    'physics-highlight': 'Ultra-Réaliste',
    
    'multiplayer-title': 'MULTIJOUEUR',
    'multiplayer-desc': 'Défiez vos amis en ligne ! Partagez simplement votre ID de partie et jouez ensemble de n\'importe où.',
    'multiplayer-highlight': 'En Ligne',
    
    'difficulty-title': '3 DIFFICULTÉS',
    'difficulty-desc': 'De NOOB à LEGEND, choisissez votre niveau de défi ! Trou géant, équilibré ou mode hardcore.',
    'difficulty-highlight': 'Progressive',
    
    'responsive-title': 'RESPONSIVE',
    'responsive-desc': 'Jouez sur PC, tablette ou mobile ! Interface adaptative et contrôles tactiles optimisés.',
    'responsive-highlight': 'Partout',
    
    // Game Section
    'game-title': 'Prêt à Jouer ?',
    'local-title': 'LOCAL',
    'local-desc': 'Jouez à deux sur le même appareil ! Parfait pour défier famille et amis.',
    'local-btn': 'JOUER LOCAL',
    
    // About Section
    'about-title': 'À Propos d\'Epic Billiards',
    'about-future': 'Le billard du futur',
    'about-future-desc': 'Epic Billiards repousse les limites du jeu de billard en ligne. Développé avec les dernières technologies web, notre jeu offre une expérience immersive et compétitive inégalée.',
    'about-tech': 'Technologie avancée',
    'about-tech-desc': 'Notre moteur physique propriétaire simule avec précision les collisions, la friction et les rebonds. L\'IA TERMINATOR utilise des algorithmes de pointe pour analyser des millions de trajectoires en temps réel.',
    'about-community': 'Communauté mondiale',
    'about-community-desc': 'Avec le support de 9 langues et le multijoueur en ligne, Epic Billiards rassemble une communauté mondiale de passionnés de billard.',
    
    // Footer
    'footer-desc': 'Le meilleur jeu de billard en ligne. Gratuit, sans inscription.',
    'footer-game': 'Jeu',
    'footer-play': 'Jouer Maintenant',
    'footer-support': 'Support',
    'footer-source': 'Code Source',
    'footer-contact': 'Contact',
    'footer-languages': 'Langues Supportées',
    'footer-copyright': '© 2024 Epic Billiards. Fait avec ❤️ et beaucoup de ☕'
  },
  
  en: {
    // Navigation
    'nav-home': 'Home',
    'nav-features': 'Features',
    'nav-game': 'Play',
    'nav-about': 'About',
    
    // Hero Section
    'hero-title': 'EPIC BILLIARDS',
    'hero-subtitle': 'Billiards Reinvented',
    'hero-description': 'Discover the most advanced billiards experience on the web! Face intelligent AIs, play multiplayer and enjoy ultra-realistic physics.',
    'hero-play-btn': '🎱 PLAY NOW',
    
    // Stats
    'stat-languages': 'Languages',
    'stat-ai-levels': 'AI Levels',
    'stat-fun': 'Fun',
    
    // Features Section
    'features-title': 'Epic Features',
    'ai-title': 'TERMINATOR AI',
    'ai-desc': 'Face our most advanced AI! TERMINATOR analyzes millions of trajectories and adapts to every game situation.',
    'ai-highlight': 'Ultra-Smart',
    
    'languages-title': '9 LANGUAGES',
    'languages-desc': 'Play in your preferred language! Français, English, Deutsch, Español, 中文, العربية, Nederlands, Lëtzebuergesch, 日本語.',
    'languages-highlight': 'Multilingual',
    
    'physics-title': 'REALISTIC PHYSICS',
    'physics-desc': 'Enjoy ultra-precise physics simulation with realistic collisions, authentic friction and perfect bounces.',
    'physics-highlight': 'Ultra-Realistic',
    
    'multiplayer-title': 'MULTIPLAYER',
    'multiplayer-desc': 'Challenge your friends online! Simply share your game ID and play together from anywhere.',
    'multiplayer-highlight': 'Online',
    
    'difficulty-title': '3 DIFFICULTIES',
    'difficulty-desc': 'From NOOB to LEGEND, choose your challenge level! Giant hole, balanced or hardcore mode.',
    'difficulty-highlight': 'Progressive',
    
    'responsive-title': 'RESPONSIVE',
    'responsive-desc': 'Play on PC, tablet or mobile! Adaptive interface and optimized touch controls.',
    'responsive-highlight': 'Everywhere',
    
    // Game Section
    'game-title': 'Ready to Play?',
    'local-title': 'LOCAL',
    'local-desc': 'Play two players on the same device! Perfect for challenging family and friends.',
    'local-btn': 'PLAY LOCAL',
    
    // About Section
    'about-title': 'About Epic Billiards',
    'about-future': 'The future of billiards',
    'about-future-desc': 'Epic Billiards pushes the boundaries of online billiards gaming. Developed with the latest web technologies, our game offers an unmatched immersive and competitive experience.',
    'about-tech': 'Advanced technology',
    'about-tech-desc': 'Our proprietary physics engine accurately simulates collisions, friction and bounces. The TERMINATOR AI uses cutting-edge algorithms to analyze millions of trajectories in real time.',
    'about-community': 'Global community',
    'about-community-desc': 'With support for 9 languages and online multiplayer, Epic Billiards brings together a global community of billiards enthusiasts.',
    
    // Footer
    'footer-desc': 'The best online billiards game. Free, no registration required.',
    'footer-game': 'Game',
    'footer-play': 'Play Now',
    'footer-support': 'Support',
    'footer-source': 'Source Code',
    'footer-contact': 'Contact',
    'footer-languages': 'Supported Languages',
    'footer-copyright': '© 2024 Epic Billiards. Made with ❤️ and lots of ☕'
  },
  
  de: {
    // Navigation
    'nav-home': 'Startseite',
    'nav-features': 'Funktionen',
    'nav-game': 'Spielen',
    'nav-about': 'Über uns',
    
    // Hero Section
    'hero-title': 'EPIC BILLIARDS',
    'hero-subtitle': 'Billard neu erfunden',
    'hero-description': 'Entdecken Sie das fortschrittlichste Billard-Erlebnis im Web! Fordern Sie intelligente KIs heraus, spielen Sie Multiplayer und genießen Sie ultra-realistische Physik.',
    'hero-play-btn': '🎱 JETZT SPIELEN',
    
    // Stats
    'stat-languages': 'Sprachen',
    'stat-ai-levels': 'KI-Level',
    'stat-fun': 'Spaß',
    
    // Features Section
    'features-title': 'Epische Funktionen',
    'ai-title': 'TERMINATOR KI',
    'ai-desc': 'Fordern Sie unsere fortschrittlichste KI heraus! TERMINATOR analysiert Millionen von Trajektorien und passt sich jeder Spielsituation an.',
    'ai-highlight': 'Ultra-Intelligent',
    
    'languages-title': '9 SPRACHEN',
    'languages-desc': 'Spielen Sie in Ihrer bevorzugten Sprache! Français, English, Deutsch, Español, 中文, العربية, Nederlands, Lëtzebuergesch, 日本語.',
    'languages-highlight': 'Mehrsprachig',
    
    'physics-title': 'REALISTISCHE PHYSIK',
    'physics-desc': 'Genießen Sie ultra-präzise Physiksimulation mit realistischen Kollisionen, authentischer Reibung und perfekten Sprüngen.',
    'physics-highlight': 'Ultra-Realistisch',
    
    'multiplayer-title': 'MEHRSPIELER',
    'multiplayer-desc': 'Fordern Sie Ihre Freunde online heraus! Teilen Sie einfach Ihre Spiel-ID und spielen Sie zusammen von überall.',
    'multiplayer-highlight': 'Online',
    
    'difficulty-title': '3 SCHWIERIGKEITEN',
    'difficulty-desc': 'Von ANFÄNGER bis LEGENDE, wählen Sie Ihr Herausforderungslevel! Riesenloch, ausgewogen oder Hardcore-Modus.',
    'difficulty-highlight': 'Progressiv',
    
    'responsive-title': 'RESPONSIVE',
    'responsive-desc': 'Spielen Sie auf PC, Tablet oder Handy! Adaptive Benutzeroberfläche und optimierte Touch-Steuerung.',
    'responsive-highlight': 'Überall',
    
    // Game Section
    'game-title': 'Bereit zu spielen?',
    'local-title': 'LOKAL',
    'local-desc': 'Spielen Sie zu zweit auf demselben Gerät! Perfekt, um Familie und Freunde herauszufordern.',
    'local-btn': 'LOKAL SPIELEN',
    
    // About Section
    'about-title': 'Über Epic Billiards',
    'about-future': 'Die Zukunft des Billards',
    'about-future-desc': 'Epic Billiards erweitert die Grenzen des Online-Billard-Spiels. Mit den neuesten Web-Technologien entwickelt, bietet unser Spiel ein unvergleichliches immersives und wettbewerbsfähiges Erlebnis.',
    'about-tech': 'Fortschrittliche Technologie',
    'about-tech-desc': 'Unsere proprietäre Physik-Engine simuliert präzise Kollisionen, Reibung und Sprünge. Die TERMINATOR KI verwendet modernste Algorithmen, um Millionen von Trajektorien in Echtzeit zu analysieren.',
    'about-community': 'Globale Gemeinschaft',
    'about-community-desc': 'Mit Unterstützung für 9 Sprachen und Online-Multiplayer bringt Epic Billiards eine globale Gemeinschaft von Billard-Enthusiasten zusammen.',
    
    // Footer
    'footer-desc': 'Das beste Online-Billardspiel. Kostenlos, keine Registrierung erforderlich.',
    'footer-game': 'Spiel',
    'footer-play': 'Jetzt spielen',
    'footer-support': 'Support',
    'footer-source': 'Quellcode',
    'footer-contact': 'Kontakt',
    'footer-languages': 'Unterstützte Sprachen',
    'footer-copyright': '© 2024 Epic Billiards. Gemacht mit ❤️ und viel ☕'
  },
  
  nl: {
    // Navigation
    'nav-home': 'Home',
    'nav-features': 'Functies',
    'nav-game': 'Spelen',
    'nav-about': 'Over ons',
    
    // Hero Section
    'hero-title': 'EPIC BILLIARDS',
    'hero-subtitle': 'Biljart heruitgevonden',
    'hero-description': 'Ontdek de meest geavanceerde biljartervaring op het web! Daag intelligente AI\'s uit, speel multiplayer en geniet van ultra-realistische fysica.',
    'hero-play-btn': '🎱 NU SPELEN',
    
    // Stats
    'stat-languages': 'Talen',
    'stat-ai-levels': 'AI Niveaus',
    'stat-fun': 'Plezier',
    
    // Features Section
    'features-title': 'Epische Functies',
    'ai-title': 'TERMINATOR AI',
    'ai-desc': 'Daag onze meest geavanceerde AI uit! TERMINATOR analyseert miljoenen trajecten en past zich aan elke spelsituatie aan.',
    'ai-highlight': 'Ultra-Slim',
    
    'languages-title': '9 TALEN',
    'languages-desc': 'Speel in je voorkeurstaal! Français, English, Deutsch, Español, 中文, العربية, Nederlands, Lëtzebuergesch, 日本語.',
    'languages-highlight': 'Meertalig',
    
    'physics-title': 'REALISTISCHE FYSICA',
    'physics-desc': 'Geniet van ultra-precieze fysicasimulatie met realistische botsingen, authentieke wrijving en perfecte stuiters.',
    'physics-highlight': 'Ultra-Realistisch',
    
    'multiplayer-title': 'MULTIPLAYER',
    'multiplayer-desc': 'Daag je vrienden online uit! Deel gewoon je spel-ID en speel samen vanaf elke locatie.',
    'multiplayer-highlight': 'Online',
    
    'difficulty-title': '3 MOEILIJKHEDEN',
    'difficulty-desc': 'Van NOOB tot LEGENDE, kies je uitdagingsniveau! Reuze gat, gebalanceerd of hardcore modus.',
    'difficulty-highlight': 'Progressief',
    
    'responsive-title': 'RESPONSIVE',
    'responsive-desc': 'Speel op PC, tablet of mobiel! Adaptieve interface en geoptimaliseerde aanraakbediening.',
    'responsive-highlight': 'Overal',
    
    // Game Section
    'game-title': 'Klaar om te spelen?',
    'local-title': 'LOKAAL',
    'local-desc': 'Speel met twee spelers op hetzelfde apparaat! Perfect om familie en vrienden uit te dagen.',
    'local-btn': 'LOKAAL SPELEN',
    
    // About Section
    'about-title': 'Over Epic Billiards',
    'about-future': 'De toekomst van biljart',
    'about-future-desc': 'Epic Billiards verlegt de grenzen van online biljartspellen. Ontwikkeld met de nieuwste webtechnologieën, biedt ons spel een ongeëvenaarde meeslepende en competitieve ervaring.',
    'about-tech': 'Geavanceerde technologie',
    'about-tech-desc': 'Onze eigen fysica-engine simuleert nauwkeurig botsingen, wrijving en stuiters. De TERMINATOR AI gebruikt geavanceerde algoritmen om miljoenen trajecten in realtime te analyseren.',
    'about-community': 'Wereldwijde gemeenschap',
    'about-community-desc': 'Met ondersteuning voor 9 talen en online multiplayer brengt Epic Billiards een wereldwijde gemeenschap van biljartliefhebbers samen.',
    
    // Footer
    'footer-desc': 'Het beste online biljartspel. Gratis, geen registratie vereist.',
    'footer-game': 'Spel',
    'footer-play': 'Nu Spelen',
    'footer-support': 'Ondersteuning',
    'footer-source': 'Broncode',
    'footer-contact': 'Contact',
    'footer-languages': 'Ondersteunde Talen',
    'footer-copyright': '© 2024 Epic Billiards. Gemaakt met ❤️ en veel ☕'
  }
};

/**
 * Configurer les boutons de langue
 */
function setupLanguageButtons() {
  const langButtons = document.querySelectorAll('.hero-lang-btn');
  
  langButtons.forEach(button => {
    button.addEventListener('click', function() {
      const lang = this.getAttribute('data-lang');
      setLanguage(lang);
    });
  });
}

/**
 * Définir la langue et traduire la page
 */
function setLanguage(lang) {
  // Sauvegarder la langue
  localStorage.setItem('epic-billiards-language', lang);
  
  // Mettre à jour les boutons actifs
  const langButtons = document.querySelectorAll('.hero-lang-btn');
  langButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    }
  });
  
  // Traduire tous les éléments
  translatePage(lang);
}

/**
 * Traduire la page
 */
function translatePage(lang) {
  const translations = siteTranslations[lang] || siteTranslations.fr;
  
  // Traduire par data-translate
  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate');
    if (translations[key]) {
      element.textContent = translations[key];
    }
  });
  
  // Traduire les éléments spécifiques par ID ou classe
  const elementsToTranslate = {
    // Navigation
    '.nav-link[href="#home"]': 'nav-home',
    '.nav-link[href="#features"]': 'nav-features', 
    '.nav-link[href="#game"]': 'nav-game',
    '.nav-link[href="#about"]': 'nav-about',
    
    // Hero
    '.title-main': 'hero-title',
    '.title-sub': 'hero-subtitle',
    '.hero-description': 'hero-description',
    '.btn-hero-primary': 'hero-play-btn',
    
    // Stats
    '.hero-stats .stat:nth-child(1) .stat-label': 'stat-languages',
    '.hero-stats .stat:nth-child(2) .stat-label': 'stat-ai-levels', 
    '.hero-stats .stat:nth-child(3) .stat-label': 'stat-fun'
  };
  
  Object.entries(elementsToTranslate).forEach(([selector, key]) => {
    const element = document.querySelector(selector);
    if (element && translations[key]) {
      element.textContent = translations[key];
    }
  });
  
  console.log(`🌍 Page traduite en ${lang.toUpperCase()}`);
}

/**
 * Configuration des boutons de langue
 */
function setupLanguageButtons() {
  const langButtons = document.querySelectorAll('.nav-lang-btn');
  
  langButtons.forEach(button => {
    button.addEventListener('click', function() {
      const lang = this.getAttribute('data-lang');
      setLanguage(lang);
    });
  });
}

/**
 * Définir la langue
 */
function setLanguage(lang) {
  // Sauvegarder la langue choisie
  localStorage.setItem('epic-billiards-language', lang);
  
  // Mettre à jour les boutons actifs
  updateActiveLanguageButton(lang);
  
  // Appliquer les traductions
  applyTranslations(lang);
}

/**
 * Mettre à jour le bouton de langue actif
 */
function updateActiveLanguageButton(lang) {
  const langButtons = document.querySelectorAll('.nav-lang-btn');
  
  langButtons.forEach(button => {
    button.classList.remove('active');
    if (button.getAttribute('data-lang') === lang) {
      button.classList.add('active');
    }
  });
}

/**
 * Appliquer les traductions
 */
function applyTranslations(lang) {
  const translations = getTranslations(lang);
  
  // Titre principal
  const titleMain = document.querySelector('.title-main');
  if (titleMain) titleMain.textContent = translations.title;
  
  // Sous-titre
  const titleSub = document.querySelector('.title-sub');
  if (titleSub) titleSub.textContent = translations.subtitle;
  
  // Description
  const heroDescription = document.querySelector('.hero-description');
  if (heroDescription) heroDescription.textContent = translations.description;
  
  // Bouton principal
  const heroBtn = document.querySelector('.btn-hero-primary');
  if (heroBtn) heroBtn.textContent = translations.playButton;
  
  // Stats
  const statLabels = document.querySelectorAll('.stat-label');
  if (statLabels.length >= 3) {
    statLabels[0].textContent = translations.languages;
    statLabels[1].textContent = translations.aiLevels;
    statLabels[2].textContent = translations.fun;
  }
  
  // Navigation
  const navLinks = document.querySelectorAll('.nav-link');
  if (navLinks.length >= 4) {
    navLinks[0].textContent = translations.home;
    navLinks[1].textContent = translations.features;
    navLinks[2].textContent = translations.play;
    navLinks[3].textContent = translations.about;
  }
  
  // Section titles et autres éléments...
  updateSectionTitles(translations);
}

/**
 * Mettre à jour les titres de sections
 */
function updateSectionTitles(translations) {
  // Titre fonctionnalités
  const featuresTitle = document.querySelector('#features .section-title');
  if (featuresTitle) {
    featuresTitle.innerHTML = `<span class="title-icon">⚡</span>${translations.featuresTitle}`;
  }
  
  // Titre jeu
  const gameTitle = document.querySelector('#game .section-title');
  if (gameTitle) {
    gameTitle.innerHTML = `<span class="title-icon">🎮</span>${translations.gameTitle}`;
  }
  
  // Titre à propos
  const aboutTitle = document.querySelector('#about .section-title');
  if (aboutTitle) {
    aboutTitle.innerHTML = `<span class="title-icon">💎</span>${translations.aboutTitle}`;
  }
}

/**
 * Traductions
 */
function getTranslations(lang) {
  const translations = {
    fr: {
      title: 'EPIC BILLIARDS',
      subtitle: 'Le billard réinventé',
      description: 'Découvrez l\'expérience de billard la plus avancée du web ! Affrontez des IA intelligentes, jouez en multijoueur et profitez d\'une physique ultra-réaliste.',
      playButton: '🎱 JOUER MAINTENANT',
      languages: 'Langues',
      aiLevels: 'Niveaux d\'IA',
      fun: 'Plaisir',
      home: 'Accueil',
      features: 'Fonctionnalités',
      play: 'Jouer',
      about: 'À propos',
      featuresTitle: 'Fonctionnalités Épiques',
      gameTitle: 'Prêt à Jouer ?',
      aboutTitle: 'À Propos d\'Epic Billiards'
    },
    en: {
      title: 'EPIC BILLIARDS',
      subtitle: 'Billiards Reinvented',
      description: 'Discover the most advanced billiards experience on the web! Challenge intelligent AIs, play multiplayer and enjoy ultra-realistic physics.',
      playButton: '🎱 PLAY NOW',
      languages: 'Languages',
      aiLevels: 'AI Levels',
      fun: 'Fun',
      home: 'Home',
      features: 'Features',
      play: 'Play',
      about: 'About',
      featuresTitle: 'Epic Features',
      gameTitle: 'Ready to Play?',
      aboutTitle: 'About Epic Billiards'
    },
    de: {
      title: 'EPIC BILLIARDS',
      subtitle: 'Billard Neu Erfunden',
      description: 'Entdecken Sie das fortschrittlichste Billard-Erlebnis im Web! Fordern Sie intelligente KIs heraus, spielen Sie Multiplayer und genießen Sie ultra-realistische Physik.',
      playButton: '🎱 JETZT SPIELEN',
      languages: 'Sprachen',
      aiLevels: 'KI-Level',
      fun: 'Spaß',
      home: 'Startseite',
      features: 'Funktionen',
      play: 'Spielen',
      about: 'Über uns',
      featuresTitle: 'Epische Funktionen',
      gameTitle: 'Bereit zu Spielen?',
      aboutTitle: 'Über Epic Billiards'
    },
    nl: {
      title: 'EPIC BILLIARDS',
      subtitle: 'Biljart Heruitgevonden',
      description: 'Ontdek de meest geavanceerde biljartervaring op het web! Daag intelligente AI\'s uit, speel multiplayer en geniet van ultra-realistische fysica.',
      playButton: '🎱 NU SPELEN',
      languages: 'Talen',
      aiLevels: 'AI-niveaus',
      fun: 'Plezier',
      home: 'Home',
      features: 'Functies',
      play: 'Spelen',
      about: 'Over ons',
      featuresTitle: 'Epische Functies',
      gameTitle: 'Klaar om te Spelen?',
      aboutTitle: 'Over Epic Billiards'
    }
  };
  
  return translations[lang] || translations.fr;
}
