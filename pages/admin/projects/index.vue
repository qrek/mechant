<template>
  <div>
    <div class="page-header">
      <h1>Projets</h1>
      <NuxtLink to="/admin/projects/add" class="btn-primary">+ Ajouter un projet</NuxtLink>
    </div>

    <div v-if="loading" class="state-msg">Chargement…</div>
    <div v-else-if="!projects.length" class="state-msg">Aucun projet. <NuxtLink to="/admin/projects/add">Ajouter le premier →</NuxtLink></div>

    <div v-else class="projects-table">
      <div class="table-row table-header">
        <span>Miniature</span>
        <span>Titre / Client</span>
        <span>Vimeo ID</span>
        <span>Héro</span>
        <span>Statut</span>
        <span>Actions</span>
      </div>
      <div v-for="p in projects" :key="p.id" class="table-row">
        <div class="col-thumb">
          <img v-if="p.thumbnail_url" :src="p.thumbnail_url" :alt="p.title" />
          <div v-else class="thumb-placeholder">—</div>
        </div>
        <div class="col-title">
          <strong>{{ p.title }}</strong>
          <span>{{ p.client }}</span>
        </div>
        <div class="col-vimeo">{{ p.vimeo_id }}</div>
        <div class="col-hero">
          <span :class="['badge', p.is_hero ? 'badge-orange' : 'badge-dim']">
            {{ p.is_hero ? 'Héro' : '—' }}
          </span>
        </div>
        <div class="col-status">
          <button
            class="badge"
            :class="p.published ? 'badge-green' : 'badge-red'"
            @click="togglePublished(p)"
          >
            {{ p.published ? 'Publié' : 'Masqué' }}
          </button>
        </div>
        <div class="col-actions">
          <NuxtLink :to="`/admin/projects/${p.id}/edit`" class="btn-sm">Éditer</NuxtLink>
          <button class="btn-sm btn-danger" @click="deleteProject(p)">Supprimer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/utils/supabase'

export default {
  layout: 'admin',
  middleware: 'admin-auth',
  name: 'AdminProjects',
  data() {
    return {
      projects: [],
      loading: true
    }
  },
  async mounted() {
    await this.fetchProjects()
  },
  methods: {
    async fetchProjects() {
      this.loading = true
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('order_index', { ascending: false })
      this.projects = data || []
      this.loading = false
    },
    async togglePublished(project) {
      await supabase
        .from('projects')
        .update({ published: !project.published })
        .eq('id', project.id)
      project.published = !project.published
    },
    async deleteProject(project) {
      if (!confirm(`Supprimer "${project.title}" ?`)) return
      await supabase.from('projects').delete().eq('id', project.id)
      this.projects = this.projects.filter(p => p.id !== project.id)
    }
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
}

.btn-primary {
  background: #fff;
  color: #000;
  text-decoration: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: opacity 0.2s;
}

.btn-primary:hover { opacity: 0.85; }

.state-msg {
  color: #666;
  padding: 3rem 0;
  text-align: center;
}

.state-msg a { color: #fff; }

.projects-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 1fr 120px 80px 90px 160px;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  background: #111;
  border: 1px solid #1e1e1e;
  border-radius: 10px;
}

.table-header {
  background: transparent;
  border: none;
  padding: 0 1rem 0.3rem;
  font-size: 0.75rem;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.col-thumb img, .thumb-placeholder {
  width: 72px;
  height: 42px;
  object-fit: cover;
  border-radius: 6px;
  background: #1e1e1e;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #444;
  font-size: 0.75rem;
}

.col-title {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.col-title strong { font-size: 0.95rem; }
.col-title span { font-size: 0.8rem; color: #666; }

.col-vimeo { font-size: 0.8rem; color: #888; font-family: monospace; }

.badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 5px;
  font-size: 0.75rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.badge-green { background: #14532d; color: #4ade80; }
.badge-red   { background: #450a0a; color: #f87171; }
.badge-orange { background: #431407; color: #fb923c; }
.badge-dim   { background: #1a1a1a; color: #555; cursor: default; }

.col-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.35rem 0.7rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid #333;
  background: #1a1a1a;
  color: #ccc;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-sm:hover { border-color: #555; color: #fff; }

.btn-danger { border-color: #450a0a; color: #f87171; }
.btn-danger:hover { background: #450a0a; }
</style>
