import Tweakpane from 'tweakpane'
import { singleton } from '../../utils/Singleton'

class Debug extends singleton(Tweakpane) {
  static folders = {}

  /**
   * Public
   */
  destroy () {
    this.dispose()
  }

  getFolder (id) {
    if (Debug.folders[id]) {
      return Debug.folders[id]
    } else {
      return this.addFolder({ title: id, expanded: false })
    }
  }

  addFolder (options) {
    const folder = super.addFolder(options)
    folder.refresh = this.refresh

    Debug.folders[options.title] = folder

    return folder
  }

  static addExportInput (folder, value) {
    folder.addButton({ title: 'Export' }).on('click', () => {
      const props = {
        [folder.title]: value
      }
      const string = JSON.stringify(props)
      const input = document.createElement('input')
      input.setAttribute('type', 'text')
      input.setAttribute('value', string)
      input.style.position = 'absolute'
      input.style.opacity = 0
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    })
  }
}

export default Debug
