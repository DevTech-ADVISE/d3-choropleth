import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

export default {
  input: 'src/Choropleth.js',
  output: {
    file: 'dist/Choropleth.js',
    format: 'umd',
    name: 'Choropleth',
    strict: false // Because d3 needs non-strict mode
  },
  external: ['d3'],
  plugins: [
    resolve(),
    json({
      exclude: 'node_modules/**'
    }),
    babel({
      exclude: 'node_modules/**' // only transpile source code
    })
  ]
}
