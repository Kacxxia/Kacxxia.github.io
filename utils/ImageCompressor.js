const { createCanvas, loadImage } = require('canvas')
const sizeOf = require('image-size')

class ImageCompressor {
  static checkType(input) {
    // only supports converting image to png/jpeg
    if (!/png|jpg|jpeg/.test(input)) {
      return 'png'
    }
    return input
  }
  static compress(imagePath, type) {
    // image-size Module: Cannot work with Buffer in asynchronous way
    // So here with the provided imagePath, we read the image directly
    return new Promise((resolve, reject) => {
      sizeOf(imagePath, (err, dimensions) => {
        if (err) throw err;

        const { width, height } = dimensions
        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')
        loadImage(imagePath)
          .then(image => {
            ctx.drawImage(image, 0, 0, width, height)
            // canvas.toBuffer((err, buffer) => {
            //   if (err) throw err;
            //   resolve(buffer)
            // }
            // ,type)

            const buf = canvas.toBuffer(type.replace('jpg', 'jpeg'))
            resolve(buf)
          })
          .catch(err => { throw err;})
  
      })
    })
  }
}

module.exports = ImageCompressor