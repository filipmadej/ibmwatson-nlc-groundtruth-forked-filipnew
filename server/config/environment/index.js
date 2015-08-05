'use strict';

var path = require('path');
var _ = require('lodash');
var env = process.env.NODE_ENV || 'development';

function requiredProcessEnv (name) {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

console.error(env);

// All configurations will extend these options
// ============================================
var all = {
  env : env,

  // Root path of server
  root : path.normalize(__dirname + '/../../..'),

  // Server port
  port : process.env.PORT || 9000,

  // Secret for session, you will want to change this and make it an environment variable
  secrets : {
    cookie : process.env.COOKIE_SECRET || 'ibmwatson-nlc-groundtruth-cookie-secret',
    session : process.env.SESSION_SECRET || 'ibmwatson-nlc-groundtruth-session-secret'
  },

  // List of user roles
  userRoles : ['guest', 'user', 'admin'],

  // Default values for VCAP, to be used with node cfenv if not present
  vcap : {
    application : null,
    services : {
      'natural_language_classifier': [{
        'name': 'ibmwatson-nlc-classifier',
        'label': 'natural_language_classifier',
        'plan': 'beta',
        'credentials': {
          'url': 'https://gateway.watsonplatform.net/natural-language-classifier-beta/api',
          'username': 'fd323271-b313-440e-9ac5-29f5ed8adf91',
          'password': 'c62de7383b79',
          'version': 'v1'
        }
      }]
    }
  },

  endpoints : {
      auth : 'https://ibmwatson-nlc-tools.mybluemix.net/auth',
      cloudfoundry : 'https://api.ng.bluemix.net',
      bluemix : 'https://console.ng.bluemix.net'
  },

  classifierServiceName : 'ibmwatson-nlc-classifier'

};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + env + '.js') || {});