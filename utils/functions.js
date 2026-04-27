export function debounce (cb, delay) {
  let timer

  return function () {
    const args = arguments
    const context = this

    clearTimeout(timer)

    timer = setTimeout(function () {
      cb.apply(context, args)
    }, delay)
  }
}
