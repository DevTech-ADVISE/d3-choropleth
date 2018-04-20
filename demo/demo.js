import World from '../src/ChoroplethTypes/World'
import d3 from 'd3'
import data from './demoData.json'


World('demo-chart')
  .data(data)
  .draw()
console.log('j')
