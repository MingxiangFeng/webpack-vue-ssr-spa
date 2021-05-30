const { resolve } = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {merge} = require('webpack-merge');
const base = require('./webpack.base.conf.js');

let config = merge(base, {
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'home.html',
      template: resolve(__dirname, '../src/client.html'),
      minify: { // 压缩的方式
        removeComments: false,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
      },
    }),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.VUE_ENV': '"client"',
    }),
  ],
});

if (process.env.NODE_ENV === 'production') {
  delete config.devtool; // 删除devtool
  config.output.filename = 'js/[name].[chunkhash:8].min.js';
  config.module.rules.push(
    {
      test: /\.css$/,
      use: [MiniCssExtractPlugin.loader, 'css-loader'],
    }
  )
  config.plugins.push(
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css'
    })
  )
} else {
  config.module.rules.push(
    {
      test: /\.css$/,
      // 'style-loader',
      use: ['vue-style-loader',  'css-loader'],
    }
  )
  config.plugins.push(
    new webpack.HotModuleReplacementPlugin()
  )
}
config.optimization.splitChunks = {
  chunks: 'async',
  minSize: 30000,
  maxSize: 0,
  minChunks: 1,
  maxAsyncRequests: 5,
  maxInitialRequests: 3,
  automaticNameDelimiter: '~',
  name: true,
  cacheGroups: {
    vendors: {
      test: /[\\/]node_modules[\\/]/,
      priority: -10
    },
    default: {
      minChunks: 2,
      priority: -20,
      reuseExistingChunk: true
    }
  }
}
config.plugins = config.plugins.concat([
  new CopyWebpackPlugin({
    patterns: [
      {
        from: resolve(__dirname, '../static'),
        to: 'static',
      }
    ]
  }),
]);

module.exports = config;
