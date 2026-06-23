import webpack from 'webpack'

const siteUrl = 'https://mechant.tv'
const imageShare = `${siteUrl}/mechantshare.png`
const siteTitle = 'MÉCHANT — Post-production video studio in Paris, France'
const siteDesc = 'Méchant is a creative post-production video studio in Paris, France. Editing, VFX, 3D & 2D animation, motion design and art direction for commercials and music videos.'
const siteKeywords = 'post-production video Paris France, post-production studio Paris, VFX Paris, motion design Paris, video editing Paris, 3D animation Paris, music video post-production, commercial post-production'

// JSON-LD Organization + LocalBusiness — affiché sur toutes les pages,
// permet à Google d'afficher des rich results (logo, adresse, contact)
const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${siteUrl}/#organization`,
  name: 'MÉCHANT',
  legalName: 'Méchant',
  url: siteUrl,
  logo: `${siteUrl}/favicon.png`,
  image: imageShare,
  description: siteDesc,
  email: 'contact@mechant.tv',
  telephone: '',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '27 rue des Cascades',
    addressLocality: 'Paris',
    postalCode: '75020',
    addressCountry: 'FR',
    addressRegion: 'Île-de-France'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 48.8701,
    longitude: 2.3906
  },
  sameAs: [
    'https://www.instagram.com/mechant.tv/'
  ],
  founder: [
    { '@type': 'Person', name: 'Théo Bacholier' },
    { '@type': 'Person', name: 'Ronan Fourreau' }
  ],
  foundingDate: '2019',
  founders: 'Théo Bacholier & Ronan Fourreau',
  knowsAbout: [
    'Post-production',
    'Video editing',
    'VFX',
    '3D animation',
    '2D animation',
    'Motion design',
    'Art direction',
    'Commercial production',
    'Music video production'
  ],
  areaServed: {
    '@type': 'Country',
    name: 'France'
  }
}

export default {
  ssr: false,
  server: { port: 3000, host: '0.0.0.0' },

  // Global page headers
  head: {
    title: siteTitle,
    titleTemplate: '%s',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'theme-color', content: '#ff4500' },
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: 'MÉCHANT' },
      { name: 'keywords', content: siteKeywords },
      { hid: 'description', name: 'description', content: siteDesc },

      // Open Graph
      { hid: 'og:type', property: 'og:type', content: 'website' },
      { hid: 'og:site_name', property: 'og:site_name', content: 'MÉCHANT' },
      { hid: 'og:title', property: 'og:title', content: siteTitle },
      { hid: 'og:description', property: 'og:description', content: siteDesc },
      { hid: 'og:url', property: 'og:url', content: siteUrl },
      { hid: 'og:image', property: 'og:image', content: imageShare },
      { hid: 'og:image:type', property: 'og:image:type', content: 'image/png' },
      { hid: 'og:image:width', property: 'og:image:width', content: '1200' },
      { hid: 'og:image:height', property: 'og:image:height', content: '630' },
      { hid: 'og:locale', property: 'og:locale', content: 'en_US' },
      { hid: 'og:locale:alternate', property: 'og:locale:alternate', content: 'fr_FR' },

      // Twitter
      { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
      { hid: 'twitter:site', name: 'twitter:site', content: '@mechant_tv' },
      { hid: 'twitter:title', name: 'twitter:title', content: siteTitle },
      { hid: 'twitter:description', name: 'twitter:description', content: siteDesc },
      { hid: 'twitter:image', name: 'twitter:image', content: imageShare },

      // Geo SEO (signaux pour le local search Paris)
      { name: 'geo.region', content: 'FR-75' },
      { name: 'geo.placename', content: 'Paris' },
      { name: 'geo.position', content: '48.8701;2.3906' },
      { name: 'ICBM', content: '48.8701, 2.3906' }
    ],
    link: [
      { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      { hid: 'canonical', rel: 'canonical', href: siteUrl },
      { rel: 'preconnect', href: 'https://player.vimeo.com' },
      { rel: 'preconnect', href: 'https://f.vimeocdn.com' },
      { rel: 'preconnect', href: 'https://i.vimeocdn.com' },
      { rel: 'preconnect', href: 'https://fresnel.vimeocdn.com' }
    ],
    script: [
      { src: 'https://player.vimeo.com/api/player.js' },
      {
        hid: 'ldjson-schema',
        type: 'application/ld+json',
        innerHTML: JSON.stringify(jsonLdOrganization)
      }
    ],
    __dangerouslyDisableSanitizersByTagID: {
      'ldjson-schema': ['innerHTML']
    }
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/scss/reset.scss',
    '~/assets/scss/fonts.scss',
    '~/assets/scss/global.scss',
    '~/assets/scss/icons.scss',
    'lenis/dist/lenis.css'
  ],
  styleResources: {
    sass: [
      '~/assets/scss/vars.sass',
      '~/assets/scss/mixins.sass',
      '~/assets/scss/main.sass'
    ]
  },

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/posthog.client.js'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/style-resources'
  ],

  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    POSTHOG_KEY: process.env.POSTHOG_KEY,
    POSTHOG_HOST: process.env.POSTHOG_HOST
  },

  publicRuntimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY
  },

  serverMiddleware: [
    '~/middleware/server/auth.js'
    // NOTE : /api/r2/presign est géré par api/r2/presign.js (Vercel Function),
    // pas par un serverMiddleware Nuxt. Les serverMiddleware ne tournent pas
    // sur Vercel quand Nuxt est déployé en SPA static.
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    babel: {
      plugins: [
        '@babel/plugin-proposal-optional-chaining',
        // Les 3 plugins doivent partager le même mode 'loose' (Babel l'exige
        // car ils dépendent les uns des autres pour gérer les class fields).
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        ['@babel/plugin-proposal-private-methods', { loose: true }],
        ['@babel/plugin-proposal-private-property-in-object', { loose: true }]
      ]
    },

    plugins: [
      new webpack.ProvidePlugin({
        'THREE': 'three'
      })
    ],

    extend (config) {
      config.module.rules.push({
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: [
          'raw-loader',
          'glslify-loader'
        ]
      }),
      config.resolve.alias.vue = 'vue/dist/vue.common'
    },

    transpile: ['three', 'lenis', '@dimforge/rapier3d-compat', 'posthog-js', 'playcanvas']
  },
  pageTransition: {
    name: 'page',
    mode: 'out-in'
  },

  generate: {
    fallback: true
  }
}
