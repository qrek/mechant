// ─────────────────────────────────────────────────────────────────────────────
// CONTENU DE LA PAGE ABOUT — édite ici, le reste se met à jour tout seul
// ─────────────────────────────────────────────────────────────────────────────
//
// Notes :
// • intro.lines : chaque ligne est un tableau de { text, variant }
//   variants disponibles : 'lead' | 'accent' | 'italic' | 'circle' | 'name' | ''
//   - 'lead'    → premier mot très gros (ex: "WE ARE")
//   - 'accent'  → bloc noir avec texte blanc italique (ex: "creative.")
//   - 'italic'  → italique simple
//   - 'circle'  → pilule noire (ex: "2019")
//   - 'name'    → nom en gras
//   - ''        → texte normal
// • Pour ajouter un award/service, copie-colle une ligne et change les valeurs.
// • Les couleurs du fond (bgColors) sont jouées dans l'ordre au scroll.
// ─────────────────────────────────────────────────────────────────────────────

export default {
  meta: {
    title: 'About — MÉCHANT',
    description: 'Méchant is a creative post-production studio in Paris, founded in 2019 by Théo Bacholier and Ronan Fourreau.'
  },

  hero: {
    eyebrow: ['Paris', 'Est. 2019'],
    lines: [
      { text: 'Once upon', variant: 'italic' },
      { text: 'a frame,',  variant: 'italic' },
      { text: 'MÉCHANT',   variant: 'bold' },
      { text: 'was born.', variant: 'bold' }
    ],
    scrollLabel: 'Scroll'
  },

  intro: {
    kicker: '— The studio',
    meta: 'Paris / FR',
    lines: [
      [
        { text: 'We are',     variant: 'lead' },
        { text: 'creative.',  variant: 'accent' }
      ],
      [
        { text: 'A post-production', variant: '' },
        { text: 'studio',            variant: 'italic' },
        { text: 'based in Paris,',   variant: '' }
      ],
      [
        { text: 'founded in', variant: '' },
        { text: '2019',       variant: 'circle' }
      ],
      [
        { text: 'by',                variant: '' },
        { text: 'Théo Bacholier',    variant: 'name' },
        { text: '&',                 variant: '' },
        { text: 'Ronan Fourreau.',   variant: 'name' }
      ]
    ],
    sub: 'We dedicate our craft and technical obsession to <em>commercials</em> and <em>music videos</em> — bringing an aesthetic vision that\'s a little rough around the edges. Méchant, on purpose.'
  },

  manifesto: [
    'Pretty pictures.',
    'Bad influence.',
    'Clean cuts.',
    'Dirty habits.'
  ],

  services: {
    kicker: '— What we do',
    list: [
      { label: 'Editing',           desc: 'Story-driven cuts.' },
      { label: 'VFX',               desc: 'Invisible to spectacular.' },
      { label: '3D / 2D Animation', desc: 'Frame by frame, pixel by pixel.' },
      { label: 'Motion Design',     desc: 'Make graphics move.' },
      { label: 'Art Direction',     desc: 'Set the visual rules.' }
    ]
  },

  awards: {
    kicker: '— Distinctions',
    titleLines: [
      { text: 'Recognized',         italic: false },
      { text: 'where it matters.',  italic: true }
    ],
    totalLabel: 'Selected',
    list: [
      { year: '2024', name: 'Cannes Lions',         tag: 'Shortlist' },
      { year: '2023', name: 'Ciclope Festival',     tag: 'Bronze' },
      { year: '2023', name: 'Young Directors Award', tag: 'Selection' },
      { year: '2022', name: 'AICP Awards',          tag: 'Honor' }
    ]
  },

  visit: {
    kicker: '— Come say hi',
    titleLines: [
      { text: 'The studio', italic: false },
      { text: 'is open.',   italic: true }
    ],
    placeholderLine: '3D studio scan',
    placeholderSub: 'Coming soon',
    address: '27 rue des Cascades — 75020 Paris',
    mapsUrl: 'https://www.google.fr/maps/place/27+Rue+des+Cascades,+75020+Paris'
  },

  // Palette du fond — une couleur par section, transition douce à l'entrée
  // 4 couleurs de marque : orange / bleu clair / vert / dark
  bgColors: {
    hero:      '#ff4500', // orange Méchant
    intro:     '#b5daff', // bleu clair (transition orange → bleu)
    manifesto: '#14914f', // vert profond
    services:  '#14914f', // vert (reste pareil — pas de transition)
    awards:    '#2a2a2a', // dark
    visit:     '#ff4500'  // retour orange
  }
}
