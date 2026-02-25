# ============================================
# SCRIPT DE CORRECTION MASSIVE DES CLES API
# ============================================

Write-Host "Recherche de tous les fichiers JS avec des cles API..." -ForegroundColor Green

# Trouver TOUS les fichiers JS dans le projet (récursivement)
$allJsFiles = Get-ChildItem -Path "." -Recurse -Filter "*.js" -File
$correctedFiles = @()
$alreadyCorrect = @()

foreach ($file in $allJsFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Verifier si le fichier contient une config Firebase avec erreur
    if ($content -match 'apiKey:\s*apiKey:\s*"[^"]*"') {
        
        Write-Host "`nCorrection: $($file.FullName)" -ForegroundColor Yellow
        
        # CORRECTION: Remplacer la ligne apiKey erronnee
        $content = $content -replace 'apiKey:\s*apiKey:\s*"[^"]*"', 'apiKey: process.env.REACT_APP_FIREBASE_API_KEY'
        
        # CORRECTION: Remplacer aussi les autres champs Firebase s'ils sont en dur
        $content = $content -replace 'authDomain:\s*"[^"]*"', 'authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN'
        $content = $content -replace 'projectId:\s*"[^"]*"', 'projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID'
        $content = $content -replace 'storageBucket:\s*"[^"]*"', 'storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET'
        $content = $content -replace 'messagingSenderId:\s*"[^"]*"', 'messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID'
        $content = $content -replace 'appId:\s*"[^"]*"', 'appId: process.env.REACT_APP_FIREBASE_APP_ID'
        
        Set-Content $file.FullName $content -NoNewline
        $correctedFiles += $file.FullName
        Write-Host "  OK - Corrige!" -ForegroundColor Green
        
    } elseif ($content -match "process\.env\.REACT_APP_FIREBASE") {
        # Deja corrige
        $alreadyCorrect += $file.FullName
    }
}

# ============================================
# RESULTATS
# ============================================
Write-Host "`n============================================" -ForegroundColor Green
Write-Host "RESULTATS" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

Write-Host "`nFichiers corriges ($($correctedFiles.Count)):" -ForegroundColor Green
$correctedFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }

Write-Host "`nDeja corrects ($($alreadyCorrect.Count)):" -ForegroundColor Cyan
$alreadyCorrect | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }

# Creer le fichier .env s'il n'existe pas
if (-not (Test-Path ".env")) {
    Write-Host "`nCreation du fichier .env..." -ForegroundColor Yellow
    $envContent = @'
REACT_APP_FIREBASE_API_KEY=ta_cle_firebase_ici
REACT_APP_FIREBASE_AUTH_DOMAIN=ton-projet.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=ton-projet
REACT_APP_FIREBASE_STORAGE_BUCKET=ton-projet.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
'@
    $envContent | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "  OK - .env cree!" -ForegroundColor Green
}

# Creer/mettre a jour .gitignore
$gitignoreContent = @'
.env
.env.local
.env.development
.env.production
node_modules/
'@
$gitignoreContent | Out-File -FilePath ".gitignore" -Encoding utf8
Write-Host "  OK - .gitignore mis a jour!" -ForegroundColor Green

Write-Host "`n============================================" -ForegroundColor Yellow
Write-Host "PROCHAINES ETAPES:" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow
Write-Host "1. Verifie que tout fonctionne: npm start" -ForegroundColor White
Write-Host "2. Remplis le fichier .env avec tes VRAIES cles" -ForegroundColor White
Write-Host "3. Revoke les anciennes cles dans Firebase Console" -ForegroundColor Red
Write-Host "4. Teste en local avant de deployer" -ForegroundColor White