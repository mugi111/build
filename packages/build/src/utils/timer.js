const { hrtime } = require('process')

const { logTimer } = require('../build/log')

// Starts a timer
const startTimer = function() {
  return hrtime()
}

// Ends a timer and prints the result on console
const endTimer = function([startSecs, startNsecs], context, hook) {
  const [endSecs, endNsecs] = hrtime()
  const durationNs = (endSecs - startSecs) * NANOSECS_TO_SECS + endNsecs - startNsecs
  const durationMs = Math.ceil(durationNs / NANOSECS_TO_MSECS)

  logTimer(durationMs, hook, context)
}

const NANOSECS_TO_SECS = 1e9
const NANOSECS_TO_MSECS = 1e6

module.exports = { startTimer, endTimer }
