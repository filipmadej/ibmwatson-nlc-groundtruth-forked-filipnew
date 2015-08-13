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

angular.module('ibmwatson-common-ui-components',[])
  .directive('watsonFooter', function() {
    return {
      template: '<footer class="footer ibm-footer"><ul class="list-inline ibm-list-inline"><li>&#169; 2015 International Business Machines</li></ul></footer>',
      restrict: 'EA',
      replace: true
    };
  })
  .directive('watsonLoading', function() {
    return {
      template: '<div class="ibm-loading"><div class="ibm-loading-img"></div><p class="ibm-loading-message" ng-if="loadingMessage">{{ loadingMessage }}</p></div>',
      restrict: 'EA',
      replace: true,
      scope : {
        loadingMessage : '=',
      }
    };
  });
