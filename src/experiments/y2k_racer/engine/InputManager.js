export default class InputManager {
  constructor(target = window) {
    this.target = target
    this.keys = new Set()
    this._onKeyDown = this._onKeyDown.bind(this)
    this._onKeyUp = this._onKeyUp.bind(this)
    this.bind()
  }

  bind() {
    this.target.addEventListener('keydown', this._onKeyDown)
    this.target.addEventListener('keyup', this._onKeyUp)
  }

  _onKeyDown(e) {
    this.keys.add(e.code)
    // Prevent page scroll from arrow keys / space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault()
    }
  }

  _onKeyUp(e) {
    this.keys.delete(e.code)
  }

  getState() {
    return {
      forward: this.keys.has('KeyW') || this.keys.has('ArrowUp'),
      backward: this.keys.has('KeyS') || this.keys.has('ArrowDown'),
      left: this.keys.has('KeyA') || this.keys.has('ArrowLeft'),
      right: this.keys.has('KeyD') || this.keys.has('ArrowRight'),
      brake: this.keys.has('Space'),
      pause: this.keys.has('Escape'),
    }
  }

  consumePause() {
    this.keys.delete('Escape')
  }

  consumeEnter() {
    this.keys.delete('Enter')
  }

  hasEnter() {
    return this.keys.has('Enter')
  }

  dispose() {
    this.target.removeEventListener('keydown', this._onKeyDown)
    this.target.removeEventListener('keyup', this._onKeyUp)
    this.keys.clear()
  }
}
