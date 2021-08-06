const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

let nodeModulesPath = path.dirname(require.resolve('jest'))
nodeModulesPath = nodeModulesPath.substr(0,nodeModulesPath.indexOf("node_modules")) + "node_modules"

module.exports = (files) => ({
  mode: "development",
  output: {
    filename: 'index.js',
  },
  module: {
    rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  nodeModulesPath+'/@babel/preset-env'
                ],
                plugins:[
                  require(nodeModulesPath+'/babel-plugin-syntax-dynamic-import')
                ]
              }
            },
          ]
        },
        {
          test: /\.(css)$/, use: [
            MiniCssExtractPlugin.loader,
            {
                loader: "css-loader" // translates CSS into CommonJS
            }
          ]
        }, //css only files
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/, use: {
            loader: 'file-loader',
            options: { name: '[name].[ext]' }
          }
        }, //for images
        { test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/, use: ['file-loader'] } //for fonts
    ]
  },
  resolve: {
    extensions: ['*', '.js'],
    modules: [nodeModulesPath]
  },
  resolveLoader: {
    modules: [nodeModulesPath]
  },
  stats: {
      cached: false,
      cachedAssets: false,
      chunks: false,
      modules: false
  },
  devtool: "source-map",
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles.css',
      chunkFilename: 'styles.css',
    }),
  ]
});