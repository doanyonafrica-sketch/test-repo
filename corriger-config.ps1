Write-Host "Correction des fichiers JS pour CONFIG..." -ForegroundColor Green

$files = Get-ChildItem -Path "." -Recurse -Filter "*.js" -File

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    if ($content -match "process\.env\.REACT_APP_FIREBASE") {
        Write-Host "Correction: $($file.Name)" -ForegroundColor Yellow
        
        $content = $content -replace 'process\.env\.REACT_APP_FIREBASE_API_KEY', 'CONFIG.FIREBASE_API_KEY'
        $content = $content -replace 'process\.env\.REACT_APP_FIREBASE_AUTH_DOMAIN', 'CONFIG.FIREBASE_AUTH_DOMAIN'
        $content = $content -replace 'process\.env\.REACT_APP_FIREBASE_PROJECT_ID', 'CONFIG.FIREBASE_PROJECT_ID'
        $content = $content -replace 'process\.env\.REACT_APP_FIREBASE_STORAGE_BUCKET', 'CONFIG.FIREBASE_STORAGE_BUCKET'
        $content = $content -replace 'process\.env\.REACT_APP_FIREBASE_MESSAGING_SENDER_ID', 'CONFIG.FIREBASE_MESSAGING_SENDER_ID'
        $content = $content -replace 'process\.env\.REACT_APP_FIREBASE_APP_ID', 'CONFIG.FIREBASE_APP_ID'
        $content = $content -replace 'process\.env\.REACT_APP_FIREBASE_MEASUREMENT_ID', 'CONFIG.FIREBASE_MEASUREMENT_ID'
        $content = $content -replace 'process\.env\.REACT_APP_OPENAI_API_KEY', 'CONFIG.OPENAI_API_KEY'
        $content = $content -replace 'process\.env\.REACT_APP_IMAGE_URL', 'CONFIG.IMAGE_URL'
        
        Set-Content $file.FullName $content -NoNewline
        Write-Host "  OK!" -ForegroundColor Green
    }
}

Write-Host "`nTERMINE!" -ForegroundColor Green
Write-Host "N'oublie pas:" -ForegroundColor Yellow
Write-Host "1. Creer config.js avec tes vraies cles" -ForegroundColor White
Write-Host "2. Ajouter config.js dans .gitignore" -ForegroundColor White
Write-Host "3. Ajouter <script src='config.js'></script> dans tes fichiers HTML" -ForegroundColor White