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
    title: 'About — Méchant post-production video studio in Paris',
    description: 'Méchant is a creative post-production video studio in Paris, France, founded in 2019 by Théo Bacholier and Ronan Fourreau. Editing, VFX, 3D/2D animation, motion design, art direction.'
  },

  hero: {
    eyebrow: ['Paris', 'Est. 2019'],
    lines: [
      { text: 'Once upon', variant: 'italic' },
      { text: 'a frame,',  variant: 'italic' },
      { text: 'MÉCHANT',   variant: 'bold' },
      { text: 'was born.', variant: 'bold' }
    ],
    scrollLabel: 'Scroll',
    // Persos 3D animés (Mixamo) rendus façon PS1 à côté du titre, hébergés R2.
    // UN perso est tiré au hasard à chaque chargement de la page.
    // Ajouter un perso : optimise le GLB (textures 512 + simplify), uploade
    // dans characters/ sur R2, puis ajoute son URL ici. On peut surcharger un
    // réglage par perso, ex : { url: '...', faceDeg: 10, offsetY: 0.2 }
    characters: [
      { url: 'https://pub-fda32ee9610a4a3b845c0bf389926b04.r2.dev/characters/theo.glb' },
      { url: 'https://pub-fda32ee9610a4a3b845c0bf389926b04.r2.dev/characters/theo2.glb' }
    ],
    // Réglages PS1 communs (surchageables par perso ci-dessus)
    characterPreset: {
      clip: 'mixamo.com',
      pixelHeight: 275,
      wobble: 400,
      colorDepth: 30,
      faceDeg: -5,
      framing: 1,
      offsetY: 0.34,
      autoRotate: 0.00
    }
  },

  intro: {
    kicker: 'The studio',
    meta: 'Paris / FR',
    lines: [
      [
        { text: 'We are a',  variant: 'lead' },
        { text: 'creative',  variant: 'accent' }
      ],
      [
        { text: 'post-production', variant: '' },
        { text: 'studio',          variant: 'italic' },
        { text: 'based in Paris,', variant: '' }
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
    sub: 'From our studio in <em>Ménilmontant</em>, we put our craft and our technical obsession at the service of <em>commercials</em> and <em>music videos</em>. We like images with a bit of edge, clean enough to work, rough enough to feel alive. We follow a film from the first cut to the last frame, and we care as much about the idea as about the pixel.'
  },

  // ── Expertise : nos disciplines (montage, VFX, 3D, IA) ────────────────
  expertise: {
    kicker: 'What we do',
    intro: 'These are the <em>four crafts</em> we spend most of our days on, sometimes one at a time, often all at once on the same film.',
    list: [
      {
        index: '01',
        title: 'Editing',
        body: 'We cut for rhythm and feeling. Finding the right pace, the beat that lands, the moment to let a shot breathe.'
      },
      {
        index: '02',
        title: 'VFX',
        body: 'From a quick clean-up to a shot that couldn\'t be filmed. Compositing, retouching, set extensions, done so you don\'t notice the work.'
      },
      {
        index: '03',
        title: '3D',
        body: 'Modeling, lighting and rendering to add what the camera couldn\'t catch: an object, a set, a whole environment.'
      },
      {
        index: '04',
        title: 'AI',
        body: 'We bring generative tools into the mix when they help, to test ideas faster and open up looks that weren\'t possible before.'
      }
    ]
  },

  manifesto: [
    'Mean cuts',
    'Polygon crimes',
    'No sweat',
    'Charming menace'
  ],

  // Distinctions / awards — section showcased
  awards: {
    kicker: 'Distinctions',
    titleLines: [
      { text: 'Recognized',        italic: false },
      { text: 'where it matters.', italic: true }
    ],
    totalLabel: 'Selected',
    list: [
      { year: '2024', name: 'Cannes Lions',          tag: 'Shortlist' },
      { year: '2023', name: 'Ciclope Festival',      tag: 'Bronze' },
      { year: '2023', name: 'Young Directors Award', tag: 'Selection' },
      { year: '2022', name: 'AICP Awards',           tag: 'Honor' }
    ]
  },

  visit: {
    kicker: 'Come say hi',
    titleLines: [
      { text: 'Pull up a chair,', italic: false },
      { text: 'stay a while.',    italic: true }
    ],
    placeholderLine: 'Studio scan',
    placeholderSub: 'Loading…',
    // Scan studio en Gaussian Splatting (.sog) hébergé sur Cloudflare R2.
    // splatUrl = version desktop (SH complet, reflets) ; splatMobileUrl =
    // version allégée (sans SH, décimée) servie sur petits écrans.
    splatUrl: 'https://pub-fda32ee9610a4a3b845c0bf389926b04.r2.dev/scan/studio.sog',
    splatMobileUrl: 'https://pub-fda32ee9610a4a3b845c0bf389926b04.r2.dev/scan/studio.mobile.sog',
    address: '27 rue des Cascades, 75020 Paris, Ménilmontant',
    mapsUrl: 'https://www.google.fr/maps/place/27+Rue+des+Cascades,+75020+Paris',
    ctaLabel: 'Start a project',
    ctaTo: '/contact'
  },

  // Palette du fond — une couleur par section, transition douce à l'entrée
  bgColors: {
    hero:      '#ff4500', // orange Méchant
    intro:     '#b5daff', // bleu clair
    expertise: '#ffffff', // blanc — disciplines
    manifesto: '#14914f', // vert profond
    awards:    '#0a0a0a', // noir — showcase des distinctions
    visit:     '#0a0a0a'  // noir — pour intégrer le scan studio
  }
}
