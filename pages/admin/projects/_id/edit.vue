<template>
  <div>
    <div class="page-header">
      <NuxtLink to="/admin/projects" class="back-link">← Retour</NuxtLink>
      <h1>Éditer le projet</h1>
    </div>

    <div v-if="loading" class="state-msg">Chargement…</div>

    <form v-else class="project-form" @submit.prevent="save">
      <div class="form-section">
        <h2>Vidéo Vimeo</h2>
        <div class="field-row">
          <div class="field flex-1">
            <label>ID ou URL Vimeo *</label>
            <input v-model="vimeoInput" @blur="fetchVimeoData" placeholder="ex: 123456789" />
          </div>
          <button type="button" class="btn-fetch" @click="fetchVimeoData" :disabled="fetchingVimeo">
            {{ fetchingVimeo ? '…' : 'Recharger' }}
          </button>
        </div>
        <p v-if="vimeoError" class="error">{{ vimeoError }}</p>
      </div>

      <div v-if="form.thumbnail_url" class="thumb-preview">
        <img :src="form.thumbnail_url" alt="miniature" />
        <button type="button" class="btn-sm" @click="form.thumbnail_url = ''">Changer</button>
      </div>

      <div class="form-section">
        <h2>Informations</h2>
        <div class="field">
          <label>Titre du projet *</label>
          <input v-model="form.title" required />
        </div>
        <div class="field">
          <label>Client</label>
          <input v-model="form.client" />
        </div>
        <div class="field">
          <label>Description</label>
          <textarea v-model="form.description" rows="3" />
        </div>
        <div class="field">
          <label>Année du projet</label>
          <input type="number" v-model.number="form.year" min="2000" max="2099" placeholder="2024" />
        </div>
        <div class="field">
          <label>Badges (séparés par des virgules)</label>
          <input v-model="badgesInput" />
        </div>
      </div>

      <!-- Type de travail -->
      <div class="form-section">
        <h2>Type de travail</h2>
        <div class="categories-grid">
          <label v-for="type in workTypeOptions" :key="type" class="cat-checkbox">
            <input type="checkbox" :value="type" v-model="form.work_types" />
            {{ type }}
          </label>
        </div>
      </div>

      <div class="form-section">
        <h2>Catégories</h2>
        <div class="categories-grid">
          <label v-for="cat in categories" :key="cat.id" class="cat-checkbox">
            <input type="checkbox" :value="cat.id" v-model="form.categories" />
            {{ cat.title }}
          </label>
        </div>
      </div>

      <!-- Preview video -->
      <div class="form-section">
        <h2>Preview Vidéo (WebGL)</h2>
        <p class="field-hint" style="margin-bottom: 0.25rem">Courte vidéo MP4 affichée au survol de la carte dans la grille des projets.</p>
        <p class="field-hint" style="margin-bottom: 0.25rem; color: #ff8600;">
          ⚠️ Max <strong>{{ MAX_PREVIEW_MB }} Mo</strong> — vidéos plus lourdes : compresse via ffmpeg avant upload (commande dans l'erreur si tu dépasses).
        </p>

        <div v-if="form.preview_video" class="preview-video-row">
          <video :src="form.preview_video" muted loop playsinline style="height:72px;border-radius:6px;border:1px solid #2a2a2a;" />
          <div>
            <p class="field-hint" style="word-break:break-all">{{ form.preview_video }}</p>
            <button type="button" class="btn-sm btn-danger" style="margin-top:0.5rem" @click="removePreviewVideo">Supprimer</button>
          </div>
        </div>

        <div class="field">
          <label>{{ form.preview_video ? 'Remplacer le fichier' : 'Choisir un fichier MP4' }}</label>
          <input type="file" accept="video/mp4,video/*" @change="onPreviewVideoChange" :disabled="uploadingVideo" />
        </div>
        <div v-if="uploadingVideo" class="upload-progress">
          <div class="upload-bar" :style="{ width: uploadProgress + '%' }"></div>
          <span>{{ uploadProgress }}%</span>
        </div>
        <div v-if="uploadError" class="error" style="white-space: pre-line; line-height: 1.5;">{{ uploadError }}</div>
      </div>

      <!-- Page projet détaillée -->
      <div class="form-section">
        <h2>Page projet détaillée</h2>
        <label class="toggle-label">
          <input type="checkbox" v-model="form.has_case_study" />
          Activer une page dédiée pour ce projet
        </label>

        <template v-if="form.has_case_study">
          <div class="field" style="margin-top: 1rem">
            <label>Slug (URL : /works/<strong>mon-slug</strong>) *</label>
            <input v-model="form.slug" @input="onSlugInput" placeholder="ex: mauritshuis-audio-experience" />
            <span class="field-hint">Lettres minuscules, chiffres et tirets uniquement</span>
          </div>

          <div class="field">
            <label>Paragraphe d'introduction</label>
            <textarea v-model="form.case_study_intro" rows="3" placeholder="Le pitch du projet" />
          </div>

          <div class="field">
            <label>Paragraphe descriptif</label>
            <textarea v-model="form.case_study_body" rows="5" placeholder="Comment le projet a été réalisé, parti pris créatif…" />
          </div>

          <div class="field">
            <label>Vidéos supplémentaires (Vimeo)</label>
            <span class="field-hint">Une vidéo par ligne. Format : <code>ID</code> ou <code>ID | Titre</code></span>
            <textarea v-model="extraVideosInput" rows="4" placeholder="123456789 | Behind the scenes&#10;987654321 | Final film" />
          </div>
        </template>
      </div>

      <div class="form-section">
        <h2>Section Héro</h2>
        <label class="toggle-label">
          <input type="checkbox" v-model="form.is_featured" />
          Afficher sur la page Works (sélection)
        </label>
        <label class="toggle-label">
          <input type="checkbox" v-model="form.is_hero" />
          Afficher dans le carousel héro
        </label>
        <div v-if="form.is_hero" class="field" style="margin-top: 1rem">
          <label>Titre héro</label>
          <input v-model="form.hero_title" />
        </div>
        <div v-if="form.is_hero" class="field">
          <label>Ordre héro</label>
          <input type="number" v-model.number="form.hero_order" min="0" />
        </div>
      </div>

      <div class="form-section">
        <h2>Options</h2>
        <label class="toggle-label">
          <input type="checkbox" v-model="form.published" />
          Publié
        </label>
        <div class="field" style="margin-top: 1rem">
          <label>Ordre d'affichage</label>
          <input type="number" v-model.number="form.order_index" min="0" />
        </div>
      </div>

      <p v-if="saveError" class="error">{{ saveError }}</p>

      <div class="form-actions">
        <NuxtLink to="/admin/projects" class="btn-secondary">Annuler</NuxtLink>
        <button type="submit" class="btn-primary" :disabled="saving">
          {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { supabase } from '@/utils/supabase'

export default {
  layout: 'admin',
  middleware: 'admin-auth',
  name: 'AdminEditProject',
  data() {
    return {
      // Taille max preview video (en Mo) — au-dessus, on refuse l'upload
      // pour préserver le quota Supabase Storage. Compresser via ffmpeg avant.
      // 5 Mo permet du visuellement lossless en 1080p / CRF 22 / 5-6s.
      MAX_PREVIEW_MB: 5,
      loading: true,
      vimeoInput: '',
      badgesInput: '',
      extraVideosInput: '',
      fetchingVimeo: false,
      vimeoError: null,
      saving: false,
      saveError: null,
      uploadingVideo: false,
      uploadProgress: 0,
      uploadError: null,
      categories: [],
      workTypeOptions: ['Edit', 'VFX', '3D', 'IA', 'Motion Design', 'Direction Artistique'],
      form: {
        title: '',
        client: '',
        vimeo_id: '',
        thumbnail_url: '',
        description: '',
        categories: [],
        work_types: [],
        badges: [],
        preview_video: '',
        year: null,
        slug: '',
        has_case_study: false,
        case_study_intro: '',
        case_study_body: '',
        extra_videos: [],
        is_featured: false,
        is_hero: false,
        hero_title: '',
        hero_order: 0,
        order_index: 0,
        published: true
      }
    }
  },
  async mounted() {
    const [{ data: project }, { data: cats }] = await Promise.all([
      supabase.from('projects').select('*').eq('id', this.$route.params.id).single(),
      supabase.from('categories').select('*').order('order_index')
    ])

    this.categories = cats || []

    if (project) {
      this.form = {
        title: project.title || '',
        client: project.client || '',
        vimeo_id: project.vimeo_id || '',
        thumbnail_url: project.thumbnail_url || '',
        description: project.description || '',
        categories: project.categories || [],
        work_types: project.work_types || [],
        badges: project.badges || [],
        preview_video: project.preview_video || '',
        year: project.year || null,
        slug: project.slug || '',
        has_case_study: project.has_case_study || false,
        case_study_intro: project.case_study_intro || '',
        case_study_body: project.case_study_body || '',
        extra_videos: project.extra_videos || [],
        is_featured: project.is_featured || false,
        is_hero: project.is_hero || false,
        hero_title: project.hero_title || '',
        hero_order: project.hero_order || 0,
        order_index: project.order_index || 0,
        published: project.published !== false
      }
      this.vimeoInput = project.vimeo_id || ''
      this.badgesInput = (project.badges || []).join(', ')
      this.extraVideosInput = (project.extra_videos || [])
        .map(v => v.title ? `${v.vimeo_id} | ${v.title}` : v.vimeo_id)
        .join('\n')
    }

    this.loading = false
  },
  methods: {
    slugify(s) {
      return (s || '')
        .toString()
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    },
    onSlugInput() {
      this.form.slug = this.slugify(this.form.slug)
    },
    parseExtraVideos(text) {
      return (text || '')
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {
          const [rawId, ...rest] = line.split('|').map(s => s.trim())
          const idMatch = rawId.match(/(\d+)/)
          if (!idMatch) return null
          return { vimeo_id: idMatch[1], title: rest.join(' | ') || '' }
        })
        .filter(Boolean)
    },
    extractVimeoId(input) {
      if (!input) return null
      const trimmed = input.trim()
      if (/^\d+$/.test(trimmed)) return trimmed
      const match = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/)
      return match ? match[1] : null
    },
    async fetchVimeoData() {
      const id = this.extractVimeoId(this.vimeoInput)
      if (!id) return
      this.vimeoError = null
      this.fetchingVimeo = true
      try {
        const res = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        this.form.vimeo_id = id
        this.form.thumbnail_url = data.thumbnail_url || this.form.thumbnail_url
      } catch {
        this.vimeoError = 'Impossible de récupérer les infos Vimeo.'
      }
      this.fetchingVimeo = false
    },
    async onPreviewVideoChange(e) {
      const file = e.target.files[0]
      if (!file) return
      this.uploadError = null

      // Check taille max — refus si > MAX_PREVIEW_MB pour économiser le quota
      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > this.MAX_PREVIEW_MB) {
        this.uploadError =
          `Fichier trop lourd : ${sizeMB.toFixed(1)} Mo (max ${this.MAX_PREVIEW_MB} Mo).\n` +
          `\n` +
          `Compresse via ffmpeg (qualité visuellement lossless) :\n` +
          `\n` +
          `ffmpeg -i "${file.name}" -t 5 -vf "scale='min(1920,iw)':-2" -c:v libx264 -crf 22 -preset veryslow -profile:v high -pix_fmt yuv420p -an -movflags +faststart output.mp4\n` +
          `\n` +
          `(résultat attendu : 2-4 Mo pour 5s en 1080p, qualité indissociable de l'original à l'œil nu)`
        e.target.value = ''
        return
      }

      this.uploadingVideo = true
      this.uploadProgress = 0

      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage
        .from('preview-videos')
        .upload(filename, file, { contentType: file.type, upsert: false })

      if (error) {
        this.uploadError = 'Erreur upload : ' + error.message
        this.uploadingVideo = false
        return
      }

      const { publicURL } = supabase.storage.from('preview-videos').getPublicUrl(filename)
      this.form.preview_video = publicURL
      this.uploadProgress = 100
      this.uploadingVideo = false
    },
    removePreviewVideo() {
      this.form.preview_video = ''
    },
    async save() {
      const id = this.extractVimeoId(this.vimeoInput)
      if (!id) { this.saveError = 'ID Vimeo invalide.'; return }

      if (this.form.has_case_study && !this.form.slug) {
        this.saveError = 'Le slug est obligatoire pour une page projet détaillée.'
        return
      }

      this.saveError = null
      this.saving = true

      const payload = {
        ...this.form,
        vimeo_id: id,
        badges: this.badgesInput.split(',').map(b => b.trim()).filter(Boolean),
        slug: this.form.slug ? this.slugify(this.form.slug) : null,
        extra_videos: this.parseExtraVideos(this.extraVideosInput)
      }

      const { error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', this.$route.params.id)

      this.saving = false

      if (error) {
        this.saveError = 'Erreur : ' + error.message
      } else {
        this.$router.push('/admin/projects')
      }
    }
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.page-header h1 { font-size: 1.5rem; font-weight: 700; }
.back-link { color: #888; text-decoration: none; font-size: 0.9rem; }
.back-link:hover { color: #fff; }
.state-msg { color: #666; padding: 3rem 0; text-align: center; }

.project-form { display: flex; flex-direction: column; gap: 2rem; max-width: 760px; }

.form-section {
  background: #111;
  border: 1px solid #1e1e1e;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-section h2 {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #888;
  margin-bottom: 0.25rem;
}

.field { display: flex; flex-direction: column; gap: 0.4rem; }
.field-row { display: flex; align-items: flex-end; gap: 0.75rem; }
.flex-1 { flex: 1; }

.field label {
  font-size: 0.8rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.field input, .field textarea {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: #fff;
  padding: 0.7rem 0.9rem;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
  resize: vertical;
}

.field input:focus, .field textarea:focus { border-color: #444; }

.btn-fetch {
  background: #1a1a1a;
  border: 1px solid #333;
  color: #ccc;
  padding: 0.7rem 1.1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  height: fit-content;
}

.btn-fetch:hover:not(:disabled) { border-color: #555; color: #fff; }
.btn-fetch:disabled { opacity: 0.5; cursor: not-allowed; }

.thumb-preview { display: flex; align-items: center; gap: 1rem; }
.thumb-preview img {
  width: 160px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #2a2a2a;
}

.categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.6rem; }
.cat-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #ccc;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  transition: all 0.2s;
}
.cat-checkbox:hover { border-color: #444; }
.cat-checkbox input { accent-color: #fff; }

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9rem;
  color: #ccc;
  cursor: pointer;
}
.toggle-label input { accent-color: #fff; width: 16px; height: 16px; }

.error { color: #f87171; font-size: 0.85rem; }

.form-actions { display: flex; gap: 1rem; justify-content: flex-end; padding-top: 0.5rem; }

.btn-primary {
  background: #fff;
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-secondary {
  background: transparent;
  color: #888;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-secondary:hover { border-color: #555; color: #fff; }

.btn-sm {
  background: #1a1a1a;
  border: 1px solid #333;
  color: #ccc;
  padding: 0.35rem 0.7rem;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-sm:hover { border-color: #555; color: #fff; }

.preview-video-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.upload-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  overflow: hidden;
  position: relative;
}

.upload-bar {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  background: #333;
  transition: width 0.2s;
}

.upload-progress span { position: relative; font-size: 0.8rem; color: #888; }

.field input[type="file"] {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: #ccc;
  padding: 0.7rem 0.9rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-danger { border-color: #450a0a; color: #f87171; }
.btn-danger:hover { background: #450a0a; }
</style>
