'use strict'

let Koa = require('koa')
let konvert = require('koa-convert')
let session = require('koa-session')
// let request = require('supertest')

let flash = require('..')

describe('Flash', () => {
  before(() => {
    let app = new Koa()
    app.use(konvert(session(app)))
    app.use(flash())
  })

  describe('adds ctx.flash property as an object which ', () => {
    it('has a `set` method that set data rewriting any previous one')
    it('has a `get` method which return data from a previous client request')
  })

  describe('on each request', () => {
    it('allows to set data for the next client request')
    it('allows to get data set in the previous client request')
    it('does not return data set by sooner client request than previous one')
    it('does not keep data on redirection request')
  })

  describe('depends of ctx.session object', () => {
    it('crashes when it is not set')
    it('stores values on it under `flash` key by default')
    it('stores values on it under a key defined in options')
    it('cleans its data when next request finish')
  })
})
