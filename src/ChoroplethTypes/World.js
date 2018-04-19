import ChoroplethGenerator from '../base/ChoroplethGenerator'
import d3 from 'd3'
import countriesJson from '../geojson/countries.topo.json'
import { feature } from 'topojson'
import ColorPalette from '../util/ColorPalette'
import qdFormatters from 'qd-formatters'
import './world.scss'

const formatters = qdFormatters(d3)
// const countriesTopoJson = feature(countriesJson, countriesJson.objects.countries).features

export default function(parentId) {
  const feat = feature
  const cJson = countriesJson
  
  console.log(countriesJson)
  const chart = ChoroplethGenerator(parentId)
    .topojson(countriesJson)
    .colorPalette(ColorPalette)
    .numberFormatter(formatters.bigCurrencyFormat)

  return chart
}
