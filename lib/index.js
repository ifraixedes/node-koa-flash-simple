
module.exports = flash

function flash() {
  return (ctx, next) => {
    next()
  }
}
