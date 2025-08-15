# 🎱 Billard Épique - Jeu Multijoueur Complet

## 🚀 Fonctionnalités

- **🎮 4 modes de jeu** : Local, vs IA, Héberger, Rejoindre
- **🤖 3 niveaux d'IA** : DUMB (facile), SMART (moyen), TERMINATOR (expert)
- **🌐 Multijoueur P2P** : Connexion directe sans serveur via PeerJS
- **💬 Chat intégré** : Communication en temps réel pendant les parties
- **🎨 Design néon** : Interface cyberpunk avec effets visuels impressionnants
- **🔊 Effets sonores** : Audio synthétisé en temps réel
- **📱 Responsive** : Compatible desktop et mobile

## ✨ Améliorations visuelles récentes

- **🌟 Grille cyberpunk** : Fond avec grille lumineuse cyan
- **💫 Effet de traînée** : Les boules laissent une trace en mouvement
- **🎯 Visée améliorée** : Points d'impact lumineux et rebonds visualisés
- **🎨 Rendu des boules** : Gradients sophistiqués et reflets réalistes
- **🔥 Messages combo** : Animations "POWER SHOT!", "RED BALL!", etc.
- **🌈 Jauge de puissance** : Gradient vert → orange → rouge
- **⚡ Glow néon** : Effets lumineux sur le trou central et la boule rouge

## 📁 Structure du projet

```
billard/
├── billard.html          # Page HTML principale
├── assets/
│   ├── css/
│   │   └── style.css     # Styles CSS avec thème néon
│   └── js/
│       ├── main.js       # Contrôleur principal
│       ├── game.js       # Moteur de jeu (physique, rendu)
│       ├── ui.js         # Gestion de l'interface
│       ├── ai.js         # Intelligence artificielle
│       ├── network.js    # Système multijoueur P2P
│       ├── sfx.js        # Effets sonores
│       ├── constants.js  # Configuration et constantes
│       └── utils.js      # Fonctions utilitaires
└── README.md             # Documentation

```

## ✅ Architecture modulaire ES6

### 1. **`main.js`** - Contrôleur principal
- Gestion des modes de jeu
- Initialisation des modules
- Orchestration des événements
- Boucle de jeu principale

### 2. **`game.js`** - Moteur de jeu
- Physique réaliste (collisions, friction, rebonds)
- Rendu Canvas optimisé
- Gestion des interactions (souris/tactile)
- Détection de victoire

### 3. **`ai.js`** - Intelligence artificielle
- **DUMB** : Tirs aléatoires, réflexion rapide
- **SMART** : Stratégie basique, précision moyenne
- **TERMINATOR** : Calculs parfaits, quasi-imbattable

### 4. **`network.js`** - Multijoueur P2P
- Connexion directe via WebRTC/PeerJS
- Synchronisation en temps réel
- Chat intégré
- Gestion de la latence (ping/pong)

### 5. **`ui.js`** - Interface utilisateur
- Gestion des éléments DOM
- Animations et transitions
- Notifications (achievements)
- Mise à jour des scores

### 6. **`sfx.js`** - Système audio
- Sons synthétisés en temps réel
- Effets de collision dynamiques
- Fanfares de victoire
- Compatible avec tous les navigateurs

### 7. **`constants.js`** & **`utils.js`**
- Configuration centralisée
- Fonctions mathématiques
- Helpers réutilisables

## 🎮 Comment jouer

1. **Démarrer un serveur local** (nécessaire pour les modules ES6) :
   ```bash
   python3 -m http.server 8000
   ```

2. **Ouvrir le jeu** : http://localhost:8000/billard.html

3. **Choisir un mode** :
   - **LOCAL** : 2 joueurs sur le même appareil
   - **vs IA** : Affronter l'ordinateur (3 niveaux)
   - **HÉBERGER** : Créer une partie en ligne
   - **REJOINDRE** : Se connecter à une partie

4. **Contrôles** :
   - Cliquer-glisser sur une boule pour viser
   - Relâcher pour tirer (puissance = distance)
   - Chat : Disponible en multijoueur

## 🎯 Règles du jeu

- **Objectif principal** : Faire tomber la boule rouge dans le trou central
- **Objectif secondaire** : Éliminer toutes les boules adverses
- **Tour par tour** : Les blancs commencent
- **Assistance** : Ligne de visée (désactivée en mode LEGEND)

## 🌐 Multijoueur P2P

1. **Héberger** :
   - Cliquer sur HÉBERGER
   - Copier l'ID généré
   - Partager avec un ami

2. **Rejoindre** :
   - Cliquer sur REJOINDRE
   - Coller l'ID de l'hôte
   - Cliquer sur SE CONNECTER

## 🏆 Niveaux de difficulté

- **NOOB** : Trou 50% plus grand, assistance complète
- **PRO** : Taille normale, assistance disponible
- **LEGEND** : Trou 25% plus petit, aucune assistance

## 🛠️ Technologies utilisées

- **HTML5 Canvas** : Rendu graphique
- **JavaScript ES6** : Modules et classes modernes
- **CSS3** : Animations et effets visuels
- **PeerJS** : Connexions P2P via WebRTC
- **Web Audio API** : Sons synthétisés

## 📈 Performances

- **60 FPS** : Animation fluide
- **Optimisé mobile** : Touch et responsive
- **Léger** : Aucune dépendance lourde
- **P2P** : Pas besoin de serveur dédié

## 🚧 Améliorations futures

- [ ] Mode tournoi
- [ ] Classements en ligne
- [ ] Plus de types de boules
- [ ] Effets de particules
- [ ] Replays de parties
- [ ] Support gamepad

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**Développé avec ❤️ et beaucoup de néon 🌟**