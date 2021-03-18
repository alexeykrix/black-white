const canvas = document.createElement('canvas')
const c = canvas.getContext('2d')

const screen = {
  w: 1280,
  h: 720,
}

const player = {
  // sprite: {
  //   black: new Image(35, 70),
  //   white: new Image(35, 70),
  // },
  sprite: new Image(),
  w: 35,
  h: 70,
  x: 270,
  y: 370,
}

let color = 'black'

const blocks = {
  black: [
    { x: 0, y: 150, w: 1280, h: 20 },
    { x: 640, y: 150, w: 20, h: 500 },
  ],
  white: [
    { x: 0, y: 10, w: 1280, h: 100 },
  ]
}

player.sprite.src = './player-all.png'

canvas.width = screen.w
canvas.height = screen.h 

document.body.appendChild(canvas)

let moveDirections = []
let moveInterval = null
let pressed = ''

let inJump = false
let inFall = false
let jumpCount = 0
let jumpHeight = 200
let jumpDirection = 'up'


const checkCollision = (obj1,obj2) => {
  var XColl=false;
  var YColl=false;

  if ((obj1.x + obj1.w >= obj2.x) && (obj1.x <= obj2.x + obj2.w)) XColl = true;
  if ((obj1.y + obj1.h >= obj2.y) && (obj1.y <= obj2.y + obj2.h)) YColl = true;

  if (XColl&YColl){return true;}
  return false;
}

const jump = () => {
  player.y += 4
  jumpCount += 4
  let crossing = false
  blocks[color].forEach(block => {
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
  blocks[color].forEach(block => {
    let result = checkCollision(block, player)
    if (result) crossing = result
  })
  if (crossing) return inFall = false
  inFall = true
  player.y -= 4

  if (player.y < 0 || player.y > screen.h) player.y = 370, player.x = 270
}

const movePlayer = () => {
  if (inJump) jump()
  else if (inFall) fall()
  if (moveDirections.length === 0) return
  let moveDirection = moveDirections[0]

  if (moveDirection === 'up') inJump = true, jump()
  if (moveDirection === 'right') {
    if (!inFall) fall()
    player.x += 2
    player.y += 0.5
    let crossing = false
    blocks[color].forEach(block => {
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
    blocks[color].forEach(block => {
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
    blocks[color].forEach(block => {
      let result = checkCollision(block, player)
      if (result) crossing = result
    })
    if (crossing) player.y = 370, player.x = 270 
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
    blocks['white'].forEach(block => {
      c.fillStyle = '#ebebeb'
      c.beginPath()
      c.fillRect(block.x, screen.h - block.y - block.h, block.w, block.h)
      c.closePath()
    })
  } else {
    blocks['black'].forEach(block => {
      c.fillStyle = '#474747'
      c.beginPath()
      c.fillRect(block.x, screen.h - block.y - block.h, block.w, block.h)
      c.closePath()
    })
  }
}

const renderCollisionBlocks = () => {
  if (color === 'black') {
    blocks['black'].forEach(block => {
      c.fillStyle = '#1b1b1b'
      c.beginPath()
      c.fillRect(block.x, screen.h - block.y - block.h, block.w, block.h)
      c.closePath()
    })
  } else {
    blocks['white'].forEach(block => {
      c.fillStyle = '#fff'
      c.beginPath()
      c.fillRect(block.x, screen.h - block.y - block.h, block.w, block.h)
      c.closePath()
    })
  }
} 

const renderBlocks = () => {
  if (color === 'black') {
    blocks['black'].forEach(block => {
      c.fillStyle = '#1b1b1b'
      c.beginPath()
      c.fillRect(block.x, screen.h - block.y - block.h, block.w, block.h)
      c.closePath()
    })
    blocks['white'].forEach(block => {
      c.fillStyle = '#ebebeb'
      c.beginPath()
      c.fillRect(block.x, screen.h - block.y - block.h, block.w, block.h)
      c.closePath()
    })
  } else {
    blocks['black'].forEach(block => {
      c.fillStyle = '#474747'
      c.beginPath()
      c.fillRect(block.x, screen.h - block.y - block.h, block.w, block.h)
      c.closePath()
    })
    blocks['white'].forEach(block => {
      c.fillStyle = '#fff'
      c.beginPath()
      c.fillRect(block.x, screen.h - block.y - block.h, block.w, block.h)
      c.closePath()
    })
  }
}

const render = () => {
  clearCanvas()
  renderTransparentBlocks()
  renderPlayer()
  renderCollisionBlocks()
  window.requestAnimationFrame(() => render())
}

// player.sprite[color].onload = () => {
//   render()
// }
player.sprite.onload = () => {
  render()
}