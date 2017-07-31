const webpack = require('webpack');
const path = require('path');

const debug = process.env.NODE_ENV !== 'production';
const plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    },
  }),
  new webpack.LoaderOptionsPlugin({ minimize: !debug, debug }),
  new webpack.ContextReplacementPlugin(/graphql-language-service-interface[\/\\]dist/, /\.js$/),
];

// console.log(path.resolve(__dirname, 'node_modules'));

module.exports = {
  context: path.resolve(__dirname, 'client'),
  entry: {
    main: [ './src/index.tsx' ],
  },
  output: {
    path: path.resolve(__dirname, 'builds'),
    publicPath: '/builds/',
    filename: '[name].bundle.js',
    chunkFilename: '[name]-[chunkhash].js',
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, 'client/src/media'),
      path.resolve(__dirname, 'client'),
    ],
    alias: {
      common: path.resolve(__dirname, 'common/'),
    },
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins,
  devtool: 'source-map',
  module: {
    rules: [
      {
        // All files with a '.ts' or '.tsx' extension.
        test: /\.tsx?$/,
        loaders: [
          'react-hot-loader/webpack',
          'ts-loader',
        ]
      },
      {
        // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
        enforce: 'pre',
        test: /\.js$/,
        include: path.resolve(__dirname, 'client'),
        loader: 'source-map-loader',
      },
      {
        // SASS
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        // CSS
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
      },
      {
        // Fonts
        test: /\.(eot|woff|woff2|ttf)/,
        loader: 'file-loader?name=fonts/[name]-[hash].[ext]',
      },
      {
        // Inline SVG icons
        include: path.join(__dirname, 'client/src/media/icons'),
        test: /\.svg$/i,
        loader: 'svg-react-loader',
      },
      {
        test: /\.(graphql|gql)$/,
        include: path.resolve(__dirname, 'client'),
        loader: 'graphql-tag/loader'
      }
    ],
  },
};
