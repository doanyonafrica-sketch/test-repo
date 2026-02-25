import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import fs from 'fs'

export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement selon le mode (dev/prod)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: '/',  // Vercel sert depuis la racine, pas /electroinfo/
    root: '.',

    // Définir les variables d'environnement accessibles dans le navigateur
    define: {
      __FIREBASE_API_KEY__: JSON.stringify(env.FIREBASE_API_KEY),
      __FIREBASE_AUTH_DOMAIN__: JSON.stringify(env.FIREBASE_AUTH_DOMAIN),
      __FIREBASE_PROJECT_ID__: JSON.stringify(env.FIREBASE_PROJECT_ID),
      __FIREBASE_STORAGE_BUCKET__: JSON.stringify(env.FIREBASE_STORAGE_BUCKET),
      __FIREBASE_MESSAGING_SENDER_ID__: JSON.stringify(env.FIREBASE_MESSAGING_SENDER_ID),
      __FIREBASE_APP_ID__: JSON.stringify(env.FIREBASE_APP_ID),
    },

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

          // Générer les pages articles depuis articles.json si le fichier existe
          const articlesJsonPath = resolve(__dirname, 'articles.json')
          if (!fs.existsSync(articlesJsonPath)) {
            console.warn('⚠️ articles.json non trouvé, pages articles non générées')
            return
          }

          if (!fs.existsSync(articleTemplate)) {
            console.error('❌ article-detail.html non trouvé')
            return
          }

          const articlesData = JSON.parse(fs.readFileSync(articlesJsonPath, 'utf-8'))
          const articles = articlesData.articles.map(a => a.slug)

          articles.forEach(slug => {
            const articleDir = resolve(distPath, 'article', slug)
            fs.mkdirSync(articleDir, { recursive: true })
            fs.copyFileSync(articleTemplate, resolve(articleDir, 'index.html'))
          })

          console.log(`✓ ${articles.length} pages générées depuis articles.json`)
        }
      }
    ]
  }
})