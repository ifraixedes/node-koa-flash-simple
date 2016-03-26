'use strict'

module.exports = flash

function flash(opts) {
  let key = 'flash'

  if ((opts) && (opts.key)) {
    key = opts.key
  }

  return (ctx, next) => {
    let prev = ctx.session[key]
    ctx.session[key] = null

    ctx.flash = Object.seal({
      get() { return prev },
      set(data) { ctx.session[key] = data }
    })

    next()
  }
}
