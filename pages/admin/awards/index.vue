<template>
  <div>
    <div class="page-header">
      <h1>Récompenses</h1>
      <button class="btn-primary" @click="addRow">+ Ajouter une récompense</button>
    </div>

    <p class="hint">
      Affichées dans la section « Recognized where it matters » de la page About.
      Glisse pour réordonner, puis Sauvegarder. L'ordre du haut = affiché en premier.
    </p>

    <div v-if="loading" class="state-msg">Chargement…</div>
    <div v-else-if="!awards.length" class="state-msg">Aucune récompense. <button class="link-btn" @click="addRow">Ajouter la première →</button></div>

    <div v-else class="awards-list">
      <div class="awards-row awards-header">
        <span></span>
        <span>Année</span>
        <span>Nom / Festival</span>
        <span>Projet</span>
        <span>Mention</span>
        <span></span>
      </div>

      <div
        v-for="(a, index) in awards"
        :key="a.id || a.tmp"
        class="awards-row"
        :class="{ 'is-dragging': dragIndex === index, 'is-over': dropIndex === index && dragIndex !== index }"
        draggable="true"
        @dragstart="onDragStart(index, $event)"
        @dragover.prevent="onDragOver(index)"
        @dragend="onDragEnd"
        @drop.prevent="onDrop(index)"
      >
        <span class="drag-handle" title="Réordonner">⠿</span>
        <input v-model="a.year" type="text" placeholder="2024" class="cell-input" />
        <input v-model="a.name" type="text" placeholder="Cannes Lions" class="cell-input" />
        <input v-model="a.project" type="text" placeholder="Nom du projet" class="cell-input" />
        <input v-model="a.tag" type="text" placeholder="Shortlist" class="cell-input" />
        <button class="btn-sm btn-danger" @click="removeRow(index)">Supprimer</button>
      </div>
    </div>

    <div v-if="awards.length" class="actions">
      <button class="btn-primary" :disabled="saving" @click="saveAll">
        {{ saving ? 'Sauvegarde…' : 'Sauvegarder' }}
      </button>
      <span v-if="savedMsg" class="saved-msg">{{ savedMsg }}</span>
      <span v-if="errorMsg" class="error-msg">{{ errorMsg }}</span>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/utils/supabase'

export default {
  layout: 'admin',
  middleware: 'admin-auth',
  name: 'AdminAwards',

  data () {
    return {
      awards: [],
      loading: true,
      saving: false,
      savedMsg: '',
      errorMsg: '',
      dragIndex: null,
      dropIndex: null,
      deletedIds: []
    }
  },

  async mounted () {
    await this.fetchAwards()
  },

  methods: {
    async fetchAwards () {
      this.loading = true
      const { data, error } = await supabase
        .from('awards')
        .select('*')
        .order('order_index', { ascending: false })
      if (error) this.errorMsg = 'Erreur de chargement : ' + error.message
      this.awards = (data || []).map(a => ({ ...a }))
      this.loading = false
    },

    addRow () {
      this.awards.unshift({
        tmp: Date.now() + Math.random(),
        year: '',
        name: '',
        project: '',
        tag: ''
      })
    },

    removeRow (index) {
      const row = this.awards[index]
      if (row && row.id) this.deletedIds.push(row.id)
      this.awards.splice(index, 1)
    },

    onDragStart (index, e) { this.dragIndex = index; e.dataTransfer.effectAllowed = 'move' },
    onDragOver (index) { this.dropIndex = index },
    onDragEnd () { this.dragIndex = null; this.dropIndex = null },
    onDrop (toIndex) {
      const from = this.dragIndex
      if (from === null || from === toIndex) { this.dragIndex = null; this.dropIndex = null; return }
      const arr = [...this.awards]
      const [moved] = arr.splice(from, 1)
      arr.splice(toIndex, 0, moved)
      this.awards = arr
      this.dragIndex = null
      this.dropIndex = null
    },

    async saveAll () {
      this.saving = true
      this.savedMsg = ''
      this.errorMsg = ''

      try {
        // Supprime les lignes retirées
        if (this.deletedIds.length) {
          const { error: delErr } = await supabase.from('awards').delete().in('id', this.deletedIds)
          if (delErr) throw delErr
          this.deletedIds = []
        }

        // Validation simple
        const rows = this.awards.filter(a => (a.year || '').trim() || (a.name || '').trim())
        if (rows.some(a => !(a.name || '').trim())) {
          throw new Error('Chaque récompense doit avoir un nom.')
        }

        // order_index : le haut de la liste = plus grand index (affiché en 1er)
        const total = rows.length
        const payload = rows.map((a, i) => {
          const base = {
            year: (a.year || '').trim(),
            name: (a.name || '').trim(),
            project: (a.project || '').trim(),
            tag: (a.tag || '').trim(),
            order_index: total - i,
            published: true
          }
          if (a.id) base.id = a.id
          return base
        })

        const { error: upErr } = await supabase.from('awards').upsert(payload)
        if (upErr) throw upErr

        await this.fetchAwards()
        this.savedMsg = 'Enregistré ✓'
        setTimeout(() => { this.savedMsg = '' }, 2500)
      } catch (err) {
        this.errorMsg = 'Erreur : ' + (err.message || err)
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}
.page-header h1 { font-size: 1.6rem; }

.hint {
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
  max-width: 60ch;
}

.state-msg { color: #aaa; padding: 2rem 0; }
.link-btn {
  background: none; border: none; color: #ff8600; cursor: pointer; font: inherit; text-decoration: underline;
}

.awards-list { display: flex; flex-direction: column; gap: 0.5rem; }

.awards-row {
  display: grid;
  grid-template-columns: 2rem 5rem 1fr 1fr 9rem 6rem;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 0.8rem;
  background: #141414;
  border: 1px solid #222;
  border-radius: 6px;
}
.awards-row.is-dragging { opacity: 0.4; }
.awards-row.is-over { border-color: #ff8600; }

.awards-header {
  background: none;
  border: none;
  padding-bottom: 0;
  color: #777;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.drag-handle { cursor: grab; color: #555; text-align: center; }

.cell-input {
  width: 100%;
  background: #0d0d0d;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  padding: 0.5rem 0.7rem;
  color: #fff;
  font: inherit;
  font-size: 0.9rem;
  outline: none;
}
.cell-input:focus { border-color: #ff8600; }

.btn-primary {
  background: #ff8600;
  color: #000;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
}
.btn-primary:disabled { opacity: 0.5; cursor: default; }

.btn-sm {
  background: none;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
  color: #aaa;
  font-size: 0.8rem;
  cursor: pointer;
}
.btn-danger { color: #ff6b4a; border-color: #5a2a22; }
.btn-danger:hover { background: #2a1410; }

.actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}
.saved-msg { color: #4ade80; font-size: 0.9rem; }
.error-msg { color: #ff6b4a; font-size: 0.9rem; }
</style>
