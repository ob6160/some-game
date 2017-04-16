var path = require('path');

module.exports = {
  entry: './app/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public/dist')
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: '/\.js$/',
        exclude: '/node_modules/',
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-0']
        }
      },
    ],
    rules: [
      {
        test: /\.glsl/,
        use: 'raw-loader'
      }
    ]
  },
  devServer: {
    contentBase: 'public',
    inline: true
  },
};
