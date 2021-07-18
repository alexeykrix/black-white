class Stick {
  constructor(selector, color = '#ededed', width = 100, dotWidth) {
    this.wrapper = document.querySelector(selector)
    this.wrapper.innerHTML = 
    `<div class="stick__wrapper"><div class="stick__dot"></div></div>`
    this.stick = {
      container: this.wrapper.querySelector('.stick__wrapper'),
      dot: this.wrapper.querySelector('.stick__dot'),
      x: null,
      y: null,
      dotX: null,
      dotY: null,
      radius: null,
      old: {},
      direction: {
        x: '',
        y: '',
      }, 
      width,
      dotWidth: dotWidth? dotWidth : width * 0.3,
      color,
    }
  }

  updateDot = () => {
    this.stick.dot.style.transform = 
      `translate(${this.stick.dotX}px, ${this.stick.dotY}px)`
  }
  upadteStyles = () => {
    this.wrapper.style.width = this.stick.width+'px'
    this.wrapper.style.height = this.stick.width+'px'
    this.stick.container.style.cssText = `
      position: relative; 
      border: 4px solid ${this.stick.color};
      border-radius: 100%; 
      width: ${this.stick.width}px; 
      height: ${this.stick.width}px; 
    `
    const dotPos = this.stick.width/2-this.stick.dotWidth/2-5
    this.stick.dot.style.cssText = `
      position: absolute; 
      left: ${dotPos}px; 
      top: ${dotPos}px; 
      width: ${this.stick.dotWidth}px; 
      height: ${this.stick.dotWidth}px; 
      border-radius: 100%; 
      background: ${this.stick.color};
    `
  }

  checkDirection = () => {
    this.stick.radius = Math.sqrt(this.stick.dotX**2 + this.stick.dotY**2)
    this.stick.ax = this.stick.dotX
    const sin = Math.abs(this.stick.dotY) / this.stick.radius
    let angle = Math.round(Math.asin(sin) * 57.2958)

    // check fourth
    if (-this.stick.dotX > 0 && -this.stick.dotY > 0) {
      angle = 180 - angle
    } else if (-this.stick.dotX > 0 && -this.stick.dotY < 0) {
      angle = 180 + angle
    } else if (-this.stick.dotX < 0 && -this.stick.dotY < 0) {
      angle = 360 - angle
    }

    if (this.stick.radius < 10) return

    if (angle <= 20 || angle >= 340) this.stick.direction.x = 'right', this.stick.direction.y = ''
    if (angle > 20 && angle < 70) {
      this.stick.direction.x = 'right'
      this.stick.direction.y = this.stick.radius >= 45? 'up' :''
    }
    if (angle >= 70 && angle <= 110) this.stick.direction.y = 'up'
    if (angle > 110 && angle < 160) {
      this.stick.direction.x = 'left'
      this.stick.direction.y = this.stick.radius >= 45? 'up' :''
    }
    if (angle >= 160 && angle <= 200) this.stick.direction.x = 'left', this.stick.direction.y = ''
    if (angle > 200 && angle < 250) this.stick.direction.x = 'left', this.stick.direction.y = ''
    if (angle >= 250 && angle < 290) this.stick.direction.y = 'down'
    if (angle > 290 && angle < 340) this.stick.direction.x = 'right', this.stick.direction.y = ''
  }

  handlerMove = evt => {
    let e = evt.touches? evt.touches[0] : evt

    let mouseX = e.clientX - this.stick.x - this.stick.width/2
    let mouseY = e.clientY - this.stick.y - this.stick.width/2
    if (Math.pow(mouseX, 2) + Math.pow(mouseY, 2) < (this.stick.width/2)**2) {
      this.stick.dotX = e.clientX - this.stick.x - this.stick.width/2
      this.stick.dotY = e.clientY - this.stick.y - this.stick.width/2

      if (Math.sqrt(Math.pow(mouseX, 2) + Math.pow(mouseY, 2)) < 10 ) {
        this.stick.direction = { x: '', y: '' }
      }
    } else {
      let bigLine = Math.sqrt(mouseX**2 + mouseY**2)
      let sin = mouseY / bigLine
      let cos = mouseX / bigLine
      
      this.stick.dotX = cos * this.stick.width/2
      this.stick.dotY = sin * this.stick.width/2
    }

    this.stick.old = {
      x: this.stick.x,
      y: this.stick.y,
      left: this.stick.old.left,
      bottom: this.stick.old.bottom,
      clientX: e.clientX,
      clientY: e.clientY,
    }
    
    this.updateDot()
    this.checkDirection()
  }
  handlerStart = evt => {
    let e = evt.touches? evt.touches[0] : evt
    if (!e.target.closest('.stick__wrapper')) {
      if (e.clientX > window.innerWidth/2) return
      this.wrapper.style.display = 'block'
      
      if (this.stick.old.clientX
      && Math.abs(e.clientX - this.stick.old.clientX) < 30 
      && Math.abs(e.clientY - this.stick.old.clientY) < 30 ) {
        this.wrapper.style.left = this.stick.old.left
        this.wrapper.style.bottom = this.stick.old.bottom
        this.stick.x = this.stick.old.x
        this.stick.y = this.stick.old.y
      } else {
        this.wrapper.style.left = e.clientX - this.stick.width/2 +'px'
        this.wrapper.style.bottom = window.innerHeight - this.stick.width/2  - e.clientY+'px'
        this.stick.x = this.wrapper.offsetLeft
        this.stick.y = this.wrapper.offsetTop
        this.stick.old = {
          x: this.stick.x,
          y: this.stick.y,
          left: e.clientX - this.stick.width/2 +'px',
          bottom: window.innerHeight - this.stick.width/2  - e.clientY+'px',
          clientX: e.clientX,
          clientY: e.clientY,
        }
      }
    }
    this.handlerMove(evt)
    document.addEventListener('touchmove', this.handlerMove)
    this.stick.pressed = true
    this.stick.ax = this.stick.dotX
  }
  handlerEnd = evt => {
    let e = evt.changedTouches? evt.changedTouches[0] : evt
    if (evt.changedTouches) { 
      if (evt.changedTouches[0].target.closest('#invertSvg')) return
    }
    
    document.removeEventListener('touchmove', this.handlerMove)
    this.stick.dotX = 0
    this.stick.dotY = 0
    this.stick.radius = 0
    this.stick.direction = { x: '', y: '' }
    this.updateDot()
    this.stick.pressed = false
    this.wrapper.style.display = 'none'
    this.stick.ax = 0
  }
  handlerCancel = e => e.preventDefault()

  init = () => {
    console.log('init')
    this.upadteStyles()
    this.stick.x = this.wrapper.offsetLeft
    this.stick.y = this.wrapper.offsetTop
    document.addEventListener('touchstart', this.handlerStart)
    document.addEventListener('touchend', this.handlerEnd)
    document.addEventListener('touchcancel', this.handlerCancel)
  }
  stop = () =>  {
    console.log('stop')
    document.removeEventListener('touchstart', this.handlerStart)
    document.removeEventListener('touchend', this.handlerEnd)
    document.removeEventListener('touchcancel', this.handlerCancel)
    this.wrapper.style.display = 'none'
    this.x = null
    this.y = null
  }

  getValues = () => ({
    strength: 1,
    direction: this.stick.direction,
    pressed: this.stick.pressed,
    ax: this.stick.ax*2/100 || 0,
  })
}

export default Stick