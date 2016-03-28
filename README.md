koa-flash-simple
================

A stupidly simple flash messages middleware for Koa v2

NOTE: This middleware is NOT available for Koa v1

## Installation

`npm install koa-flash-simple`

This middleware leans on "session", so you have to install and set a session middleware before adding this one; check [Koa wiki to see a quite large list of available middlewares](https://github.com/koajs/koa/wiki#middleware).

## Usage

A few lines of code are worth several dozen of sentences

```js
const Koa = require('koa')
const session = require('koa-session')
const flash = require('koa-flash-simple')
const app = new Koa()

app.keys = ['some secret hurr']
app.use(session(app)) // Session middleware has to be added before flash
app.use(flash())

app.use((ctx) => {
  if (ctx.method === 'POST') {
    ctx.flash.set(Date.now())
    ctx.status = 204
    return
  }

  if (ctx.method === 'GET') {
    let fdata = ctx.flash.get()

    ctx.status = 200

    if (!fdata) {
      ctx.body = 'No previous post or it was long time ago'
      return
    }

    ctx.body = `Last post was {((Date.now() - fdata) / 1000)}s ago`
  }
})

app.listen(3000)

```


## API

The API is simple

Get the function middleware just calling the exported function

```js
require('koa-flash-simple')(options)
```

`options` is an object and it's optional; so far there is only one option, `key`, which is the "key" (property name) to use for storing the flash message data into the session.

After the middleware is added, it sets in the context (`ctx`), under the property `flash`, an object with just 2 methods

* `set(data)`: Allow to set the data which will be available just only for the next client request
* `get()`: Allow to retrieve the data set just in the exactly previous request, otherwise returns `undefined`

### Considerations

Calling `ctx.flash.set(...)` in the same request, by the same middleware or others of the chain, will replace the previous data, so the last `set` wins.

`ctx.flash.get()` can be called multiple times in the same request; it will return the same data on each one.

Redirections count as any usual request, hence the flash data set in the previous request will be available in the request which makes the redirection but it also be removed from the session; if you need it for the request after the redirection, `get` and `set` again.


## Development

`package.json#scripts` contains the commands needed for the development of the module, take a look if you're interested.

Notice I've created this middleware because I wanted to have a stupidly simple flash messaging functionality; here it's what I wanted and I thought that if I need more, then I will use any other or I will create a new one, but this one will remain SIMPLE.

* Set the whole data one place. I feel that is quite confusing having multiple middlewares setting data on it, if that's it needed pass data between them in other property and set all of that in the last one.
* Set data don't have any format, just set what you want and establish the conventions based in your needs; if you have to enforce, then you should find the way.
* Redirections count as an usual request; if you have to redirect a previous route, when you do the redirect because you're deprecating, refactoring or whatever, you should do the `get` and `set` too, not just only the redirection.

Although my previous mentioned expectations and the tiny and simple functionality of this middleware I know that I may miss something so, new ideas with follow this principles are welcome, please open an issue to discuss and, of course the same for any bug or issue that you find.

There is test for the module the current test coverage is 100%, however the version is `0.x` until I know that it has been used in production for a few months; so far (March 2016), I'm using in side project, which isn't in production and eventually it should be.

## License

MIT, read [LICENSE](https://github.com/ifraixedes/koa-flash/blob/master/LICENSE) file for more information.
