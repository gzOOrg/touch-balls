# 🎱 Epic Billiards - Le Meilleur Jeu de Billard en Ligne

Bienvenue dans **Epic Billiards**, l'expérience de billard la plus avancée du web ! 

## 🌟 Fonctionnalités

### 🤖 IA Intelligente
- **3 niveaux de difficulté** : DUMB, SMART, TERMINATOR
- **TERMINATOR AI** : Intelligence artificielle ultra-avancée avec analyse situationnelle
- **Anti-suicide** : L'IA ne peut plus se faire du mal
- **Stratégies adaptatives** : 9 types de situations différentes

### 🌍 Support International
**9 langues supportées** avec drapeaux :
- 🇫🇷 Français
- 🇬🇧 English  
- 🇩🇪 Deutsch
- 🇪🇸 Español
- 🇨🇳 中文 (Mandarin)
- 🇸🇦 العربية (Arabe)
- 🇳🇱 Nederlands
- 🇱🇺 Lëtzebuergesch (Luxembourgeois)
- 🇯🇵 日本語 (Japonais)

### 🎮 Modes de Jeu
- **Local** : Jouez à deux sur le même appareil
- **vs IA** : Affrontez nos intelligences artificielles
- **Multijoueur** : Jouez en ligne via WebRTC P2P

### 🎯 Physique Réaliste
- **Simulation ultra-précise** des collisions
- **Friction authentique** 
- **Rebonds parfaits**
- **Détection de trous** avancée

### 🎪 Niveaux de Difficulté
- **NOOB** : Trou géant pour débuter
- **PRO** : Équilibré pour les joueurs expérimentés  
- **LEGEND** : Mode hardcore pour les experts

## 🚀 Installation et Utilisation

### Démarrage Rapide
```bash
# Cloner le repository
git clone https://github.com/username/epic-billiards.git

# Aller dans le dossier
cd epic-billiards

# Lancer le serveur local
python3 -m http.server 8000

# Ouvrir dans le navigateur
open http://localhost:8000
```

### Structure du Projet
```
epic-billiards/
├── index.html              # Page d'accueil du site
├── billard.html            # Jeu de billard
├── assets/
│   ├── css/
│   │   ├── site.css        # Styles pour le site
│   │   └── style.css       # Styles pour le jeu
│   └── js/
│       ├── site.js         # JavaScript du site
│       ├── main.js         # Point d'entrée du jeu
│       ├── game.js         # Logique de jeu
│       ├── ai.js           # Intelligence artificielle
│       ├── network.js      # Multijoueur P2P
│       ├── translations.js # Système de langues
│       └── constants.js    # Constantes du jeu
└── README.md
```

## 🎯 Guide de Jeu

### Contrôles
- **Souris/Tactile** : Cliquez et glissez pour viser
- **Puissance** : Plus vous tirez loin, plus le tir est puissant
- **Objectif** : Mettez la balle rouge dans le trou en utilisant vos balles

### Règles
1. Chaque joueur contrôle ses balles (blanches ou noires)
2. Vous ne pouvez frapper QUE vos propres balles
3. L'objectif est de mettre la balle rouge dans le trou
4. Le premier à réussir gagne la manche

### Modes IA
- **DUMB** : IA basique pour débuter
- **SMART** : IA intelligente avec stratégies
- **TERMINATOR** : IA ultra-avancée avec :
  - Analyse situationnelle (9 types de situations)
  - Simulation de millions de trajectoires
  - Planification multi-étapes
  - Détection de combos complexes
  - Stratégies adaptatives

## 🛠️ Technologies Utilisées

- **HTML5 Canvas** pour le rendu du jeu
- **JavaScript ES6+** pour la logique
- **CSS3** avec animations et gradients
- **WebRTC** pour le multijoueur P2P
- **Orbitron Font** pour le style futuriste

## 🎨 Fonctionnalités Avancées

### IA TERMINATOR
L'IA la plus avancée avec :
- **Analyse situationnelle** : Détecte 9 types de situations différentes
- **Stratégies spécialisées** : Mode urgence, agressif, défensif, perfection
- **Anti-suicide** : Pénalité massive (-10000 points) pour éviter l'auto-destruction
- **Précision ultra-fine** : Analyse jusqu'à 0.05° d'angle
- **Simulation avancée** : Jusqu'à 2000 étapes de simulation physique

### Multijoueur P2P
- **WebRTC** pour connexion directe peer-to-peer
- **Partage d'ID** simple pour inviter des amis
- **Synchronisation** en temps réel des actions
- **Chat** intégré (prévu)

### Interface Responsive
- **Mobile-first** design
- **Contrôles tactiles** optimisés
- **Adaptation automatique** à tous les écrans
- **Performance** optimisée

## 🐛 Debug et Console

Le jeu affiche des informations détaillées dans la console :
- **TERMINATOR** : Analyse des stratégies et scores
- **Physique** : Collisions et trajectoires  
- **Réseau** : État des connexions P2P
- **Performance** : FPS et temps de calcul

## 🎯 Roadmap

### Version Future
- [ ] **Tournois en ligne**
- [ ] **Classements globaux** 
- [ ] **Personnalisation** des balles et tables
- [ ] **Modes de jeu** supplémentaires (8-ball, 9-ball)
- [ ] **Replay system** pour revoir les parties
- [ ] **IA adaptatrice** qui apprend de vos habitudes

## 📱 Compatibilité

- ✅ **Chrome/Chromium** (recommandé)
- ✅ **Firefox**
- ✅ **Safari** 
- ✅ **Edge**
- ✅ **Mobile** (iOS/Android)

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🎯 Easter Eggs

Essayez le **Konami Code** sur la page d'accueil ! ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA

---

**Développé avec ❤️ et beaucoup de ☕**

🎱 **Jouez maintenant sur [Epic Billiards](http://localhost:8000) !**