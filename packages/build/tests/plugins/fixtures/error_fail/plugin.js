'use strict'

module.exports = {
  onBuild() {
    throw new Error('onBuild')
  },
  onError() {
    throw new Error('onError')
  },
}
