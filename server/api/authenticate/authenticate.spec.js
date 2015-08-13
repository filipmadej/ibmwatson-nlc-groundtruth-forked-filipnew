/**
 * Copyright 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

'use strict';
/*eslint func-names: 0, max-nested-callbacks: 0, max-statements: 0, handle-callback-err: 0 */

// core dependencies
var util = require('util');

// external dependencies
var async = require('async');
var chai = require('chai');
var httpstatus = require('http-status');
var proxyquire = require('proxyquire');
var request = require('supertest');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

// local dependencies
var nlc = require('../../config/nlc');

// test dependencies
var mocks = require('../../test/mocks');

var should = chai.should();
chai.use(sinonChai);

var passport = require('passport');
passport['@global'] = true;

var app = proxyquire('../../app', {
  './config/db/store' : new mocks.StoreMock(),
  'passport' : passport
});

describe('/server/api/authenticate', function () {

  describe('GET /api/authenticate', function () {

    it('should respond with a 401 response if the user is not authenticated', function (done) {
      request(app)
        .get('/api/authenticate')
        .expect(httpstatus.UNAUTHORIZED, done);
    });

    it('should respond with a 401 response if the session cookie is invalid', function (done) {
      request(app)
        .get('/api/authenticate')
        .set('Cookie', ['connect.sid=s:AWWn3-T1GJ1N5fpXVh0OYTnbSVcEVeG5.7skWD6cJUPyNIyd/Tk+/+P7wK3L31Tys70Z3zDiKAbI'])
        .expect(httpstatus.UNAUTHORIZED, done);
    });

    it('should respond with a 200 response if the user is authenticated', function (done) {
      var sessionCookie;
      async.series([
        function (next) {
          request(app)
            .post('/api/authenticate')
            .send({username : nlc.username, password : nlc.password})
            .expect(httpstatus.OK)
            .end(function (err, res) {
            sessionCookie = res.headers['set-cookie'][0];
            next(err);
          });
        },
        function (next) {
          request(app)
            .get('/api/authenticate')
            .set('Cookie', [sessionCookie])
            .expect(httpstatus.OK, next);
        }
      ], done);
    });
  });

  describe('POST /api/authenticate', function () {

    it('should respond with a 200 response if the user provides the correct credentials', function (done) {
      request(app)
        .post('/api/authenticate')
        .send({username : nlc.username, password : nlc.password})
        .expect(httpstatus.OK)
        .end(function (err, res) {
          should.exist(res.headers['set-cookie'][0]);
          res.headers['set-cookie'][0].should.match(/^connect\.sid/);
          done(err);
        });
    });

    it('should respond with a 400 response if the user provides the incorrect credentials', function (done) {
      request(app)
        .post('/api/authenticate')
        .send({username : nlc.username, password : 'wrongpasswordfool'})
        .expect(httpstatus.BAD_REQUEST, done);
    });

    it('should respond with a 400 response if the user provides the credentials in header', function (done) {
      request(app)
        .post('/api/authenticate')
        .auth(nlc.username, nlc.password)
        .expect(httpstatus.BAD_REQUEST, done);
    });

    it('should return error from passport strategy', function (done) {

      var passportStub = sinon.stub(passport, 'authenticate', function (strategy, callback) {
        return function (req, res, next) {
          callback({error : 'test-generated'});
        }
      });

      request(app)
        .post('/api/authenticate')
        .auth(nlc.username, nlc.password)
        .expect(httpstatus.INTERNAL_SERVER_ERROR)
        .end(function (err, resp) {
          passport.authenticate.restore();
          done(err);
        });
    });

    it('should return error from request login', function (done) {

      var passportStub = sinon.stub(passport, 'authenticate', function (strategy, callback) {
        return function (req, res, next) {
          var loginStub = sinon.stub(req, 'logIn');
          loginStub.callsArgWith(1, {error : 'test-generated'});
          callback(null, {username : 'test-user'});
        }
      });

      request(app)
        .post('/api/authenticate')
        .auth(nlc.username, nlc.password)
        .expect(httpstatus.INTERNAL_SERVER_ERROR)
        .end(function (err, resp) {
          passport.authenticate.restore();
          done(err);
        });
    });
  });

  describe('POST /api/authenticate/logout', function (done) {
    it('should respond with a 400 if user not logged in', function (done) {

      request(app)
        .post('/api/authenticate/logout')
        .expect(httpstatus.BAD_REQUEST, done);

    });

    it('should respond with a 200 and log out user if already logged in', function (done) {

      var sessionCookie;

      async.series([
        function (next) {
          request(app)
            .post('/api/authenticate')
            .send({username : nlc.username, password : nlc.password})
            .expect(httpstatus.OK)
            .end(function (err, res) {
            sessionCookie = res.headers['set-cookie'][0];
            next(err);
          });
        },
        function (next) {
          request(app)
            .get('/api/authenticate')
            .set('Cookie', [sessionCookie])
            .expect(httpstatus.OK, next);
        },
        function (next) {
          request(app)
            .post('/api/authenticate/logout')
            .set('Cookie', [sessionCookie])
            .expect(httpstatus.OK)
            .end(function (err, res) {
            next(err);
          });
        },
        function (next) {
          request(app)
            .get('/api/authenticate')
            .set('Cookie', [sessionCookie])
            .expect(httpstatus.UNAUTHORIZED, next);
        }
      ], done);

    });
  });

});
