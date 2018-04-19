import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'
import json from 'rollup-plugin-json'
import scss from 'rollup-plugin-scss'
import commonjs from 'rollup-plugin-commonjs'

export default {
  input: 'demo/demo.js',
  output: {
    file: 'demo/demo-bundle.js',
    format: 'umd',
    name: 'Choropleth',
    sourcemap: 'inline',
    strict: false // Because d3 needs non-strict mode
  },
  plugins: [
    resolve({

    }),
    scss(),
    json({
      exclude: 'node_modules/**'
    }),
    commonjs({
      include: ['node_modules/d3/d3.js', 'node_modules/qd-formatters/index.js'],
      exclude: '*.json'
    }),
    babel({
      exclude: ['node_modules/**', '*.json'], // only transpile source code

    }),
    serve({
      contentBase: 'demo',
      port: '8080'
    })
  ]
}
