import { supabase } from '@/utils/supabase'

export default function ({ route, redirect }) {
  if (!process.client) return

  if (route.path === '/admin/login') return

  const session = supabase.auth.session()

  if (!session) {
    return redirect('/admin/login')
  }
}
