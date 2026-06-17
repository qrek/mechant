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
    sub: 'From our studio in <em>Ménilmontant</em>, eastern Paris, we dedicate our craft and technical obsession to <em>commercials</em> and <em>music videos</em> — bringing an aesthetic vision that\'s a little rough around the edges. Méchant, on purpose.'
  },

  // ── Expertise : nos disciplines (montage, VFX, 3D, IA) ────────────────
  expertise: {
    kicker: '— What we do',
    intro: 'Four things we genuinely love doing — and spend most of our days on.',
    list: [
      {
        index: '01',
        title: 'Editing',
        body: 'We cut for rhythm and feeling. Finding the right pace, the beat that lands, the moment to let a shot breathe.'
      },
      {
        index: '02',
        title: 'VFX',
        body: 'From a quick clean-up to a shot that couldn\'t be filmed. Compositing, retouching, set extensions — done so you don\'t notice the work.'
      },
      {
        index: '03',
        title: '3D',
        body: 'Modeling, lighting and rendering to add what the camera couldn\'t catch — an object, a set, a whole environment.'
      },
      {
        index: '04',
        title: 'AI',
        body: 'We bring generative tools into the mix when they help — to test ideas faster and open up looks that weren\'t possible before.'
      }
    ]
  },

  manifesto: [
    'Pretty pictures.',
    'Bad influence.',
    'Clean cuts.',
    'Dirty habits.'
  ],

  // Colonne gauche du combo : ce qu'on livre (formats) — différent des
  // disciplines de la section Expertise, donc pas de répétition
  services: {
    kicker: '— What we work on',
    list: [
      { label: 'Commercials',   desc: 'Brand films & ads.' },
      { label: 'Music videos',  desc: 'Where we play the most.' },
      { label: 'Brand content', desc: 'Social, launches, teasers.' },
      { label: 'Collabs',       desc: 'Directors, agencies, artists.' }
    ]
  },

  // Colonne droite du combo : façon de bosser (plus humble que des awards)
  awards: {
    kicker: '— How we work',
    titleLines: [
      { text: 'Small team,',  italic: false },
      { text: 'big care.',    italic: true }
    ],
    totalLabel: 'Studio',
    list: [
      { year: '01', name: 'Hands-on', tag: 'No middlemen' },
      { year: '02', name: 'Flexible', tag: 'Freelancers when needed' },
      { year: '03', name: 'Honest',   tag: 'Real deadlines, real talk' },
      { year: '04', name: 'Close',    tag: 'You talk to the people doing the work' }
    ]
  },

  visit: {
    kicker: '— Come say hi',
    titleLines: [
      { text: 'Drop by', italic: false },
      { text: 'the studio.', italic: true }
    ],
    placeholderLine: '3D studio scan',
    placeholderSub: 'Coming soon',
    address: '27 rue des Cascades — 75020 Paris, Ménilmontant',
    mapsUrl: 'https://www.google.fr/maps/place/27+Rue+des+Cascades,+75020+Paris',
    ctaLabel: 'Start a project',
    ctaTo: '/contact'
  },

  // Palette du fond — une couleur par section, transition douce à l'entrée
  bgColors: {
    hero:      '#ff4500', // orange Méchant
    intro:     '#b5daff', // bleu clair
    expertise: '#ffffff', // blanc — section éditoriale "ce qu'on maîtrise"
    manifesto: '#14914f', // vert profond
    capa:      '#2a2a2a', // dark (services + awards combinés)
    visit:     '#ff4500'  // retour orange
  }
}
