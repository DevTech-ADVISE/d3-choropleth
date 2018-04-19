import World from '../src/ChoroplethTypes/World'
import d3 from 'd3'
import data from './demoData.json'

d3.select('#demo-chart').text('hello')
World('#demo-chart')
  .data(data)
  .draw()
