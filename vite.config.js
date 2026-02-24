import { defineConfig } from 'vite'
import { resolve } from 'path'
import fs from 'fs'

export default defineConfig({
  // ESSENTIEL pour GitHub Pages
  base: '/electroinfo/',
  
  root: '.',
  
  build: {
    outDir: 'dist',
    emptyOutDir: true, // Nettoie le dossier dist avant chaque build
    
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        articleDetail: resolve(__dirname, 'html/article-detail.html'),
        // Ajoutez vos autres pages HTML ici si nécessaire
        // articles: resolve(__dirname, 'html/articles.html'),
      },
    },
  },

  plugins: [
    // PAS DE PLUGIN REACT - vous utilisez HTML vanilla
    
    // Plugin pour générer les pages d'articles statiques
    {
      name: 'generate-article-pages',
      writeBundle() {
        // writeBundle est plus sûr que closeBundle
        // car le dossier dist est garanti d'exister
        
        const articles = [
          'introduction-electricite',
          'courant-alternatif',
          'transformateurs',
          'moteurs-electriques',
          // Ajoutez tous vos slugs ici
        ];
        
        const distPath = resolve(__dirname, 'dist');
        const articleTemplate = resolve(distPath, 'html/article-detail.html');
        
        // Vérifier que le template existe
        if (!fs.existsSync(articleTemplate)) {
          console.error('❌ article-detail.html non trouvé dans dist/html/');
          return;
        }
        
        articles.forEach(slug => {
          const articleDir = resolve(distPath, 'article', slug);
          
          // Créer le dossier article/slug
          fs.mkdirSync(articleDir, { recursive: true });
          
          // Copier le template comme index.html
          fs.copyFileSync(articleTemplate, resolve(articleDir, 'index.html'));
        });
        
        console.log(`✓ Généré ${articles.length} pages d'articles`);
      }
    }
  ]
})