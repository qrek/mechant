/**
 * Migration complète Prismic → Supabase
 * Migre : poster, video_home, video_home_mobile, preview_video, subtitle, description
 * Et génère le contenu de content/site.js depuis les données Prismic réelles
 *
 * Usage : node scripts/migrate-full.js
 */

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

const PRISMIC = 'https://mechant.cdn.prismic.io/api/v2'
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

async function prismicFetch(path) {
  const res = await fetch(PRISMIC + path)
  if (!res.ok) throw new Error(`Prismic HTTP ${res.status}`)
  return res.json()
}

async function getMasterRef() {
  const api = await prismicFetch('')
  return api.refs.find(r => r.isMasterRef).ref
}

async function queryType(ref, type) {
  const docs = []
  let page = 1, total = 1
  while (page <= total) {
    const p = new URLSearchParams({ ref, q: `[[at(document.type,"${type}")]]`, pageSize: 100, page })
    const d = await prismicFetch(`/documents/search?${p}`)
    docs.push(...d.results)
    total = d.total_pages
    page++
  }
  return docs
}

function txt(field) {
  if (!field) return null
  if (typeof field === 'string') return field
  if (Array.isArray(field)) return field.map(f => f.text || '').filter(Boolean).join('\n') || null
  if (field.text) return field.text
  return null
}

function url(field) {
  if (!field) return null
  if (typeof field === 'string') return field
  if (field.url) return field.url
  return null
}

// ─── Mise à jour des projets ──────────────────────────────────────────────────

async function updateProjects(ref) {
  console.log('\n🎬  Mise à jour des champs manquants sur les projets…')
  const docs = await queryType(ref, 'project')

  let ok = 0, skip = 0
  for (const doc of docs) {
    const d = doc.data

    const vimeoRaw = d.vimeo_id
    const vimeoId = txt(vimeoRaw)?.trim()

    if (!vimeoId) { skip++; continue }

    const updates = {
      poster:             url(d.poster),
      video_home:         url(d.video_home),
      video_home_mobile:  url(d.video_home_mobile),
      preview_video:      url(d.preview_video),
      subtitle:           txt(d.subtitle),
      description:        txt(d.text),
    }

    // Ne garder que les champs non-null
    const payload = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== null))

    process.stdout.write(`  "${txt(d.title) || doc.uid}" … `)

    const { error } = await supabase
      .from('projects')
      .update(payload)
      .eq('vimeo_id', vimeoId)

    if (error) { console.log('ERREUR : ' + error.message); skip++ }
    else { console.log('✓'); ok++ }
  }

  console.log(`  → ${ok} mis à jour, ${skip} ignorés`)
}

// ─── Génération de content/site.js ───────────────────────────────────────────

async function generateSiteContent(ref) {
  console.log('\n📝  Génération de content/site.js depuis Prismic…')

  const [homeDocs, footerDocs, aboutDocs, cookiesDocs, legalDocs, worksListDocs] = await Promise.all([
    queryType(ref, 'homepage'),
    queryType(ref, 'footer'),
    queryType(ref, 'about'),
    queryType(ref, 'cookies_policy'),
    queryType(ref, 'legal_notice'),
    queryType(ref, 'projects_list'),
  ])

  const home   = homeDocs[0]?.data   || {}
  const footer = footerDocs[0]?.data || {}
  const about  = aboutDocs[0]?.data  || {}
  const cookies = cookiesDocs[0]?.data || {}
  const legal  = legalDocs[0]?.data  || {}
  const works  = worksListDocs[0]?.data || {}

  // Awards
  const awards = (about.awards || []).map(a => ({
    year: a.year || '',
    award_title: a.award_title || '',
    tag: a.tag || '',
    details: Array.isArray(a.details) ? a.details : [{ text: txt(a.details) || '' }]
  }))

  const content = `// ─────────────────────────────────────────────────────────────────────────────
// CONTENU STATIQUE DU SITE — généré depuis Prismic le ${new Date().toLocaleDateString('fr-FR')}
// ─────────────────────────────────────────────────────────────────────────────

export const homepage = {
  meta_title: ${JSON.stringify(txt(home.meta_title) || 'MÉCHANT')},
  meta_description: ${JSON.stringify(txt(home.meta_description) || '')},
  about_us_text: ${JSON.stringify(home.about_us_text || [{ text: '' }])}
}

export const footer = {
  text: ${JSON.stringify(footer.text || [{ text: '' }])},
  email_address: ${JSON.stringify(txt(footer.email_address) || 'contact@mechant.tv')},
  address: ${JSON.stringify(txt(footer.address) || '')},
  address_footer: ${JSON.stringify(txt(footer.address_footer) || '')},
  address_menu: ${JSON.stringify(footer.address_menu || [])},
  instagram_url: ${JSON.stringify(footer.instagram_url || { url: '' })},
  google_maps_link: ${JSON.stringify(footer.google_maps_link || { url: '' })}
}

export const aboutpage = {
  meta_title: ${JSON.stringify(txt(about.meta_title) || 'About — MÉCHANT')},
  meta_description: ${JSON.stringify(txt(about.meta_description) || '')},
  video_id: ${JSON.stringify(about.video_id || [{ text: '' }])},
  video_poster: ${JSON.stringify(about.video_poster || { url: '' })},
  title: ${JSON.stringify(about.title || [{ text: '' }])},
  text: ${JSON.stringify(about.text || [{ text: '' }])},
  services: ${JSON.stringify(txt(about.services) || '')},
  awards: ${JSON.stringify(awards, null, 2)}
}

export const projectsPage = {
  meta_title: ${JSON.stringify(txt(works.meta_title) || 'Works — MÉCHANT')},
  meta_description: ${JSON.stringify(txt(works.meta_description) || '')}
}

export const cookiesPage = {
  meta_title: ${JSON.stringify(txt(cookies.meta_title) || 'Cookies — MÉCHANT')},
  meta_description: ${JSON.stringify(txt(cookies.meta_description) || '')},
  content: ${JSON.stringify(cookies.content || [{ text: '' }])}
}

export const legalsPage = {
  meta_title: ${JSON.stringify(txt(legal.meta_title) || 'Mentions légales — MÉCHANT')},
  meta_description: ${JSON.stringify(txt(legal.meta_description) || '')},
  content: ${JSON.stringify(legal.content || [{ text: '' }])}
}
`

  const outPath = path.join(__dirname, '..', 'content', 'site.js')
  fs.writeFileSync(outPath, content, 'utf8')
  console.log('  ✓  content/site.js mis à jour')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀  Migration complète Prismic → Supabase')
  console.log('─'.repeat(50))

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('❌  SUPABASE_URL et SUPABASE_SERVICE_KEY requis dans .env')
    process.exit(1)
  }

  const ref = await getMasterRef()
  console.log(`✓  Ref Prismic : ${ref.substring(0, 20)}…`)

  await updateProjects(ref)
  await generateSiteContent(ref)

  console.log('\n✅  Migration complète terminée !')
  console.log('\nProchaines étapes :')
  console.log('  1. Vérifier content/site.js')
  console.log('  2. Ajouter les nouvelles colonnes dans Supabase (voir supabase-schema-update.sql)')
  console.log('  3. Pusher sur GitHub → Vercel redéploie')
}

main().catch(e => { console.error('❌', e.message); process.exit(1) })
