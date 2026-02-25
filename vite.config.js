import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import fs from 'fs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: '/',
    root: '.',

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
          home: resolve(__dirname, 'html/index.html'),
          articles: resolve(__dirname, 'html/articles.html'),
          articleDetail: resolve(__dirname, 'html/article-detail.html'),
          courses: resolve(__dirname, 'html/courses.html'),
          courseDetail: resolve(__dirname, 'html/course-detail.html'),
          about: resolve(__dirname, 'html/about.html'),
          contact: resolve(__dirname, 'html/contact.html'),
          auth: resolve(__dirname, 'html/auth.html'),
          admin: resolve(__dirname, 'html/admin.html'),
          archives: resolve(__dirname, 'html/archives.html'),
          dashboard: resolve(__dirname, 'html/dashboard.html'),
          privacy: resolve(__dirname, 'html/privacy.html'),
          terms: resolve(__dirname, 'html/terms.html'),
          mentions: resolve(__dirname, 'html/mentions-legales.html'),
          notFound: resolve(__dirname, 'html/404.html'),
        },

        external: (id) => {
          // Externaliser tous les fichiers JS locaux (non npm)
          // qui ne sont pas dans node_modules
          if (id.startsWith('/') && id.endsWith('.js')) return true
          if (id.endsWith('.js') && !id.includes('node_modules') && !id.startsWith('.')) return true
          return false
        },
      },
    },

    plugins: [
      {
        name: 'generate-article-pages',
        writeBundle() {
          const distPath = resolve(__dirname, 'dist')
          const articleTemplate = resolve(distPath, 'html/article-detail.html')

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

          console.log(`✓ ${articles.length} pages générées`)
        }
      }
    ]
  }
})