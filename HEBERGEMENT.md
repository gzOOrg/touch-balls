# 🌐 Guide d'hébergement du jeu

## Option 1 : GitHub Pages (Recommandé)
**Gratuit, rapide, intégré à GitHub**

1. Repository Settings → Pages
2. Source : main branch / (root)
3. URL : https://gzorg-zog.github.io/touch-balls/

## Option 2 : Netlify
**Gratuit, déploiement automatique**

1. Créer compte sur netlify.com
2. Glisser-déposer le dossier du projet
3. URL instantanée : https://ton-jeu.netlify.app

## Option 3 : Vercel
**Gratuit, très rapide**

1. Installer Vercel CLI : `npm i -g vercel`
2. Dans le dossier : `vercel`
3. URL : https://ton-jeu.vercel.app

## Option 4 : Surge.sh
**Super simple**

```bash
npm install -g surge
cd /chemin/vers/billard
surge
# Choisir un nom : billard-epique.surge.sh
```

## Option 5 : Firebase Hosting
**Par Google, gratuit**

```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

## 📱 QR Code pour mobile

Une fois hébergé, génère un QR code sur :
- https://qr-code-generator.com
- Colle ton URL
- Tes amis scannent = jouent instantanément !

## 🔒 Rendre le repo privé/public

### Repo PUBLIC (actuel) :
- ✅ Tout le monde peut voir le code
- ✅ GitHub Pages fonctionne
- ✅ Contributions possibles

### Repo PRIVÉ :
- ❌ GitHub Pages nécessite un compte Pro
- ✅ Code protégé
- ✅ Netlify/Vercel fonctionnent quand même

## 💡 Conseils

1. **Teste toujours** avant de partager
2. **README.md** bien documenté = plus de ⭐
3. **Issues** activées = feedback des joueurs
4. **License MIT** = libre utilisation

## 🚀 Commandes rapides

```bash
# Pousser une mise à jour
git add .
git commit -m "Nouvelle fonctionnalité"
git push

# GitHub Pages se met à jour automatiquement !
```
