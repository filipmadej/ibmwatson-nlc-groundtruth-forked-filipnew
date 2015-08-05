'use strict';

angular.module('ibmwatson-nlc-groundtruth-app')
    .config(function($stateProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'app/login/login.html',
                controller: 'LoginCtrl',
                params: {
                    message:''
                },
                access: {
                    requiredLogin: false
                }
            });
    });