import loadFont from 'load-bmfont'

class ThreeFNTLoader {
  load ({ path }) {
    return new Promise((resolve, reject) => {
      loadFont(path, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }
}

export default ThreeFNTLoader
