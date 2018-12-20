'use strict';
if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
    module.exports = 'ui.router.tabs';
}

angular.module('ui.router.tabs', ['ngSanitize']);
angular.module('ui.router.tabs').directive('uiTabs', ['$rootScope', '$state',
function($rootScope, $state) {
    return {
        restrict: 'EA',
        scope: {
            tabs: '=data',
            type: '@',
            justified: '@',
            vertical: '@',
            class: '@'
        },
        link: function(scope) {

            var updateTabs = function() {
                scope.update_tabs();
            };

            var unbindStateChangeSuccess = $rootScope.$on('$stateChangeSuccess', updateTabs);
            var unbindStateChangeError = $rootScope.$on('$stateChangeError', updateTabs);
            var unbindStateChangeCancel = $rootScope.$on('$stateChangeCancel', updateTabs);
            var unbindStateNotFound = $rootScope.$on('$stateNotFound', updateTabs);

            scope.$on('$destroy', unbindStateChangeSuccess);
            scope.$on('$destroy', unbindStateChangeError);
            scope.$on('$destroy', unbindStateChangeCancel);
            scope.$on('$destroy', unbindStateNotFound);
        },
        controller: ['$scope', function($scope) {
            $scope.contextMenu = {
                "display": "none",
                "top": "0",
                "left": "0"
            };
            $scope.currentTab = angular.noop();
            $scope.currentTabHasRight = false;

            if (!$scope.tabs) {
                throw new Error('UI Router Tabs: \'data\' attribute not defined, please check documentation for how to use this directive.');
            }

            if (!angular.isArray($scope.tabs)) {
                throw new Error('UI Router Tabs: \'data\' attribute must be an array of tab data with at least one tab defined.');
            }

            var currentStateEqualTo = function(tab) {
                var isEqual = $state.is(tab.route, tab.params, tab.options);
                return isEqual;
            };

            $scope.go = function(tab) {
                if (!currentStateEqualTo(tab) && !tab.disable) {
                    $state.go(tab.route, tab.params, tab.options);
                }
            };

            $scope.remove = function($event, t, clearAll) {
                // 组织事件传递到a标签上的点击事件
                $event && $event.stopPropagation();
                if (!t) return;
                var ary = [],
                targetTab = angular.noop();
                if (t.constructor == Object) {
                    ary.push(t);
                    // 若删除的是当前选中tab，则选中另外一个tab
                    if (t.active) {
                        for (var i = 0, c; c = $scope.tabs[i++];) {
                            if (c.route !== t.route) {
                                targetTab = c;
                                break;
                            }
                        }
                    }
                } else if (t.constructor == Array) {
                    ary = t;
                    // 清空时保留当前打开的tab
                    if (clearAll) {
                        for (var i = 0, c; c = $scope.tabs[i++];) {
                            if (c.active) {
                                targetTab = c;
                                break;
                            }
                        }
                    }
                    // 其他情况下保留所选的tab
                    else {
                        targetTab = $scope.currentTab;
                    }
                }
                if (targetTab && !targetTab.active) {
                    $scope.go(targetTab);
                }
                if(ary.length===$scope.tabs.length){
                	for (var i = 0; i < ary.length; i++) {
                        var c = ary[i];
                        if (c.route !== targetTab.route) {
                            // 移除tab
                            $scope.tabs.splice(i, 1);
                            i--;
                        }
                    }
                }
                else{
                	for (var i = 0, c; c = ary[i++];) {
                		$scope.tabs.remove(c);
                    }
                }
            }

            // 显示右键菜单
            $scope.showContextMenu = function($event, t) {
                $scope.currentTab = t;
                var me = angular.element($event.currentTarget),
                ft = me.closest("div"),
                offset = ft.offset();
                $scope.contextMenu = {
                    "display": "block",
                    "top": $event.clientY - offset.top,
                    "left": $event.clientX - offset.left + 15
                };
                $scope.currentTabHasRight = ($scope.getRightTabs(t).length > 0);
            }

            // 隐藏右键菜单
            $scope.hideContextMenu = function() {
                $scope.currentTab = angular.noop();
                $scope.contextMenu = {
                    "display": "none",
                };
            }

            angular.element("body").bind("mousedown",
            function(event) {
                var me = angular.element(event.target),
                pul = me.closest("ul.uiTabsMenu");
                if (!pul || pul.length == 0) {
                    $scope.hideContextMenu(); ! $scope.$$phase && $scope.$digest();
                }
            });
            // 关闭当前tab
            $scope.closeMe = function() {
                $scope.remove(null, $scope.currentTab);
                $scope.hideContextMenu();
            }
            // 关闭其他tab
            $scope.closeOther = function() {
                $scope.remove(null, $scope.tabs);
                $scope.hideContextMenu();
            }
            // 关闭右侧tab
            $scope.closeRightGuys = function() {
                var rightGuys = $scope.getRightTabs($scope.currentTab);
                $scope.remove(null, rightGuys);
                $scope.hideContextMenu();
            }
            // 关闭所有(保留一个)
            $scope.closeAll = function() {
                $scope.remove(null, $scope.tabs, true);
                $scope.hideContextMenu();
            }
            // 获取右侧的tabs
            $scope.getRightTabs = function(t) {
                var indexTag = -1;
                for (var i = 0, c; c = $scope.tabs[i++];) {
                    if (c.route === t.route) {
                        indexTag = i;
                        break;
                    }
                }
                return $scope.tabs.slice(indexTag);
            }
            /* whether to highlight given route as part of the current state */
            $scope.is_active = function(tab) {
                var isAncestorOfCurrentRoute = $state.includes(tab.route, tab.params, tab.options);
                return isAncestorOfCurrentRoute;
            };
            $scope.update_tabs = function() {
                // sets which tab is active (used for highlighting)
                angular.forEach($scope.tabs,
                function(tab, index) {
                    tab.params = tab.params || {};
                    tab.options = tab.options || {};
                    tab.class = tab.class || '';

                    tab.active = $scope.is_active(tab);
                    if (tab.active) {
                        $scope.tabs.active = index;
                    }
                });
            };

            $scope.update_tabs();
        }],
        templateUrl: function(element, attributes) {
            return attributes.templateUrl || 'ui-router-tabs-custom-ui-view-template.html';
        }
    };
}]).run(['$templateCache', function($templateCache) {
    var CUSTOM_UI_VIEW_TEMPLATE = '<div>' + 
    '<ul class="nav nav-pills" ng-class="{multiTabs: tabs.length > 1}">' +
    '<li class="tab {{tab.class}}" ng-class="{active: tab.active}"' +
    '  ng-repeat="tab in tabs" disable="tab.disable" ng-click="go(tab)">' +
    '<a ng-click="select($event)" ng-right-click="showContextMenu($event, tab)" class="nav-link">' +
    '<span ng-bind="tab.heading"></span>' +
    '<i class="fa fa-close" ng-click="remove($event, tab)"></i>' +
    '</a>' +
    '</li>' +
    '</ul>' +
    '<ul class="dropdown-menu uiTabsMenu" ng-style="contextMenu">' +
    '<li role="menuitem" ng-class="{disabled:tabs.length<=1}"><a ng-click="closeMe()">关闭标签</a></li>' +
    '<li role="menuitem"><a ng-click="closeOther()">关闭其他标签</a></li>' +
    '<li role="menuitem" ng-class="{disabled:!currentTabHasRight}"><a ng-click="closeRightGuys()">关闭右侧标签</a></li>' +
    '<li role="menuitem"><a ng-click="closeAll()">清空</a></li>' +
    '</ul>' +
    '</div>';
    
    $templateCache.put('ui-router-tabs-custom-ui-view-template.html', CUSTOM_UI_VIEW_TEMPLATE);
}]);