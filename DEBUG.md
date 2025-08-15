# 🔧 Guide de Debug - Billard Épique

## 🎯 Correction du décalage souris/boules

### Problème rencontré
Il y avait un décalage d'environ 5mm en diagonale entre l'endroit où on clique et la position réelle de la boule.

### Solution appliquée
1. **Calcul précis des coordonnées** : Prise en compte du ratio entre la taille réelle du canvas (912x532) et sa taille d'affichage CSS
2. **Compensation des bordures** : Les bordures et padding du canvas sont maintenant compensés
3. **Clamping des coordonnées** : S'assure que les coordonnées restent dans les limites du canvas

### Indicateur de debug
Pour vérifier la précision du clic :
- Cliquez n'importe où sur le canvas (pas sur une boule)
- Une croix rouge apparaît à l'endroit exact du clic
- Les coordonnées précises s'affichent à côté
- L'indicateur disparaît après 2 secondes

### Code ajouté
```javascript
function getCanvasCoordinates(e, rect) {
  // Calcule les coordonnées exactes en tenant compte :
  // - Du ratio canvas réel / CSS
  // - Des bordures et padding
  // - Du clamping dans les limites
}
```

### Test du décalage
1. Cliquez juste à côté d'une boule
2. La croix rouge doit apparaître exactement sous votre curseur
3. Si ce n'est pas le cas, vérifiez :
   - Le zoom du navigateur (doit être à 100%)
   - La résolution d'écran
   - Les paramètres d'accessibilité

### Ajustements CSS
- `object-fit: contain` : Maintient le ratio d'aspect
- `user-select: none` : Évite la sélection accidentelle
- `touch-action: none` : Améliore la réactivité tactile
