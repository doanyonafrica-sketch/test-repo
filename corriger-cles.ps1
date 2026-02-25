# ============================================
# SCRIPT DE CORRECTION DES CLÉS API
# ============================================

Write-Host "Correction des fichiers JS..." -ForegroundColor Green

# Liste des fichiers à corriger
$files = @("about.js", "admin.js", "app.js")

foreach ($file in $files) {
    Write-Host "`nTraitement de $file..." -ForegroundColor Yellow
    
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # CORRECTION 1: Remplacer la ligne apiKey erronée
        # Pattern: apiKey: apiKey: "AlzaSy..." (avec n'importe quelle clé)
        $pattern = 'apiKey:\s*apiKey:\s*"[^"]*"'
        $replacement = 'apiKey: process.env.REACT_APP_FIREBASE_API_KEY'
        
        if ($content -match $pattern) {
            $content = $content -replace $pattern, $replacement
            Set-Content $file $content -NoNewline
            Write-Host "  ✅ Corrigé!" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️ Pattern non trouvé (déjà corrigé?)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "  ❌ Fichier non trouvé" -ForegroundColor Red
    }
}

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "TERMINE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

# Vérification
Write-Host "`nVerification des fichiers:" -ForegroundColor Cyan
foreach ($file in $files) {
    if (Test-Path $file) {
        $check = Get-Content $file -Raw
        if ($check -match "process.env.REACT_APP_FIREBASE_API_KEY") {
            Write-Host "  ✅ $file - OK" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $file - Toujours une erreur" -ForegroundColor Red
        }
    }
}

Write-Host "`nProchaines etapes:" -ForegroundColor Yellow
Write-Host "1. Remplis le fichier .env avec ta NOUVELLE clé Firebase" -ForegroundColor White
Write-Host "2. Revoke l'ancienne clé exposee dans Firebase Console" -ForegroundColor White
Write-Host "3. Redemarre: npm start" -ForegroundColor White