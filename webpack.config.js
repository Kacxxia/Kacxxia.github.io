const path = require('path')

module.exports = {
  mode: "development",
  entry: ["./assets/srcJS/homepage.js"],
  output: {
    path: path.resolve(__dirname, "assets", "js"),
    filename: "homepage.js",
    library: "AutoBtnColor",
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: /.jsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env"]
        }
      }
    ]
  }
}