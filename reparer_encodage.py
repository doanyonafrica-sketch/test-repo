#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de réparation d'encodage pour fichiers HTML
Résout le problème de mojibake (UTF-8 interprété comme Latin-1)
"""

import os
import sys
import glob

def fix_mojibake(text):
    """
    Répare le mojibake (caractères bizarres dus à un double encodage UTF-8 → Latin-1)
    """
    replacements = {
        'Ã©': 'é', 'Ã¨': 'è', 'Ã ': 'à', 'Ã´': 'ô', 'Ãª': 'ê',
        'Ã§': 'ç', 'Ã¹': 'ù', 'Ã¢': 'â', 'Ã®': 'î', 'Ã¯': 'ï',
        'Ã«': 'ë', 'Ã¼': 'ü', 'Ã¶': 'ö', 'Ã¤': 'ä', 'ÃŸ': 'ß',
        'Ã€': 'À', 'Ã‰': 'É', 'Ãˆ': 'È', 'ÃŠ': 'Ê', 'Ã‡': 'Ç',
        'Ã”': 'Ô', 'Ã›': 'Û', 'Å“': 'œ', 'ÅŸ': 'ş',
        'â€™': "'", 'â€"': '"', 'â€“': '-', 'â€¢': '•',
        'â€¦': '…', 'â€œ': '"', 'â€': '"', 'Â°': '°',
        'Ã¡': 'á', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
        'Ã½': 'ý', 'Ã¿': 'ÿ', 'Ã°': 'ð', 'Ã±': 'ñ',
        'Ã†': 'Æ', 'Ã˜': 'Ø', 'Ã…': 'Å', 'Ã‹': 'Ë',
        'Ã�': 'Ï', 'Ã–': 'Ö', 'Ãœ': 'Ü', 'Ãƒ': 'Ã',
        'Ã ': 'à', 'Ã¡': 'á', 'Ã¢': 'â', 'Ã£': 'ã',
        'Ã¤': 'ä', 'Ã¥': 'å', 'Ã¦': 'æ', 'Ã¨': 'è',
        'Ã©': 'é', 'Ãª': 'ê', 'Ã«': 'ë', 'Ã¬': 'ì',
        'Ã­': 'í', 'Ã®': 'î', 'Ã¯': 'ï', 'Ã°': 'ð',
        'Ã±': 'ñ', 'Ã²': 'ò', 'Ã³': 'ó', 'Ã´': 'ô',
        'Ãµ': 'õ', 'Ã¶': 'ö', 'Ã·': '÷', 'Ã¸': 'ø',
        'Ã¹': 'ù', 'Ãº': 'ú', 'Ã»': 'û', 'Ã¼': 'ü',
        'Ã½': 'ý', 'Ã¾': 'þ', 'Ã¿': 'ÿ', 'Ã€': 'À',
        'Ã�': 'Á', 'Ã‚': 'Â', 'Ãƒ': 'Ã', 'Ã„': 'Ä',
        'Ã…': 'Å', 'Ã†': 'Æ', 'Ã‡': 'Ç', 'Ãˆ': 'È',
        'Ã‰': 'É', 'ÃŠ': 'Ê', 'Ã‹': 'Ë', 'ÃŒ': 'Ì',
        'Ã�': 'Í', 'ÃŽ': 'Î', 'Ã�': 'Ï', 'Ã�': 'Ð',
        'Ã‘': 'Ñ', 'Ã’': 'Ò', 'Ã“': 'Ó', 'Ã”': 'Ô',
        'Ã•': 'Õ', 'Ã–': 'Ö', 'Ã—': '×', 'Ã˜': 'Ø',
        'Ã™': 'Ù', 'Ãš': 'Ú', 'Ã›': 'Û', 'Ãœ': 'Ü',
        'Ã�': 'Ý', 'Ãž': 'Þ',
    }

    # Trier par longueur décroissante pour éviter les remplacements partiels
    for bad, good in sorted(replacements.items(), key=lambda x: len(x[0]), reverse=True):
        text = text.replace(bad, good)

    return text

def fix_file(filepath, backup=True):
    """Répare un fichier"""
    try:
        # Créer une sauvegarde si demandé
        if backup:
            backup_path = filepath + '.backup'
            if not os.path.exists(backup_path):
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                with open(backup_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"  Sauvegarde créée: {backup_path}")

        # Lire et réparer
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        fixed_content = fix_mojibake(content)

        # Sauvegarder avec UTF-8 BOM
        with open(filepath, 'w', encoding='utf-8-sig') as f:
            f.write(fixed_content)

        return True, "OK"
    except Exception as e:
        return False, str(e)

def main():
    """Fonction principale"""
    # Chercher tous les fichiers HTML
    html_files = glob.glob('*.html')

    if not html_files:
        print("Aucun fichier HTML trouvé dans le répertoire courant.")
        return

    print(f"\n{len(html_files)} fichiers HTML trouvés.")
    print("Réparation en cours...\n")

    success_count = 0
    error_count = 0

    for filepath in sorted(html_files):
        print(f"Traitement: {filepath}")
        success, msg = fix_file(filepath, backup=True)
        if success:
            print(f"  ✓ Réparé avec succès")
            success_count += 1
        else:
            print(f"  ✗ Erreur: {msg}")
            error_count += 1

    print(f"\n{'='*50}")
    print(f"Résultat: {success_count} succès, {error_count} erreurs")
    print(f"Les sauvegardes sont en .backup")
    print(f"{'='*50}\n")

if __name__ == "__main__":
    main()