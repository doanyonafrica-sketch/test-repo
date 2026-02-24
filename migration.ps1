# 1. CRÉATION DES DOSSIERS CIBLES
$dossiers = @("html", "css", "java")
foreach ($d in $dossiers) {
    if (!(Test-Path $d)) {
        New-Item -ItemType Directory -Path $d | Out-Null
    }
}

# 2. DÉPLACEMENT DES FICHIERS (On trie tout ce qui est à la racine)
Write-Host "Rangement des fichiers en cours..." -ForegroundColor Yellow

# Déplace les HTML (Sauf fichiers systèmes et le dossier public)
Get-ChildItem -Path "." -Filter *.html | Where-Object { $_.FullName -notlike "*\public\*" } | Move-Item -Destination ".\html" -Force

# Déplace les CSS
Get-ChildItem -Path "." -Filter *.css | Move-Item -Destination ".\css" -Force

# Déplace les JS (Sauf les fichiers de config comme vite.config.js et ce script)
Get-ChildItem -Path "." -Filter *.js | Where-Object { $_.Name -notmatch "vite.config|migration" } | Move-Item -Destination ".\java" -Force

Write-Host "Rangement terminé." -ForegroundColor Green

# 3. CORRECTION DES LIENS DANS LES FICHIERS HTML
$fichiersHtml = Get-ChildItem -Path ".\html" -Filter *.html

foreach ($fichier in $fichiersHtml) {
    $contenu = Get-Content $fichier.FullName -Raw

    # A. Réparation CSS : remplace 'styles.css' par '../css/styles.css'
    # La regex ignore les liens HTTP et les chemins déjà corrigés
    $contenu = $contenu -replace 'href="(?![a-z]*/|http)([^"]+\.css)"', 'href="../css/$1"'

    # B. Réparation JS : remplace 'home.js' par '../java/home.js'
    $contenu = $contenu -replace 'src="(?![a-z]*/|http)([^"]+\.js)"', 'src="../java/$1"'

    # C. Réparation IMAGES : remplace 'logo.png' par '../images/logo.png'
    # Comme vos images sont déjà dans /images, on ajoute juste le ../ devant le chemin actuel
    # On gère les deux cas : src="images/logo.png" devient "../images/logo.png"
    # Et src="logo.png" devient "../images/logo.png"
    if ($contenu -match 'src="images/') {
        $contenu = $contenu -replace 'src="images/', 'src="../images/'
    } else {
        $contenu = $contenu -replace 'src="(?![a-z]*/|http)([^"]+\.(png|jpg|jpeg|ico|svg|gif))"', 'src="../images/$1"'
    }

    # D. Correction Favicons (très spécifique à votre fichier)
    $contenu = $contenu -replace 'href="/images/', 'href="../images/'

    # E. Liens entre pages HTML : ils sont tous dans /html maintenant
    # Si le lien était "contact.html", il reste "contact.html" (voisins)
    # On nettoie juste au cas où il y avait des "html/..." résiduels
    $contenu = $contenu -replace 'href="html/([^"]+\.html)"', 'href="$1"'

    # SAUVEGARDE PROPRE (Encodage UTF8 pour les accents)
    [System.IO.File]::WriteAllText($fichier.FullName, $contenu, [System.Text.Encoding]::UTF8)
    
    Write-Host "Fichier réparé : $($fichier.Name)" -ForegroundColor Cyan
}

Write-Host "`nMigration réussie, Monsieur Djone ! Tout est à sa place." -ForegroundColor Green