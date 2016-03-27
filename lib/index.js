'use strict'

const debug = require('debug')('koa-flash-simple')

module.exports = flash

function flash(opts) {
  let key = 'flash'

  if ((opts) && (opts.key)) {
    key = opts.key
  }

  return (ctx, next) => {
    let prev = ctx.session[key]

    if (prev) {
      debug('flash message found %j', prev)
      ctx.session[key] = null
    } else {
      debug('No flash message found')
    }

    ctx.flash = Object.seal({
      get() { return prev },
      set(data) { ctx.session[key] = data }
    })

    return next()
  }
}
