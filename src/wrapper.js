import { throttle } from './throttle'

export class Wrapper {
  constructor(element) {
    this.element = element

    this.resizeObserver = new ResizeObserver(throttle(this.onResize, 100))
    this.resizeObserver.observe(this.element)
    this.onResize()
  }

  destroy() {
    this.resizeObserver.disconnect()
  }

  get isRoot() {
    return (
      this.element === document.documentElement ||
      this.element === document.body
    )
  }

  onResize = () => {
    console.log('onResize')

    if (this.root) {
      this.clientWidth = window.innerWidth
      this.clientHeight = window.innerHeight
    } else {
      this.clientWidth = this.element.clientWidth
      this.clientHeight = this.element.clientHeight
    }

    this.scrollWidth = this.element.scrollWidth
    this.scrollHeight = this.element.scrollHeight
  }

  get limit() {
    return {
      x: this.scrollWidth - this.clientWidth,
      y: this.scrollHeight - this.clientHeight,
    }
  }
}
