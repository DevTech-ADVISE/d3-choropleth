import d3 from 'd3'
import * as ss from 'simple-statistics'

export default class ColorScale {
  constructor(data, colors, noDataColor = "#ddd", valueAccessorFunc = (d) => d.value, scaleType = 'quantize', customDomain) {
    this.data = data
    this.colors = colors
    this.noDataColor = noDataColor
    this.valueAccessorFunc = valueAccessorFunc
    this.scaleType = scaleType
    this.customDomain = customDomain

    // Setup the scale based on scale type
    if (scaleType === 'quantize') { // Calculate the colors based on a linear quantize domain
      this.scale = d3.scale.quantize()
    } else if (scaleType === 'quantile' || scaleType === 'ckmeans') {
      // Calculate the colors by n domain sections(similar to quartiles but of n sections)
      // ckmeans will be a quantile scale, but with each quantile section having a custom value dependent on where most values are clustering
      this.scale = d3.scale.quantile()
    } else if (scaleType === 'threshold') {
      this.scale = d3.scale.threshold()
    }
    this.scale.domain(this.calculateDomain())
      .range(colors)
  }

  calculateDomain() {
    const notEnoughDataForCkmeans = ((this.colors.length - 1) > this.data.length)
    if (this.customDomain) {
      return this.customDomain
    } else if (this.scaleType === 'quantize' || notEnoughDataForCkmeans) {
      // Standard min/max domain for linear quantize scale
      return [d3.min(this.data, this.valueAccessorFunc), d3.max(this.data, this.valueAccessorFunc)]
    } else if (this.scaleType === 'quantile') {
      // If the user didn't specify a list of quantiles using the customDomain
      // then use the data itself as the quantiles
      return this.data.map(this.valueAccessorFunc)
    } else if (this.scaleType === 'threshold' || this.scaleType === 'ckmeans') {
      // ckmeans will be a quantile scale, but with each quantile section having a custom value dependent on where most values are clustering
      const dataValues = this.data.map(this.valueAccessorFunc)
      return ss.ckmeans(dataValues, this.colors.length - 1).map((cluster) => cluster[0])
    }

    console.warn(`Scale type not recognized: ${this.scaleType}`)
    return [undefined, undefined]
  }

  setDomain() {
    this.scale.domain(this.calculateDomain())
  }

  setData(data) {
    this.data = data
  }

  getColorFor(value) {
    if(value === undefined) {
      return this.noDataColor
    }
    return this.scale(value)
  }
}
