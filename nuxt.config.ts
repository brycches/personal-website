export default defineNuxtConfig({
  compatibilityDate: '2026-07-01',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  // GitHub Pages' branch-based builder chokes on the extracted
  // _payload.json files; inline the payloads instead.
  experimental: { payloadExtraction: false },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Bryce Chesley — Software Engineer',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        {
          name: 'description',
          content:
            'Bryce Chesley is a full-stack software engineer in Idaho, building production enterprise operations software with Vue 3, Node.js, SQL Server, and NetSuite.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800;900&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap',
        },
      ],
    },
  },
})
