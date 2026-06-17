// ─────────────────────────────────────────────────────────────────────────────
// Helper de tracking — envoie des events custom à PostHog
// ─────────────────────────────────────────────────────────────────────────────
//
// Utilisation :
//   import { track } from '@/utils/track'
//   track('project_click', { client: 'Renault', slug: 'campaign-x' })
//
// Best practices :
// - event name : snake_case, descriptif ("project_hover", "project_click")
// - Pas de PII dans les params (pas d'email, pas de nom personnel hors entreprise)
// - Garde les params plats (string/number/boolean), pas d'objets imbriqués
//
// L'event est silencieusement ignoré si PostHog n'est pas chargé (SSR, clé
// absente, ad-blocker, etc.) — ne casse jamais l'app.
// ─────────────────────────────────────────────────────────────────────────────

export function track (eventName, params = {}) {
  if (typeof window === 'undefined') return
  try {
    if (window.posthog && typeof window.posthog.capture === 'function') {
      window.posthog.capture(eventName, params)
    }
  } catch (err) {
    if (typeof console !== 'undefined') {
      console.warn('[track] failed:', err)
    }
  }
}

// Helpers prêts à l'emploi pour les events les plus fréquents

export function trackProjectView (project, source) {
  if (!project) return
  track('project_view', {
    project_id: project.id,
    project_slug: project.slug || null,
    project_title: project.title || null,
    project_client: project.client || null,
    project_categories: (project.categories || []).join('|') || null,
    project_work_types: (project.work_types || []).join('|') || null,
    source: source || null
  })
}

export function trackProjectHover (project, source) {
  if (!project) return
  track('project_hover', {
    project_id: project.id,
    project_client: project.client || null,
    project_title: project.title || null,
    source: source || null
  })
}

export function trackProjectClick (project, source) {
  if (!project) return
  track('project_click', {
    project_id: project.id,
    project_slug: project.slug || null,
    project_title: project.title || null,
    project_client: project.client || null,
    has_case_study: !!project.has_case_study,
    source: source || null
  })
}

export function trackCaseStudyView (project) {
  if (!project) return
  track('case_study_view', {
    project_id: project.id,
    project_slug: project.slug || null,
    project_title: project.title || null,
    project_client: project.client || null
  })
}

export function trackCaseStudyVideoPlay (project, videoId) {
  if (!project) return
  track('case_study_video_play', {
    project_id: project.id,
    project_slug: project.slug || null,
    vimeo_id: videoId || null
  })
}

export function trackContactSubmit () {
  track('contact_form_submit')
}

export function trackContactEmail () {
  track('contact_email_click')
}

export function trackContactMaps () {
  track('contact_maps_click')
}

export function trackPlayground (action, extra = {}) {
  track(`playground_${action}`, extra)
}
