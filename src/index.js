import Phaser from "phaser";
const { Arc } = Phaser.GameObjects

const { width, height } = document.getElementById("app").getBoundingClientRect()

function initGame(width, height, create){
  const config = {
    type: Phaser.AUTO,
    parent: "app",
    width,
    height,
    scene: {
      create
    }
  };
  return new Phaser.Game(config);
}

function randRange(min, max){
  return Math.floor(Math.random() * (max - min) + min)
}

function getRandPoint(width, height, padding=0){
  return {
    x: randRange(padding, width - padding),
    y: randRange(padding, height - padding),
  }
}

function addACircle(group, x, y, size, color){
  const c = new Arc(group.scene, x, y, size)
  group.add(c)
  return c
}

function addAMark(group, color, size, minProximity=0, maxProximity=Infinity){
  const MAX_ATTEMPTS = 500
  let attempts = 0
  let valid = false
  do {
    var { x, y } = getRandPoint(width, height, size)

    const children = group.getChildren()
  
    const isTooClose = children.some(({x: x2, y: y2, radius}) => {
      const distance = Math.sqrt(Math.pow((y2 - y), 2) + Math.pow((x2 - x), 2)) - size
      if(distance < minProximity){
        return true
      }
    })

    let isTooFar = false

    // need at least one mark before we can start measuring toofar
    if(children.length){
      isTooFar = children.every(({x: x2, y: y2, radius}) => {
        const distance = Math.sqrt(Math.pow((y2 - y), 2) + Math.pow((x2 - x), 2)) - size
        if(distance > maxProximity){
          return true
        }
      })
    }

    /*
    // this forces them to stay in abunch
    const isTooFar = children.some(({x: x2, y: y2, radius}) => {
      const distance = Math.sqrt(Math.pow((y2 - y), 2) + Math.pow((x2 - x), 2)) - size
      if(distance > maxProximity){
        return true
      }
    })
    */
    if(!isTooClose && !isTooFar){
      valid = true
    }
    attempts += 1
  } while (!valid && attempts < MAX_ATTEMPTS)

  if(attempts === MAX_ATTEMPTS){
    return undefined
  } else {
    return addACircle(group, x, y, size, color)
  }
}

function create() {
  const SIZE = 10
  const MIN_PROXIMITY = SIZE
  const MAX_PROXIMITY = 20
  const MAX_FAILURES = 50
  const MAX_MARKS = 500

  const group = game.add.group({
  })
  let failures = 0
  let count = 0
  const doItAgain = () => {
    setTimeout(() => {
      const m = addAMark(group, 0x333333, SIZE, MIN_PROXIMITY, MAX_PROXIMITY)
      if(!m){
        failures += 1
        console.log("failed to find a nice spot", failures)
      } else {
        count += 1
      }
      if(failures < MAX_FAILURES && count < MAX_MARKS){
        doItAgain()
      } else {
        console.log("Done!")
      }
    }, 10)
  }
  doItAgain()
}

var game = initGame(width, height, create)
