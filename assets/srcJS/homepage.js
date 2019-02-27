// This module has three main functionality
// 1. responsive
// 2. display random background image
// 3. render buttons in Complementary Color

import PaintingManifest from '../img/Paintings/manifest.json'
import Throttle from 'lodash/throttle'
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

class Painter {
  constructor(containerElement, imgElement) {
    const imgLoader = new ResourceLoadManager(imgElement)
    const canvas = document.createElement("canvas")
    containerElement.appendChild(canvas)
    this.img = imgElement
    this.imgLoader = imgLoader
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")
    this.container = containerElement
    

  }

  setCamera() {
    this.camera = new Camera(this)
    window.addEventListener("deviceorientation", Throttle((e) => this.camera.rotate(e.beta, e.gamma), 1000 / 60))
  }

  reset() {
    this.canvas.width = this.width = this.container.offsetWidth
    this.canvas.height = this.height = this.container.offsetHeight
    this.ctx.clearRect(0, 0, this.width, this.height)
  }

  build() {
    this.reset()
    this.imgLoader.subscribe(() => {
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
    this.callback = () => {}
    this.event = null
    this.loaded = false
    this.element.addEventListener("load", (ev) => {
      this.loaded = true
      this.event = ev
      this.callback()
    })
  }

  subscribe(cb) {
    this.callback = cb
    if (this.loaded) {
      cb(this.event)
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
      if (Math.abs(newX - this.lastX) < 3 && Math.abs(newY - this.lastY) < 3) return;

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

      if (this.gammaCount >= 48 || this.betaCount >= 48) {
        this.ticking = true
        this.gammaCount = 0
        this.betaCount = 0
        this.cubicBezier = CubicBezier(0, 0, 0.58, 1)
        window.requestAnimationFrame((time) => this.restore(time))
      }
    } catch(err) {
      alert(err)
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
  
      if ((this.lastX - newX) * (newX - this.painter.startX) <= 0
       && (this.lastY - newY) * (newY - this.painter.startY) <= 0) {
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


const randomImg = getRandomImg()
const bkgImg = new Image()
bkgImg.src = randomImg.url
const body = document.getElementById('home-root')
const painter = new Painter(body, bkgImg)
painter.build()
window.addEventListener("orientationchange", painter.build)

