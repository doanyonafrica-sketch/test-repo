# ============================================
# SCRIPT DE SECURISATION DES CLES API - V3
# ============================================

Write-Host "Securisation en cours..." -ForegroundColor Green

# 1. REMPLACER TOUTES LES CLES
Write-Host "`nRemplacement des cles..." -ForegroundColor Yellow

Get-ChildItem -Path "." -Recurse -Filter "*.js" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $modified = $false
    
    # FIREBASE - tous les patterns trouves
    if ($content -match "PLACEHOLDER_FIREBASE") {
        $content = $content -replace '"PLACEHOLDER_FIREBASE_API_KEY"', 'process.env.REACT_APP_FIREBASE_API_KEY'
        $content = $content -replace '"PLACEHOLDER_FIREBASE_AUTH_DOMAIN"', 'process.env.REACT_APP_FIREBASE_AUTH_DOMAIN'
        $content = $content -replace '"PLACEHOLDER_FIREBASE_PROJECT_ID"', 'process.env.REACT_APP_FIREBASE_PROJECT_ID'
        $content = $content -replace '"PLACEHOLDER_FIREBASE_STORAGE_BUCKET"', 'process.env.REACT_APP_FIREBASE_STORAGE_BUCKET'
        $content = $content -replace '"PLACEHOLDER_FIREBASE_MESSAGING_SENDER_ID"', 'process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID'
        $content = $content -replace '"PLACEHOLDER_FIREBASE_APP_ID"', 'process.env.REACT_APP_FIREBASE_APP_ID'
        $content = $content -replace '"PLACEHOLDER_FIREBASE_MEASUREMENT_ID"', 'process.env.REACT_APP_FIREBASE_MEASUREMENT_ID'
        $modified = $true
    }
    
    # IMAGES (si besoin)
    if ($content -match "PLACEHOLDER_IMAGE") {
        $content = $content -replace "'PLACEHOLDER_IMAGE'", 'process.env.REACT_APP_IMAGE_URL'
        $modified = $true
    }
    
    # OPENAI (si present)
    if ($content -match "PLACEHOLDER_OPENAI") {
        $content = $content -replace '"PLACEHOLDER_OPENAI_API_KEY"', 'process.env.REACT_APP_OPENAI_API_KEY'
        $modified = $true
    }
    
    if ($modified) {
        Set-Content $_.FullName $content
        Write-Host "  OK: $($_.Name)" -ForegroundColor Green
    }
}

# 2. CREER LE FICHIER .ENV
Write-Host "`nCreation du fichier .env..." -ForegroundColor Yellow
$envContent = @'
REACT_APP_FIREBASE_API_KEY=ta_cle_firebase_ici
REACT_APP_FIREBASE_AUTH_DOMAIN=ton-projet.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=ton-projet
REACT_APP_FIREBASE_STORAGE_BUCKET=ton-projet.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
REACT_APP_IMAGE_URL=https://ton-image.com
REACT_APP_OPENAI_API_KEY=ta_cle_openai_ici
'@

$envContent | Out-File -FilePath ".env" -Encoding utf8
Write-Host "  OK: .env cree" -ForegroundColor Green

# 3. CREER .GITIGNORE
Write-Host "`nCreation du .gitignore..." -ForegroundColor Yellow
$gitignoreContent = @'
.env
.env.local
.env.development
.env.production
node_modules/
'@

$gitignoreContent | Out-File -FilePath ".gitignore" -Encoding utf8
Write-Host "  OK: .gitignore cree" -ForegroundColor Green

Write-Host "`nTERMINE !" -ForegroundColor Green
Write-Host "Prochaines etapes:" -ForegroundColor Cyan
Write-Host "1. Remplis le fichier .env avec tes VRAIES cles"
Write-Host "2. Revoke les anciennes cles"
Write-Host "3. Redemarre: npm start"