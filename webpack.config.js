
module.exports = {
  entry: {
    'Choropleth-bundle': './src/Choropleth.js',
    'demo-bundle': './demo/demo.js'
  },
  output: {
    path: __dirname + '/dist',
    publicPath: '/dist',
    filename: '[name].js',
    libraryTarget: 'umd'
  },
  devServer: {
    contentBase: './demo'
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader' // create styles from JS strings
          },
          {
            loader: 'css-loader' // translate CSS into CommonJS
          },
          {
            loader: 'sass-loader' // compiles Sass to CSS
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js']
  },
  externals: ['d3']
}
