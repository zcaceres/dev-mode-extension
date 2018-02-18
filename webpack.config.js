const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude : /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['env']
        }
      }]
    },
    plugins: [new CopyWebpackPlugin([
          {
            from: 'manifest.json'
          }
        ])
      ]
}
