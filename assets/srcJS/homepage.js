// This module has three main functionality
// 1. responsive
// 2. display random background image
// 3. render buttons in Complementary Color

import PaintingManifest from '../img/Paintings/manifest.json'
import { CubicBezier } from './utils'

function getRandomImg() {
  const names = Object.keys(PaintingManifest)
  const selectedIndex = Math.floor(Math.random() * names.length)
  const name = names[selectedIndex]
  const img = PaintingManifest[name]
  return {
    url: `assets/img/Paintings/${name}${img.ext}`
  }
}

function customThrottleWithFilterMoves(func, wait) {
  const betaCounter = {
    origin: [],
    towards: [],
    backwards: [],
    history: []
  }
  const gammaCounter = {
    origin: [],
    towards: [],
    backwards: [],
    history: []
  }
  const betamap = []
  const gammamap = []
  let count = 0
  let lastInvokeTime, lastArgs, lastThis, baseBeta, baseGamma, timer

  function calcAverage(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((total, current) => total + current, 0) / arr.length
  }

  function calcStandardDeviation(arr, avg) {
    if (arr.length === 0) return 0;
    return Math.sqrt(arr.reduce((total, current) => total + Math.pow(current - avg, 2), 0) / arr.length)
  }
  function shouldInvoke(time) {
    return lastInvokeTime === undefined || time - lastInvokeTime >= wait
  }
  function invokeFunc(time) {
    lastInvokeTime = time
    let betas = [].concat(betaCounter.history, betaCounter.origin)
    let gammas = [].concat(gammaCounter.history, gammaCounter.origin)
    let betaAverage = calcAverage(betas)
    let gammaAverage = calcAverage(gammas)

    betaCounter.history = betas.slice()
    gammaCounter.history = gammas.slice()

    if (betas.length >= 10 || gammas.length >= 10) {
      const betaStandardDeviation = calcStandardDeviation(betas, betaAverage) 
      const gammaStandardDeviation = calcStandardDeviation(gammas, gammaAverage)
      const p = Math.abs(betaStandardDeviation)
      const v = Math.abs(gammaStandardDeviation)
      const isQuivering = betaStandardDeviation < 0.2 && gammaStandardDeviation < 0.2

      betamap[count] = p
      gammamap[count++] = v

      if (isQuivering) {
        gammaCounter.origin = []
        gammaCounter.towards = []
        gammaCounter.backwards = []
        betaCounter.origin = []
        betaCounter.towards = []
        betaCounter.backwards = []
        return;
      }
    }

    betas = betaCounter.towards.length >= betaCounter.backwards.length 
    ? betaCounter.towards 
    : betaCounter.backwards
    gammas = gammaCounter.towards.length >= gammaCounter.backwards.length 
    ? gammaCounter.towards 
    : gammaCounter.backwards
    betaAverage = calcAverage(betas)
    gammaAverage = calcAverage(gammas)
    lastArgs[0] = Object.assign({}, lastArgs[0], { beta: betaAverage, gamma: gammaAverage})

    gammaCounter.origin = []
    gammaCounter.towards = []
    gammaCounter.backwards = []
    betaCounter.origin = []
    betaCounter.towards = []
    betaCounter.backwards = []
    if (betaCounter.history.length >= 20 || gammaCounter.history.length >= 20) {
      betaCounter.history = betaCounter.history.slice(-20)
      gammaCounter.history = gammaCounter.history.slice(-20)
    }
    

    return func.apply(lastThis, lastArgs)
  }

  function _throttle() {
    const time = new Date().getTime()
    lastArgs = arguments
    lastThis = this

    const currentBeta = arguments[0].beta
    const currentGamma = arguments[0].gamma

    betaCounter.origin.push(currentBeta)
    gammaCounter.origin.push(currentGamma)
    if (baseBeta === undefined) {
      betaCounter.towards.push(currentBeta)
      gammaCounter.towards.push(currentGamma)
      baseBeta = currentBeta
      baseGamma = currentGamma
      return;
    }

    const betaDir = currentBeta >= baseBeta ? betaCounter.towards : betaCounter.backwards
    const gammaDir = currentGamma >= baseGamma ? gammaCounter.towards : gammaCounter.backwards
    betaDir.push(currentBeta)
    gammaDir.push(currentGamma)

    if (shouldInvoke(time)) {
      invokeFunc(time)
    }
  }

  return _throttle
}

class Painter {
  constructor(containerElement, imgElement, imgLoader) {
    const canvas = document.createElement("canvas")
    canvas.classList.add("hide")
    containerElement.appendChild(canvas)
    this.img = imgElement
    this.imgLoader = imgLoader
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")
    this.container = containerElement
    this.build = this.build.bind(this)
  }

  setCamera() {
    this.camera = new Camera(this)
    window.addEventListener("deviceorientation", deviceOrientationHandler)
  }

  reset() {
    this.canvas.width = this.width = this.container.offsetWidth
    this.canvas.height = this.height = this.container.offsetHeight
    this.ctx.clearRect(0, 0, this.width, this.height)
  }

  build() {
    this.reset()
    this.imgLoader.subscribe(() => {
      this.canvas.classList.remove('hide')
      this.setViewport()
      this.ctx.drawImage(this.img, this.startX, this.startY, this.vw, this.vh, 0, 0, this.width, this.height)
      this.setCamera()
    })
  }

  setViewport() {

    this.vw = this.width
    this.vh = this.height

    // Gently shrink the viewport until it fits the img
    while(this.vw > this.img.width || this.vh > this.img.height) {
      // y = n / (1.001 ** x) shows an gentle decreasing curve on the domain(414, 1920)
      this.vw = this.vw / 1.001  
      this.vh = this.vh / 1.001
    }

    const MINIUM_CAMERA_AVAILABLE_MOVING_SPACE = 200
    if (this.img.width < this.img.height) {
      this.vw -= MINIUM_CAMERA_AVAILABLE_MOVING_SPACE
      this.vh = this.vw * this.height / this.width
    } else {
      this.vh -= MINIUM_CAMERA_AVAILABLE_MOVING_SPACE
      this.vw = this.vh * this.width / this.height
    }

    // put the viewport to the center
    this.startX = (this.img.width - this.vw) / 2
    this.startY = (this.img.height - this.vh) / 2

    // pick the interesting part of the image manually

    // this.img.height * 0.5 - this.img.height * (1-0.618)
    if (this.img.height >= this.img.width) this.startY -= Math.min(this.startY, this.img.height * 0.118)
    if (this.img.height < this.img.width) {
      // pick the bottom-right part
      // this.img.width * 0.618 - this.img.width * 0.5
      this.startY += Math.min(this.img.height - this.startY - this.vh, this.img.height * 0.118)
      this.startX += Math.min(this.img.width - this.startX - this.vw, this.img.width * 0.118)
    }
  }


  paint(newStartX, newStartY) {
    this.ctx.drawImage(this.img, newStartX, newStartY, this.vw, this.vh, 0, 0, this.width, this.height)
  }
}

class ResourceLoadManager {
  constructor(ele) {
    this.element = ele
    this.callbacks = []
    this.event = null
    this.loaded = false
    this.element.addEventListener("load", (ev) => {
      console.log(this.callbacks)
      this.loaded = true
      this.event = ev
      this.callbacks.forEach(cb => cb(this.event))
    })
  }

  subscribe(cb) {
    this.callbacks.push(cb)
    if (this.loaded) {
      this.callbacks.forEach(cb => cb(this.event))
    }
  }
}

function tanDegree(degree) { return Math.tan(degree / 180 * Math.PI)}
class Camera {
  constructor(painter) {
    this.painter = painter

    this.sightDistance = 1 / 96 * 2.54 * 20
    this.lastBeta = undefined
    this.lastGamma = undefined
    this.anchorBeta = undefined
    this.anchorGamma = undefined

    this.restoreTime = null
    this.betaCounter = 0
    this.gammaCounter = 0
    this.ticking = false
  }

  rotate(beta, gamma) {
    try {
      this.lastBeta = beta
      this.lastGamma = gamma
      if (this.ticking) return;
      if (this.anchorBeta === undefined) {
        const maxDis = Math.sqrt(Math.max(
          Math.pow(painter.startX, 2) + Math.pow(painter.startY, 2),
          Math.pow(painter.startX, 2) + Math.pow(painter.img.height - painter.startY, 2),
          Math.pow(painter.img.width - painter.startX, 2) + Math.pow(painter.startY, 2),
          Math.pow(painter.img.width - painter.startX, 2) + Math.pow(painter.img.height - painter.startY, 2)
        ))
        this.lastX = this.painter.startX
        this.lastY = this.painter.startY
        this.anchorBeta = beta
        this.anchorGamma = gamma
        this.step = Math.abs(maxDis / tanDegree(30 - beta))
        this.duration = 0.4

        return;
      }
  
      let newX = this.painter.startX - tanDegree(gamma - this.anchorGamma) * this.step
      let newY = this.painter.startY - tanDegree(beta - this.anchorBeta) * this.step

      if (newX < 0) newX = 0;
      if (newX + this.painter.vw > this.painter.img.width) newX = this.painter.img.width - this.painter.vw;
      // if (newX === 0 || newX === this.painter.img.width - this.painter.vw) this.anchorGamma = gamma
      if (newY < 0) newY = 0;
      if (newY + this.painter.vh > this.painter.img.height) newY = this.painter.img.height - this.painter.vh;
      // if (newY === 0 || newY === this.painter.img.height - this.painter.vh) this.anchorBeta = beta

      this.lastX = newX
      this.lastY = newY


      this.painter.paint(newX, newY)

      if (newX === 0 || newX === this.painter.img.width - this.painter.vw) {
        this.gammaCount++
      } else {
        this.gammaCount = 0
      }
      if (newY === 0 || newY === this.painter.img.height - this.painter.vh) {
        this.betaCount++
      } else {
        this.betaCount = 0
      }

      if (this.gammaCount >= 54 || this.betaCount >= 54) {
        this.ticking = true
        this.gammaCount = 0
        this.betaCount = 0
        this.cubicBezier = CubicBezier(0, 0, 0.58, 1)
        window.requestAnimationFrame((time) => this.restore(time))
      }
    } catch(err) {

    }
  }

  restore(time) {
    try {
      if (this.restoreTime === null) {
        this.restoreTime = time
        window.requestAnimationFrame((time) => this.restore(time))
        return;
      }
      const newX = this.lastX + (this.painter.startX - this.lastX) * this.cubicBezier((time - this.restoreTime) / 1000 / this.duration)
      const newY = this.lastY + (this.painter.startY - this.lastY) * this.cubicBezier((time - this.restoreTime) / 1000 / this.duration)
      
      this.painter.paint(newX, newY)
  
      if (((this.lastX - newX) * (newX - this.painter.startX) <= 0
       && (this.lastY - newY) * (newY - this.painter.startY) <= 0) || (time - this.restoreTime) / 1000 > this.duration) {
         this.restoreTime = null
         this.anchorBeta = this.lastBeta
         this.anchorGamma = this.lastGamma
         this.ticking = false
         return;
       }
       window.requestAnimationFrame((time) => this.restore(time))
    } catch (err) {
      alert(err)
    }
    
  }

}



const body = document.getElementById('home-root')
const hint = document.getElementById('arcade-hint')

const randomImg = getRandomImg()
const bkgImg = new Image()
bkgImg.src = randomImg.url
const imgLoader = new ResourceLoadManager(bkgImg)

const painter = new Painter(body, bkgImg, imgLoader)
const deviceOrientationHandler = customThrottleWithFilterMoves(function (e) { this.camera.rotate(e.beta / 6, e.gamma / 6) }.bind(painter), 12)
painter.build()


window.addEventListener("orientationchange", painter.build)
window.addEventListener("resize", painter.build)

function navigate(ev) {
  if (ev.type === "keydown") {
    // except for the function key (F1, F2...)
    if (ev.key.length === 2 && ev.key[0] === 'F') return;
    if (ev.ctrlKey || ev.altKey || ev.shiftKey) return;
  }
  painter.canvas.classList.add('hide')
  window.removeEventListener("orientationchange", painter.build)
  window.removeEventListener("resize", painter.build)
  window.removeEventListener("deviceorientation", deviceOrientationHandler)
  window.removeEventListener("click", navigate)
  window.removeEventListener("touchstart", navigate)
  window.removeEventListener("keydown", navigate)
  window.location.pathname = "/blog"
}
imgLoader.subscribe(() => {
  hint.textContent = "Press any button"
  document.addEventListener("click", navigate)
  document.addEventListener("touchstart", navigate)
  document.addEventListener("keydown", navigate)
})


