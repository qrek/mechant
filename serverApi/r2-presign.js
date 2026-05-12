// ─────────────────────────────────────────────────────────────────────────────
// Endpoint serverMiddleware : génère une URL présignée pour upload R2
// ─────────────────────────────────────────────────────────────────────────────
//
// Le client (admin) appelle POST /api/r2/presign avec { filename, contentType, size }
// Le serveur :
//   1. valide la requête (taille max, content-type vidéo)
//   2. génère une clé unique et un presigned URL PUT signé pour ~5 minutes
//   3. renvoie { uploadUrl, publicUrl, key }
// Le client uploade ensuite DIRECTEMENT vers R2 via PUT, sans repasser par le
// serveur Nuxt (zéro bande passante côté Vercel, ultra rapide).
//
// Variables d'environnement requises :
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
//   R2_ENDPOINT, R2_PUBLIC_URL, R2_BUCKET_NAME
// ─────────────────────────────────────────────────────────────────────────────

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const MAX_SIZE_MB = 5
const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v']

// Singleton du client S3 (réutilisé entre invocations serverless)
let _client = null
function getClient () {
  if (_client) return _client
  _client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    }
  })
  return _client
}

function readJsonBody (req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => { raw += chunk })
    req.on('end', () => {
      if (!raw) return resolve({})
      try { resolve(JSON.parse(raw)) }
      catch (err) { reject(new Error('Invalid JSON body')) }
    })
    req.on('error', reject)
  })
}

function sendJson (res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

export default async (req, res) => {
  // Seul POST est accepté
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  // Vérifie que toutes les env vars sont bien là
  const requiredEnv = ['R2_ENDPOINT', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_PUBLIC_URL']
  const missing = requiredEnv.filter(k => !process.env[k])
  if (missing.length) {
    return sendJson(res, 500, {
      error: 'Server R2 misconfigured',
      missing
    })
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch (err) {
    return sendJson(res, 400, { error: err.message })
  }

  const { filename, contentType, size } = body

  if (!filename || typeof filename !== 'string') {
    return sendJson(res, 400, { error: 'filename is required' })
  }

  if (!contentType || !ALLOWED_TYPES.includes(contentType)) {
    return sendJson(res, 400, {
      error: `contentType must be one of: ${ALLOWED_TYPES.join(', ')}`,
      received: contentType
    })
  }

  if (typeof size !== 'number' || size <= 0) {
    return sendJson(res, 400, { error: 'size (in bytes) is required' })
  }

  const sizeMB = size / (1024 * 1024)
  if (sizeMB > MAX_SIZE_MB) {
    return sendJson(res, 413, {
      error: `File too large: ${sizeMB.toFixed(1)} MB (max ${MAX_SIZE_MB} MB). Compress with ffmpeg first.`
    })
  }

  // Génère une clé unique et propre pour R2
  // Format : <timestamp>_<random>_<original-name-sanitized>.<ext>
  const ext = (filename.split('.').pop() || 'mp4').toLowerCase().slice(0, 5)
  const safeBase = filename
    .replace(/\.[^/.]+$/, '')                 // retire extension
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // retire accents
    .replace(/[^a-zA-Z0-9-_]/g, '-')          // remplace tout le reste par tirets
    .replace(/-+/g, '-')                       // dédoublonne les tirets
    .replace(/^-|-$/g, '')                     // trim les tirets de début/fin
    .slice(0, 50)                              // limite la longueur
    .toLowerCase()
  const rand = Math.random().toString(36).slice(2, 8)
  const key = `previews/${Date.now()}_${rand}_${safeBase || 'video'}.${ext}`

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ContentLength: size
    })

    const uploadUrl = await getSignedUrl(getClient(), command, {
      expiresIn: 300 // 5 minutes
    })

    const publicUrl = `${process.env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`

    return sendJson(res, 200, { uploadUrl, publicUrl, key })
  } catch (err) {
    console.error('[r2-presign] error generating signed URL:', err)
    return sendJson(res, 500, { error: 'Failed to generate signed URL', detail: err.message })
  }
}
