const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './index.js',
    output: {
      filename: isProduction ? 'xpectra.min.js' : 'xpectra.js',
      path: path.resolve(__dirname, 'dist'),
      library: 'XpectraAnalytics',
      libraryTarget: 'umd',
      libraryExport: 'default',
      globalObject: 'this'
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            format: {
              comments: false
            },
            compress: {
              drop_console: isProduction,
              drop_debugger: isProduction
            }
          }
        })
      ]
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    },
    devtool: isProduction ? false : 'source-map'
  };
}; 