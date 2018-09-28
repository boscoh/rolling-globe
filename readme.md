

# Rolling Choropleth Globe in D3

Programmable chloropeth Globe in D3 with modifiable country colors, tool-tips, event handling, rotations and highlights.

Demo: <https://boscoh.github.io/rolling-globe>

## Installation

Download the [package](https://github.com/boscoh/rolling-globe/archive/master.zip).

Open the file `example/index.html` in the browser. 

## How-to

_Quick-start._ To create a globe, you need [`require.js`](https://github.com/requirejs/requirejs) and `rolling-globe.min.js` from the `dist` directory in the package. Then in your HTML file:

```html
<div 
  id="globe"
  style="
    width: calc(100vw - 60px);
    height: calc(100vh - 160px);">
</div>

<script src="./require.js"></script>

<script>
require(['./rolling-globe.min.js'], function (rollingGlobe) {
    var g = new rollingGlobe.Globe('#globe')
})
</script>
```

_Matching country indices_. To access the the countries in the globe, you need to obtain the index of the country. This can be obtained using the `getICountry` method, with a query based on the built-in country properties (described in the section Looking up Countries below). To find Australia:

```javascript
var i = g.getICountry({'iso_a3': 'AUS'})
```

_Rotation to a selected country._
```javascript
g.rotateTransitionToICountry(i)
```

_Handle clicks and double-clicks._

```javascript
g.clickCountry = function (i) {
  console.log('clicked: ' + g.features[i].properties.name)
  g.setHighlight(i)
  g.rotateTransitionToICountry(i, function () {
    g.draw()
  })
}
```

_Setting country colors._
```javascript
g.colors[i] = 'green'
g.borderColors[i] = 'blue'
```

_Setting color palette based on country values._
```javascript
// let's say populations is a list of country
// populations sorted by the country index
for (var i = 0; i < g.values.length; i += 1) {
  g.values[i] = populations[i]
}
g.resetCountryColorsFromValues('red')
g.draw()

// optional legend
g.drawLegend()
```

_Highlight specific countries with outline._
```javascript
g.highlightColor = 'green'
g.iHighlightCountry = i
g.draw()
```

_Replace tool-tip._
```javascript
g.getCountryPopupHtml = function (i) {
  return g.features[i].properties.name + ': ' + g.values[i]
}
```

_Resize_: The resize method will resize the globe to fit the parent `<div>`. Attach the function the window resize function:
```javascript
window.onresize = function() { g.resize() }
```


## Development

Download package and load the module using require.js

The module has been written in ES6, a very nice dialect, and transpiled into a single file for easy deployment, which includes all the necessary data files to get up and running. To compile `dist/globe.min.js` use:

```bash
> npm intall
> webpack
```

During development, it is suggested to run with the file watcher, and re-load `example/index.html` which uses the compiled version in the `dist` directory:

```bash
> webpack --watch
```

### Looking up Countries

Each country is internally represented by an index iCountry, which refers to SVG vector data stored in `this.world`. This index is used to access the `this.values`, `this.colors`, `this.borderColors` and `this.features`.

Each country comes with a default set properties, which is stored in a list `this.features`. Each element in this list `feature` has a sub-field dictionary `feature.properties`, such as this one for Australia:

```
{
  "scalerank": 1,
  "featurecla": "Admin-0 country",
  "labelrank": 2,
  "sovereignt": "Australia",
  "sov_a3": "AU1",
  "adm0_dif": 1,
  "level": 2,
  "type": "Country",
  "admin": "Australia",
  "adm0_a3": "AUS",
  "geou_dif": 0,
  "geounit": "Australia",
  "gu_a3": "AUS",
  "su_dif": 0,
  "subunit": "Australia",
  "su_a3": "AUS",
  "brk_diff": 0,
  "name": "Australia",
  "name_long": "Australia",
  "brk_a3": "AUS",
  "brk_name": "Australia",
  "brk_group": "",
  "abbrev": "Auz.",
  "postal": "AU",
  "formal_en": "Commonwealth of Australia",
  "formal_fr": "",
  "note_adm0": "",
  "note_brk": "",
  "name_sort": "Australia",
  "name_alt": "",
  "mapcolor7": 1,
  "mapcolor8": 2,
  "mapcolor9": 2,
  "mapcolor13": 7,
  "pop_est": 21262641,
  "gdp_md_est": 800200,
  "pop_year":` -99,
  "lastcensus": 2006,
  "gdp_year":` -99,
  "economy": "2. Developed region: nonG7",
  "income_grp": "1. High income: OECD",
  "wikipedia":` -99,
  "fips_10": "",
  "iso_a2": "AU",
  "iso_a3": "AUS",
  "iso_n3": "036",
  "un_a3": 36,
  "wb_a2": "AU",
  "wb_a3": "AUS",
  "woe_id":` -99,
  "adm0_a3_is": "AUS",
  "adm0_a3_us": "AUS",
  "adm0_a3_un":` -99,
  "adm0_a3_wb":` -99,
  "continent": "Oceania",
  "region_un": "Oceania",
  "subregion": "Australia and New Zealand",
  "region_wb": "East Asia & Pacific",
  "name_len": 9,
  "long_len": 9,
  "abbrev_len": 4,
  "tiny":` -99,
  "homepart": 1
}
```

To lookup the iCountry index:

  - you can iterate through the country features `this.features` and match the properties of each country to your country identifier.
  - or use a default dictionary `this.iCountryFromId` that maps the iCountry index to `iso_n3` field of a country feature.
  - use the lookup method `this.getICountry({key: value})`, which will match the key, value pair to the values in `feature.properties` of each country, and return the iCountry index if successful

### References

The SVG vector data is stored in `this.world`, and this is taken from Mike Bostocks's [world-atlas](https://github.com/topojson/world-atlas), which was generated from the data at [Natural Earth](http://www.naturalearthdata.com/) at the resolution of 1:110.

The Globe object has the following properties:

 - `this.world` - topoJson data used to generate the SVG

 - `this.features` - list of features for each country

 - `this.values` - list of numerical values for each country
 - `this.colors` - list of colors for countries
 - `this.borderColors` - list of colors for borders of countries

 - `this.iCountryFromId` - dictionary to map `iso_n3` to iCountry indice

 - `this.nullColor` - color of country with values set to null
 - `this.borderColor` - color of country borders
 - `this.outerBorderColor` - color of globe border
 - `this.fillColor` - color of water
 - `this.highlightColor` - color of border outline for highlighted country

 - `this.scaleFactor` - zoom factor for globe

 - `this.iHighlightCountry` - iCountry to be highlighted with this.highlightColor; none if null

Methods:

 - `this.getICountry(query)` - query comes in the form of `{key: value}` that is used to search `this.features` for a matching property, function will return matchin iCountry index, or null
 - `this.dblclickCountry(iCountry)` - overridable callback for double-click
 - `this.clickCountry(iCountry)` - overridable callback fro click
 - `this.getCountryPopupHtml(iCountry)` - overridable callback to generate the HTML for the tool-tip pop-up for a country mouse-over.
 - `this.resize()` - resizes the globe to the size of the parent div. Useful for web-responsive divs.
 - `this.rotateTo(r)` - direct rotation to the rotational coordinate `r=[-Longitude, -Latitude]`, this is the internal D3 rotational coordinate system.
 - `this.rotateTransition(targetR, callback)` - animated transition analogue to `this.rotateTo` with callback upon end of animation
 - `this.rotateTransitionToICountry(iCountry, callback)` - animated rotation to country
 - `this.resetCountryColorsFromValues(maxColor, maxValue = null, minColor = '#DDD')` - recolors the countries using `this.values` from `maxColor` to `minColor` using a linear color palette
 - `this.draw()` - force redraw





