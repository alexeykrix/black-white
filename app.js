import Stick from './stick.js'
import { Data, Update } from './lvlsData.js'

let 
color = 'black',
lvl = 0,
edit = false,
lvls = Update(),
moveDirections = [],
moveInterval = null,
pressed = '',
inFall = false,
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
  vector: {x: 0, y:0, crossingBlock: null},
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
  maxVy: 4,
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
        <button class="menu__btn" data-id="0" focusable="false"> play </button>
      </li>
      <li class="list__item">
        <button class="menu__btn" data-id="1" focusable="false"> editor </button>
      </li>
      <li class="list__item">
        <button class="menu__btn" data-id="2" focusable="false"> settings </button>
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
    let timeout = setTimeout(()=> {
      checkOrientation()
      clearTimeout(timeout)
    }, 0)
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
},
editor = {
  template: `
    <div class="toollbar">
      <button class="toollbar__btn" data-id="back">
        <img src="./arrow.svg" alt="">
      </button>
      <button class="toollbar__btn" data-id="save">
        <img src="./floppy-disk.svg" alt="">
      </button>
      <button class="toollbar__btn" data-id="newlvl">
        <img src="./new.svg" alt="">
      </button>

      <input type="text" id="lvlNameInput"
        placeholder="Unnamed"
      >

      <div class="inputs">
        <p>X: <input value="0" type="number" data-target="x" class="targetX"></p>
        <p>W: <input value="0" type="number" data-target="w" class="targetW"></p>
        <p>Y: <input value="0" type="number" data-target="y" class="targetY"></p>
        <p>H: <input value="0" type="number" data-target="h" class="targetH"></p>
      </div>

      <button class="toollbar__btn play" data-id="play_stop">
        <img class="imgPlay" src="./play-button-arrowhead.svg" alt="">
        <img class="imgStop" src="./stop-button.svg" alt="">
      </button>
      <button class="toollbar__btn" data-id="block">
        <img src="./block.svg" alt="">
      </button>
      <button class="toollbar__btn" data-id="color">
      <img src="./color.svg" alt="">
      </button>
      <button class="toollbar__btn" data-id="removeBlock">
        <img src="./delete.svg" alt="">
      </button>
    </div>
  `,
  el: null,
  inputs: { x: null, y: null, w: null, h: null },
  init() {
    if (this.el) {
      this.el.querySelector('#lvlNameInput').value = lvls[lvl].name ?? ''
      return this.el.classList = 'editor'
    }
    this.el = document.createElement('section')
    this.el.classList = 'editor hide'
    this.el.innerHTML = this.template
    document.body.appendChild(this.el)
    this.el.querySelector('#lvlNameInput').addEventListener('input', handler.InputChange)
    this.el.querySelector('#lvlNameInput').value = lvls[lvl].name ?? ''
    this.el.querySelectorAll('.inputs input').forEach(el => {
      this.inputs[el.dataset.target] = el
      el.addEventListener('input', handler.ParametrsInput)
    })
  }
},
levelsList = {
  template: `
    <div class="left">
      <button class="back__btn">
        <img src="./arrow.svg" alt="">
      </button>  
      <ul class="levels__list"></ul>
      <button class="select__btn">select</button>
    </div>
  `,
  el: null,
  init(idList) {
    if (this.el) this.el.classList = 'levels'
    else {
      this.el = document.createElement('section')
      this.el.classList = 'levels hide'
      this.el.innerHTML = this.template
      document.body.appendChild(this.el)
      this.el.addEventListener('click', handler.LevelsClick)
    }

    let userLvlsId = []
    lvls.forEach((lvl, id) => lvl.user? userLvlsId.push(+id): '')

    const list = this.el.querySelector('.levels__list')
    list.innerHTML = `
      <li class="list__item"><button class="levels__btn" data-id="${ lvls.length }">
        create new lvl
      </button></li>`
    list.innerHTML += userLvlsId.map(id => 
      `<li class="list__item"><button class="levels__btn" data-id="${id}">
        ${ lvls[id].name || 'level '+id  }
      </button>
      <button class="levels__btn-del" data-id="${id}">
        <img src="./remove.svg" alt="">
      </button>
      </li>`
    ).join('\n')


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
    
    // c.font = "15px Verdana"
    // c.strokeStyle = "red"
    // c.strokeText('x: '+ player.vector.x, 20, 50)
    // c.strokeText('y: '+ player.vector.y, 20, 70)
    // c.strokeText('vx: '+ player.vx, 20, 90)
    // c.strokeText('vy: '+ player.vy, 20, 110)

    c.closePath()
  },
  renderPlayer: function () {
    let playerY = screen.h - player.y - player.h
  
    // if (moveDirections[0] === 'left' || moveDirections[0] === 'right') {
    if (player.vx !== 0) {
      this.animCount < 4 ? this.animCount++ : this.animCount = 1
      if (inFall) this.animCount = 1
    } else this.animCount = 0
    let x = this.animCount
  
    let y = color === 'black' ? 0 : 2
    if (moveDirections[0] === 'left') y++
  
    if (this.mode === 'static') { 
      c.drawImage(player.sprite, 35 * x, 70 * y, 35, 70, player.x, playerY+1, 35, 70)
    } else c.drawImage(player.sprite, 35 * x, 70 * y, 35, 70, screen.w/2, screen.h/2+1, 35, 70)
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
      canvas.width = screen.w = window.innerWidth * window.devicePixelRatio
      canvas.height = screen.h = window.innerHeight * window.devicePixelRatio
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

  let timeout = setTimeout(() => {
    stick.enabled ? stick.init() :''
    clearTimeout(timeout)
  }, 1000)
}
const checkOrientation = () => {
  if (document.fullscreenElement) {
    fullscreenSvg.style.transform = 'scale(0) translateY(-100px)'
    if (edit) {
      canvas.style.marginTop = 'auto'
      canvas.style.width = (window.innerHeight - window.innerHeight*0.1)*16/9 + 'px'
      canvas.style.height = window.innerHeight - window.innerHeight*0.1 + 'px'
      screen.scale = {
        x: screen.w / canvas.offsetWidth,
        y: screen.h / canvas.offsetHeight,
      }
      canvas.style.boxShadow = '0px 0px 100px 0px #474747'
    } else {
      canvas.style.boxShadow = ''
      fullscreenSvg.style.transform = ''
      canvas.style.marginTop = ''
      canvas.style.width = ''
      canvas.style.height = ''
      screen.scale = {
        x: screen.w / window.innerWidth,
        y: screen.h / window.innerHeight,
      }
    }
  } else {
    if (edit) {
      canvas.style.marginTop = 'auto'
      canvas.style.width = (window.innerHeight - window.innerHeight*0.1)*16/9 + 'px'
      canvas.style.height = window.innerHeight - window.innerHeight*0.1 + 'px'
      screen.scale = {
        x: screen.w / canvas.offsetWidth,
        y: screen.h / canvas.offsetHeight,
      }
      canvas.style.boxShadow = '0px 0px 100px 0px #474747'
      fullscreenSvg.style.transform = ''
      fullscreenSvg.style.zIndex = '2341'
      fullscreenSvg.style.top = (window.innerHeight*0.1 -30) /2
      fullscreenSvg.style.right = (window.innerHeight*0.1 -30) /2
    } else {
      fullscreenSvg.style.transform = ''
      canvas.style.marginTop = ''
      canvas.style.width = ''
      canvas.style.height = ''
      screen.scale = {
        x: screen.w / window.innerWidth,
        y: screen.h / window.innerHeight,
      }
      canvas.style.boxShadow = ''
    }
  }

  if (window.innerWidth / window.innerHeight > 1) {// landscape
    if (edit || moveInterval) return document.querySelector('.rotate-phone').classList.add('hide')
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
  let XColl = false;
  let YColl = false;

  if ((obj1.x + obj1.w >= obj2.x) && (obj1.x <= obj2.x + obj2.w)) XColl = true;
  if ((obj1.y + obj1.h >= obj2.y) && (obj1.y <= obj2.y + obj2.h)) YColl = true;

  if (XColl && YColl) return true;
  return false;
}
const getVector = (block, player) => {
  let bCenter = {
    x: (block.x + block.w)/2,
    y: (block.y + block.h)/2,
  }
  let pCenter = {
    x: (player.x + player.w)/2,
    y: (player.y + player.h)/2,
  }
  
  player.vector = {
    x: pCenter.x - bCenter.x, 
    y: pCenter.y - bCenter.y,
    crossingBlock: block,
  }
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
  let timeout1 = setTimeout(() => {
    starSvg.style.left = window.innerWidth / 2 + 'px'
    starSvg.style.bottom = window.innerHeight / 2 + 'px'
    starSvg.style.transform = 'scale(100)'
    let timeout2 = setTimeout(() => {
      if (lvl + 1 === lvls.length) lvl = 0
      else lvl++
      player.x = lvls[lvl].player.startX
      player.y = lvls[lvl].player.startY
      clearTimeout(timeout2)
    }, 800);
    let timeout3 = setTimeout(() => {
      if (player.y === 100000) {
        if (lvl + 1 === lvls.length) lvl = 0
        else lvl++
        player.x = lvls[lvl].player.startX
        player.y = lvls[lvl].player.startY
      }
      moveStar()
      starSvg.style.transform = ''
      let timeout4 = setTimeout(() => {
        starSvg.style.opacity = 0
        clearTimeout(timeout4)
      }, 900);
      clearTimeout(timeout3)
    }, 1000);
    clearTimeout(timeout1)
  }, 10);

}
const jump = () => player.vy = 5 * (jumpCoef> 0.5 ? jumpCoef: 0.5)

const isCrossing = () => {
  let crossing = false
  lvls[lvl].blocks[color].forEach(block => {
    let result = checkCollision(block, player)
    if (result) crossing = result, getVector(block, player)
  })
  return crossing
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
      if (!inFall) jump()
    }
    if (values.pressed) pressed = values.direction.x
    else pressed = ''
  }
  if (checkCollision({ ...star, ...lvls[lvl].star }, player)) {
    if (!edit) changeLvl()
    else {    
      clearInterval(moveInterval)
      moveInterval = null
      player.vx = player.vy = player.ax = 0
      player.x = lvls[lvl].player.startX
      player.y = lvls[lvl].player.startY
      document.removeEventListener('keydown', handler.Keydown)
      document.removeEventListener('keyup', handler.Keyup)
      document.addEventListener('keydown', handler.EditorKeydown)
      canvas.addEventListener('mousemove', handler.Mousemove)
      document.addEventListener('mousedown', handler.Mousedown)

      document.querySelector('[data-id="play_stop"]').classList.toggle('play')
      document.querySelector('[data-id="play_stop"]').classList.toggle('stop')
      document.querySelectorAll('.toollbar__btn').forEach(el => {
        if (el.dataset.id !== 'play_stop') el.classList.remove('hidden')
      })
      document.querySelector('#lvlNameInput').classList.remove('hidden')
      document.querySelector('.inputs').classList.remove('hidden')
    }
  }
  let moveDirection = moveDirections[0] || null
  let oldVy = player.vy
  let oldVx = player.vx
  
  {  // movement X
    if (player.vx === 0) player.x = Math.ceil(player.x)

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
    if (isCrossing() || player.x + player.w > 1280) player.x -= player.vx
  }

  {  // movement Y
    player.y = Math.ceil(player.y)
    player.vy > 0 ? player.y += player.vy : player.y -= 1
    
    if (isCrossing()) {
      let block = player.vector.crossingBlock
      if (player.x+player.w > block.x) ''
      else player.vy = 0
      if (player.y + player.h > block.y && player.y < block.y) player.vy = 0
      inFall = false
    } else inFall = true
    player.vy > 0 ? player.y -= player.vy : player.y += 1

    while ( isCrossing() ) {
      let distanceX = 0
      let distanceY = 0
      let block = player.vector.crossingBlock

      if (player.vector.x < 0) {
        distanceX = player.w - (player.vector.crossingBlock.x- player.x)
      } else if (player.vector.x > 0) {
        distanceX = player.w - (player.vector.crossingBlock.x + player.vector.crossingBlock.w - player.x - player.w)
      }

      if (player.vector.y < 0) {
        distanceY = player.h + player.y - player.vector.crossingBlock.y
      } else if (player.vector.y > 0) {
        distanceY = player.vector.crossingBlock.y + player.vector.crossingBlock.h - player.y
      }
      

      if (player.y > block.y && player.y + player.h < block.y + block.h ) {
        // player inside a block vertically => move player x
        player.x -= distanceX+1
      } else player.y -= distanceY+1 

    }

    if (inFall) {
      if (player.vy > -player.maxVy) player.vy += player.ay
      else if (player.vy < 0) player.vy = -player.maxVy
    
      player.y += player.vy
      player.y = Math.ceil(player.y)
    
      if (player.y < 0) {
        player.x = lvls[lvl].player.startX
        player.y = lvls[lvl].player.startY
      }
    
      if (isCrossing()) {
        while ( isCrossing() ) {
          player.y -= player.vy
        }
        player.vy = 0
        inFall = false
      } else inFall = true
    }

  }

  
  if (moveDirection && moveDirection === 'up' && !inFall) jump()

  moveDirection? moveDirections.shift() :''
  if (pressed && moveDirection) moveDirections.push(pressed)
}
const switchColor = () => {
  color === 'black' ? color = 'white' : color = 'black'

    if (isCrossing()) {
      player.y = lvls[lvl].player.startY
      player.x = lvls[lvl].player.startX
    }

    document.body.style.background = color === 'black' ? 'white' : '#333'
    starSvg.classList = color
    invertSvg.classList = color
    fullscreenSvg.classList = color
    stick.stick.color = color === 'black'? '#474747': '#ebebeb'
    stick.upadteStyles()
}

// HANDLERS \/
const handler = {
  EditorKeydown: e => {
    const key = {
      ArrowUp: 'up',
      ArrowRight: 'right',
      ArrowLeft: 'left',
      ArrowDown: 'down',
      KeyW: 'up',
      KeyA: 'left',
      KeyS: 'down',
      KeyD: 'right',
      KeyM: 'edit',
      KeyC: 'create',
      KeyN: 'newlvl',
      Delete: 'delete',
      Space: 'color',
    }[e.code] || null

    if (!key) return

    if (key === 'edit') {
      document.addEventListener('keydown', handler.Keydown)
      document.addEventListener('keyup', handler.Keyup)
      canvas.removeEventListener('mousemove', handler.Mousemove)
      document.removeEventListener('mousedown', handler.Mousedown)
      document.removeEventListener('keydown', handler.EditorKeydown)
      canvas.style.cursor = ''
      cursor.blockId = null
      clearInterval(moveInterval)
      moveInterval = setInterval(movePlayer, 5)
      edit = false
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

    if (cursor.blockId && key === 'left') {
      block.x -= e.shiftKey ? 10 : 1
    }
    if (cursor.blockId && key === 'right') {
      block.x += e.shiftKey ? 10 : 1
    }
    if (cursor.blockId && key === 'down') {
      block.y -= e.shiftKey ? 10 : 1
    }
    if (cursor.blockId && key === 'up') {
      block.y += e.shiftKey ? 10 : 1
    }
  },
  ToollClick: e => {
    if (e.target.closest('.toollbar__btn')) {
      const btnId = e.target.closest('.toollbar__btn').dataset.id
      if (btnId === 'save') { // save level
        localStorage.setItem('black-white-user', JSON.stringify(lvls.filter(lvl => lvl.user && (lvl.blocks['white'].length || lvl.blocks['black'].length))))
      } if (btnId === 'newlvl') { // new level
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
      } if (btnId === 'back') { // select level
        lvls = Update() 
        lvl = 0
        levelsList.init()
        let timeout = setTimeout(() => {
          levelsList.el.classList.remove('hide')
          clearTimeout(timeout)
        }, 100)
      } if (btnId === 'block') { // new block
        lvls[lvl].blocks[color].push({
          x: screen.w / 2 - 50,
          y: screen.h / 2 - 50,
          w: 100,
          h: 100
        }, )
      } if (btnId === 'color') { // color
        color === 'black' ? color = 'white' : color = 'black'
        document.body.style.background = color === 'black' ? 'white' : '#333'
        starSvg.classList = color
        invertSvg.classList = color
      } if (btnId === 'removeBlock') { // remove block
        lvls[lvl].blocks[color] = lvls[lvl].blocks[color].filter((block, id) => id !== cursor.blockId)
      } if (btnId === 'play_stop') {
        if (moveInterval) { // stop 
          clearInterval(moveInterval)
          moveInterval = null
          player.vx = player.vy = player.ax = 0
          player.x = lvls[lvl].player.startX
          player.y = lvls[lvl].player.startY
          document.removeEventListener('keydown', handler.Keydown)
          document.removeEventListener('keyup', handler.Keyup)
          document.addEventListener('keydown', handler.EditorKeydown)
          canvas.addEventListener('mousemove', handler.Mousemove)
          document.addEventListener('mousedown', handler.Mousedown)
          document.querySelectorAll('.toollbar__btn').forEach(el => {
            if (el.dataset.id !== 'play_stop') el.classList.remove('hidden')
          })
          document.querySelector('#lvlNameInput').classList.remove('hidden')
          document.querySelector('.inputs').classList.remove('hidden')
        } else { // play
          document.querySelectorAll('.toollbar__btn').forEach(el => {
            if (el.dataset.id !== 'play_stop') el.classList.add('hidden')
          })
          cursor.blockId = null
          clearInterval(moveInterval)
          moveInterval = setInterval(movePlayer, 5)
          document.addEventListener('keydown', handler.Keydown)
          document.addEventListener('keyup', handler.Keyup)
          document.removeEventListener('keydown', handler.EditorKeydown)
          canvas.removeEventListener('mousemove', handler.Mousemove)
          document.removeEventListener('mousedown', handler.Mousedown)
          document.querySelector('#lvlNameInput').classList.add('hidden')
          document.querySelector('.inputs').classList.add('hidden')
        }

        e.target.closest('.toollbar__btn').classList.toggle('play')
        e.target.closest('.toollbar__btn').classList.toggle('stop')
      }
    }
  },
  InputChange: e => {
    lvls[lvl].name = e.target.value || null
  },
  ParametrsInput: e => {   
    let values = {
      x: Math.round(+editor.inputs.x.value),
      y: Math.round(+editor.inputs.y.value),
      w: Math.round(+editor.inputs.w.value),
      h: Math.round(+editor.inputs.h.value),
    } 
    lvls[lvl].blocks[color][cursor.blockId].x = values.x
    lvls[lvl].blocks[color][cursor.blockId].y = values.y
    lvls[lvl].blocks[color][cursor.blockId].w = values.w
    lvls[lvl].blocks[color][cursor.blockId].h = values.h
  },
  LevelsClick: e => {
    if (e.target.closest('.levels__btn')) {
      const btn = e.target.closest('.levels__btn')
      const btnId = +btn.dataset.id

      if (document.querySelector('.levels__btn.selected')) {
        document.querySelector('.levels__btn.selected').classList.remove('selected')
      }
      btn.classList.add('selected')
    }
    if (e.target.closest('.back__btn')) {
      menu.el.classList.remove('hide')
      editor.el? editor.el.classList.add('hide') :''
      levelsList.el.classList.add('hide')
      lvl = 0
      edit = false
      cursor.blockId = null
      lvls = Update()
      document.removeEventListener('keydown', handler.EditorKeydown)
      canvas.removeEventListener('mousemove', handler.Mousemove)
      document.removeEventListener('mousedown', handler.Mousedown)
      checkOrientation()
    }
    if (e.target.closest('.select__btn')) {
      // change lvl
      let btnId = null
      if (document.querySelector('.levels__btn.selected')) {
        btnId = +document.querySelector('.levels__btn.selected').dataset.id
      }
      if (!btnId) return
      lvl = btnId

      if (lvl === lvls.length) { // create new lvl
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
      }

      player.x = lvls[lvl].player.startX
      player.y = lvls[lvl].player.startY
      editor.init()
      editor.el.addEventListener('click', handler.ToollClick)
      canvas.addEventListener('mouseenter', e => {
        cursor.grab = false
        cursor.star = false
        cursor.player = false
      })
      document.addEventListener('keydown', handler.EditorKeydown)
      canvas.addEventListener('mousemove', handler.Mousemove)
      document.addEventListener('mousedown', handler.Mousedown)
      let timeout = setTimeout(() => {
        editor.el.classList.remove('hide')
        clearTimeout(timeout)
      }, 100)
      levelsList.el.classList.add('hide')
      checkOrientation()
    }
    if (e.target.closest('.levels__btn-del')) {
      const btn = e.target.closest('.levels__btn-del')
      const btnId = +btn.dataset.id || null
      if (!btnId) return

      lvls =  lvls.filter((el, id) => btnId !== id)
      localStorage.setItem('black-white-user', JSON.stringify(lvls.filter(lvl => lvl.user && (lvl.blocks['white'].length || lvl.blocks['black'].length))))
      levelsList.init()
    }
  },
  Mousemove: e => { 
    cursor = { ...cursor, ...{ 
      x: e.offsetX * screen.scale.x, 
      y: (canvas.offsetHeight - e.offsetY) * screen.scale.y 
    }}
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


    let block = lvls[lvl].blocks[color][cursor.blockId] || null
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

    block ? lvls[lvl].blocks[color][cursor.blockId] = {
      x: Math.round(block.x),
      y: Math.round(block.y),
      w: Math.round(block.w),
      h: Math.round(block.h),
    } : '' 

    if (cursor.player) {
      canvas.style.cursor = 'grabbing'
      lvls[lvl].player.startX += cursor.x - cursor.startX
      lvls[lvl].player.startY += cursor.y - cursor.startY
      player.x = lvls[lvl].player.startX
      player.y = lvls[lvl].player.startY
      cursor.startX = Math.round(cursor.x)
      cursor.startY = Math.round(cursor.y)
    }
    if (cursor.star) {
      canvas.style.cursor = 'grabbing'
      lvls[lvl].star.x += cursor.x - cursor.startX
      lvls[lvl].star.y += cursor.y - cursor.startY
      cursor.startX = Math.round(cursor.x)
      cursor.startY = Math.round(cursor.y)
    }

    if (!cursor.grab) cursor.mode = canvas.style.cursor

    if (cursor.blockId !== null && cursor.blockId>=0) {
      let block = lvls[lvl].blocks[color][cursor.blockId]
      editor.inputs.x.value = block.x? block.x : 0
      editor.inputs.y.value = block.y? block.y : 0
      editor.inputs.w.value = block.w? block.w : 0
      editor.inputs.h.value = block.h? block.h : 0
    }
  },
  Mouseup: e => {
    cursor.grab = false
    cursor.star = false
    cursor.player = false
    canvas.removeEventListener('mouseup', handler.Mouseup)
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
    cursor.startX = e.offsetX * screen.scale.x,
    cursor.startY = (canvas.offsetHeight - e.offsetY) * screen.scale.y,
    canvas.addEventListener('mouseup', handler.Mouseup)
  },
  Keydown: e => {
    const key = {
      ArrowUp: 'up',
      ArrowRight: 'right',
      ArrowLeft: 'left',
      KeyW: 'up',
      KeyD: 'right',
      KeyA: 'left',
      Space: 'color',
      KeyM: 'edit',
      KeyF: 'fullscreen',
    }[e.code] || null
    if (!key) return
    if (key === 'edit') {
      document.removeEventListener('keydown', handler.Keydown)
      document.removeEventListener('keyup', handler.Keyup)
      document.addEventListener('keydown', handler.EditorKeydown)
      canvas.addEventListener('mousemove', handler.Mousemove)
      document.addEventListener('mousedown', handler.Mousedown)
      clearInterval(moveInterval)
      moveInterval = null
      edit = true
      return
    }

    if (key == 'fullscreen') return requestFullScreen(document.documentElement)

    if (!key || pressed === key) return

    if (key === 'color') return switchColor()

    if (key !== 'up') moveDirections.push(key), pressed = key
    else if (!inFall) moveDirections.push(key)
  },
  Keyup: e => {
    const key = {
      ArrowUp: 'up',
      ArrowRight: 'right',
      ArrowLeft: 'left',
      KeyW: 'up',
      KeyD: 'right',
      KeyA: 'left',
      Space: 'color',
    }[e.code] || null
    if (!key) return
    if (key === 'right' || key === 'left') {
      player.ax = 0
    }
    if (key !== 'up' && key !== 'color') pressed = ''
  },
  MenuClick: e => {
    if (e.target.closest('.menu__btn')) {
      const btnId = +e.target.dataset.id
      if (btnId === 0) {
        menu.el.classList.add('hide')
        clearInterval(moveInterval)
        moveInterval = setInterval(movePlayer, 5)
        document.addEventListener('keydown', handler.Keydown)
        document.addEventListener('keyup', handler.Keyup)
        init()
      } if (btnId === 1) {
        menu.el.classList.add('hide')
        profile.camera = 'static'
        render.mode = 'static'
        canvas.style.marginTop = 'auto'
        canvas.style.width = (window.innerHeight - window.innerHeight*0.1)*16/9 + 'px'
        canvas.style.height = window.innerHeight - window.innerHeight*0.1 + 'px'
        levelsList.init()
        let timeout = setTimeout(() => {
          levelsList.el.classList.remove('hide')
          clearTimeout(timeout)
        }, 100)
        let timeout1 = setTimeout(() => {
          init()
          clearTimeout(timeout1)
        }, 1000)
        starSvg.style.left = '10000px'
        starSvg.style.bottom = '10000px'
        edit = true
        checkOrientation()
      } if (btnId === 2) {
        menu.el.classList.add('hide')
        settings.el ? settings.el.classList.remove('hide') : settings.init()
        let timeout = setTimeout(() => {
          settings.el.classList.remove('hide')
          clearTimeout(timeout)
        }, 100)
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
        clearInterval(moveInterval)
        moveInterval = setInterval(movePlayer, 5)
        invertSvg.addEventListener('touchstart', () => switchColor())
        invertSvg.style.display = 'block'
        stick.init()
        stick.wrapper.style.display = 'block'
        stick.enabled = true
      } if (btnId === 1) {

      } if (btnId === 2) {
        menu.el.classList.add('hide')
        settings.el ? settings.el.classList.remove('hide') : settings.init()
        let timeout = setTimeout(() => {
          settings.el.classList.remove('hide')
          clearTimeout(timeout)
        }, 100)
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
      let timeout = setTimeout(() => {
        settings.el.classList.add('hide')
        clearTimeout(timeout)
      }, 100);
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

// level preview in level list
// 7. add new blocks like spikes or third colored blocks or blocks that have movement