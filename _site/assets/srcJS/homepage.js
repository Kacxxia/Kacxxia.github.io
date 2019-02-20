// This module has three main functionality
// 1. responsive
// 2. display random background image
// 3. render buttons in Complementary Color

import PaintingManifest from '../img/Paintings/manifest.json'

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

  reset() {
    this.canvas.width = this.width = this.container.offsetWidth
    this.canvas.height = this.height = this.container.offsetHeight
    this.ctx.clearRect(0, 0, this.width, this.height)
  }

  build() {
    this.reset()
    this.imgLoader.subscribe(() => {
      this.ctx.drawImage(this.img, 0, 0, this.width, this.width * this.img.height / this.img.width)
    })

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


const randomImg = getRandomImg()
const bkgImg = new Image()
bkgImg.src = randomImg.url
const body = document.getElementById('home-root')
const painter = new Painter(body, bkgImg)
painter.build()
window.addEventListener("orientationchange", painter.build)

