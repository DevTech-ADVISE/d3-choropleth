import World from '../src/ChoroplethTypes/World'
import data from './demoData.json'


World('demo-chart')
  .data(data)
  .draw()
