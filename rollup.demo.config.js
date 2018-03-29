import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'

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
    resolve(),
    babel({
      exclude: 'node_modules/**' // only transpile source code
    }),
    serve({
      contentBase: 'demo',
      port: '8080'
    })
  ]
}
