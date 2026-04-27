import {
  MeshPhysicalMaterial,
  MeshBasicMaterial,
  DoubleSide,
  sRGBEncoding,
  NearestFilter
} from 'three'

import ResourceLoader from '@/webgl/vendor/resource-loader/ResourceLoader'

class Materials {
  constructor ({ ...args }) {
    this.add(args)
  }

  static materials = {}

  add ({ resources }) {
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i]

      if (typeof (resource) === 'string') {
        Materials.materials[resource] = this.getMaterial({ name: resource, options: { side: DoubleSide }, params: {} })
      } else {
        Materials.materials[resource.name] = this.getMaterial(resource)
      }
    }
  }

  getMaterial (resource) {
    const { type = null, name, options = null, params = null } = resource

    let texture = null

    switch (type) {
      case 'MeshBasicMaterial':
        texture = ResourceLoader.get(name)
        texture.flipY = false
        texture.encoding = sRGBEncoding
        texture.generateMipmaps = false
        texture.minFilter = NearestFilter

        return new MeshBasicMaterial({
          map: texture,
          ...options
        })
      case 'ColorBasicMaterial':
        return new MeshBasicMaterial({
          ...options
        })
      case 'MeshPhysicalMaterial':
        return new MeshPhysicalMaterial({
          ...options
        })
      default:
        texture = ResourceLoader.get(name)
        texture.flipY = false

        return new MeshBasicMaterial({
          map: texture,
          transparent: true
        })
    }
  }

  static get (name) {
    return this.getMaterialByName(name)
  }

  static getMaterialByName (name) {
    return this.materials[name] || null
  }

  static setModelTextures (model) {
    model.traverse((m) => {
      if (m.name && m.material) {
        const name = Object.keys(this.materials).find(s => m.name.includes(s))

        if (name) {
          m.material = this.getMaterialByName(name)
        }
      }
    })
  }
}

export default Materials
