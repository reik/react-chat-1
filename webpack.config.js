const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: path.join(__dirname, 'src', 'app-client.js'), //Bundles all the modules recursively from this file
  output: {
    path: path.join(__dirname, 'src', 'static', 'js'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: path.join(__dirname, 'src'),
      loader: ['babel-loader'],
      query: {
        cacheDirectory: 'babel_cache',
        presets: ['react', 'es2015']
      }
    }]
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),            //Removes duplicated modules from bundle
    new webpack.optimize.OccurenceOrderPlugin(),    //Reduces file size of bundle
    new webpack.optimize.UglifyJsPlugin({           //Minifies and obfuscates the bundle file
      compress: { warnings: false },
      mangle: true,
      sourcemap: false,
      beautify: false,
      dead_code: true
    })
  ]
};