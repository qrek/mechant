/**
 * Met à jour les thumbnails existants en base vers une résolution plus haute (1280px)
 * Usage : node scripts/update-thumbnails.js
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

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌  SUPABASE_URL et SUPABASE_SERVICE_KEY requis dans .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function fetchHighResThumbnail(vimeoId) {
  const res = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}&width=1920`)
  if (!res.ok) return null
  const data = await res.json()
  const url = data.thumbnail_url || null
  return url ? url.replace(/_\d+x\d+(\.\w+)/, '_1920x1080$1').replace(/_\d+(\.\w+)$/, '_1920x1080$1') : null
}

async function main() {
  console.log('🖼️  Mise à jour des thumbnails en haute résolution…\n')

  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, title, vimeo_id, thumbnail_url')

  if (error) { console.error('❌', error.message); process.exit(1) }

  console.log(`  → ${projects.length} projets à mettre à jour\n`)

  let updated = 0
  for (const project of projects) {
    process.stdout.write(`  "${project.title}" (Vimeo ${project.vimeo_id})… `)

    try {
      const thumbnailUrl = await fetchHighResThumbnail(project.vimeo_id)
      if (!thumbnailUrl) { console.log('⏭️  pas de thumbnail'); continue }

      const { error } = await supabase
        .from('projects')
        .update({ thumbnail_url: thumbnailUrl })
        .eq('id', project.id)

      if (error) { console.log(`ERREUR : ${error.message}`); continue }
      console.log('✓')
      updated++
    } catch (e) {
      console.log(`ERREUR : ${e.message}`)
    }
  }

  console.log(`\n✅  ${updated}/${projects.length} thumbnails mis à jour`)
}

main()
