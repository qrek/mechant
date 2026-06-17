// ─────────────────────────────────────────────────────────────────────────────
// PostHog — analytics + heatmaps + session replay
// ─────────────────────────────────────────────────────────────────────────────
//
// Plugin client-only (suffixe .client) : ne tourne jamais côté serveur.
// Initialise PostHog avec la clé publique (env var POSTHOG_KEY).
// Expose $posthog sur l'instance Vue + window.posthog pour utils/track.js.
//
// Variables d'env requises (Vercel + .env local) :
//   POSTHOG_KEY   : clé projet publique (commence par "phc_...")
//   POSTHOG_HOST  : optionnel — https://eu.i.posthog.com (EU, RGPD) ou
//                   https://us.i.posthog.com (US). Défaut : EU.
// ─────────────────────────────────────────────────────────────────────────────

import posthog from 'posthog-js'

export default function (ctx, inject) {
  const key = process.env.POSTHOG_KEY

  // Pas de clé configurée → on injecte un no-op pour ne pas casser l'app
  if (!key) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[posthog] POSTHOG_KEY manquante — analytics désactivé')
    }
    const noop = { capture: () => {}, identify: () => {}, __noop: true }
    inject('posthog', noop)
    if (typeof window !== 'undefined') window.posthog = noop
    return
  }

  // Reverse proxy : on route via /ingest (first-party, même domaine) au lieu
  // de eu.i.posthog.com directement → contourne les ad-blockers qui bloquent
  // les domaines analytics tiers. Les rewrites sont dans vercel.json.
  // ui_host pointe vers le vrai PostHog pour que les liens du toolbar marchent.
  posthog.init(key, {
    api_host: '/ingest',
    ui_host: 'https://eu.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false,            // on gère les pageviews manuellement (SPA)
    capture_pageleave: true,
    autocapture: true,                  // capture auto des clics → alimente les heatmaps
    enable_heatmaps: true,              // HEATMAPS activées
    disable_session_recording: false,   // session replay activé
    session_recording: {
      maskAllInputs: true               // masque les inputs (RGPD : formulaire contact)
    },
    loaded: (ph) => {
      if (process.env.NODE_ENV !== 'production') ph.debug(false)
    }
  })

  // Expose pour les composants ($posthog) et pour utils/track.js (window.posthog)
  inject('posthog', posthog)
  if (typeof window !== 'undefined') window.posthog = posthog

  // Pageview manuel à chaque changement de route (SPA Nuxt)
  if (ctx.app && ctx.app.router) {
    ctx.app.router.afterEach((to) => {
      // nextTick pour que le document.title soit à jour après le head()
      window.requestAnimationFrame(() => {
        posthog.capture('$pageview', {
          $current_url: window.location.href,
          path: to.fullPath
        })
      })
    })
  }
}
