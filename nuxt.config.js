import webpack from 'webpack'

const imageShare = 'https://mechant.tv/mechantshare.png'
const siteTitle = 'MÉCHANT'
const siteDesc = 'Creative post-production studio'

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: siteTitle,
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'format-detection', content: 'telephone=no' },
      { hid: 'description', name: 'description', content: siteDesc },
      { hid: 'og:description', property: 'og:description', content: siteDesc },
      { hid: 'og:image', property: 'og:image', content: imageShare },
      { hid: 'og:image:type', property: 'og:image:type', content: 'image/png' },
      { hid: 'og:site_name', property: 'og:site_name', content: siteTitle },
      { hid: 'og:title', property: 'og:title', content: siteTitle },
      { hid: 'og:type', property: 'og:type', content: 'website' },
      { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
      { hid: 'twitter:site', name: 'twitter:site', content: siteTitle },
      { hid: 'twitter:title', name: 'twitter:title', content: siteTitle },
      { hid: 'twitter:image:src', name: 'twitter:image:src', content: imageShare },
    ],
    link: [
      { rel: 'icon', type: 'image/png', href: '/favicon.png' }
    ],
    script: [
      { src: 'https://player.vimeo.com/api/player.js' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/scss/reset.scss',
    '~/assets/scss/fonts.scss',
    '~/assets/scss/global.scss',
    '~/assets/scss/icons.scss'
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
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/style-resources'
  ],

  publicRuntimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY
  },

  serverMiddleware: [
    '~/middleware/server/auth.js'
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    babel: {
      plugins: ['@babel/plugin-proposal-optional-chaining']
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

    transpile: ['three']
  },
  generate: {
    fallback: true
  }
}
