/**
 * Module de traductions pour l'internationalisation du jeu
 */

export const translations = {
  fr: {
    // Menus principaux
    gameTitle: "BILLARD ÉPIQUE",
    newGame: "NOUVELLE PARTIE",
    gameMode: "MODE DE JEU",
    local: "LOCAL",
    vsAI: "vs IA",
    host: "HÉBERGER",
    join: "REJOINDRE",
    
    // Joueurs
    player1: "Joueur 1",
    player2: "Joueur 2",
    playerTurn: "TOUR DE",
    
    // Niveaux de difficulté
    difficulty: "DIFFICULTÉ",
    noob: "NOOB",
    pro: "PRO",
    legend: "LEGEND",
    
    // Niveaux d'IA
    aiLevel: "NIVEAU DE L'IA",
    dumb: "DUMB",
    smart: "SMART",
    terminator: "TERMINATOR",
    
    // Messages de jeu
    victory: "VICTOIRE ÉPIQUE!",
    wins: "domine",
    finalScore: "Score final",
    totalShots: "Tirs totaux",
    duration: "Durée",
    rematch: "REVANCHE!",
    menu: "MENU",
    
    // Messages de combo
    powerShot: "POWER SHOT!",
    megaShot: "MEGA SHOT! 🔥",
    redBall: "RED BALL! 🎯",
    niceShot: "NICE SHOT! 💀",
    
    // Multijoueur
    hostGame: "Héberger une partie",
    joinGame: "Rejoindre une partie",
    connectionId: "ID de connexion",
    copyId: "Copier l'ID",
    connect: "SE CONNECTER",
    cancel: "ANNULER",
    chat: "CHAT",
    
    // Interface
    home: "ACCUEIL",
    ready: "PRÉPARE-TOI...",
    round: "MANCHE",
    gameStarted: "PARTIE LANCÉE!",
    roundWon: "GAGNE LA MANCHE !",
    matchWon: "GAGNE LA PARTIE !",
    player1Wins: "🏆 JOUEUR 1 GAGNE LA MANCHE !",
    player2Wins: "🏆 JOUEUR 2 GAGNE LA MANCHE !"
  },
  
  nl: {
    // Hoofdmenu's
    gameTitle: "EPISCH BILJART",
    newGame: "NIEUW SPEL",
    gameMode: "SPELMODUS",
    local: "LOKAAL",
    vsAI: "vs AI",
    host: "HOSTEN",
    join: "DEELNEMEN",
    
    // Spelers
    player1: "Speler 1",
    player2: "Speler 2",
    playerTurn: "BEURT VAN",
    
    // Moeilijkheidsgraden
    difficulty: "MOEILIJKHEID",
    noob: "BEGINNER",
    pro: "PRO",
    legend: "LEGENDE",
    
    // AI-niveaus
    aiLevel: "AI NIVEAU",
    dumb: "DOM",
    smart: "SLIM",
    terminator: "TERMINATOR",
    
    // Spelberichten
    victory: "EPISCHE OVERWINNING!",
    wins: "domineert",
    finalScore: "Eindscore",
    totalShots: "Totaal schoten",
    duration: "Duur",
    rematch: "REVANCHE!",
    menu: "MENU",
    
    // Combo berichten
    powerShot: "KRACHT SCHOT!",
    megaShot: "MEGA SCHOT! 🔥",
    redBall: "RODE BAL! 🎯",
    niceShot: "MOOI SCHOT! 💀",
    
    // Multiplayer
    hostGame: "Een spel hosten",
    joinGame: "Deelnemen aan spel",
    connectionId: "Verbindings-ID",
    copyId: "ID kopiëren",
    connect: "VERBINDEN",
    cancel: "ANNULEREN",
    chat: "CHAT",
    
    // Interface
    home: "THUIS",
    ready: "MAAK JE KLAAR...",
    round: "RONDE",
    gameStarted: "SPEL GESTART!",
    roundWon: "WINT DE RONDE!",
    matchWon: "WINT HET SPEL!",
    player1Wins: "🏆 SPELER 1 WINT DE RONDE!",
    player2Wins: "🏆 SPELER 2 WINT DE RONDE!",
    
    // Réseau
    waitingForPeer: "Wachten op peer-verbinding...",
    yourId: "JOUW ID",
    peerId: "HOST ID",
    connectionReady: "Verbinding klaar!",
    disconnected: "heeft de verbinding verbroken",
    connectionLost: "VERBINDING VERLOREN!",
    connectedTo: "Verbonden met:"
  }
};

// Langue actuelle
let currentLanguage = 'fr';

/**
 * Change la langue du jeu
 */
export function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
    return true;
  }
  return false;
}

/**
 * Obtient la langue actuelle
 */
export function getLanguage() {
  return currentLanguage;
}

/**
 * Obtient une traduction
 */
export function t(key) {
  return translations[currentLanguage][key] || translations['fr'][key] || key;
}

/**
 * Obtient toutes les traductions de la langue actuelle
 */
export function getTranslations() {
  return translations[currentLanguage];
}
