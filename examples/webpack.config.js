/* eslint-disable @typescript-eslint/no-var-requires */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    plasma: './plasma.js',
  },
  output: {
    path: path.resolve(__dirname, '../public/examples/'),
    filename: 'static/[name].cache-[contenthash:8].js',
  },
  plugins: [new HtmlWebpackPlugin({
    filename: '[name].html',
    title: 'Simplex-Noise.js examples'
  })],
  mode: 'production'
};