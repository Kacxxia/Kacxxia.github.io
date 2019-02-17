// This module has three main functionality
// 1. responsive
// 2. display random background image
// 3. render buttons in Complementary Color

import PaintingManifest from '../img/Paintings/manifest.json'

(function run(){
  const names = Object.keys(PaintingManifest)
  const selectedIndex = Math.floor(Math.random() * names.length)
  const name = names[selectedIndex]
  const img = PaintingManifest[name]
  const bkg = new Image()
  console.log(`assets/img/Paintings/${name}${img.ext}`)
  bkg.src = `assets/img/Paintings/祭-Pixiv-藤原.jpg`
  
  const body = document.getElementsByTagName('body')[0]
  body.appendChild(bkg)

})()