const path = require('path')
const fs = require('fs')
const { promisify } = require('util')

const makeDir = require('make-dir')
const pathExists = require('path-exists')
const readdirp = require('readdirp')
const cpy = require('cpy')
const { zipFunctions } = require('@netlify/zip-it-and-ship-it') // eslint-disable-line
const htmlToText = require('html-to-text')

function netlifyPluginSearchIndex(pluginConfig) {
  const searchIndexFolder = pluginConfig.searchIndexFolder || 'searchIndex'
  return {
    name: '@netlify/plugin-search-index',
    // scopes: ['listSites'],

    async postBuild(opts) {
      const {
        constants: { BUILD_DIR, FUNCTIONS_SRC, FUNCTIONS_DIST },
      } = opts

      if (FUNCTIONS_SRC === undefined) {
        throw new Error('You must specify config.build.functions when using netlify-plugin-search-index')
      }

      let newManifest = []
      newManifest = await readdirp
        .promise(BUILD_DIR, { directoryFilter: ['node_modules'] })
        .then(x => x.map(y => y.fullPath))
      newManifest = newManifest.filter(x => x.endsWith('.html'))
      let searchIndex = {}
      let customOpts = {
        // TODO: expose this
        // https://www.npmjs.com/package/html-to-text#options
        wordwrap: 130,
      }
      const readfile = promisify(fs.readFile)
      await Promise.all(
        newManifest.map(htmlFilePath => {
          return readfile(htmlFilePath, 'utf8').then(htmlFileContent => {
            const text = htmlToText.fromString(htmlFileContent, customOpts)
            const indexPath = path.relative(BUILD_DIR, htmlFilePath)
            searchIndex[`/${indexPath}`] = text
          })
        }),
      )
      let searchIndexPath = path.join(BUILD_DIR, searchIndexFolder, 'searchIndex.json')
      if (await pathExists(searchIndexPath)) {
        console.warn(
          `searchIndex detected at ${searchIndexPath}, will overwrite for this build but this may indicate an accidental conflict`,
        )
      }
      await makeDir(searchIndexPath)
      let stringifiedIndex = JSON.stringify(searchIndex)
      fs.writeFileSync(searchIndexPath, stringifiedIndex)

      const searchIndexFunctionPath = path.join(FUNCTIONS_SRC, 'searchIndex')
      await cpy(__dirname + '/functionTemplate', searchIndexFunctionPath)
      // now we have copied it out to intermediate dir
      // we may want to do some processing/templating
      fs.writeFileSync(path.join(searchIndexFunctionPath, 'searchIndex.json'), stringifiedIndex)
      // and then..
      await zipFunctions(FUNCTIONS_SRC, FUNCTIONS_DIST)
      console.log('Files copied!')
      // done with generating functions
    },
  }
}
module.exports = netlifyPluginSearchIndex