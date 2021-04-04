import Stick from './stick.js'

let 
color = 'black',
lvl = 0,
edit = false,
lvls = data,
moveDirections = [],
moveInterval = null,
pressed = '',
inJump = false,
inFall = false,
jumpCount = 0,
jumpHeight = 189.5,
jumpCoef = 1,
stick = new Stick('.stick', '#474747', 100),
cursor = {
  x: 0,
  y: 0,
  startX: 0,
  startY: 0,
  w: 1,
  h: 1,
  grab: false,
  player: false,
  star: false,
  mode: null,
  blockId: null,
},
profile = JSON.parse(localStorage.getItem('black-white-settings')) || {
  camera: 'static',
}

const 
starSvg = document.querySelector('#starSvg'),
invertSvg = document.querySelector('#invertSvg'),
fullscreenSvg = document.querySelector('#fullscreenSvg'),
canvas = document.createElement('canvas'),
c = canvas.getContext('2d'),
screen = {
  w: 1280,
  h: 720,
  scale: { x: 0, y: 0 }
},
player = {
  sprite: new Image(),
  w: 35,
  h: 70,
  x: lvls[lvl].player.startX,
  y: lvls[lvl].player.startY,
  vx: 0,
  ax: 0,
  maxVx: 2,
  vy: 0,
  ay: -0.1,
  maxVy: 2,
},
star = {
  sprite: {
    black: new Image(),
    white: new Image(),
  },
  w: 35,
  h: 35,
},
menu = {
  template: `
    <h2 class="menu__heading"> Black & <span>white</span> </h2>
    <ul class="menu__list">
      <li class="list__item">
        <button class="menu__btn" data-id="0"> play </button>
      </li>
      <li class="list__item">
        <button class="menu__btn" data-id="1"
        style="text-decoration: line-through;"> editor </button>
      </li>
      <li class="list__item">
        <button class="menu__btn" data-id="2"> settings </button>
      </li>
    </ul>
  `,
  el: null,
  init() {
    this.el = document.createElement('section')
    this.el.classList = 'menu'
    this.el.innerHTML = this.template
    document.body.appendChild(this.el)
    this.el.addEventListener('touchstart', handler.MenuTouchStart)
    this.el.addEventListener('click', handler.MenuClick)
    fullscreenSvg.addEventListener('click', handler.ClickFullscreen)
    window.addEventListener('resize', checkOrientation)
    setTimeout(()=> checkOrientation(), 0)
  }
},
settings = {
  template: `
    <div class="settings__option">
      <form id="settings">
        <p class="menu__text"> camera mode
          <select name="camera">
            <option value="static" ${profile.camera==='static'? 'selected': ''}>static</option>
            <option value="fixed" ${profile.camera==='fixed'? 'selected': ''}>fixed</option>
          </select>
        </p>
      </form>
    </div>
    <button class="menu__btn btn-back">back</button>
  `,
  el: null,
  init() {
    this.el = document.createElement('section')
    this.el.classList = 'settings hide'
    this.el.innerHTML = this.template
    document.body.appendChild(this.el)
    this.form = this.el.querySelector('#settings')
    this.el.addEventListener('click', handler.ClickSettings)
  }
}

document.body.appendChild(canvas)
stick.enabled = false
star.sprite['black'].src = './star.svg'
star.sprite['white'].src = './star-white.svg'
player.sprite.src = './player-all.png'
canvas.width = screen.w
canvas.height = screen.h


const render =  {
  animCount: 0,
  mode: profile.camera,

  clearCanvas: function () {
    if (color === 'black') c.fillStyle = '#fff'
    else c.fillStyle = '#333'
    c.beginPath()
    c.fillRect(0, 0, screen.w, screen.h)
    if (edit) {
      c.textAlign = 'left'
      c.fillStyle = 'red'
      c.font = '20px Roboto'
      c.fillText('EDIT', 0, 20)
    }
  
    c.closePath()
  },
  renderPlayer: function () {
    let playerY = screen.h - player.y - player.h
  
    if (moveDirections[0] === 'left' || moveDirections[0] === 'right') {
      this.animCount < 4 ? this.animCount++ : this.animCount = 1
      if (inFall || inJump) this.animCount = 1
    } else this.animCount = 0
    let x = this.animCount
  
    let y = color === 'black' ? 0 : 2
    if (moveDirections[0] === 'left') y++
  
    if (this.mode === 'static') { 
      c.drawImage(player.sprite, 35 * x, 70 * y, 35, 70, player.x, playerY, 35, 70)
    } else c.drawImage(player.sprite, 35 * x, 70 * y, 35, 70, screen.w/2, screen.h/2, 35, 70)
  },
  renderTransparentBlocks: function () {
    let playerY = screen.h - player.y - player.h
    if (color === 'black') {
      lvls[lvl].blocks['white'].forEach(block => {
        c.fillStyle = '#ebebeb'
        c.beginPath()
        if (this.mode === 'static') { 
          c.fillRect(block.x, screen.h - block.y - block.h, block.w, block.h)
        } else c.fillRect(block.x + screen.w/2 - player.x, screen.h*1.5 - playerY - block.y - block.h, block.w, block.h)
        c.closePath()
      })
    } else {
      lvls[lvl].blocks['black'].forEach(block => {
        c.fillStyle = '#474747'
        c.beginPath()
        if (this.mode === 'static') { 
          c.fillRect(block.x, screen.h - block.y - block.h, block.w, block.h)
        } else c.fillRect(block.x + screen.w/2 - player.x, screen.h*1.5 - playerY - block.y - block.h, block.w, block.h)
        c.closePath()
      })
    }
  },
  renderCollisionBlocks: function () {
    let playerY = screen.h - player.y - player.h
    if (color === 'black') {
      lvls[lvl].blocks['black'].forEach((block, id) => {
        c.fillStyle = '#1b1b1b'
        if (id === cursor.blockId) c.fillStyle = '#fdd835'
        c.beginPath()
        if (this.mode === 'static') {
          c.fillRect(block.x, screen.h - block.y - block.h, block.w, block.h)
        } else c.fillRect(block.x + screen.w/2 - player.x, screen.h*1.5 - playerY - block.y - block.h, block.w, block.h)
        c.closePath()
      })
    } else {
      lvls[lvl].blocks['white'].forEach((block, id) => {
        c.fillStyle = '#fff'
        if (id === cursor.blockId) c.fillStyle = '#fdd835'
        c.beginPath()
        if (this.mode === 'static') {
          c.fillRect(block.x, screen.h - block.y - block.h, block.w, block.h)
        } else c.fillRect(block.x + screen.w/2 - player.x, screen.h*1.5 - playerY - block.y - block.h, block.w, block.h)
        c.closePath()
      })
    }
  },
  renderStar: function () {
    let playerY = screen.h - player.y - player.h
    if (this.mode === 'static') {
      c.drawImage(star.sprite[color], lvls[lvl].star.x, screen.h - lvls[lvl].star.y - star.h, star.w, star.h)
    } else c.drawImage(star.sprite[color], lvls[lvl].star.x + screen.w/2 - player.x, screen.h*1.5 - playerY - lvls[lvl].star.y - star.h, star.w, star.h)
  
  },
  render: function () {
    if (profile.camera === 'fixed') {
      canvas.width = screen.w = window.innerWidth * window.devicePixelRatio/2
      canvas.height = screen.h = window.innerHeight * window.devicePixelRatio/2
      canvas.style.width = '100%'
      canvas.style.height = '100%'
    }

    this.clearCanvas()
    this.renderTransparentBlocks()
    this.renderPlayer()
    this.renderCollisionBlocks()
    this.renderStar()

    window.requestAnimationFrame(() => this.render())
  },
}
const requestFullScreen = el => {
  let requestMethod = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen;
  if (requestMethod) requestMethod.call(el);
  
  screen.scale = {
    x: screen.w / window.innerWidth,
    y: screen.h / window.innerHeight,
  }

  setTimeout(() => stick.enabled ? stick.init() :'' , 1000);
}
const checkOrientation = () => {
  if (window.innerWidth / window.innerHeight > 1) {// landscape
    document.querySelector('.rotate-phone').classList.add('hide')
    menu.el.classList.remove('hide')
  } else {// vertical
    document.querySelector('.rotate-phone').classList.remove('hide')
    if (!settings.el) {
      menu.el.classList.add('hide')
    } else settings.el.classList.add('hide'), menu.el.classList.add('hide')
  }
}
const checkCollision = (obj1, obj2) => {
  var XColl = false;
  var YColl = false;

  if ((obj1.x + obj1.w >= obj2.x) && (obj1.x <= obj2.x + obj2.w)) XColl = true;
  if ((obj1.y + obj1.h >= obj2.y) && (obj1.y <= obj2.y + obj2.h)) YColl = true;

  if (XColl & YColl) {
    return true;
  }
  return false;
}
const moveStar = () => {
  let cordX = lvls[lvl].star.x / screen.scale.x
  let cordY = lvls[lvl].star.y / screen.scale.y

  if (screen.w - window.innerWidth < 0) {
    cordX = lvls[lvl].star.x + (window.innerWidth - screen.w)/2
    cordY = lvls[lvl].star.y + (window.innerHeight - screen.h)/2
  }

  starSvg.style.left = cordX + 'px'
  starSvg.style.bottom = cordY + 'px'
  starSvg.style.width = star.w / screen.scale.x
}
const changeLvl = () => {
  player.x = 0
  player.y = 100000

  starSvg.style.opacity = 1
  setTimeout(() => {
    starSvg.style.left = window.innerWidth / 2 + 'px'
    starSvg.style.bottom = window.innerHeight / 2 + 'px'
    starSvg.style.transform = 'scale(100)'
    setTimeout(() => {
      if (lvl + 1 === lvls.length) lvl = 0
      else lvl++
      player.x = lvls[lvl].player.startX
      player.y = lvls[lvl].player.startY
    }, 800);
    setTimeout(() => {
      if (player.y === 100000) {
        if (lvl + 1 === lvls.length) lvl = 0
        else lvl++
        player.x = lvls[lvl].player.startX
        player.y = lvls[lvl].player.startY
      }

      moveStar()
      starSvg.style.transform = ''
      setTimeout(() => {
        starSvg.style.opacity = 0
        fall()
      }, 900);
    }, 1000);
  }, 10);

}
const jump = () => {
  // if (jumpCount === 0) player.vy = 5
  // player.ay = -0.065
  // if (player.vy + player.ay > 0.01) player.vy += player.ay
  
  // player.y += player.vy
  // jumpCount += player.vy
  // let crossing = false
  // lvls[lvl].blocks[color].forEach(block => {
  //   let result = checkCollision(block, player)
  //   if (result) crossing = result
  // })

  // if (crossing || jumpCount >= jumpHeight * jumpCoef) {
  //   inJump = false
  //   jumpCount = 0
  //   inFall = true
  // }

  player.y += 4
  jumpCount += 4
  let crossing = false
  lvls[lvl].blocks[color].forEach(block => {
    let result = checkCollision(block, player)
    if (result) crossing = result
  })
  if (crossing) return inJump = false, jumpCount = 0, inFall = true, player.y -= 4
  if (jumpCount >= jumpHeight * jumpCoef) {
    inJump = false
    jumpCount = 0
    inFall = true
  }
}
const fall = () => {
  let crossing = false
  lvls[lvl].blocks[color].forEach(block => {
    let result = checkCollision(block, player)
    if (result) crossing = result
  })
  if (crossing) return inFall = false
  player.y -= 1

  crossing = false
  lvls[lvl].blocks[color].forEach(block => {
    let result = checkCollision(block, player)
    if (result) crossing = result
  })
  if (crossing) return inFall = false
  player.y -= 1

  crossing = false
  lvls[lvl].blocks[color].forEach(block => {
    let result = checkCollision(block, player)
    if (result) crossing = result
  })
  if (crossing) return inFall = false
  player.y -= 1

  crossing = false
  lvls[lvl].blocks[color].forEach(block => {
    let result = checkCollision(block, player)
    if (result) crossing = result
  })
  if (crossing) return inFall = false
  inFall = true
  player.y -= 1

  if (player.y < 0) {
    player.x = lvls[lvl].player.startX
    player.y = lvls[lvl].player.startY
  }
}
const movePlayer = () => {
  if (document.fullscreenElement) {
    fullscreenSvg.style.transform = 'scale(0) translateY(-100px)'
  } else fullscreenSvg.style.transform = ''
  if (stick.enabled) { // handle stick move
    let values = stick.getValues()
    player.ax = values.ax
    jumpCoef = values.strength
    if (values.direction.x !== '') {
      if (values.direction.x !== values.pressed) {
        if (moveDirections[moveDirections.length-1] !== values.direction.x) {
          moveDirections.push(values.direction.x)
        }
      }
    }
    if (values.direction.y === 'up') {
      if (!inJump && !inFall) inJump = true, jump()
    }
    if (values.pressed) pressed = values.direction.x
    else pressed = ''
  }

  if (inJump) jump()
  else if (inFall) fall()
  if (checkCollision({ ...star, ...lvls[lvl].star }, player)) changeLvl()

  let moveDirection = moveDirections[0] || null
  
  if (moveDirection && moveDirection === 'right' && !stick.enabled) {
    if (Math.abs(player.ax) < 1) player.ax += 0.02
  }
  if (moveDirection && moveDirection === 'left' && !stick.enabled) {
    if (Math.abs(player.ax) < 1) player.ax += -0.02
  }
  if (!moveDirection && !stick.enabled) {
    player.ax = 0
  }
// if axeleration isn`t avaible, but move speed bigger the 0
//  slowdown
  if (player.ax === 0 && player.vx !== 0) {
    if (player.vx > 0) player.vx -= 0.05
    else player.vx += 0.05
  }
  // stop moving if speed < .1
  if (Math.abs(player.vx) < 0.1) player.vx = 0
  
  // if axeleration is avaible => change move speed
  if (player.ax !== 0 && stick.enabled) { 
    if (Math.abs(player.vx + player.ax) < player.maxVx * Math.abs(player.ax)) {
      player.vx += player.ax
    } else {
      if (player.vx < 0) player.vx = -player.maxVx * Math.abs(player.ax)
      else player.vx = player.maxVx * Math.abs(player.ax)
    }
  } if (player.ax !== 0 && !stick.enabled) { 
    if (Math.abs(player.vx + player.ax) < player.maxVx) {
      player.vx += player.ax
    } else {
      if (player.vx < 0) player.vx = -player.maxVx
      else player.vx = player.maxVx
    }
  }
  
  player.x += player.vx

  if (!inFall && !inJump) fall()
  player.y += 0.5
    let crossing = false
    lvls[lvl].blocks[color].forEach(block => {
      let result = checkCollision(block, player)
      if (result) crossing = result
    })
    if (crossing || player.x + player.w > 1280) player.x -= player.vx
    player.y -= 0.5

  if (moveDirection && moveDirection === 'up') inJump = true, jump()

  moveDirection? moveDirections.shift() :''
  if (pressed && moveDirection) moveDirections.push(pressed)
}
const switchColor = () => {
  if (!inFall) player.y += 4, fall()
    player.y += 4
    color === 'black' ? color = 'white' : color = 'black'
    document.body.style.background = color === 'black' ? 'white' : '#333'
    let crossing = false
    lvls[lvl].blocks[color].forEach(block => {
      let result = checkCollision(block, player)
      if (result) crossing = result
    })
    starSvg.classList = color
    invertSvg.classList = color
    fullscreenSvg.classList = color
    if (crossing) {
      player.y = lvls[lvl].player.startY
      player.x = lvls[lvl].player.startX
    }
    stick.stick.color = color === 'black'? '#474747': '#ebebeb'
    stick.upadteStyles()
}
// HANDLERS \/

const handler = {
  KeydownEditor: e => {
    const keys = {
      ArrowUp: 'up',
      ArrowRight: 'right',
      ArrowLeft: 'left',
      ArrowDown: 'down',
      KeyW: 'up',
      KeyA: 'left',
      KeyS: 'down',
      KeyD: 'right',
      Space: 'color',
      KeyM: 'edit',
      KeyC: 'create',
      KeyN: 'newlvl',
      Delete: 'delete',
    }
    const key = keys[e.code]

    if (key === 'edit') {
      document.addEventListener('keydown', handler.Keydown)
      document.addEventListener('keyup', handler.Keyup)
      canvas.removeEventListener('mousemove', handler.Mousemove)
      document.removeEventListener('mousedown', handler.Mousedown)
      document.removeEventListener('keydown', handler.KeydownEditor)
      canvas.style.cursor = ''
      cursor.blockId = null
      moveInterval = setInterval(movePlayer, 5)
      edit = false
    }
    if (key === 'newlvl') {
      lvls.push({
        user: true,
        blocks: {
          black: [],
          white: []
        },
        player: {
          startX: 0,
          startY: 0,
        },
        star: {
          x: screen.w / 2,
          y: screen.h / 2,
        }
      })
      lvl = lvls.length - 1
      player.x = lvls[lvl].player.startX
      player.y = lvls[lvl].player.startY
    }
    if (key === 'create') {
      lvls[lvl].blocks[color].push({
        x: screen.w / 2 - 50,
        y: screen.h / 2 - 50,
        w: 100,
        h: 100
      }, )
    }
    if (key === 'delete') {
      lvls[lvl].blocks[color] = lvls[lvl].blocks[color].filter((block, id) => id !== cursor.blockId)
      localStorage.setItem('black-white-user', JSON.stringify(lvls.filter(lvl => lvl.user)))
    }
    if (key === 'color') {
      color === 'black' ? color = 'white' : color = 'black'
      document.body.style.background = color === 'black' ? 'white' : '#333'
      starSvg.classList = color
      invertSvg.classList = color
    }

    let block = lvls[lvl].blocks[color][cursor.blockId]

    if (key === 'left') {
      block.x -= e.shiftKey ? 10 : 1
    }
    if (key === 'right') {
      block.x += e.shiftKey ? 10 : 1
    }
    if (key === 'down') {
      block.y -= e.shiftKey ? 10 : 1
    }
    if (key === 'up') {
      block.y += e.shiftKey ? 10 : 1
    }
  },
  Mousemove: e => {
    cursor = { ...cursor, ...{ x: e.offsetX, y: canvas.offsetHeight - e.offsetY }}
    let crossedBlock = null

    if (!cursor.grab && !cursor.player && !cursor.star) {
      if (checkCollision({
          ...star,
          ...lvls[lvl].star
        }, cursor)) {
        crossedBlock = star
        cursor.mode = 'star'
        cursor.blockId = null
      } else if (checkCollision(player, cursor)) {
        crossedBlock = player
        cursor.mode = 'star'
        cursor.blockId = null
      } else lvls[lvl].blocks[color].forEach((block, id) => {
        if (checkCollision(block, cursor)) {
          crossedBlock = block
          cursor.blockId = id
        }
      })
    }

    if (crossedBlock && cursor.mode !== 'star') {
      canvas.style.cursor = 'grab'
      if (cursor.y - (crossedBlock.y + crossedBlock.h) > -5 ||
        cursor.y - crossedBlock.y < 5) {
        canvas.style.cursor = 'ns-resize'
      }
      if (cursor.x - (crossedBlock.x + crossedBlock.w) > -5 ||
        cursor.x - crossedBlock.x < 5) {
        canvas.style.cursor = 'ew-resize'
      }
    } else if (cursor.mode === 'star') {
      canvas.style.cursor = 'grab'
    } else canvas.style.cursor = ''


    let block = lvls[lvl].blocks[color][cursor.blockId]
    if (cursor.mode === 'grab' && cursor.grab) {
      canvas.style.cursor = 'grabbing'
      block.x += cursor.x - cursor.startX
      block.y += cursor.y - cursor.startY
      cursor.startX = cursor.x
      cursor.startY = cursor.y
    }
    if (cursor.mode === 'ew-resize' && cursor.grab) {
      if (cursor.x - block.x < block.w / 2) { // left corner
        let delta = cursor.x - cursor.startX
        if (delta > 0) {
          block.w -= cursor.x - cursor.startX
          block.x += cursor.x - cursor.startX
        } else {
          block.w -= cursor.x - cursor.startX
          block.x += cursor.x - cursor.startX
        }
      } else block.w += cursor.x - cursor.startX

      if (block.w < 5) block.w = 5
      cursor.startX = cursor.x
      cursor.startY = cursor.y
    }
    if (cursor.mode === 'ns-resize' && cursor.grab) {
      if (cursor.y - block.y < block.h / 2) { // left corner
        let delta = cursor.y - cursor.startY
        if (delta > 0) {
          block.h -= cursor.y - cursor.startY
          block.y += cursor.y - cursor.startY
        } else {
          block.h -= cursor.y - cursor.startY
          block.y += cursor.y - cursor.startY
        }
      } else block.h += cursor.y - cursor.startY

      if (block.h < 5) block.h = 5
      cursor.startX = cursor.y
      cursor.startY = cursor.y
    }

    if (cursor.player) {
      canvas.style.cursor = 'grabbing'
      lvls[lvl].player.startX += cursor.x - cursor.startX
      lvls[lvl].player.startY += cursor.y - cursor.startY
      player.x = lvls[lvl].player.startX
      player.y = lvls[lvl].player.startY
      cursor.startX = cursor.x
      cursor.startY = cursor.y
    }
    if (cursor.star) {
      canvas.style.cursor = 'grabbing'
      lvls[lvl].star.x += cursor.x - cursor.startX
      lvls[lvl].star.y += cursor.y - cursor.startY
      cursor.startX = cursor.x
      cursor.startY = cursor.y
    }

    if (!cursor.grab) cursor.mode = canvas.style.cursor
  },
  Mouseup: e => {
    cursor.grab = false
    cursor.star = false
    cursor.player = false
    canvas.removeEventListener('mouseup', handler.Mouseup)
    localStorage.setItem('black-white-user', JSON.stringify(lvls.filter(lvl => lvl.user)))
  },
  Mousedown: e => {
    cursor.grab = true
    if (checkCollision({ ...star, ...lvls[lvl].star }, cursor)) {
      cursor.star = true
      cursor.mode = 'star'
      cursor.blockId = null
      cursor.grab = false
    } else if (checkCollision(player, cursor)) {
      cursor.player = true
      cursor.mode = 'star'
      cursor.blockId = null
      cursor.grab = false
    }
    cursor.startX = e.offsetX,
    cursor.startY = canvas.offsetHeight - e.offsetY,
    canvas.addEventListener('mouseup', handler.Mouseup)
  },
  Keydown: e => {
    const keys = {
      ArrowUp: 'up',
      ArrowRight: 'right',
      ArrowLeft: 'left',
      KeyW: 'up',
      KeyD: 'right',
      KeyA: 'left',
      Space: 'color',
      KeyM: 'edit',
      KeyF: 'fullscreen',
    }
    const key = keys[e.code]

    if (key === 'edit') {
      document.removeEventListener('keydown', handler.Keydown)
      document.removeEventListener('keyup', handler.Keyup)
      document.addEventListener('keydown', handler.KeydownEditor)
      canvas.addEventListener('mousemove', handler.Mousemove)
      document.addEventListener('mousedown', handler.Mousedown)
      clearInterval(moveInterval)
      edit = true
      return
    }

    // if (key === 'right') player.ax = 1
    // else if (key === 'left') player.ax = -1
    

    if (key == 'fullscreen') return requestFullScreen(document.documentElement)

    if (!key || pressed === key) return

    if (key === 'color') switchColor()

    if (key !== 'up' && key !== 'color') moveDirections.push(key), pressed = key
    else if (!inFall) moveDirections.push(key)
  },
  Keyup: e => {
    const keys = {
      ArrowRight: 'right',
      ArrowLeft: 'left',
      KeyD: 'right',
      KeyA: 'left',
    }
    const key = keys[e.code]
    if (key === 'right' || key === 'left') {
      player.ax = 0
      
      // setTimeout(() => {
      //   player.ax = 0
      // }, 10);
    }
    if (e.code !== 'ArrowUp' && e.code !== 'KeyW' && e.code !== 'Space') pressed = ''
  },
  MenuClick: e => {
    if (e.target.closest('.menu__btn')) {
      const btnId = +e.target.dataset.id
      if (btnId === 0) {
        menu.el.remove()
        moveInterval = setInterval(movePlayer, 5)
        document.addEventListener('keydown', handler.Keydown)
        document.addEventListener('keyup', handler.Keyup)
        init()
      } if (btnId === 2) {
        menu.el.classList.add('hide')
        settings.el ? settings.el.classList.remove('hide') : settings.init()
        setTimeout(() => settings.el.classList.remove('hide'), 100)
        settings.form.addEventListener('change', e => {
          profile[e.target.name] = e.target.value
          localStorage.setItem('black-white-settings', JSON.stringify(profile))
        })
      }
    }
  },
  MenuTouchStart: e => {
    e.stopPropagation()
    menu.el.removeEventListener('click', handler.MenuClick)
    if (e.touches[0].target.closest('.menu__btn')) {
      const btnId = +e.target.dataset.id
      if (btnId === 0) {
        menu.el.remove()
        init()
        
        moveInterval = setInterval(movePlayer, 5)
        invertSvg.addEventListener('touchstart', () => switchColor())
        invertSvg.style.display = 'block'
        stick.init()
        stick.wrapper.style.display = 'block'
        stick.enabled = true
      } 
      if (btnId === 2) {
        menu.el.classList.add('hide')
        settings.el ? settings.el.classList.remove('hide') : settings.init()
        setTimeout(() => settings.el.classList.remove('hide'), 100)
        settings.form.addEventListener('change', e => {
          profile[e.target.name] = e.target.value
          localStorage.setItem('black-white-settings', JSON.stringify(profile))
        })
      } 
    }
  },
  ClickFullscreen: e => {
    requestFullScreen(document.documentElement)
    fullscreenSvg.style.transform = 'scale(0) translateY(-100px)'
  },
  ClickSettings: e => {
    if (e.target.classList.contains('btn-back')) {
      menu.el.classList.remove('hide')
      setTimeout(() => settings.el.classList.add('hide'), 100);
    }
  },
}



const init = () => {
  screen.scale = {
    x: screen.w / window.innerWidth,
    y: screen.h / window.innerHeight,
  }
  moveStar()
  render.render()
  render.mode = profile.camera
}

menu.init()


// TODO: 
// 1. physical correct motion
// 2. jump height can be different
// 3. add editor interface
// 4. add new blocks like spikes or third colored blocks or blocks that have movement
// 5. moveble stick