export default (req, res, next) => {
  const basicAuth = req?.headers?.authorization

  if (process.env.NODE_ENV === 'development')
    return next()

  if (basicAuth) {
    const auth = basicAuth.split(' ')[1]
    const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':')

    if (user === process.env.CLIENT_BASIC_AUTH_USER && pwd === process.env.CLIENT_BASIC_AUTH_PASSWORD) {
      return next()
    }
  }

  res.statusCode = 401
  res.setHeader('WWW-authenticate', 'Basic realm="Secure Area"')
  return res.end()
}
