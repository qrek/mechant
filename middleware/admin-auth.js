import { supabase } from '@/utils/supabase'

export default async function ({ route, redirect }) {
  if (!process.client) return

  if (route.path === '/admin/login') return

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return redirect('/admin/login')
  }
}
