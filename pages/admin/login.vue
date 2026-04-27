<template>
  <div class="login-page">
    <form class="login-form" @submit.prevent="login">
      <div class="login-form_logo">MÉCHANT</div>
      <h1 class="login-form_title">Backoffice</h1>

      <div class="field">
        <label>Email</label>
        <input type="email" v-model="email" autocomplete="email" required />
      </div>
      <div class="field">
        <label>Mot de passe</label>
        <input type="password" v-model="password" autocomplete="current-password" required />
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <button type="submit" :disabled="loading" class="btn-primary">
        {{ loading ? 'Connexion…' : 'Se connecter' }}
      </button>
    </form>
  </div>
</template>

<script>
import { supabase } from '@/utils/supabase'

export default {
  layout: 'admin',
  name: 'AdminLogin',
  data() {
    return {
      email: '',
      password: '',
      error: null,
      loading: false
    }
  },
  async mounted() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) this.$router.push('/admin/projects')
  },
  methods: {
    async login() {
      this.error = null
      this.loading = true
      const { error } = await supabase.auth.signInWithPassword({
        email: this.email,
        password: this.password
      })
      this.loading = false
      if (error) {
        this.error = 'Email ou mot de passe incorrect.'
      } else {
        this.$router.push('/admin/projects')
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0a;
}

.login-form {
  width: 100%;
  max-width: 380px;
  background: #111;
  border: 1px solid #222;
  border-radius: 12px;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.login-form_logo {
  font-weight: 900;
  font-size: 1.4rem;
  letter-spacing: 0.12em;
  color: #fff;
}

.login-form_title {
  font-size: 1.1rem;
  font-weight: 400;
  color: #888;
  margin-top: -0.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field label {
  font-size: 0.8rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.field input {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: #fff;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.field input:focus {
  border-color: #444;
}

.error {
  color: #f87171;
  font-size: 0.85rem;
}

.btn-primary {
  background: #fff;
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 0.85rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-top: 0.5rem;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
