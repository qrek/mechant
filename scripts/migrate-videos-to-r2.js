// ─────────────────────────────────────────────────────────────────────────────
// Migration : Supabase Storage → Cloudflare R2
// ─────────────────────────────────────────────────────────────────────────────
//
// Pour chaque projet dans la table `projects` :
//   1. Récupère project.preview_video (URL Supabase)
//   2. Si c'est bien une URL Supabase Storage (et pas déjà R2) :
//      - télécharge le fichier depuis Supabase
//      - upload vers R2 avec une clé propre
//      - met à jour project.preview_video dans la DB avec la nouvelle URL R2
//   3. Skip les projets sans preview_video ou déjà migrés
//
// Lancement :
//   node scripts/migrate-videos-to-r2.js          # dry-run (par défaut)
//   node scripts/migrate-videos-to-r2.js --apply  # exécute les changements
//
// Variables d'environnement requises (dans .env ou exportées) :
//   SUPABASE_URL, SUPABASE_SERVICE_KEY (pas l'anon, pour pouvoir UPDATE)
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
//   R2_ENDPOINT, R2_PUBLIC_URL, R2_BUCKET_NAME
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

const APPLY = process.argv.includes('--apply')

function abort (msg) {
  console.error('\n❌ ' + msg)
  process.exit(1)
}

const required = [
  'SUPABASE_URL', 'SUPABASE_SERVICE_KEY',
  'R2_ENDPOINT', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY',
  'R2_PUBLIC_URL', 'R2_BUCKET_NAME'
]
const missing = required.filter(k => !process.env[k])
if (missing.length) abort(`Missing env vars: ${missing.join(', ')}`)

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
})

const PUBLIC_URL = process.env.R2_PUBLIC_URL.replace(/\/$/, '')
const BUCKET = process.env.R2_BUCKET_NAME

function sanitizeName (str) {
  return (str || 'video')
    .replace(/\.[^/.]+$/, '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
    .toLowerCase() || 'video'
}

async function migrateOne (project) {
  const url = project.preview_video
  if (!url) {
    return { status: 'skip', reason: 'no preview_video' }
  }
  // Si déjà sur R2, skip
  if (url.startsWith(PUBLIC_URL) || url.includes('.r2.dev') || url.includes('r2.cloudflarestorage.com')) {
    return { status: 'skip', reason: 'already on R2' }
  }
  // Si pas Supabase Storage, skip
  if (!url.includes('.supabase.co/storage/')) {
    return { status: 'skip', reason: 'not a Supabase URL' }
  }

  // 1. Télécharge depuis l'URL publique Supabase
  console.log(`  ↓ fetching ${url.split('/').pop()}...`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} downloading ${url}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2)
  console.log(`    ${sizeMB} MB`)

  // 2. Compose la nouvelle key R2
  const originalName = decodeURIComponent(url.split('/').pop() || 'video.mp4')
  const ext = (originalName.split('.').pop() || 'mp4').toLowerCase().slice(0, 5)
  // Préfixe par le client/titre du projet pour rester lisible
  const labelSource = project.client || project.title || originalName
  const label = sanitizeName(labelSource)
  const rand = Math.random().toString(36).slice(2, 8)
  const key = `previews/${label}-${rand}.${ext}`

  // 3. Upload vers R2
  if (!APPLY) {
    console.log(`    [dry-run] would upload to r2://${BUCKET}/${key}`)
    return { status: 'would-migrate', key }
  }

  console.log(`    ↑ uploading to r2://${BUCKET}/${key}...`)
  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: res.headers.get('content-type') || 'video/mp4'
  }))

  // 4. Update la DB
  const newUrl = `${PUBLIC_URL}/${key}`
  const { error: upErr } = await supabase
    .from('projects')
    .update({ preview_video: newUrl })
    .eq('id', project.id)
  if (upErr) throw new Error('DB update failed: ' + upErr.message)

  console.log(`    ✓ DB updated → ${newUrl}`)
  return { status: 'migrated', oldUrl: url, newUrl }
}

async function main () {
  console.log('\n──────────────────────────────────────────────────────')
  console.log(' Migration Supabase Storage → Cloudflare R2')
  console.log(` Mode: ${APPLY ? '🚀 APPLY (réel)' : '🧪 dry-run'}`)
  console.log('──────────────────────────────────────────────────────\n')

  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, title, client, preview_video')
    .order('created_at', { ascending: true })

  if (error) abort('Failed to fetch projects: ' + error.message)
  console.log(`📦 ${projects.length} projets trouvés\n`)

  const stats = { migrated: 0, skipped: 0, errors: 0, wouldMigrate: 0 }
  for (const project of projects) {
    const label = project.client || project.title || project.id
    console.log(`▶ [${label}]`)
    try {
      const result = await migrateOne(project)
      if (result.status === 'migrated') stats.migrated++
      else if (result.status === 'would-migrate') stats.wouldMigrate++
      else {
        stats.skipped++
        console.log(`    ⤷ skip (${result.reason})`)
      }
    } catch (err) {
      stats.errors++
      console.error(`    ✗ ERROR: ${err.message}`)
    }
  }

  console.log('\n──────────────────────────────────────────────────────')
  console.log(' Récap')
  console.log('──────────────────────────────────────────────────────')
  if (APPLY) {
    console.log(`  ✓ Migrées : ${stats.migrated}`)
  } else {
    console.log(`  → À migrer : ${stats.wouldMigrate} (lance avec --apply)`)
  }
  console.log(`  ⤷ Skippées : ${stats.skipped}`)
  if (stats.errors) console.log(`  ✗ Erreurs : ${stats.errors}`)
  console.log('')
}

main().catch((err) => {
  console.error('\n💥 Migration crashed:', err)
  process.exit(1)
})
