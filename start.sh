#!/bin/bash

# Script de démarrage du jeu Billard Épique

echo "🎱 Démarrage du serveur Billard Épique..."
echo ""
echo "📌 Le jeu sera accessible à : http://localhost:8000/"
echo "📌 Pour arrêter le serveur : Ctrl+C"
echo ""
echo "🚀 Lancement du serveur..."

# Démarrer le serveur Python
python3 -m http.server 8000
