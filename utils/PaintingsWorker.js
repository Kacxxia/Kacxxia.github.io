// In the pre-commit hook,
// This module converts image files 
// into needed format and store it to assets/Paintings.json for further use

// @example:
// Painting: name-website-artist.png ->
// {
//   "name": name
//   "from": website
//   "artist": artistn'm
//   "src": <base64DataURL>
// }

const path = require("path");
const fs = require("fs");
const readline = require("readline");
const ImageCompressor = require('./ImageCompressor')
const pkgjson = require("../package.json");

class Progresser {
  constructor(title) {
    if (title) {
      console.log(title);
    }
    this.label = "Load";
    this.timer = null;
    this.stageDone = false;
    this.failed = false;
  }

  setLabel(label) {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.clear();
    this.label = label;
    this.start();
  }

  print(suffix) {
    if (this.failed) {
      if (this.timer) {
        clearInterval(this.timer);
      }
      process.stdout.write(this.label + "... failed.\n");
      return;
    }

    if (this.stageDone) {
      if (this.timer) {
        clearInterval(this.timer);
      }
      process.stdout.write(this.label + "... done.\n");
      this.stageDone = false;
      return;
    }

    process.stdout.write(this.label + suffix);
  }

  clear() {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
  }

  start() {
    let i = 0;
    const suffixes = [".", "..", "..."];
    this.print(suffixes[i++]);
    this.timer = setInterval(() => {
      this.clear();
      this.print(suffixes[i]);
      i = (i + 1) % suffixes.length;
    }, 800);
  }

  outputStageResult() {
    this.stageDone = true;
    this.clear();
    this.print(); 
  }

  stageFailed() {
    this.failed = true;
    this.clear();
    this.print();
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = null;
    console.log("All jobs finished.");
  }
  isRunning() {
    return !!this.timer;
  }
  }

class PaintingsWorker {
  constructor() {
    let inputPath;
    if (
      pkgjson &&
      pkgjson.variables &&
      pkgjson.variables.PaintingsWorker &&
      pkgjson.variables.PaintingsWorker.inputPath
    ) {
      inputPath = pkgjson.variables.PaintingsWorker.inputPath;
      if (fs.existsSync(inputPath)) {
        this.inputPath = inputPath;
      }
    } else {
      throw new Error("Invalid inputPath. Please check.");
    }

    this.output = {}
    this.outputPath = path.resolve(__dirname, "..", "assets", "img", "Paintings")
    this.outputFile = path.resolve(__dirname, "..", "assets","img", "Paintings","manifest.json");
    this.progresser = new Progresser("Start formatting paintings");
  }

  run() {
    this.progresser.start();
    this.removeOldFile().then(() => this.convert());
  }

  removeOldFile() {
    this.progresser.setLabel('Deleting old file')
    return new Promise((resolve, reject) => {
      if (fs.existsSync(this.outputFile)) {
        fs.unlink(this.outputFile, (err) => {
          if (err) reject(err);
          this.progresser.outputStageResult();
          resolve();
        })
      } else {
        resolve();
      }
    })
  }

  convert() {
    fs.readdir(this.inputPath, (err, files) => {
      if (err) throw err;
      this.linearPromiseRecursiveWrapper(0, files).then(() => {
        fs.appendFile(this.outputFile, JSON.stringify(this.output), err => {
          if (err) throw err
        });
      })
    });
  }

  linearPromiseRecursiveWrapper(i, filenames) {
    if (i >= filenames.length) {
      this.progresser.stop();
      return null;
    }
    this.progresser.setLabel(`Handling ${filenames[i]}`);
    return this.handle(this.inputPath, filenames[i]).then(() =>
      this.linearPromiseRecursiveWrapper(i + 1, filenames)
    );
  }

  handle(inputPath, filename) {
    return new Promise((resolve, reject) => {
      const inputFilePath = path.resolve(inputPath, filename);
      if (fs.statSync(inputFilePath).isDirectory()) {
        resolve();
        return;
      }

      const { name: fname, ext } = path.parse(inputFilePath);
      const [name, website, artist] = fname.split("-");
      const extAfterCompress = ImageCompressor.checkType(ext.toLocaleLowerCase().slice(1))
      this.output[`${name}-${website}-${artist}`] = {
        name,
        from: website,
        artist,
        ext: `.${extAfterCompress}`
      }

      // make sure the ext is in lowercase
      const outputFilename = `${name}-${website}-${artist}.${extAfterCompress}`
      ImageCompressor.compress(
        inputFilePath,
        `image/${extAfterCompress}`
      )
        .then(compressed => {
          fs.writeFile(path.resolve(this.outputPath, outputFilename), compressed, (err) => {
            if (err) {
              this.progresser.failed()
              reject(err)
              return;
            }
            this.progresser.outputStageResult()
            resolve()
          })
        })
        .catch(err => {
          this.progresser.failed()
          reject(err)
          return;
        })

    }).catch(err => { throw err; });
  }

  formatOutput(d) {
    // return `- name: ${d.name}\n  artist: ${d.artist}\n  from: ${d.from}\n  data: ${d.data}\n\n`;
    return d
  }
}

const worker = new PaintingsWorker();
worker.run();
