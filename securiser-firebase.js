#!/usr/bin/env node
/**
 * 🔒 SECURISER-FIREBASE.JS
 * Script d'automatisation pour extraire et sécuriser les clés API Firebase
 * 
 * Usage: node securiser-firebase.js [options]
 * Options:
 *   --init       : Créer la structure de configuration initiale
 *   --extract    : Extraire les clés des fichiers existants
 *   --replace    : Remplacer les clés par l'import externe
 *   --full       : Exécuter tout le processus (défaut)
 *   --dry-run    : Simuler sans modifier les fichiers
 *   --backup     : Créer des sauvegardes (.backup) avant modification
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    // Répertoires à scanner
    sourceDirs: ['.', './js', './src', './scripts'],
    
    // Fichiers à ignorer
    ignoreFiles: [
        'node_modules',
        'securiser-firebase.js',
        'firebase-config.js',
        '.env',
        '.git'
    ],
    
    // Extensions à scanner
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
    
    // Patterns de détection Firebase
    firebasePatterns: [
        /apiKey\s*:\s*["']AIza[a-zA-Z0-9_-]{35}["']/,
        /authDomain\s*:\s*["'][a-z0-9-]+\.firebaseapp\.com["']/,
        /projectId\s*:\s*["'][a-z0-9-]+["']/,
        /storageBucket\s*:\s*["'][a-z0-9-]+\.firebasestorage\.app["']/,
        /messagingSenderId\s*:\s*["']\d+["']/,
        /appId\s*:\s*["']1:\d+:web:[a-f0-9]+["']/
    ],
    
    // Template de configuration
    configTemplate: `// firebase-config.js - Configuration Firebase centralisée
// ⚠️ IMPORTANT: Ce fichier contient des clés sensibles
// Ne jamais commiter ce fichier avec de vraies clés en production
// Utiliser les variables d'environnement ou un gestionnaire de secrets

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "VOTRE_API_KEY",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "VOTRE_AUTH_DOMAIN",
    projectId: process.env.FIREBASE_PROJECT_ID || "VOTRE_PROJECT_ID",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "VOTRE_STORAGE_BUCKET",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "VOTRE_MESSAGING_SENDER_ID",
    appId: process.env.FIREBASE_APP_ID || "VOTRE_APP_ID"
};

// Validation en développement
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('🔧 Mode développement Firebase détecté');
}

export { firebaseConfig };
`,
    
    // Template .env
    envTemplate: `# Configuration Firebase ElectroInfo
# Copier ce fichier en .env.local et remplir avec vos vraies clés
# NE JAMAIS COMMITTER .env.local

# Firebase Configuration
FIREBASE_API_KEY=VOTRE_API_KEY_ICI
FIREBASE_AUTH_DOMAIN=VOTRE_PROJET.firebaseapp.com
FIREBASE_PROJECT_ID=VOTRE_PROJET
FIREBASE_STORAGE_BUCKET=VOTRE_PROJET.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=VOTRE_SENDER_ID
FIREBASE_APP_ID=1:VOTRE_SENDER_ID:web:VOTRE_APP_HASH

# Environment
NODE_ENV=development
`,
    
    // Template .gitignore
    gitignoreTemplate: `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.*.local
.env.production

# Firebase configuration with real keys
config/firebase-config.js
**/firebase-config.js

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Backups créées par le script
*.backup
*.backup.js
.backup/

# Build
dist/
build/
.cache/
`
};

// ============================================
// UTILITAIRES
// ============================================

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, type = 'info') {
    const colorMap = {
        info: colors.blue,
        success: colors.green,
        warning: colors.yellow,
        error: colors.red,
        header: colors.magenta + colors.bright
    };
    console.log(`${colorMap[type] || ''}${message}${colors.reset}`);
}

function createBackup(filePath) {
    const backupPath = `${filePath}.backup-${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
}

function findJsFiles(dir, files = []) {
    if (!fs.existsSync(dir)) return files;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        // Ignorer les fichiers/dossiers exclus
        if (CONFIG.ignoreFiles.some(ignore => fullPath.includes(ignore))) {
            continue;
        }
        
        if (stat.isDirectory()) {
            files = findJsFiles(fullPath, files);
        } else if (CONFIG.extensions.includes(path.extname(item))) {
            files.push(fullPath);
        }
    }
    
    return files;
}

function extractFirebaseConfig(content) {
    const config = {};
    const patterns = {
        apiKey: /apiKey\s*:\s*["']([^"']+)["']/,
        authDomain: /authDomain\s*:\s*["']([^"']+)["']/,
        projectId: /projectId\s*:\s*["']([^"']+)["']/,
        storageBucket: /storageBucket\s*:\s*["']([^"']+)["']/,
        messagingSenderId: /messagingSenderId\s*:\s*["']([^"']+)["']/,
        appId: /appId\s*:\s*["']([^"']+)["']/
    };
    
    for (const [key, pattern] of Object.entries(patterns)) {
        const match = content.match(pattern);
        if (match) config[key] = match[1];
    }
    
    return Object.keys(config).length === 6 ? config : null;
}

// ============================================
// COMMANDES
// ============================================

async function initStructure(dryRun = false) {
    log('\n📁 INITIALISATION DE LA STRUCTURE', 'header');
    
    const dirs = ['config', 'js', 'backup'];
    
    for (const dir of dirs) {
        if (!fs.existsSync(dir)) {
            if (!dryRun) {
                fs.mkdirSync(dir, { recursive: true });
            }
            log(`  ✅ Dossier créé: ${dir}`, 'success');
        } else {
            log(`  ℹ️  Dossier existe: ${dir}`, 'info');
        }
    }
    
    // Créer firebase-config.js.example
    const examplePath = 'config/firebase-config.example.js';
    if (!fs.existsSync(examplePath) || dryRun) {
        if (!dryRun) {
            fs.writeFileSync(examplePath, CONFIG.configTemplate);
        }
        log(`  ✅ Template créé: ${examplePath}`, 'success');
    }
    
    // Créer .env.example
    if (!fs.existsSync('.env.example') || dryRun) {
        if (!dryRun) {
            fs.writeFileSync('.env.example', CONFIG.envTemplate);
        }
        log(`  ✅ Template créé: .env.example`, 'success');
    }
    
    // Créer .gitignore
    if (!fs.existsSync('.gitignore') || dryRun) {
        if (!dryRun) {
            fs.writeFileSync('.gitignore', CONFIG.gitignoreTemplate);
        }
        log(`  ✅ Fichier créé: .gitignore`, 'success');
    } else {
        // Vérifier si firebase-config.js est dans .gitignore
        const gitignore = fs.readFileSync('.gitignore', 'utf8');
        if (!gitignore.includes('firebase-config.js')) {
            log(`  ⚠️  Attention: firebase-config.js n'est pas dans .gitignore`, 'warning');
            if (!dryRun) {
                fs.appendFileSync('.gitignore', '\n# Firebase config\nconfig/firebase-config.js\n');
                log(`  ✅ Mise à jour de .gitignore`, 'success');
            }
        }
    }
    
    // Créer README
    const readmePath = 'README-SECURISATION.md';
    if (!fs.existsSync(readmePath) || dryRun) {
        const readme = `# 🔒 Sécurisation Firebase - ElectroInfo

## Fichiers créés

- \`config/firebase-config.js\` - Configuration centralisée (NE PAS COMMITTER)
- \`config/firebase-config.example.js\` - Template avec fausses valeurs
- \`.env.example\` - Template pour variables d'environnement
- \`.gitignore\` - Exclusion des fichiers sensibles

## Installation

1. Copier le template de configuration :
   \`\`\`bash
   cp config/firebase-config.example.js config/firebase-config.js
   \`\`\`

2. Remplacer les valeurs par vos vraies clés Firebase dans \`config/firebase-config.js\`

3. Ou utiliser les variables d'environnement (recommandé pour CI/CD) :
   \`\`\`bash
   cp .env.example .env.local
   # Éditer .env.local avec vos clés
   \`\`\`

## Développement

Les fichiers JavaScript importent maintenant :
\`\`\`javascript
import { firebaseConfig } from './config/firebase-config.js';
\`\`\`

## Production

Pour la production, utiliser un gestionnaire de secrets (GitHub Secrets, Vercel, etc.)
`;
        if (!dryRun) {
            fs.writeFileSync(readmePath, readme);
        }
        log(`  ✅ Documentation créée: ${readmePath}`, 'success');
    }
}

async function extractKeys(dryRun = false) {
    log('\n🔍 EXTRACTION DES CLÉS FIREBASE', 'header');
    
    const allFiles = [];
    for (const dir of CONFIG.sourceDirs) {
        allFiles.push(...findJsFiles(dir));
    }
    
    log(`  📄 ${allFiles.length} fichiers JavaScript trouvés`, 'info');
    
    const foundConfigs = [];
    const filesWithKeys = [];
    
    for (const file of allFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const config = extractFirebaseConfig(content);
        
        if (config) {
            foundConfigs.push(config);
            filesWithKeys.push(file);
            log(`  🔑 Clés trouvées dans: ${file}`, 'success');
        }
    }
    
    if (foundConfigs.length === 0) {
        log('  ❌ Aucune clé Firebase trouvée', 'error');
        return null;
    }
    
    // Vérifier la cohérence
    const firstConfig = foundConfigs[0];
    const allSame = foundConfigs.every(c => 
        c.apiKey === firstConfig.apiKey &&
        c.projectId === firstConfig.projectId
    );
    
    if (!allSame) {
        log('  ⚠️  ATTENTION: Plusieurs configurations Firebase différentes détectées!', 'warning');
        foundConfigs.forEach((c, i) => {
            log(`     [${i}] ${c.projectId} dans ${filesWithKeys[i]}`, 'warning');
        });
    }
    
    // Sauvegarder la configuration extraite
    const extractedPath = 'config/firebase-config.extracted.js';
    if (!dryRun) {
        const extractedContent = CONFIG.configTemplate.replace(
            /VOTRE_API_KEY/g, firstConfig.apiKey
        ).replace(
            /VOTRE_AUTH_DOMAIN/g, firstConfig.authDomain
        ).replace(
            /VOTRE_PROJECT_ID/g, firstConfig.projectId
        ).replace(
            /VOTRE_STORAGE_BUCKET/g, firstConfig.storageBucket
        ).replace(
            /VOTRE_MESSAGING_SENDER_ID/g, firstConfig.messagingSenderId
        ).replace(
            /VOTRE_APP_ID/g, firstConfig.appId
        );
        
        fs.writeFileSync(extractedPath, extractedContent);
    }
    
    log(`  💾 Configuration extraite: ${extractedPath}`, 'success');
    
    return {
        config: firstConfig,
        files: filesWithKeys
    };
}

async function replaceKeys(extractedData, dryRun = false, createBackups = false) {
    if (!extractedData) {
        log('  ❌ Aucune donnée extraite. Exécuter --extract d\'abord.', 'error');
        return;
    }
    
    log('\n🔄 REMPLACEMENT DES CLÉS', 'header');
    
    const { files } = extractedData;
    const importStatement = `import { firebaseConfig } from './config/firebase-config.js';`;
    
    let modifiedCount = 0;
    
    for (const file of files) {
        let content = fs.readFileSync(file, 'utf8');
        const originalContent = content;
        
        // Vérifier si déjà modifié
        if (content.includes('firebase-config.js')) {
            log(`  ⏭️  Déjà sécurisé: ${file}`, 'info');
            continue;
        }
        
        // Créer backup si demandé
        if (createBackups && !dryRun) {
            const backup = createBackup(file);
            log(`  💾 Backup créé: ${backup}`, 'info');
        }
        
        // Supprimer l'ancienne configuration firebaseConfig inline
        const configRegex = /const\s+firebaseConfig\s*=\s*\{[\s\S]*?apiKey[\s\S]*?\};\s*/;
        content = content.replace(configRegex, '');
        
        // Supprimer aussi les configurations avec const app = initializeApp({...})
        const inlineConfigRegex = /const\s+(?:app|firebaseApp)\s*=\s*initializeApp\s*\(\s*\{[\s\S]*?apiKey[\s\S]*?\}\s*\)\s*;?\s*/;
        content = content.replace(inlineConfigRegex, '');
        
        // Ajouter l'import en début de fichier (après les imports existants)
        const importLines = content.match(/import\s+.*?from\s+['"][^'"]+['"]\s*;?/g) || [];
        const lastImport = importLines[importLines.length - 1];
        
        if (lastImport) {
            const lastImportIndex = content.lastIndexOf(lastImport) + lastImport.length;
            content = content.slice(0, lastImportIndex) + 
                      '\n' + importStatement + 
                      content.slice(lastImportIndex);
        } else {
            // Pas d'imports existants, ajouter au début
            content = importStatement + '\n' + content;
        }
        
        // Remplacer initializeApp({...}) par initializeApp(firebaseConfig)
        content = content.replace(
            /initializeApp\s*\(\s*\{[\s\S]*?\}\s*\)/g,
            'initializeApp(firebaseConfig)'
        );
        
        // Nettoyer les espaces multiples
        content = content.replace(/\n{3,}/g, '\n\n');
        
        if (content !== originalContent) {
            if (!dryRun) {
                fs.writeFileSync(file, content);
            }
            modifiedCount++;
            log(`  ✅ Modifié: ${file}`, 'success');
        }
    }
    
    log(`\n📊 ${modifiedCount} fichiers modifiés`, modifiedCount > 0 ? 'success' : 'warning');
}

async function verifySetup() {
    log('\n✅ VÉRIFICATION', 'header');
    
    const checks = [
        { path: 'config', type: 'directory', name: 'Dossier config' },
        { path: 'config/firebase-config.example.js', type: 'file', name: 'Template config' },
        { path: '.env.example', type: 'file', name: 'Template .env' },
        { path: '.gitignore', type: 'file', name: 'Gitignore' }
    ];
    
    for (const check of checks) {
        const exists = fs.existsSync(check.path);
        const status = exists ? '✅' : '❌';
        const color = exists ? 'success' : 'error';
        log(`  ${status} ${check.name}: ${check.path}`, color);
    }
    
    // Vérifier les fichiers JS restants avec clés en dur
    log('\n  🔍 Scan des clés restantes...', 'info');
    const allFiles = [];
    for (const dir of CONFIG.sourceDirs) {
        allFiles.push(...findJsFiles(dir));
    }
    
    let remainingKeys = 0;
    for (const file of allFiles) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('AIza') && !content.includes('firebase-config.js')) {
            log(`  ⚠️  Clés potentielles dans: ${file}`, 'warning');
            remainingKeys++;
        }
    }
    
    if (remainingKeys === 0) {
        log('  ✅ Aucune clé API exposée détectée!', 'success');
    } else {
        log(`  ⚠️  ${remainingKeys} fichier(s) peuvent contenir encore des clés`, 'warning');
    }
}

// ============================================
// INTERFACE CLI
// ============================================

function showHelp() {
    console.log(`
${colors.cyan}${colors.bright}🔒 SECURISER-FIREBASE.JS${colors.reset}

Usage: node securiser-firebase.js [commande] [options]

Commandes:
  init        Créer la structure de configuration
  extract     Extraire les clés des fichiers existants
  replace     Remplacer les clés par l'import externe
  verify      Vérifier la configuration
  full        Exécuter tout le processus (défaut)

Options:
  --dry-run   Simuler sans modifier les fichiers
  --backup    Créer des sauvegardes avant modification
  --help      Afficher cette aide

Exemples:
  node securiser-firebase.js --help
  node securiser-firebase.js init
  node securiser-firebase.js full --backup
  node securiser-firebase.js extract --dry-run
`);
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        showHelp();
        return;
    }
    
    const dryRun = args.includes('--dry-run');
    const backup = args.includes('--backup');
    
    let command = 'full';
    const commands = ['init', 'extract', 'replace', 'verify', 'full'];
    for (const cmd of commands) {
        if (args.includes(cmd)) {
            command = cmd;
            break;
        }
    }
    
    log(`\n${'='.repeat(60)}`, 'header');
    log('🔒 SÉCURISATION FIREBASE - ELECTROINFO', 'header');
    log(`${'='.repeat(60)}\n`, 'header');
    
    if (dryRun) {
        log('⚠️  MODE SIMULATION (--dry-run) - Aucun fichier ne sera modifié\n', 'warning');
    }
    
    let extractedData = null;
    
    try {
        switch (command) {
            case 'init':
                await initStructure(dryRun);
                break;
                
            case 'extract':
                extractedData = await extractKeys(dryRun);
                break;
                
            case 'replace':
                // Charger les données précédemment extraites si disponibles
                const extractedPath = 'config/firebase-config.extracted.js';
                if (fs.existsSync(extractedPath)) {
                    const content = fs.readFileSync(extractedPath, 'utf8');
                    const config = extractFirebaseConfig(content);
                    if (config) {
                        extractedData = { config, files: [] }; // files sera détecté dynamiquement
                        // Retrouver les fichiers
                        const allFiles = [];
                        for (const dir of CONFIG.sourceDirs) {
                            allFiles.push(...findJsFiles(dir));
                        }
                        extractedData.files = allFiles.filter(f => {
                            const c = fs.readFileSync(f, 'utf8');
                            return extractFirebaseConfig(c) !== null;
                        });
                    }
                }
                await replaceKeys(extractedData, dryRun, backup);
                break;
                
            case 'verify':
                await verifySetup();
                break;
                
            case 'full':
            default:
                await initStructure(dryRun);
                extractedData = await extractKeys(dryRun);
                await replaceKeys(extractedData, dryRun, backup);
                await verifySetup();
                break;
        }
        
        log(`\n${'='.repeat(60)}`, 'header');
        log('✅ TRAITEMENT TERMINÉ', 'success');
        log(`${'='.repeat(60)}\n`, 'header');
        
        if (command === 'full' || command === 'extract') {
            log('📋 Prochaines étapes:', 'info');
            log('   1. Vérifier config/firebase-config.extracted.js', 'info');
            log('   2. Renommer en firebase-config.js', 'info');
            log('   3. Tester l\'application', 'info');
            log('   4. Committer les changements (sans firebase-config.js)', 'info');
        }
        
    } catch (error) {
        log(`\n❌ ERREUR: ${error.message}`, 'error');
        console.error(error);
        process.exit(1);
    }
}

main();