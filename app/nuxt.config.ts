import { fileURLToPath, URL } from 'url'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-21',

  ssr: true,

  alias: {
    '#lib': fileURLToPath(new URL('../src/utils/html-elements', import.meta.url)),
  },

  app: {
    head: {
      viewport: 'minimum-scale=1, initial-scale=1, width=device-width',
      title: 'RubikX Builder',
      htmlAttrs: { lang: 'en' },
    },
  },

  modules: ['@nuxtjs/tailwindcss'],

  css: ['@myissue/vue-website-page-builder/style.css', '~/assets/css/main.css'],

  typescript: {
    strict: true,
  },

  components: {
    // pathPrefix: false keeps component names flat (e.g. <EditorSidebar> not
    // <BuilderEditorSidebar>) even though files now live in components/builder/
    dirs: [{ path: '~/components', pathPrefix: false, isAsync: true }],
  },

  imports: {
    // Explicit subdirectory list ensures all composable folders are auto-imported.
    // Add new layout composable dirs here as the library grows.
    dirs: ['composables', 'composables/editor', 'composables/themes', 'composables/layouts', 'stores'],
    autoImport: true,
  },

  sourcemap: {
    server: true,
    client: false,
  },

  devtools: { enabled: true },

  experimental: {
    payloadExtraction: true,
  },

  runtimeConfig: {
    unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY,
    apiBaseUrl: process.env.API_BASE_URL,
    apiSecretKey: process.env.API_SECRET_KEY,
    odooBaseUrl: process.env.ODOO_BASE_URL,
    odooApiKey: process.env.ODOO_API_KEY,
    odooSessionId: process.env.ODOO_SESSION_ID,
    odooAccessToken: process.env.ODOO_ACCESS_TOKEN,
    odooCompanyId: process.env.ODOO_COMPANY_ID,
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'RubikX Builder',
      env: process.env.NUXT_PUBLIC_ENV || 'development',
    },
  },

  nitro: {
    preset: process.env.NITRO_PRESET || 'node-server',
    routeRules: {
      '/**': {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-DNS-Prefetch-Control': 'off',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        },
      },
    },
  },
})
