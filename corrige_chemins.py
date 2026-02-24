import os

# Pour chaque fichier HTML dans html/
for filename in os.listdir('html'):
    if filename.endswith('.html'):
        filepath = os.path.join('html', filename)
        
        # Lire
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Sauvegarde
        with open(filepath + '.backup', 'w', encoding='utf-8') as f:
            f.write(content)
        
        # CORRECTIONS : /xxx devient ../xxx
        content = content.replace('href="/styles.css"', 'href="../css/styles.css"')
        content = content.replace('href="/article-styles.css"', 'href="../css/article-styles.css"')
        content = content.replace('href="/admin-styles.css"', 'href="../css/admin-styles.css"')
        content = content.replace('href="/courses-styles.css"', 'href="../css/courses-styles.css"')
        
        # Images
        content = content.replace('src="/images/', 'src="../images/')
        content = content.replace('href="/images/', 'href="../images/')
        
        # Liens vers autres pages (qui sont à la racine)
        content = content.replace('href="/index.html"', 'href="../index.html"')
        content = content.replace('href="/articles.html"', 'href="../articles.html"')
        content = content.replace('href="/courses.html"', 'href="../courses.html"')
        content = content.replace('href="/about.html"', 'href="../about.html"')
        content = content.replace('href="/contact.html"', 'href="../contact.html"')
        content = content.replace('href="/auth.html"', 'href="../auth.html"')
        content = content.replace('href="/admin.html"', 'href="../admin.html"')
        
        # JS
        content = content.replace('src="/articles.js"', 'src="../articles.js"')
        content = content.replace('src="/courses.js"', 'src="../courses.js"')
        
        # Sauvegarder
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ {filename} corrigé")

print("\nTerminé! Sauvegardes: .backup")