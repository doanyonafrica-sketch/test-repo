import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

export default defineConfig({
  // ESSENTIEL pour GitHub Pages - le nom de votre repo
  base: '/electroinfo/',
  
  root: '.',
  
  build: {
    outDir: 'dist',
    // Copier article-detail.html vers la racine pour chaque article
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        article: resolve(__dirname, 'article-detail.html'),
      },
    },
  },

  plugins: [
    react(), // N'oubliez pas le plugin React !
    
    // Plugin pour générer les pages d'articles statiques (build only)
    {
      name: 'generate-article-pages',
      closeBundle() {
        // Cette fonction s'exécute après le build
        const articles = [
          'introduction-electricite',
          'courant-alternatif',
          // Ajoutez ici tous vos slugs d'articles
          // Ou lisez-les depuis un fichier JSON
        ];
        
        const distPath = resolve(__dirname, 'dist');
        
        articles.forEach(slug => {
          const articleDir = resolve(distPath, 'article', slug);
          
          // Créer le dossier article/slug
          if (!fs.existsSync(articleDir)) {
            fs.mkdirSync(articleDir, { recursive: true });
          }
          
          // Copier article-detail.html comme index.html dans ce dossier
          fs.copyFileSync(
            resolve(distPath, 'article-detail.html'),
            resolve(articleDir, 'index.html')
          );
        });
        
        console.log(`✓ Généré ${articles.length} pages d'articles`);
      }
    }
  ]
})