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
    player1Label: "🤖 JOUEUR 1 (BLANC)",
    player2Label: "⚡ JOUEUR 2 (NOIR)",
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
    player2Wins: "🏆 JOUEUR 2 GAGNE LA MANCHE !",
    
    // Textes d'aide
    difficultyHelp: "NOOB: Trou géant • PRO: Équilibré • LEGEND: Mode hardcore",
    gameInstructions: "👆 Touche une boule, tire en arrière, relâche pour DÉTRUIRE !",
    startGame: "COMMENCER LE MASSACRE",
    aimAssist: "Assistance de visée",
    
    // Messages IA
    aiThinking: "RÉFLÉCHIT...",
    aiAnalyzing: "🤖 ANALYSE EN COURS...",
    aiCalculating: "📊 CALCUL DES TRAJECTOIRES...",
    aiOptimizing: "🎯 OPTIMISATION...",
    aiQuantum: "🤖 CALCUL QUANTIQUE!",
    aiComplete: "ANALYSE TERMINÉE!",
    aiGoodShot: "BON TIR!",
    aiPerfectCalc: "CALCUL PARFAIT!",
    aiTactical: "TIR TACTIQUE!",
    aiUsingPlayerBall: "UTILISE TA BOULE!"
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
    player1Label: "🤖 SPELER 1 (WIT)",
    player2Label: "⚡ SPELER 2 (ZWART)",
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
    connectedTo: "Verbonden met:",
    
    // Helpteksten
    difficultyHelp: "BEGINNER: Reuzengat • PRO: Evenwichtig • LEGENDE: Hardcore modus",
    gameInstructions: "👆 Raak een bal aan, trek terug, laat los om te VERNIETIGEN!",
    startGame: "BEGIN HET BLOEDBAD",
    aimAssist: "Richthulp",
    
    // AI berichten
    aiThinking: "DENKT NA...",
    aiAnalyzing: "🤖 ANALYSE BEZIG...",
    aiCalculating: "📊 TRAJECTEN BEREKENEN...",
    aiOptimizing: "🎯 OPTIMALISEREN...",
    aiQuantum: "🤖 QUANTUM BEREKENING!",
    aiComplete: "ANALYSE VOLTOOID!",
    aiGoodShot: "GOED SCHOT!",
    aiPerfectCalc: "PERFECTE BEREKENING!",
    aiTactical: "TACTISCH SCHOT!",
    aiUsingPlayerBall: "GEBRUIKT JOUW BAL!"
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
