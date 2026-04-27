<template>
  <div class="admin-layout">
    <nav class="admin-nav" v-if="isAuthenticated">
      <NuxtLink to="/admin/projects" class="admin-nav_logo">MÉCHANT Admin</NuxtLink>
      <div class="admin-nav_links">
        <NuxtLink to="/admin/projects">Projets</NuxtLink>
        <button @click="logout">Déconnexion</button>
      </div>
    </nav>
    <main class="admin-main">
      <Nuxt />
    </main>
  </div>
</template>

<script>
import { supabase } from '@/utils/supabase'

export default {
  name: 'AdminLayout',
  data() {
    return { isAuthenticated: false }
  },
  async mounted() {
    const { data: { session } } = await supabase.auth.getSession()
    this.isAuthenticated = !!session
  },
  methods: {
    async logout() {
      await supabase.auth.signOut()
      this.$router.push('/admin/login')
    }
  }
}
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

.admin-layout {
  min-height: 100vh;
  background: #0a0a0a;
  color: #fff;
  font-family: system-ui, -apple-system, sans-serif;
}

.admin-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 2rem;
  background: #111;
  border-bottom: 1px solid #222;
  position: sticky;
  top: 0;
  z-index: 10;
}

.admin-nav_logo {
  font-weight: 700;
  font-size: 1rem;
  color: #fff;
  text-decoration: none;
  letter-spacing: 0.1em;
}

.admin-nav_links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.admin-nav_links a {
  color: #aaa;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.admin-nav_links a:hover,
.admin-nav_links a.nuxt-link-active {
  color: #fff;
}

.admin-nav_links button {
  background: none;
  border: 1px solid #333;
  color: #aaa;
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-nav_links button:hover {
  border-color: #555;
  color: #fff;
}

.admin-main {
  padding: 2.5rem 2rem;
  max-width: 1100px;
  margin: 0 auto;
}
</style>
