// This module has three main functionality
// 1. responsive
// 2. display random background image
// 3. render buttons in Complementary Color

import PaintingManifest from '../img/Paintings/manifest.json'

(function run(){
  alert(1)
  const names = Object.keys(PaintingManifest)
  const selectedIndex = Math.floor(Math.random() * names.length)
  const name = names[selectedIndex]
  const img = PaintingManifest[name]
  const bkg = new Image()
  bkg.src = `assets/img/Paintings/${name}${img.ext}`
  
  const body = document.getElementsByTagName('body')[0]
  body.appendChild(bkg)

})()