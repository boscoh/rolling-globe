

# Rotating Globe Choropleth in D3

Convenient D3-SVG globe for chloropeths of countries with programmable:
    - country colors
    - tool-tips
    - click
    - double-click
    - rotations
    - country highlights
    - country transitions

Based on Mike Bostocks's world-atlas 1:110 D3 topo-json data with basic country data.

Rolling globe version of [datamaps](https://github.com/markmarkoh/datamaps/blob/master/README.md#getting-started)

## Installation

Download the package

Look at the example `index.html` file.

## Quick-start

## How-to

## Development

Download package and load the module using require.js

To compile `dist/globe.min.js` use:

```bash
> npm intall
> webpack
```

The module has been written in ES6 and transpiled into a single file for easy deployment. All the necessary data has been compiled into the javascript file.

ES6 is much easier to edit and during development, it is suggested to run:

```bash
> webpack --watch
```


### References

By creating an object, the data-structures used to modify the globe can be easily accessed and modified.

Each country is internally represented by an index iCountry that refers to the country attributes stored in the object.

Most of the methods accesses or refers to countries by the ISO_N3 numeric doe as a string.

Incorporates Mike Bostock's [world-atlas](https://github.com/topojson/world-atlas 1:110 scale map, with country data

Properties
    this.world - topoJson data used to generate the SVG
    this.countryFeatures - list of features for each country
    this.iCountryFromId - dictionary to map ISO_N3 ID's to iCountry index
    this.nullColor - color string of country with no values set
    this.borderColor - color of country borders
    this.outerBorderColor - color of globe border
    this.fillColor - color water
    this.highlightColor - color of border outline for highlighted country
    this.colors - list of colors for countries
    this.borderColors - list of colors for borders of countries
    this.scaleFactor - zoom factor for globe
    this.iHighlight - iCountry to be highlighted with this.highlightColor; none if null
    this.values - list of numerical values for each country

Methods:

    getCountryFeature(id)
    dblclickCountry(id)
    clickCountry(id)
    setCountryValue(id, value)
    getCountryValue(id)
    setCountryColor(id, color)
    getCountryColor(id)
    getCountryPopupHtml(id)
    resize()
    rotateTo(r)
        r = [-Longitude, -Latitude]
      /**
       *
       * @param targetR - [-Longitude, -Latitude]
       * @param callback
       */
    rotateTransition(targetR, callback)
    rotateTransitionToCountry(id, callback)
    draw()

CountryFeatures deserves a bit more unpacking:

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
  "pop_year": -99,
  "lastcensus": 2006,
  "gdp_year": -99,
  "economy": "2. Developed region: nonG7",
  "income_grp": "1. High income: OECD",
  "wikipedia": -99,
  "fips_10": "",
  "iso_a2": "AU",
  "iso_a3": "AUS",
  "iso_n3": "036",
  "un_a3": 36,
  "wb_a2": "AU",
  "wb_a3": "AUS",
  "woe_id": -99,
  "adm0_a3_is": "AUS",
  "adm0_a3_us": "AUS",
  "adm0_a3_un": -99,
  "adm0_a3_wb": -99,
  "continent": "Oceania",
  "region_un": "Oceania",
  "subregion": "Australia and New Zealand",
  "region_wb": "East Asia & Pacific",
  "name_len": 9,
  "long_len": 9,
  "abbrev_len": 4,
  "tiny": -99,
  "homepart": 1
}
```





