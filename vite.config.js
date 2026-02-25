import { defineConfig } from 'vite'
import { resolve } from 'path'
import fs from 'fs'

// Lire les articles depuis le JSON
const articlesData = JSON.parse(
  fs.readFileSync(resolve(__dirname, 'articles.json'), 'utf-8')
)
const articles = articlesData.articles.map(a => a.slug)

console.log(`📚 ${articles.length} articles trouvés :`, articles)

export default defineConfig({
  base: '/electroinfo/',
  root: '.',
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        articleDetail: resolve(__dirname, 'html/article-detail.html'),
      },
    },
  },

  plugins: [
    {
      name: 'generate-article-pages',
      writeBundle() {
        const distPath = resolve(__dirname, 'dist')
        const articleTemplate = resolve(distPath, 'html/article-detail.html')
        
        if (!fs.existsSync(articleTemplate)) {
          console.error('❌ article-detail.html non trouvé')
          return
        }
        
        // Générer une page pour chaque article du JSON
        articles.forEach(slug => {
          const articleDir = resolve(distPath, 'article', slug)
          fs.mkdirSync(articleDir, { recursive: true })
          fs.copyFileSync(articleTemplate, resolve(articleDir, 'index.html'))
        })
        
        console.log(`✓ ${articles.length} pages générées depuis articles.json`)
      }
    }
  ]
})