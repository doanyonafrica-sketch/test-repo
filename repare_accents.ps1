$dossierHtml = ".\html"
$fichiers = Get-ChildItem -Path $dossierHtml -Filter *.html

foreach ($fichier in $fichiers) {
    # On lit le fichier en forçant la lecture des caractères spéciaux
    $contenu = [System.IO.File]::ReadAllText($fichier.FullName)

    # Sauvegarde forcée en UTF8 avec BOM (ce qui aide Windows à reconnaître les accents)
    $utf8EmitBOM = New-Object System.Text.UTF8Encoding $true
    [System.IO.File]::WriteAllText($fichier.FullName, $contenu, $utf8EmitBOM)
    
    Write-Host "Accents stabilisés pour : $($fichier.Name)" -ForegroundColor Cyan
}