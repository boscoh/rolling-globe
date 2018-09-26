"use strict";
let path = require('path');
module.exports = {
  mode: 'development',
  entry: ['./src/globe.js'],
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'rolling-globe.min.js',
    library: 'globe',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: path.join(__dirname, 'src'),
        exclude: /node_modules/,
        use: ['babel-loader'],
      }
    ]
  },
};