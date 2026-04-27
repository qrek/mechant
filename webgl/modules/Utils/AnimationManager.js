import {
  AnimationMixer,
  LoopOnce,
  LoopRepeat,
  LoopPingPong
} from 'three'
import { component } from 'bidello'

class AnimationManager extends component() {
  constructor ({ model }) {
    super()

    this._model = model
    this._mixer = this._setMixer(model)
    this._animations = model.animations.reduce((wrap, animation) => {
      wrap[animation.name] = this._mixer.clipAction(animation)

      return wrap
    }, {})

    this._animationsActions = []
    this._animationsCbk = {}

    this._pausedTimeOut = {}
  }

  playAnimation ({ name, loop = false, yoyo = false, from = 0, to = 1, timeScale = 1, cbk = null }) {
    const action = this._animations[name]

    this._animationsActions.push({
      action,
      name,
      yoyo,
      from,
      to,
      timeScale,
      cbk,
      duration: action._clip.duration
    })

    if (action) {
      if (cbk) {
        this._animationsCbk[name] = cbk
      }

      if (from !== 0) {
        this._animations[name].time = (this._animations[name].getClip().duration) * from
      } else {
        this._animations[name].time = 0
      }

      if (!loop) {
        this._animations[name].clampWhenFinished = true
        this._animations[name].setLoop(LoopOnce)
      }

      if (yoyo) {
        this._animations[name].clampWhenFinished = true
        this._animations[name].setLoop(LoopPingPong)
        this._animations[name].repetitions = 2
      }

      if (loop) {
        this._animations[name].repetitions = LoopRepeat
      }

      this._setWeight(this._animations[name], 1.0)

      this._animations[name].paused = false
      this._animations[name].setEffectiveTimeScale(timeScale)
      this._animations[name].play()

      if (to !== 1) {
        const duration = this._animations[name]._clip.duration

        setTimeout(() => {
          this._animations[name].paused = true
          this._handleCbk(name)
        }, ((duration / Math.abs(timeScale)) * to) * 1000)
      }
    } else {
      console.error('Animation Action not found')
    }
  }

  playAnimations (animations = []) {
    for (let i = 0; i < animations.length; i++) {
      this.playAnimation(animations[i])
    }
  }

  stopAllAnimations (timeScale = 1) {
    if (this._animationsActions.length) {
      for (let i = 0; i < this._animationsActions.length; i++) {
        const { action } = this._animationsActions[i]

        action.setEffectiveTimeScale(timeScale)
        action.setLoop(LoopOnce)
      }
    }
  }

  pauseAnimations (animations = []) {
    for (let i = 0; i < animations.length; i++) {
      const { name, add, to } = animations[i]
      const source = this._animationsActions.find(a => a.name === name)
      const { action, timeScale, duration } = source
      const additionalTime = source[add] || 0
      const delay = (((to + additionalTime) - action.time) < 0) ? duration + ((to + additionalTime) - action.time) : ((to + additionalTime) - action.time)

      this._pausedTimeOut[name] = setTimeout(() => {
        action.paused = true
      }, (((duration) / Math.abs(timeScale)) * (delay)) * 1000)
    }
  }

  unPauseAnimations (animations) {
    for (let i = 0; i < animations.length; i++) {
      const { name } = animations[i]
      const { action } = this._animationsActions.find(a => a.name === name)

      clearTimeout(this._pausedTimeOut[name])

      action.paused = false
      action.play()
    }
  }

  resumeAllAnimations (timeScale = 1, loop = true) {
    if (this._animationsActions.length) {
      for (let i = 0; i < this._animationsActions.length; i++) {
        const { action } = this._animationsActions[i]

        action.time = 0
        action.clampWhenFinished = true
        this._setWeight(action, 1.0)

        action.setEffectiveTimeScale(timeScale)
        const loopStatus = (loop) ? LoopRepeat : LoopOnce
        action.setLoop(loopStatus)
        action.paused = false
        action.play()
      }
    }
  }

  _setMixer ({ scene }) {
    const mixer = new AnimationMixer(scene)

    mixer.addEventListener('finished', (e) => {
      const { action } = e
      const name = Object.keys(this._animations).find(key => this._animations[key] === action)

      if (name && this._animationsCbk[name]) {
        this._handleCbk(name)
      }
    })

    return mixer
  }

  _handleCbk (name) {
    if (this._animationsCbk[name])
      this._animationsCbk[name]()

    this._animationsCbk[name] = null
  }

  _setWeight (action, weight) {
    action.enabled = true
    action.setEffectiveWeight(weight)
  }

  onUpdate ({ delta }) {
    if (this._mixer) {
      this._mixer.update(delta)
    }
  }
}

export default AnimationManager
