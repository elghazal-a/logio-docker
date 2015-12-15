/**
 * Copyright (C) 2012 by Matias Niemela
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function (angular, window) {
    'use strict';

    angular.module('SafeApply', [])

        .factory('$safeApply', ['$rootScope', function ($rootScope) {
            $rootScope.$safeApply = function () {
                var $scope, fn, arg, force = false, args = arguments;

                if (args.length === 1) {
                    arg = args[0];
                    if (typeof arg === 'function') {
                        fn = arg;
                    } else {
                        $scope = arg;
                    }
                } else if (args.length > 0) {
                    $scope = args[0];
                    fn = args[1];
                    if (args.length === 3) {
                        force = !!args[2];
                    }
                }

                $scope = $scope || this || $rootScope;
                // Weird v8 bug where sometimes this === window
                // Doesn't happen if you set breakpoints either
                // used a try / catch with a debugger statement
                // before I could inspect an exception instance
                if ($scope === window) { $scope = $rootScope; }
                
                fn = fn || function () {};

                if (force || !($scope.$$phase || $scope.$root.$$phase)) {
                    $scope.$apply ? $scope.$apply(fn) : $scope.apply(fn);
                } else {
                    fn();
                }
            };

            return $rootScope.$safeApply;
        }])

        // Mix it into the root scope
        .run(['$safeApply', function () {}]);

}(this.angular, this));
