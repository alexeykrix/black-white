const canvas = document.createElement('canvas')
const c = canvas.getContext('2d')

const screen = {
  w: 1280,
  h: 720,
}

let color = 'black'

let lvl = 0

const lvls = [
  {
    blocks: {
      black: [
        { x: 126, y: 0, w: 480, h: 276 },
        { x: 760, y: 0, w: 480, h: 276 },
      ],
      white: []
    },
    player: {
      startX: 256,
      startY: 276,
    },
    star: {
      x: 1180,
      y: 335,
    }
  },
  {
    blocks: {
      black: [
        { x: 0, y: 150, w: 1280, h: 20 },
        { x: 640, y: 150, w: 20, h: 500 },
      ],
      white: [
        { x: 0, y: 10, w: 1280, h: 100 },
      ]
    },
    player: {
      startX: 270,
      startY: 170,
    },
    star: {
      x: 1100,
      y: 220,
    }
  },
  {
    blocks: {
      black: [
        { x: 650, y: 556, w: 1280, h: 20 },
        { x: 650, y: 256, w: 1280, h: 20 },
        { x: 20, y: 0, w: 100, h: 20 },        
        { x: 640, y: 108, w: 10, h: 800 },
        { x: 500, y: 0, w: 1000, h: 20 },
      ],
      white: [
        { x: 650, y: 404, w: 1280, h: 20 },        
        { x: 650, y: 108, w: 1280, h: 20 },
        { x: 250, y: 0, w: 100, h: 20 },
        { x: 650, y: 108, w: 10, h: 800 },
      ]
    },
    player: {
      startX: 668,
      startY: 584,
    },
    star: {
      x: 50,
      y: 80,
    }
  }
]

const player = {
  sprite: new Image(),
  w: 35,
  h: 70,
  x: lvls[lvl].player.startX,
  y: lvls[lvl].player.startY,
}

const star = {
  sprite: {
    black: new Image(),
    white: new Image(),
  },
  w: 35,
  h: 35,
}

star.sprite['black'].src = './star.svg'
star.sprite['white'].src = './star-white.svg'

player.sprite.src = './player-all.png'

canvas.width = screen.w
canvas.height = screen.h 

const starSvg = document.querySelector('#starSvg')

document.body.appendChild(canvas)

let moveDirections = []
let moveInterval = null
let pressed = ''

let inJump = false
let inFall = false
let jumpCount = 0
let jumpHeight = 200

const checkCollision = (obj1,obj2) => {
  var XColl=false;
  var YColl=false;

  if ((obj1.x + obj1.w >= obj2.x) && (obj1.x <= obj2.x + obj2.w)) XColl = true;
  if ((obj1.y + obj1.h >= obj2.y) && (obj1.y <= obj2.y + obj2.h)) YColl = true;

  if (XColl&YColl){return true;}
  return false;
}

const changeLvl = () => {
  player.x = 0
  player.y = 100000 

  starSvg.style.opacity = 1
  setTimeout(() => {
    starSvg.style.left = window.innerWidth /2 +'px'
    starSvg.style.bottom = window.innerHeight /2 +'px'
    starSvg.style.transform = 'scale(100)'
    setTimeout(() => {
      if (lvl +1 === lvls.length) lvl = 0
      else lvl++
      player.x = lvls[lvl].player.startX
      player.y = lvls[lvl].player.startY
    }, 800);
    setTimeout(() => {
      if (player.y === 100000) {
        if (lvl +1 === lvls.length) lvl = 0
        else lvl++
        player.x = lvls[lvl].player.startX
        player.y = lvls[lvl].player.startY
      }

      let cordX = lvls[lvl].star.x / (screen.w / window.innerWidth)
      let cordY = lvls[lvl].star.y / (screen.h / window.innerHeight)

      starSvg.style.left = cordX
      starSvg.style.bottom = cordY
      starSvg.style.transform = ''
      setTimeout(() => {
        starSvg.style.opacity = 0
        fall()
      }, 900);
    }, 1000);
  }, 10);

}

const jump = () => {
  player.y += 4
  jumpCount += 4
  let crossing = false
  lvls[lvl].blocks[color].forEach(block => {
    let result = checkCollision(block, player)
    if (result) crossing = result
  })
  if (crossing) return inJump = false, jumpCount = 0, inFall = true, player.y -= 4

  if (jumpCount >= jumpHeight) {
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
  inFall = true
  player.y -= 4

  if (player.y < 0 || player.y > screen.h) {
    player.x = lvls[lvl].player.startX
    player.y = lvls[lvl].player.startY
  }
}

const movePlayer = () => {
  if (inJump) jump()
  else if (inFall) fall()
  if (checkCollision({...star, ...lvls[lvl].star}, player)) changeLvl()
  if (moveDirections.length === 0) return
  let moveDirection = moveDirections[0]

  if (moveDirection === 'up') inJump = true, jump()
  if (moveDirection === 'right') {
    if (!inFall) fall()
    player.x += 2
    player.y += 0.5
    let crossing = false
    lvls[lvl].blocks[color].forEach(block => {
      let result = checkCollision(block, player)
      if (result) crossing = result
    })
    if (crossing || player.x + player.w > 1280) player.x -= 2
    player.y -= 0.5
  }
  if (moveDirection === 'left') {
    if (!inFall) fall()
    player.x -= 2
    player.y += 0.5
    let crossing = false
    lvls[lvl].blocks[color].forEach(block => {
      let result = checkCollision(block, player)
      if (result) crossing = result
    })
    if (crossing || player.x < 0) player.x += 2
    player.y -= 0.5
  }

  moveDirections.shift()
  if (pressed) moveDirections.push(pressed)
}

const handlerKeydown = e => {
  const keys = {
    ArrowUp: 'up',
    ArrowRight: 'right',
    ArrowLeft: 'left',
    KeyW: 'up',
    KeyD: 'right',
    KeyA: 'left',
    Space: 'color',
  }
  const key = keys[e.code]
  if (!key || pressed === key) return
  
  if (key === 'color') {
    if (!inFall) player.y += 4 , fall() 
    player.y += 4
    color === 'black'? color = 'white' : color = 'black'
    document.body.style.background = color === 'black'? 'white' : '#333'
    let crossing = false
    lvls[lvl].blocks[color].forEach(block => {
      let result = checkCollision(block, player)
      if (result) crossing = result
    })
    starSvg.classList = color
    if (crossing) {
      player.y = lvls[lvl].player.startY
      player.x = lvls[lvl].player.startX 
    }
    return
  }
  if (key !== 'up') moveDirections.push(key), pressed = key
  else if (!inFall) moveDirections.push(key)
}

moveInterval = setInterval(movePlayer, 5)

document.addEventListener('keydown', handlerKeydown)
document.addEventListener('keyup', e => {
  if (e.code !== 'ArrowUp' && e.code !== 'Space') pressed = ''
})


const clearCanvas = () => {
  if (color === 'black') c.fillStyle = '#fff'
  else c.fillStyle = '#333'
  c.beginPath()
  c.fillRect(0,0, screen.w, screen.h)
  c.closePath()
}

let animCount = 0

const renderPlayer = () => {
  let playerY = screen.h - player.y - player.h
  
  if (moveDirections[0] === 'left' || moveDirections[0] === 'right') {
    animCount<4 ? animCount++ : animCount = 1 
    if (inFall || inJump) animCount = 1
  } else animCount = 0
  let x = animCount

  let y = color === 'black'? 0 : 2
  if (moveDirections[0] === 'left') y++
  
  
  c.drawImage(player.sprite, 35*x, 70*y, 35, 70, player.x, playerY, 35, 70)
}

const renderTransparentBlocks = () => {
  if (color === 'black') {
    lvls[lvl].blocks['white'].forEach(block => {
      c.fillStyle = '#ebebeb'
      c.beginPath()
      c.fillRect(block.x, screen.h - block.y - block.h, block.w, block.h)
      c.closePath()
    })
  } else {
    lvls[lvl].blocks['black'].forEach(block => {
      c.fillStyle = '#474747'
      c.beginPath()
      c.fillRect(block.x, screen.h - block.y - block.h, block.w, block.h)
      c.closePath()
    })
  }
}

const renderCollisionBlocks = () => {
  if (color === 'black') {
    lvls[lvl].blocks['black'].forEach(block => {
      c.fillStyle = '#1b1b1b'
      c.beginPath()
      c.fillRect(block.x, screen.h - block.y - block.h, block.w, block.h)
      c.closePath()
    })
  } else {
    lvls[lvl].blocks['white'].forEach(block => {
      c.fillStyle = '#fff'
      c.beginPath()
      c.fillRect(block.x, screen.h - block.y - block.h, block.w, block.h)
      c.closePath()
    })
  }
} 

const renderStar = () => {
  c.drawImage(star.sprite[color], lvls[lvl].star.x, screen.h - lvls[lvl].star.y, star.w, star.h )
}

const render = () => {
  clearCanvas()
  renderTransparentBlocks()
  renderPlayer()
  renderCollisionBlocks()
  renderStar()
  window.requestAnimationFrame(() => render())
}

player.sprite.onload = () => {
  let cordX = lvls[lvl].star.x / (screen.w / window.innerWidth)
  let cordY = lvls[lvl].star.y / (screen.h / window.innerHeight)

  starSvg.style.left = cordX+'px'
  starSvg.style.bottom = cordY+'px'
  starSvg.style.width = star.w / (screen.w / window.innerWidth)
  render()
}