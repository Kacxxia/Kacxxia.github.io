const path = require('path')

module.exports = {
  mode: "development",
  entry: ["./assets/srcJS/homepage.js"],
  output: {
    path: path.resolve(__dirname, "_site", "assets", "js"),
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
  },
  devServer: {
    contentBase: "_site/",
    publicPath: "/assets/js",
    watchContentBase: true,
    open: true,
    port: 4000
  }
}