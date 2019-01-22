// In the pre-push hook,
// This module converts image files 
// into needed format and store it to _data/paintings.yml for further use

// @example:
// Painting: name-website-artist.png ->
// - name: name
//   from: website
//   artist: artist
//   data: <base64DataURL>

const path = require("path");
const fs = require("fs");
const readline = require("readline");
const pkgjson = require("../package.json");

class Progresser {
  constructor(title) {
    if (title) {
      console.log(title);
    }
    this.label = "Load";
    this.timer = null;
    this.stageDone = false;
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

    this.outputFile = path.resolve(__dirname, "..", "_data", "Paintings.yml");
    this.progresser = new Progresser("Start formatting paintings");
  }

  run() {
    this.progresser.start();
    fs.readdir(this.inputPath, (err, files) => {
      if (err) throw err;
      Promise.resolve().then(() =>
        this.linearPromiseRecursiveWrapper(0, files)
      );
    });
  }

  linearPromiseRecursiveWrapper(i, filenames) {
    if (i >= filenames.length) {
      this.progresser.stop();
      return () => {};
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
      fs.readFile(inputFilePath, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        const toWrite = this.formatOutput({
          data: `"data:image/${ext};base64,${data.toString("base64")}"`,
          name,
          from: website,
          artist
        });
        fs.appendFile(this.outputFile, toWrite, err => {
          if (err) {
            reject(err);
            return;
          }
          this.progresser.outputStageResult();
          resolve();
        });
      });
    }).catch(err => { throw err; });
  }

  formatOutput(d) {
    return `-\tname: ${d.name}\n\tartist: ${d.artist}\n\tfrom: ${d.from}\n\tdata: ${d.data}\n\n`;
  }
}

const worker = new PaintingsWorker();
worker.run();
