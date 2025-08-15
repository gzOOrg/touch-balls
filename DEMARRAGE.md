# 🎮 Guide de démarrage rapide

## ❌ Problème : CORS / Cross-Origin

Tu as eu cette erreur car tu as essayé d'ouvrir `billard.html` directement depuis l'explorateur de fichiers. Les modules ES6 nécessitent un serveur HTTP pour fonctionner.

## ✅ Solution : Utiliser un serveur local

### Option 1 : Script automatique (recommandé)
```bash
./start.sh
```

### Option 2 : Commande manuelle
```bash
python3 -m http.server 8000
```

### Option 3 : Autres serveurs
```bash
# Si tu as Node.js
npx http-server -p 8000

# Si tu as PHP
php -S localhost:8000
```

## 🌐 Accéder au jeu

Une fois le serveur lancé, ouvre ton navigateur à :
- **http://localhost:8000/**
- ou **http://localhost:8000/billard.html**

## 🔴 IMPORTANT

**NE PAS** ouvrir le fichier ainsi :
- ❌ Double-clic sur `billard.html`
- ❌ `file:///chemin/vers/billard.html`
- ❌ Glisser-déposer dans le navigateur

**TOUJOURS** utiliser :
- ✅ `http://localhost:8000/`
- ✅ Un serveur HTTP

## 💡 Pourquoi cette erreur ?

Les navigateurs bloquent le chargement de modules JavaScript depuis `file://` pour des raisons de sécurité. C'est une protection contre les scripts malveillants qui pourraient accéder à ton système de fichiers.

## 🚀 Lancement rapide

1. Ouvre un terminal dans le dossier du projet
2. Lance : `./start.sh` ou `python3 -m http.server 8000`
3. Ouvre : http://localhost:8000/
4. Joue ! 🎱
