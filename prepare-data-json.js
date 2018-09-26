const fs = require('fs')
const tsv = require('tsv')

function wrapJson (wrapJsFname, o) {
  let jsonText = JSON.stringify(o, null, 2)
  let wrappedText = `define(function() {
return ${jsonText}
});`
  fs.writeFileSync(wrapJsFname, wrappedText)
}

let data = require('./node_modules/world-atlas/world/110m.json')
wrapJson('./src/data/world-110m.json.js', data)

let s = fs.readFileSync( './node_modules/world-atlas/world/110m.tsv').toString()
wrapJson('./src/data/world-110m-name.json.js', tsv.parse(s))
