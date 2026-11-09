# Gestion des boxes · concours

Application web pour répartir les chevaux d'un concours dans les boxes :
import CSV → groupes par club → plan des boxes → écuries.

## Structure

```
index.html            page principale (structure HTML)
css/style.css         mise en forme
js/concours.js        plusieurs concours, historique, rappels de sauvegarde
js/app.js             logique : import, groupes, placement, exports, sauvegarde
sw.js                 fonctionnement hors ligne (cache)
manifest.webmanifest  permet d'« installer » l'app depuis Chrome / Edge
icon.svg              icône
.vscode/              réglages VS Code (extension Live Server recommandée)
```

## Travailler avec VS Code

1. Ouvrir ce dossier dans VS Code (Fichier › Ouvrir le dossier…).
2. Accepter l'extension recommandée **Live Server** (ou la chercher dans Extensions).
3. Clic droit sur `index.html` › **Open with Live Server** (ou bouton « Go Live » en bas à droite).
4. Le site s'ouvre sur http://127.0.0.1:5500 et se recharge à chaque enregistrement.

Sans VS Code, un double-clic sur `index.html` fonctionne aussi.

## Concours et données

- **Mes concours** : créer, ouvrir, renommer, dupliquer ou supprimer un concours,
  et importer une sauvegarde `.json` comme nouveau concours.
- **Historique** : un point de restauration est créé toutes les 5 minutes s'il y a
  eu des changements, à l'ouverture et avant chaque changement de concours.
  Les 40 derniers points sont gardés ; chacun peut être restauré ou téléchargé.
- **Rappel** : un bandeau rappelle de télécharger une sauvegarde `.json` quand il y a
  des changements non sauvegardés depuis plus de 2 h. En ligne (pas en local),
  le navigateur avertit aussi si on ferme la page dans ce cas.
- **Hors ligne** : une fois le site ouvert une première fois (via http, pas en
  double-clic), il fonctionne sans internet.
- Tout est enregistré dans le navigateur. Les données dépendent de l'adresse du
  site : Live Server (127.0.0.1:5500), double-clic (file://) et GitHub Pages ont
  chacun leurs propres données. Passer de l'un à l'autre avec une sauvegarde `.json`.
- Les données de l'ancienne version sont reprises automatiquement dans
  « Concours actuel ».
