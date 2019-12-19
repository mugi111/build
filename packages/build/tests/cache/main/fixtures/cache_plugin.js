const { writeFile, readFile } = require('fs')
const { promisify } = require('util')
const { dirname } = require('path')
const {
  env: { TEST_CACHE_PATH },
} = require('process')

const makeDir = require('make-dir')
const del = require('del')

const cachePath = `${TEST_CACHE_PATH}/test/test`

const pWriteFile = promisify(writeFile)
const pReadFile = promisify(readFile)

const DUMMY_VALUE = String(Math.random())

module.exports = {
  name: 'netlify-plugin-test',
  async onPreSaveCache({ utils: { cache } }) {
    await cache.remove(TEST_CACHE_PATH)
    await makeDir(dirname(cachePath))
    await pWriteFile(cachePath, DUMMY_VALUE)
  },
  async onPostSaveCache({ utils: { cache } }) {
    await del(TEST_CACHE_PATH, { force: true })
    await cache.restore(TEST_CACHE_PATH)
    const value = await pReadFile(cachePath, 'utf8')
    console.log(value === DUMMY_VALUE)
    await del(TEST_CACHE_PATH, { force: true })
  },
}
