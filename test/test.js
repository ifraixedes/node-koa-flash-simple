'use strict'

let assert = require('assert')
let Koa = require('koa')
let konvert = require('koa-convert')
let session = require('koa-session')
let request = require('supertest')

let flash = require('..')

describe('Flash', () => {
  describe('adds ctx.flash property as an object which ', () => {
    it('has `set` and `get methods`', () => {
      const fmd = flash()
      const ctx = { session: {} }
      fmd(ctx, () => undefined)

      assert.equal(typeof ctx.flash.set, 'function', 'flash does not have set method')
      assert.equal(typeof ctx.flash.get, 'function', 'flash does not have get method')
    })
  })

  describe('depends of ctx.session object', () => {
    it('crashes when it is not set', () => {
      const fmd = flash()
      try {
        fmd({}, () => {})
      } catch (e) {
        return
      }

      assert(false, 'Exception was expected')
    })

    it('stores values on it under `flash` key by default', () => {
      const data = 'some data'
      const fmd = flash()
      const ctx = {
        session: {}
      }

      fmd(ctx, () => {
        ctx.flash.set(data)
        assert.equal(ctx.session.flash, data, 'ctx.session.flash does not contain the expected data')
      })
    })

    it('stores values on it under a key defined in options', () => {
      const data = 'some data'
      const key = 'flashtest'
      const fmd = flash({ key: key })
      const ctx = {
        session: {}
      }

      fmd(ctx, () => {
        ctx.flash.set(data)
        assert.equal(ctx.session[key], data, `ctx.session.${key} does not contain the expected data`)
      })
    })

    it('cleans its data when next request finish', () => {
      const data = 'some data'
      const fmd = flash()
      const ctx = {
        session: {}
      }

      fmd(ctx, () => {
        ctx.flash.set(data)
        assert.equal(ctx.session.flash, data, 'ctx.session.flash does not contain the expected data')
      })

      fmd(ctx, () => {})
      fmd(ctx, () => {
        assert.equal(ctx.session.flash, undefined, 'ctx.session.flash exists')
      })
    })

    it('rewrites previous data when is called again `set`', () => {
      const data = 'second data'
      const fmd = flash()
      const ctx = {
        session: {}
      }

      fmd(ctx, () => {
        ctx.flash.set('first data')
        ctx.flash.set(data)
        assert.equal(ctx.session.flash, data, 'ctx.session.flash does not contain the expected data')
      })
    })
  })

  describe('on each request', () => {
    function getFlashData(ctx, next) {
      let data = ctx.flash.get()

      if (data) {
        // Emulate asynchronous operation
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            ctx.body = data
            ctx.status = 200
            resolve()
          }, 10)
        })
      }

      return next()
    }

    function setFlashData(ctx, next) {
      ctx.flash.set(data)
      return next()
    }

    function redirectOnSecond() {
      let nreqs = 0
      return (ctx, next) => {
        nreqs++

        if (nreqs === 2) {
          ctx.redirect('/redirect')
          ctx.status = 307
          return
        }

        return next()
      }
    }

    function respond200(ctx) {
      ctx.status = 200
    }

    const data = { type: 'info', msg: 'flash message' }
    let app

    beforeEach(() => {
      app = new Koa()
      app.keys = ['secret']
      app.use(konvert(session(app)))
      app.use(flash())
    })

    it('allows to set data to retrieve in the next client request', () => {
      app.use(getFlashData)
      app.use(setFlashData)
      app.use(respond200)

      let agent = request.agent(app.listen())

      return promiseFromAgent(agent.get('/').expect(200, {}))
      .then(() => promiseFromAgent(agent.get('/').expect(200, data)))
    })

    it('allows to set data to retrieve in the next request but only from the same client', () => {
      app.use(getFlashData)
      app.use(setFlashData)
      app.use(respond200)

      let appListening = app.listen()
      let agent1 = request.agent(appListening)
      let agent2 = request.agent(appListening)

      return promiseFromAgent(agent1.get('/').expect(200, {}))
      .then(() => promiseFromAgent(agent2.get('/').expect(200, {})))
      .then(() => promiseFromAgent(agent1.get('/').expect(200, data)))
      .then(() => promiseFromAgent(agent2.get('/').expect(200, data)))
    })

    it('does not return data, set by sooner client request than previous one', () => {
      app.use(getFlashData)
      app.use(setFlashData)
      app.use(respond200)

      let agent = request.agent(app.listen())
      return promiseFromAgent(agent.get('/').expect(200, {}))
      .then(() => promiseFromAgent(agent.get('/').expect(200, data)))
      .then(() => promiseFromAgent(agent.get('/').expect(200, {})))
    })

    it('does not keep data on redirection request', () => {
      app.use(redirectOnSecond())
      app.use(getFlashData)
      app.use(setFlashData)
      app.use(respond200)

      let agent = request.agent(app.listen())
      return promiseFromAgent(agent.get('/').expect(200, {}))
      .then(() => promiseFromAgent(agent.get('/').expect(307)))
      .then(() => promiseFromAgent(agent.get('/').expect(200, {})))
    })
  })
})

function promiseFromAgent(agent) {
  return new Promise((resolve, reject) => {
    agent.end((err) => {
      if (err) {
        reject(err)
        return
      }

      return resolve()
    })
  })
}
