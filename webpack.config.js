import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
const config = {
  entry: path.resolve(path.join("src", "views", "app", "index.js")),
  output: {
    path: path.resolve(path.join("src", "views", "js")),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: path.resolve(path.join("src", "views", "index.html"))
    })
  ]
};

export default config;
