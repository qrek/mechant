// ─────────────────────────────────────────────────────────────────────────────
// CONTENU STATIQUE DU SITE — à éditer directement ici
// ─────────────────────────────────────────────────────────────────────────────

export const homepage = {
  meta_title: 'MÉCHANT',
  meta_description: 'Creative post-production studio',
  // Texte principal de la section intro (HTML autorisé, <strong> pour le gras)
  about_us_text: [{ text: 'We are a creative post-production studio. We make <strong>bold</strong>, <strong>unexpected</strong> films.' }]
}

export const footer = {
  // Texte principal du footer (HTML autorisé)
  text: [{ text: 'Want to work with us? <strong>Let\'s talk.</strong>' }],
  email_address: 'contact@mechant.tv',
  address: '10 rue de la Paix, 75002 Paris',
  instagram_url: { url: 'https://www.instagram.com/mechant.tv' },
  google_maps_link: { url: 'https://maps.google.com/?q=10+rue+de+la+Paix+Paris' }
}

export const aboutpage = {
  meta_title: 'About — MÉCHANT',
  meta_description: 'Creative post-production studio based in Paris.',
  // ID Vimeo du showreel sur la page About
  video_id: [{ text: '000000000' }],
  // URL de la miniature du showreel (peut être une image de /static)
  video_poster: { url: '/textures/hero_1.png' },
  title: [{ text: 'We are\nMéchant.' }],
  // Texte de présentation (HTML autorisé)
  text: [{ text: 'Born from <strong>creativity</strong> and <strong>technical</strong> excellence, Méchant is a post-production studio that pushes the boundaries of visual storytelling.' }],
  services: 'Color grading · Motion design · VFX · Sound design',
  awards: [
    {
      year: '2023',
      award_title: 'Cannes Lions',
      tag: 'Gold',
      details: [{ text: 'Best Post-Production' }]
    },
    {
      year: '2022',
      award_title: 'D&AD Awards',
      tag: 'Wood Pencil',
      details: [{ text: 'Film Craft — Editing' }]
    }
  ]
}

export const projectsPage = {
  meta_title: 'Works — MÉCHANT',
  meta_description: 'Discover our latest projects.'
}

export const cookiesPage = {
  meta_title: 'Cookies — MÉCHANT',
  meta_description: 'Notre politique de cookies.',
  content: [{ text: '<h2>Politique de cookies</h2><p>Ce site utilise des cookies à des fins d\'analyse de trafic via Piwik Pro. Aucun cookie publicitaire n\'est utilisé.</p>' }]
}

export const legalsPage = {
  meta_title: 'Privacy Policy — MÉCHANT',
  meta_description: 'Notre politique de confidentialité.',
  content: [{ text: '<h2>Privacy Policy</h2><p>Méchant TV — 10 rue de la Paix, 75002 Paris. Hébergeur : Vercel Inc.</p>' }]
}
