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

angular.module('ibmwatson-nlc-groundtruth-app')
  .factory('authentication',
    ['$http', '$q', 'session','endpoints', 'socket',
      function init ($http, $q, session, endpoints, socket) {

        function createSession (user) {
            // Store the current user and tenant for other services
            var tenant = _.isArray(user.tenants) ? user.tenants[0] : null;
            session.create(user.username,tenant);
        }

        function checkStatus () {
          return $http.get(endpoints.auth)
            .then(function handleResponse (response) {
              // An error response should be handled globally
              createSession(response.data);
              return response.data;
            });
        }

        function getCurrentUser () {
          if (!session.username) {
            return checkStatus();
          } else {
            return $q.when(session.username);
          }
        }

        function isAuthenticated () {
          return !!session.username;
        }

        function login (username, password) {
          return $http
            .post(endpoints.auth, {
              username: username,
              password: password
            })
            .then(function handleLoginResponse (res) {

              // Store the current user and tenant for other services
              var tenant = _.isArray(res.data.tenants) ? res.data.tenants[0] : null;

              session.create(res.data.username,tenant);

              // join the channel for the current tenant
              socket.emit('subscribe',tenant);

              return res.data;

            }, function handleLoginError (res) {
              if (res.status === 400 || res.status === 401) {
                throw new Error('Invalid username or password');
              }
              return res.data;
            });

        }

        function logout () {
          return $http.post(endpoints.auth + '/logout', null, {
            withCredentials: true
          }).then(function onLogout () {

            // leave the channel for the tenant
            socket.emit('unsubscribe',session.tenant);

            // Destroy the session
            session.destroy();
          });
        }

        var auth = {
          checkStatus: checkStatus,
          isAuthenticated: isAuthenticated,
          getCurrentUser: getCurrentUser,
          login: login,
          logout: logout
        };

        return auth;
      }
    ]
  );
