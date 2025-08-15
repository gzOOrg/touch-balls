/**
 * Module Constants - Constantes et configurations du jeu
 */

// Dimensions du canvas
export const CANVAS_WIDTH = 912;
export const CANVAS_HEIGHT = 532;

// Physique
export const BALL_RADIUS = 14;
export const BASE_HOLE_SIZE = 34;
export const FRICTION = 110;
export const RESTITUTION_WALL = 0.88;
export const RESTITUTION_BALL = 0.99;
export const STOP_VELOCITY = 2.5;
export const MAX_PULL_DISTANCE = BALL_RADIUS * 10;
export const AIM_EXTEND = 4;
export const AIM_SECONDARY = 0.6;
export const POWER_MULTIPLIER = 18;

// Niveaux de difficulté
export const DIFFICULTY = {
  NOOB: 1,
  PRO: 2,
  LEGEND: 3
};

// Tailles de trou par difficulté
export const HOLE_SIZES = {
  [DIFFICULTY.NOOB]: BASE_HOLE_SIZE * 1.5,
  [DIFFICULTY.PRO]: BASE_HOLE_SIZE,
  [DIFFICULTY.LEGEND]: BASE_HOLE_SIZE * 0.75
};

// Niveaux d'IA
export const AI_LEVEL = {
  DUMB: 1,
  SMART: 2,
  TERMINATOR: 3
};

// Modes de jeu
export const GAME_MODE = {
  LOCAL: 'local',
  AI: 'ai',
  HOST: 'host',
  GUEST: 'guest'
};

// Types de messages réseau
export const MESSAGE_TYPE = {
  PING: 'ping',
  PONG: 'pong',
  CHAT: 'chat',
  SHOT: 'shot',
  GAME_STATE: 'gameState',
  TURN_CHANGE: 'turnChange',
  GAME_START: 'gameStart',
  PLAYER_NAMES: 'playerNames',
  GAME_SETTINGS: 'gameSettings'
};

// Couleurs des boules
export const BALL_COLORS = {
  WHITE: 'white',
  BLACK: '#111827',
  RED: '#e11d48'
};
