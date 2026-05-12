// ─────────────────────────────────────────────────────────────────────────────
// Vercel Serverless Function : génère une URL présignée pour upload R2
// ─────────────────────────────────────────────────────────────────────────────
//
// Route Vercel : POST /api/r2/presign
// (Le routage est automatique : ce fichier api/r2/presign.js → /api/r2/presign)
//
// Pourquoi pas un serverMiddleware Nuxt ? Parce que Nuxt 2 en mode SPA
// (ssr: false) est déployé en static sur Vercel — les serverMiddleware
// ne tournent PAS en prod. Les Vercel Functions, elles, tournent toujours.
//
// Variables d'environnement requises (Vercel Project Settings) :
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
//   R2_ENDPOINT, R2_PUBLIC_URL, R2_BUCKET_NAME
// ─────────────────────────────────────────────────────────────────────────────

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const MAX_SIZE_MB = 5
const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v']

// Singleton du client S3 (réutilisé entre invocations)
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

export default async function handler (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Vercel parse le body JSON automatiquement, mais on sécurise au cas où
  let body = req.body
  if (!body || typeof body === 'string') {
    try { body = JSON.parse(body || '{}') }
    catch { return res.status(400).json({ error: 'Invalid JSON body' }) }
  }

  // Vérifie env vars
  const requiredEnv = ['R2_ENDPOINT', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_PUBLIC_URL']
  const missing = requiredEnv.filter(k => !process.env[k])
  if (missing.length) {
    return res.status(500).json({ error: 'Server R2 misconfigured', missing })
  }

  const { filename, contentType, size } = body

  if (!filename || typeof filename !== 'string') {
    return res.status(400).json({ error: 'filename is required' })
  }
  if (!contentType || !ALLOWED_TYPES.includes(contentType)) {
    return res.status(400).json({
      error: `contentType must be one of: ${ALLOWED_TYPES.join(', ')}`,
      received: contentType
    })
  }
  if (typeof size !== 'number' || size <= 0) {
    return res.status(400).json({ error: 'size (in bytes) is required' })
  }

  const sizeMB = size / (1024 * 1024)
  if (sizeMB > MAX_SIZE_MB) {
    return res.status(413).json({
      error: `File too large: ${sizeMB.toFixed(1)} MB (max ${MAX_SIZE_MB} MB). Compress with ffmpeg first.`
    })
  }

  // Génère une clé unique et propre pour R2
  const ext = (filename.split('.').pop() || 'mp4').toLowerCase().slice(0, 5)
  const safeBase = sanitizeName(filename)
  const rand = Math.random().toString(36).slice(2, 8)
  const key = `previews/${Date.now()}_${rand}_${safeBase}.${ext}`

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

    return res.status(200).json({ uploadUrl, publicUrl, key })
  } catch (err) {
    console.error('[r2-presign] error generating signed URL:', err)
    return res.status(500).json({ error: 'Failed to generate signed URL', detail: err.message })
  }
}
