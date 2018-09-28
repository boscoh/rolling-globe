import _ from 'lodash'
import $ from 'jquery'
import { legendColor } from 'd3-svg-legend'
const d3 = require('d3')
const topojson = require('topojson')
const world110m = require('./data/world-110m.json')
const world110mInfo = require('./data/world-110m-name.json')

/**
 * https://stackoverflow.com/questions/2998784/how-to-output-integers-with-leading-zeros-in-javascript
 */
function zeroPad(num, places) {
  let zero = places - num.toString().length + 1
  return Array(+(zero > 0 && zero)).join('0') + num
}

/**
 * A Rotating Globe widget that can be parameterized by
 * country ID colors, using a value-mapped color scheme
 * that is displayed in a legend.
 *
 * Country borders are taken from
 * Use world json from:
 *   https://github.com/topojson/world-atlas
 *   https://unpkg.com/world-atlas@1.1.4/world/110m.json
 *
 * Countries id use ISO numeric for each country
 *
 * Colors for countries are either set implicitly with
 * country values:
 *   this.setCountryValue (id, value)
 * Or directly with:
 *   this.setCountryColor (color)
 * where color is a hex-string color
 *
 * Allows a highlighted country that is drawn with
 * a different border color
 *
 * Resize function that can be called by your resize function
 *
 * Zoom based on this.scaleFactor
 *
 * Automatic legend from maximum values to 0
 * and mapped from light-grey to this.fillColor
 *
 * Internally countries are indexed using the world data structure.
 * A dictionary is provided to convert from ISO country codes:
 *    this.iCountryFromId
 *
 * Overrridable methods:
 *   - this.clickCountry (id)
 *   - this.dbclickCoutnry (id)
 *   - this.getCountryPopupHtml (id)
 *
 * Based on the following D3 globe code snippets:
 *  - https://jorin.me/d3-canvas-globe-hover/
 *  - http://bl.ocks.org/KoGor/5994804
 *  - http://bl.ocks.org/tlfrd/df1f1f705c7940a6a7c0dca47041fec8
 *  - https://bl.ocks.org/mbostock/7ea1dde508cec6d2d95306f92642bc42
 */
class Globe {
  /**
   *
   *
   * Use world json from:
   *   https://unpkg.com/world-atlas@1.1.4/world/110m.json
   *
   * @param selector - jquery div tag to insert the globe
   */
  constructor(selector, world = world110m, worldData = world110mInfo) {
    this.world = world
    this.selector = selector
    this.scaleFactor = 1 / 2.2
    this.iHighlightCountry = null

    this.features = topojson.feature(
      this.world,
      this.world.objects.countries
    ).features

    for (let info of worldData) {
      if (typeof info.iso_n3 === 'number') {
        info.iso_n3 = zeroPad(info.iso_n3, 3)
      }
    }

    // look-up country from numeric ISO country ID
    this.iCountryFromId = {}
    for (let i = 0; i < this.features.length; i += 1) {
      let countryFeature = this.features[i]
      this.iCountryFromId[countryFeature.id] = i
      for (let info of worldData) {
        if (info.iso_n3 === countryFeature.id && info.iso_n3 !== '-99') {
          _.assign(countryFeature.properties, info)
          break
        }
      }
    }

    // special data mangling for resolving the two data-sets
    // in world-110m set from vector and country data
    let kosovo = worldData[0]
    let somaliland = worldData[1]
    let northernCyprus = worldData[2]
    _.assign(this.features[88].properties, kosovo)
    _.assign(this.features[38].properties, northernCyprus)
    _.assign(this.features[145].properties, somaliland)

    let tags = ['adm0_a3', 'gu_a3', 'su_a3', 'brk_a3', 'iso_a3', 'iso_n3', 'adm0_a3_is']
    for (let i = 0; i < this.features.length; i += 1) {
      let countryFeature = this.features[i]
      let strs = _.map(tags, t => countryFeature.properties[t])
      console.log(i, countryFeature.properties.geounit, strs)
    }

    this.nullColor = '#CCB'
    this.borderColor = '#EEE'
    this.outerBorderColor = '#BBD'
    this.fillColor = 'aliceblue'
    this.highlightColor = 'green'

    this.colors = []
    this.borderColors = []
    for (let i = 0; i < this.features.length; i += 1) {
      this.colors.push(this.nullColor)
      this.borderColors.push(this.borderColor)
    }

    this.values = []
    for (let i = 0; i < this.features.length; i += 1) {
      this.values.push(null)
    }

    this.pos = { x: 0, y: 0 }
    this.savePos = { x: 0, y: 0 }
    this.isMouseDown = false

    this.getCurrentSize()

    this.projection = d3
      .geoOrthographic()
      .translate([this.centerX, this.centerY])
      .scale(this.scale)
      .clipAngle(90)
      .precision(0.6)

    this.path = d3.geoPath().projection(this.projection)

    this.svg = d3
      .select(this.selector)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .on('mousedown', () => this.mousedown())
      .on('mouseup', () => this.mouseup())
      .on('mousemove', () => this.mousemove())
      .on('mousewheel', () => this.mousewheel())
      .on('touchstart', () => this.mousedown())
      .on('touchend', () => this.mouseup())
      .on('touchmove', () => this.mousemove())

    // draw the fill of sphere
    this.svg
      .append('path')
      .datum({ type: 'Sphere' })
      .attr('class', 'water')
      .style('fill', this.fillColor)
      .style('stroke', 'none')
      .attr('d', this.path)

    // draw the countries, add change the colors
    this.svg
      .selectAll('.country')
      .data(this.features)
      .enter()
      .insert('path')
      .attr('class', 'country')
      .attr('d', this.path)
      .style('stroke', this.borderColor)

    // draw the country outlines
    this.svg
      .selectAll('.highlightCountry')
      .data(this.features)
      .enter()
      .insert('path')
      .attr('class', 'highlightCountry')
      .attr('d', this.path)
      .attr('fill', 'none')
      .style('stroke', 'none')

    // draw the encircling sphere
    this.svg
      .append('path')
      .datum({ type: 'Sphere' })
      .attr('class', 'water')
      .style('fill', 'none')
      .style('stroke', this.outerBorderColor)
      .attr('d', this.path)

    this.tooltip = d3
      .select(this.selector)
      .append('div')
      .attr('class', 'countryTooltip')
      .style('display', 'hidden')
      .style('pointer-events', 'none')
      .style('position', 'absolute')

    this.svg
      .selectAll('path.country')
      .on('mouseover', (d, i) => {
        let html = this.getCountryPopupHtml(i)
        if (html) {
          this.tooltip
            .html(html)
            .style('position', 'absolute')
            .style('display', 'block')
            .style('opacity', 1)
          this.moveTooltip()
        } else {
          this.tooltip.style('opacity', 0).style('display', 'none')
        }
      })
      .on('mousemove', () => {
        this.moveTooltip()
      })
      .on('mouseout', () => {
        this.tooltip.style('opacity', 0).style('display', 'none')
      })
      .on('dblclick', (d, i) => {
        this.dblclickCountry(i)
      })
      .on('click', (d, i) => {
        this.clickCountry(i)
      })

    // build the legend
    let element = $(this.selector)
    let elementId = element.attr('id')
    this.legendId = `${elementId}-legend`

    element.contextmenu(() => false).css({
      'user-select': 'none',
      cursor: 'pointer'
    }).append(`
        <div
          style="
          position: absolute;
          bottom: 0;
          padding-left: 10px;
          user-select: none;
          pointer-events: none;">
          <svg id="${this.legendId}"></svg>
        </div>
      `)

    this.draw()
  }

  /**
   * To be overridden
   * @param id
   */
  dblclickCountry(iCountry) {
    console.log('> Globe.dblclickCountry', iCountry, d3.event.pageX, d3.event.pageY)
  }

  /**
   * To be overridden
   * @param id
   */
  clickCountry(iCountry) {
    console.log('> Globe.clickCountry', iCountry, d3.event.pageX, d3.event.pageY)
  }

  moveTooltip() {
    this.tooltip
      .style('left', d3.event.pageX + 7 + 'px')
      .style('top', d3.event.pageY - 15 + 'px')
  }

  getICountry(query) {
    for (let i = 0; i < this.features.length; i += 1) {
      for (let key of _.keys(query)) {
        if (this.features[i].properties[key] === query[key]) {
          return i
        }
      }
    }
    return null
  }

  /**
   * To be overridden
   * @param id
   * @returns String - contains HTML to write to popup
   */
  getCountryPopupHtml(iCountry) {
    let value = this.values[iCountry]
    if (value === null) {
      return ''
    }
    return value.toFixed(1)
  }

  getCurrentSize() {
    let rect = d3
      .select(this.selector)
      .node()
      .getBoundingClientRect()
    this.width = rect.width
    this.height = rect.height
    this.scale = Math.min(this.width, this.height) * this.scaleFactor
    this.centerX = this.width / 2
    this.centerY = this.height / 2
  }

  resize() {
    this.getCurrentSize()
    this.svg.attr('width', this.width).attr('height', this.height)
    this.projection.translate([this.centerX, this.centerY]).scale(this.scale)
    this.draw()
  }

  draw() {
    this.svg.selectAll('path.water').attr('d', this.path)
    // draw country fills
    this.svg
      .selectAll('path.country')
      .attr('d', this.path)
      .style('fill', (d, i) => this.colors[i])
      .style('stroke', this.borderColor)
    this.drawHighlight()
  }

  setHighlight(iCountry) {
    this.iHighlightCountry = iCountry
  }

  drawHighlight() {
    // draw the highlighted country outline
    this.svg
      .selectAll('path.highlightCountry')
      .attr('d', this.path)
      .style('stroke', (d, i) => {
        if (i === this.iHighlightCountry) {
          return this.highlightColor
        } else {
          return 'none'
        }
      })
  }

  /**
   * Rotates globe directly to coordinates in r [-long, -lat]
   *
   * @param r - [-Longitude, -Latitude]
   */
  rotateTo(r) {
    if (r[1] < -90) {
      r[1] = -90
    }
    if (r[1] > 90) {
      r[1] = 90
    }
    this.projection.rotate(r)
    this.draw()
  }

  /**
   * Animated transition to this.rotateTo with callback when
   * the animation is finished
   *
   * @param targetR - [-Longitude, -Latitude]
   * @param callback
   */
  rotateTransition(targetR, callback) {
    let interpolateR = d3.interpolate(this.projection.rotate(), targetR)
    let rotate = t => {
      this.rotateTo(interpolateR(t))
    }
    d3.transition()
      .duration(1250)
      .tween('rotate', () => rotate)
      .on('end', callback)
  }

  rotateTransitionToICountry(iCountry, callback) {
    let selectedFeature = this.features[iCountry]
    let p = d3.geoCentroid(selectedFeature)
    this.rotateTransition([-p[0], -p[1]], callback)
  }

  rotateRel(diffR) {
    let r = this.projection.rotate()
    r[0] += diffR[0]
    r[1] += diffR[1]
    this.rotateTo(r)
  }

  resetCountryColorsFromValues(maxColor, maxValue = null, minColor = '#DDD') {
    if (maxValue === null) {
      maxValue = Math.max.apply(null, this.values)
    }
    this.paletteScale = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([minColor, maxColor])

    for (let i = 0; i < this.features.length; i += 1) {
      if (this.values[i] == null) {
        this.colors[i] = this.nullColor
      } else {
        this.colors[i] = this.paletteScale(this.values[i])
      }
    }
  }

  extractPointerPos() {
    let event = d3.event
    event.preventDefault()
    let x, y

    if (event.changedTouches) {
      x = event.changedTouches[0].pageX
      y = event.changedTouches[0].pageY
    } else if (event.touches) {
      x = event.touches[0].clientX
      y = event.touches[0].clientY
    } else {
      x = event.clientX
      y = event.clientY
    }

    let rect = d3
      .select(this.selector)
      .node()
      .getBoundingClientRect()

    x +=
      document.body.scrollLeft + document.documentElement.scrollLeft - rect.left
    y += document.body.scrollTop + document.documentElement.scrollTop - rect.top

    this.pos.x = x
    this.pos.y = y
  }

  mousemove() {
    this.extractPointerPos()
    if (this.isMouseDown) {
      this.rotateRel([
        +0.3 * (this.pos.x - this.savePos.x),
        -0.3 * (this.pos.y - this.savePos.y)
      ])
      this.savePos = _.clone(this.pos)
    }
  }

  mousedown() {
    this.mousemove()
    this.savePos = _.clone(this.pos)
    this.isMouseDown = true
  }

  mouseup() {
    this.mousemove()
    this.isMouseDown = false
  }

  mousewheel() {
    // event.preventDefault()

    let wheel
    let e = d3.event
    if (e.wheelDelta) {
      wheel = e.wheelDelta / 3000
    } else {
      // for Firefox
      wheel = -e.detail / 300
    }

    this.scaleFactor = this.scaleFactor * (1 - wheel)
    if (this.scaleFactor < 0.1) {
      this.scaleFactor = 0.1
    }

    this.resize()
  }

  drawLegend() {
    let svg = d3.select(`#${this.legendId}`)
    svg.html('')
    let colorLegend = legendColor()
      .labelFormat(d3.format('.0f'))
      .scale(this.paletteScale)
      .shapePadding(0)
      .shapeWidth(20)
      .shapeHeight(20)
      .labelOffset(8)
    svg.append('g').call(colorLegend)
  }
}

export { Globe }
