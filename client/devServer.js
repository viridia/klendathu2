const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const config = require('../webpack.config.js');
const dotenv = require('dotenv');

dotenv.config();

// Adjust the config for hot reloading.
config.entry = [
  'react-hot-loader/patch',
  `webpack-dev-server/client?http://127.0.0.1:${process.env.CLIENT_PORT}`,
  'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
  './src/index.tsx', // Your appʼs entry point
];
config.plugins.push(new webpack.HotModuleReplacementPlugin());

const compiler = webpack(config);
const server = new WebpackDevServer(compiler, {
  contentBase: __dirname,
  historyApiFallback: true,
  stats: 'minimal',
  hot: true,
  publicPath: '/builds/',
  proxy: {
    '/api': {
      target: `http://localhost:${process.env.SERVER_PORT}`,
      secure: false
    }
  }
});
server.listen(process.env.CLIENT_PORT, 'localhost', () => {});
