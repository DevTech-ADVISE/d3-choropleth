import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'
import json from 'rollup-plugin-json'
import scss from 'rollup-plugin-scss'
import commonjs from 'rollup-plugin-commonjs'
import simplevars from 'postcss-simple-vars'
import nested from 'postcss-nested'
import cssnext from 'postcss-cssnext'
import postcss from 'rollup-plugin-postcss'

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
      jsnext: true
    }),
    postcss({
      plugins: [
        simplevars(),
        nested(),
        cssnext({ warnForDuplicates: false })
      ],
      extensions: ['.css']
    }),
    json({
      exclude: 'node_modules/**'
    }),
    commonjs(),
    babel({
      exclude: ['node_modules/**', '**/*.json'], // only transpile source code
    }),
    serve({
      contentBase: 'demo',
      port: '8080'
    })
  ]
}
