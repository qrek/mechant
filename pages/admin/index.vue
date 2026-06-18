<template>
  <div class="admin-redirect"></div>
</template>

<script>
// /admin (chemin nu) n'avait pas de route → 404 sur Vercel.
// Cette page existe pour créer la route et rediriger vers l'admin.
// → /admin/projects (qui redirige lui-même vers /admin/login si pas de session
//    via le middleware admin-auth).
export default {
  name: 'AdminIndex',
  middleware ({ redirect }) {
    return redirect('/admin/projects')
  },
  mounted () {
    // Filet de sécurité si le middleware ne s'est pas déclenché côté client
    if (this.$route.path === '/admin' || this.$route.path === '/admin/') {
      this.$router.replace('/admin/projects')
    }
  }
}
</script>

<style lang="sass" scoped>
.admin-redirect
  min-height: 100vh
  background: #0a0a0a
</style>
