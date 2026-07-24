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
        { property: 'og:type', content: 'profile' },
        { property: 'og:site_name', content: 'Bryce Chesley' },
        { property: 'og:title', content: 'Bryce Chesley — Software Engineer' },
        {
          property: 'og:description',
          content:
            'I build the software that runs a dairy plant — operations apps used by 95% of staff and an MES posting 1.4M+ ERP transaction lines a year with zero manual entry.',
        },
        { property: 'og:url', content: 'https://brycechesley.com/' },
        { name: 'twitter:card', content: 'summary' },
      ],
      script: [
        {
          type: 'application/ld+json',
          // Machine-readable resume layer for search engines and AI
          // screening systems (schema.org Person).
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: 'Bryce Chesley',
            jobTitle: 'Software Engineer',
            url: 'https://brycechesley.com/',
            email: 'mailto:brycches@gmail.com',
            address: { '@type': 'PostalAddress', addressRegion: 'ID', addressCountry: 'US' },
            sameAs: [
              'https://github.com/brycches',
              'https://www.linkedin.com/in/bryce-chesley-43546915b',
              'https://fobech.com',
            ],
            worksFor: { '@type': 'Organization', name: 'Suntado · Ida Milk' },
            affiliation: { '@type': 'Organization', name: 'Fobech LLC', url: 'https://fobech.com' },
            alumniOf: [
              { '@type': 'CollegeOrUniversity', name: 'Brigham Young University–Idaho' },
              { '@type': 'CollegeOrUniversity', name: 'Idaho State University' },
            ],
            knowsAbout: [
              'Vue 3',
              'Nuxt',
              'Node.js',
              'Express',
              'SQL Server',
              'NetSuite',
              'SuiteScript',
              'SuiteQL',
              'OAuth 1.0a',
              'Manufacturing Execution Systems (MES)',
              'SCADA / historian integration',
              'EDI',
              'ERP integration',
            ],
            description:
              'Full-stack software engineer building the operations platform and MES for a dairy manufacturing plant: applications used daily by ~95% of staff, and automation that posts over 90% of the company’s ERP transaction lines (1.4M+ lines in the first seven months of 2026) with zero manual entry.',
          }),
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
