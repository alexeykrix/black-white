let data = [{
  blocks: {
    black: [{
      x: 173,
      y: 0,
      w: 480,
      h: 261
    }],
    white: [{
      x: 747,
      y: 12,
      w: 489,
      h: 247
    }]
  },
  player: {
    startX: 256,
    startY: 276
  },
  star: {
    x: 1180,
    y: 335
  }
}, {
  blocks: {
    black: [{
      x: 0,
      y: 150,
      w: 1280,
      h: 20
    }, {
      x: 650,
      y: 150,
      w: 24,
      h: 500
    }],
    white: [{
      x: 503,
      y: 10,
      w: 560,
      h: 100
    }, {
      x: 1040,
      y: 107,
      w: 23,
      h: 540
    }]
  },
  player: {
    startX: 270,
    startY: 170
  },
  star: {
    x: 1100,
    y: 220
  }
}, {
  blocks: {
    black: [{
      x: 650,
      y: 556,
      w: 1280,
      h: 20
    }, {
      x: 650,
      y: 256,
      w: 1280,
      h: 20
    }, {
      x: 20,
      y: 0,
      w: 100,
      h: 20
    }, {
      x: 640,
      y: 108,
      w: 10,
      h: 800
    }, {
      x: 500,
      y: 0,
      w: 1000,
      h: 20
    }],
    white: [{
      x: 650,
      y: 404,
      w: 1280,
      h: 20
    }, {
      x: 650,
      y: 108,
      w: 1280,
      h: 20
    }, {
      x: 250,
      y: 0,
      w: 100,
      h: 20
    }, {
      x: 650,
      y: 108,
      w: 10,
      h: 800
    }]
  },
  player: {
    startX: 947,
    startY: 578
  },
  star: {
    x: 50,
    y: 80
  }
}, {
  blocks: {
    black: [{
      x: 161,
      y: 13,
      w: 100,
      h: 100
    }, {
      x: 439,
      y: 150,
      w: 100,
      h: 100
    }, {
      x: 716,
      y: 283,
      w: 100,
      h: 100
    }, {
      x: 987,
      y: 406,
      w: 100,
      h: 100
    }],
    white: [{
      x: 27,
      y: -56,
      w: 100,
      h: 100
    }, {
      x: 304,
      y: 75,
      w: 100,
      h: 100
    }, {
      x: 575,
      y: 222,
      w: 100,
      h: 100
    }, {
      x: 855,
      y: 341,
      w: 100,
      h: 100
    }, {
      x: 1119,
      y: 478,
      w: 100,
      h: 100
    }]
  },
  player: {
    startX: 63,
    startY: 47
  },
  star: {
    x: 1192,
    y: 680
  }
}, {
  blocks: {
    black: [{
      x: 241,
      y: 334,
      w: 25,
      h: 100
    }, {
      x: 597,
      y: 334,
      w: 26,
      h: 100
    }, {
      x: 847,
      y: 405,
      w: 30,
      h: 100
    }, {
      x: 1052,
      y: 19,
      w: 146,
      h: 522
    }],
    white: [{
      x: 27,
      y: 607,
      w: 100,
      h: 21
    }, {
      x: 420,
      y: 194,
      w: 26,
      h: 205
    }, {
      x: 733,
      y: 295,
      w: 28,
      h: 207
    }, {
      x: 952,
      y: 380,
      w: 28,
      h: 213
    }]
  },
  player: {
    startX: 62,
    startY: 631
  },
  star: {
    x: 1164,
    y: 558
  }
}]

let storagedData = localStorage.getItem('black-white-user')
if (storagedData) data = [...data, ...JSON.parse(storagedData)]