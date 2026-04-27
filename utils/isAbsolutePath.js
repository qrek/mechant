/**
 * Regex: https://stackoverflow.com/a/19709846
 * @param {String} path
 * @returns {Boolean}
 */
function isAbsolutePath (path) {
  const regex = /^(?:[a-z]+:)?\/\//i

  return regex.test(path)
}

export default isAbsolutePath
