import ChoroplethGenerator from '../base/ChoroplethGenerator'
import d3 from 'd3'
import countriesJson from '../geojson/countries.topo.json'
import * as TopoJson from 'topojson'
import ColorPalette from '../util/ColorPalette'
import qdFormatters from 'qd-formatters'
import './world.scss'

const formatters = qdFormatters(d3)
const countriesTopoJson = TopoJson.feature(countriesJson, countriesJson.objects.countries).features

export default function(parentId) {

  const chart = ChoroplethGenerator(parentId)
    .topojson(countriesTopoJson)
    .colorPalette(ColorPalette)
    .numberFormatter(formatters.bigCurrencyFormat)

  return chart
}
