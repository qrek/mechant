export default function(doc) {
  if (doc.type === 'homepage') return '/'
  if (doc.type === 'projects_page') return '/works'
  if (doc.type === 'about') return '/about'
  if (doc.type === 'project') return '/works'
  if (doc.type === 'cookies') return '/cookies'
  if (doc.type === 'privacy_policy') return '/privacy_policy'
  return '/'
}