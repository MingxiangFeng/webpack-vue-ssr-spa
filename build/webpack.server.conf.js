const webpack = require('webpack');
const {merge} = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const base = require('./webpack.base.conf');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const { resolve } = require('path');
const config = merge(base, {
  target: 'node',
  devtool: 'source-map',
  entry: resolve(__dirname, '../src/entry-server.js'),
  output: {
    filename: 'server-bundle.js',
    libraryTarget: 'commonjs2',
  },
  externals: nodeExternals({
    allowlist: [/\.css$/],
  }),
  module: {
    rules:[
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.VUE_ENV': '"server"',
    }),
    new VueSSRServerPlugin(),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    })
  ],
});
module.exports = config;
