# 🔒 Sécurisation Firebase - ElectroInfo

## Fichiers créés

- `config/firebase-config.js` - Configuration centralisée (NE PAS COMMITTER)
- `config/firebase-config.example.js` - Template avec fausses valeurs
- `.env.example` - Template pour variables d'environnement
- `.gitignore` - Exclusion des fichiers sensibles

## Installation

1. Copier le template de configuration :
   ```bash
   cp config/firebase-config.example.js config/firebase-config.js
   ```

2. Remplacer les valeurs par vos vraies clés Firebase dans `config/firebase-config.js`

3. Ou utiliser les variables d'environnement (recommandé pour CI/CD) :
   ```bash
   cp .env.example .env.local
   # Éditer .env.local avec vos clés
   ```

## Développement

Les fichiers JavaScript importent maintenant :
```javascript
import { firebaseConfig } from './config/firebase-config.js';
```

## Production

Pour la production, utiliser un gestionnaire de secrets (GitHub Secrets, Vercel, etc.)
