/**
 * Migration Prismic → Supabase
 *
 * Usage :
 *   node scripts/migrate-from-prismic.js
 *
 * Nécessite un fichier .env à la racine du projet avec :
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY
 *
 * Le script est idempotent : on_conflict(vimeo_id) → update, donc relancer ne duplique pas.
 */

// Charge automatiquement le fichier .env
const fs = require('fs')
const path = require('path')
const envPath = path.join(__dirname, '..', '.env')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...rest] = line.split('=')
    if (key && rest.length && !key.startsWith('#')) {
      process.env[key.trim()] = rest.join('=').trim()
    }
  })
}

const { createClient } = require('@supabase/supabase-js')

const PRISMIC_ENDPOINT = 'https://mechant.cdn.prismic.io/api/v2'
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌  Variables manquantes : SUPABASE_URL et SUPABASE_SERVICE_KEY requis.')
  console.error('   Exemple : SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx node scripts/migrate-from-prismic.js')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ─── Helpers Prismic ──────────────────────────────────────────────────────────

async function prismicFetch(path) {
  const res = await fetch(PRISMIC_ENDPOINT + path)
  if (!res.ok) throw new Error(`Prismic HTTP ${res.status} sur ${path}`)
  return res.json()
}

async function getMasterRef() {
  const api = await prismicFetch('')
  return api.refs.find(r => r.isMasterRef).ref
}

async function queryAll(ref, type) {
  const docs = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const params = new URLSearchParams({
      ref,
      q: `[[at(document.type,"${type}")]]`,
      pageSize: 100,
      page
    })
    const data = await prismicFetch(`/documents/search?${params}`)
    docs.push(...data.results)
    totalPages = data.total_pages
    page++
  }

  return docs
}

// Transforme un champ Prismic rich-text en string plate
function extractText(field) {
  if (!field) return null
  if (typeof field === 'string') return field
  if (Array.isArray(field)) {
    return field.map(f => f.text || '').filter(Boolean).join(' ') || null
  }
  if (field.text) return field.text
  return null
}

// Extrait l'ID Vimeo depuis une URL ou un ID brut
function extractVimeoId(value) {
  if (!value) return null
  const str = String(value).trim()
  const match = str.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (match) return match[1]
  if (/^\d+$/.test(str)) return str
  return str
}

// Récupère la miniature Vimeo via oEmbed (public, sans auth)
async function fetchVimeoThumbnail(vimeoId) {
  try {
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}&width=1920`)
    if (!res.ok) return null
    const data = await res.json()
    // thumbnail_url_with_play_button has lower quality, use thumbnail_url
    // Replace _640 suffix with _1280 for better quality if present
    const url = data.thumbnail_url || null
    // Remplace les dimensions dans l'URL Vimeo CDN par 1920x1080 (max disponible)
    return url ? url.replace(/_\d+x\d+(\.\w+)/, '_1920x1080$1').replace(/_\d+(\.\w+)$/, '_1920x1080$1') : null
  } catch {
    return null
  }
}

// ─── Migration catégories ─────────────────────────────────────────────────────

async function migrateCategories(ref) {
  console.log('\n📂  Migration des catégories…')
  const docs = await queryAll(ref, 'category')

  // Map prismicId → supabaseUuid
  const categoryMap = {}

  for (const doc of docs) {
    const d = doc.data
    const title = extractText(d.name || d.title) || doc.uid || 'Sans titre'
    const slug = doc.uid || title.toLowerCase().replace(/\s+/g, '-')

    const { data, error } = await supabase
      .from('categories')
      .upsert({ title, slug }, { onConflict: 'slug' })
      .select('id, slug')
      .single()

    if (error) {
      console.error(`  ⚠️  Catégorie "${title}" : ${error.message}`)
      continue
    }

    categoryMap[doc.id] = data.id
    console.log(`  ✓  "${title}" → ${data.id}`)
  }

  // Si Prismic n'a pas de type "category" séparé, on retourne une map vide
  // et les catégories par défaut du schema SQL seront utilisées
  if (docs.length === 0) {
    console.log('  ℹ️  Aucun document "category" trouvé dans Prismic.')
    console.log('     Les catégories par défaut du schema SQL seront conservées.')
  }

  return categoryMap
}

// ─── Migration projets ────────────────────────────────────────────────────────

async function migrateProjects(ref, categoryMap) {
  console.log('\n🎬  Migration des projets…')
  const docs = await queryAll(ref, 'project')
  console.log(`  → ${docs.length} projets trouvés dans Prismic`)

  let success = 0
  let skipped = 0

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i]
    const d = doc.data

    // Titre / client
    const title = extractText(d.title) || doc.uid || 'Sans titre'
    const client = extractText(d.client) || null
    const description = extractText(d.description || d.text || d.body) || null

    // Vimeo ID — le champ peut s'appeler vimeo_id, video_id, vimeo_url…
    const rawVimeo = d.vimeo_id || d.video_id || d.vimeo_url
    const vimeoId = extractVimeoId(
      Array.isArray(rawVimeo) ? rawVimeo[0]?.text || rawVimeo[0] : rawVimeo
    )

    if (!vimeoId) {
      console.warn(`  ⏭️  "${title}" ignoré — pas d'ID Vimeo`)
      skipped++
      continue
    }

    // Miniature
    process.stdout.write(`  [${i + 1}/${docs.length}] "${title}" (Vimeo ${vimeoId})… `)
    const thumbnailUrl = await fetchVimeoThumbnail(vimeoId)

    // Catégories — tableau de relations Prismic
    const categories = []
    const rawCats = d.categories || d.tags || []
    for (const item of rawCats) {
      // Prismic relation : { category: { id: 'XYZ…', type: 'category' } }
      const prismicId = item?.category?.id || item?.id
      if (prismicId && categoryMap[prismicId]) {
        categories.push(categoryMap[prismicId])
      }
    }

    // Badges
    const rawBadges = d.badges || d.awards || []
    const badges = rawBadges
      .map(b => extractText(b.badge || b.name || b.title || b))
      .filter(Boolean)

    // Order index basé sur la date de publication Prismic
    const orderIndex = docs.length - i

    const row = {
      title,
      client,
      vimeo_id: vimeoId,
      thumbnail_url: thumbnailUrl,
      description,
      categories,
      badges,
      is_hero: false,
      hero_order: 0,
      order_index: orderIndex,
      published: true
    }

    const { error } = await supabase
      .from('projects')
      .upsert(row, { onConflict: 'vimeo_id' })

    if (error) {
      console.error(`ERREUR : ${error.message}`)
      skipped++
    } else {
      console.log('✓')
      success++
    }
  }

  console.log(`\n  Résultat : ${success} insérés, ${skipped} ignorés`)
  return docs
}

// ─── Hero projects depuis la homepage ────────────────────────────────────────

async function migrateHeroProjects(ref) {
  console.log('\n⭐  Récupération des hero projects depuis la homepage…')

  let homepageDocs = []
  try {
    homepageDocs = await queryAll(ref, 'homepage')
  } catch {
    // Essayer d'autres types de document pour la homepage
  }

  if (!homepageDocs.length) {
    try {
      homepageDocs = await queryAll(ref, 'home')
    } catch {}
  }

  if (!homepageDocs.length) {
    console.log('  ℹ️  Pas de document homepage trouvé — hero projects non configurés.')
    return
  }

  const homepage = homepageDocs[0].data
  const featuredProjects = homepage.featured_projects || homepage.hero_projects || homepage.projects || []

  if (!featuredProjects.length) {
    console.log('  ℹ️  Pas de featured_projects dans la homepage Prismic.')
    return
  }

  console.log(`  → ${featuredProjects.length} hero projects trouvés`)

  for (let i = 0; i < featuredProjects.length; i++) {
    const item = featuredProjects[i]
    // La relation pointe vers un document project
    const projectDoc = item?.project || item?.link || item
    const prismicProjectId = projectDoc?.id

    if (!prismicProjectId) continue

    // On cherche le vimeo_id de ce projet dans Prismic pour l'identifier dans Supabase
    // (Supabase n'a pas les Prismic IDs, mais a le vimeo_id comme clé unique)
    const heroTitle = extractText(item.hero_title || item.title) || null

    // Fetch le doc projet Prismic pour récupérer son vimeo_id
    try {
      const params = new URLSearchParams({ ref, q: `[[at(document.id,"${prismicProjectId}")]]` })
      const data = await prismicFetch(`/documents/search?${params}`)
      const projectData = data.results[0]?.data

      if (!projectData) continue

      const rawVimeo = projectData.vimeo_id || projectData.video_id || projectData.vimeo_url
      const vimeoId = extractVimeoId(
        Array.isArray(rawVimeo) ? rawVimeo[0]?.text || rawVimeo[0] : rawVimeo
      )

      if (!vimeoId) continue

      const { error } = await supabase
        .from('projects')
        .update({ is_hero: true, hero_title: heroTitle, hero_order: i + 1 })
        .eq('vimeo_id', vimeoId)

      if (error) {
        console.error(`  ⚠️  Hero update Vimeo ${vimeoId} : ${error.message}`)
      } else {
        console.log(`  ✓  Hero #${i + 1} — Vimeo ${vimeoId}${heroTitle ? ` ("${heroTitle}")` : ''}`)
      }
    } catch (e) {
      console.error(`  ⚠️  Erreur pour hero project ${i + 1} : ${e.message}`)
    }
  }
}

// ─── idempotence : ajouter contrainte unique sur vimeo_id si absente ──────────

async function ensureVimeoIdUnique() {
  // On tente juste une upsert — si la contrainte n'existe pas, on log un warning
  // L'utilisateur doit exécuter ce SQL dans Supabase si ce n'est pas encore fait :
  // ALTER TABLE projects ADD CONSTRAINT projects_vimeo_id_key UNIQUE (vimeo_id);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀  Méchant.TV — Migration Prismic → Supabase')
  console.log('─'.repeat(50))

  // Vérifier que fetch est disponible (Node 18+) ou utiliser node-fetch
  if (typeof fetch === 'undefined') {
    console.error('❌  fetch non disponible. Utilise Node 18+ ou installe node-fetch.')
    process.exit(1)
  }

  try {
    const ref = await getMasterRef()
    console.log(`✓  Ref Prismic master : ${ref.substring(0, 20)}…`)

    const categoryMap = await migrateCategories(ref)
    await migrateProjects(ref, categoryMap)
    await migrateHeroProjects(ref)

    console.log('\n✅  Migration terminée !')
    console.log('\nProchaines étapes :')
    console.log('  1. Vérifier les données dans Supabase Table Editor')
    console.log('  2. Ajuster les catégories si la map était vide (aucun doc "category" Prismic)')
    console.log('  3. Vérifier les hero projects dans la colonne is_hero')
  } catch (err) {
    console.error('\n❌  Erreur fatale :', err.message)
    process.exit(1)
  }
}

main()
