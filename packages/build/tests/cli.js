const test = require('ava')

const { version } = require('../package.json')

const { runFixture } = require('./helpers/main')

test('--help', async t => {
  await runFixture(t, '', { config: false, flags: '--help' })
})

test('--version', async t => {
  const { all } = await runFixture(t, '', { config: false, flags: '--version' })
  t.is(all, version)
})

test('Exit code is 0 on success', async t => {
  const { exitCode } = await runFixture(t, 'empty')
  t.is(exitCode, 0)
})

test('Exit code is 1 on error', async t => {
  const { exitCode } = await runFixture(t, 'invalid')
  t.is(exitCode, 1)
})
