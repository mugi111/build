'use strict'

const {
  env: { NETLIFY },
} = require('process')

module.exports = {
  onPreBuild() {
    console.log(NETLIFY)
  },
}
