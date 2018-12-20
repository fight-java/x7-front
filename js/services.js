;(function() {
	'use strict';

	var base = angular.module("eip");
	
	function AuthService($http, $sessionStorage, context, baseService, $rootScope, $state, $timeout) {
        var service = {},
        	ctx = context();

        service.Login = Login;
        service.Logout = Logout;
        service.ssoRedirect = ssoRedirect;
        service.ssoLogin = ssoLogin;
        service.loadDefaultPage = loadDefaultPage;
        service.genCurrentUserMenu = genCurrentUserMenu;
        service.genCurrentOnLine = genCurrentOnLine;
        
        return service;

        function Login(username, password, callback) {
            $http.post(ctx['uc'] + '/auth', { username: username, password: password })
                .success(function (response) {
                    // login successful if there's a token in the response
                    if (response.token) {
                        // store username and token in local storage to keep user logged in between page refreshes
                        $sessionStorage.currentUser = response;
                        if($sessionStorage.currentUser){
                        	$rootScope.currentUserName = response.username;
                        }
                        // add jwt token to auth header for all requests made by the $http service
                        $http.defaults.headers.common.Authorization = 'Bearer ' + response.token;
                        window.sessionStorage.setItem("token",response.token);
                        // execute callback with true to indicate successful login
                        callback({result: true});
                    } else {
                        // execute callback with false to indicate failed login
                        callback({result: false, message: "登录失败"});
                    }
                })
                .error(function(rep){
                	if(rep && rep.code==499){
                		$sessionStorage.welcome = rep.message;
                		$state.go('welcome');
                	}
                	callback({result: false, message: rep.message});
                });
        }
        
        // 重定向到单点登录界面
        function ssoRedirect(){
        	ssoInfo().then(function(data){
        		if(data && data.enable){
        			// 跳转到单点登录界面
                	window.location.href = data.ssoUrl + ctx['web'];
        		}
        		else{
        			$state.go('login');
        		}
        	}, function(){
        		$state.go('login');
        	});
        }
        // 获取单点登录信息
        function ssoInfo(){
        	return baseService.get("${uc}/sso/info");
        }
        // 完成单点登录，并从后端获取jwt
        function ssoLogin(params, callback){
        	var url = ctx['uc'] + "/sso/auth?service=" + ctx['web'];
        	if(params.ticket){
    			url += "&ticket=" + params.ticket;
    		}
    		if(params.code){
    			url += "&code=" + params.code;
    		}
        	$http.get(url)
                .success(function (response) {
                    if (response.token) {
                        $sessionStorage.currentUser = response;
                        $http.defaults.headers.common.Authorization = 'Bearer ' + response.token;
                        callback({result: true});
                    } else {
                        callback({result: false, message: "登录失败"});
                    }
                })
                .error(function(rep){
                	callback({result: false, message: "认证失败"});
                });
        }
        // 退出系统
        function Logout() {
            $http.defaults.headers.common.Authorization = '';
        	$sessionStorage.$reset();
        	ssoInfo().then(function(data){
        		if(data && data.enable){
        			// 单点退出
        			window.location.href = data.ssoLogoutUrl + ctx['web'];
        		}
        		else{
        			$state.go('login');
        		}
        	}, function(){
        		$state.go('login');
        	});
        }
        // 加载默认页面
        function loadDefaultPage(){
    		// 跳转到默认页面
    		$state.go("worktop.myHome");
    		genCurrentUserMenu();
    		genCurrentOnLine();
        }
        // 获取当前用户的菜单资源
        function genCurrentUserMenu(){
        	// 获取当前用户的功能资源
        	getCurrentUserMethodAuth();
        	if($sessionStorage.frontMenus){
        	    $rootScope.frontMenus = $sessionStorage.frontMenus;
        	    $rootScope.$broadcast("frontMenus:ready", $rootScope.frontMenus);
        	    evalState($rootScope.frontMenus,$state)
        	    return;
        	}
        	
        	if(!$sessionStorage.currentUser) return;
        	baseService.get("${portal}/sys/sysMenu/v1/getCurrentUserMenu?menuType=1").then(function(data){
        		$rootScope.frontMenus = data.value;
        		$rootScope.$broadcast("frontMenus:ready", $rootScope.frontMenus);
        		$sessionStorage.frontMenus = data.value;
        		evalState(data.value,$state);
        	});
        }
        // 获取当前用户拥有的功能资源
        function getCurrentUserMethodAuth(){
        	if($sessionStorage.methodAuth){
            	return;
        	}
        	if(!$sessionStorage.currentUser) return;
        	baseService.get("${portal}/sys/sysMenu/v1/getCurrentUserMethodAuth").then(function(data){
        		$rootScope.methodAuth = data;
        		$sessionStorage.methodAuth = data;
        	});
        }
        // 获取当前在线用户数
        function genCurrentOnLine(){
        	baseService.get("${portal}/portal/main/v1/getOnLineCount").then(function(data){
        		$rootScope.onLineCount = data;
        	});
        }
    }
	
	base.config(["$httpProvider", function($httpProvider) {
		$httpProvider.interceptors.push("httpInterceptor");
	}]).constant('context', function(){
		var ctx = getContext();
		return angular.extend(ctx, {
			defaultMessageType: ["mail", "inner"]
        });
    })
    .provider('context', ['context', function(context){
    	this.context = context();
    	
    	this.$get = function(){
    		return this.context;
    	}
    }])
    .factory("AuthenticationService", AuthService)
    .factory("httpInterceptor", ["$q", "$rootScope", "$injector", "$timeout", "$window","toaster", function($q, $rootScope, $injector, $timeout, $window,toaster) {
		return {
			request: function(config) {
				config.headers['X-Requested-With'] = "XMLHttpRequest";
				return config || $q.when(config);
			},
			requestError: function(rejection) {
				return $q.reject(rejection);
			},
			response: function(response) {
				if(typeof response.data=='string' && response.data.indexOf('form-login')>-1){
					//redirect to login page
					$window.location.href = "/";
		            return $q.reject(response);
				}
				return response || $q.when(response);
			},
			responseError: function(rejection) {
				if(rejection && rejection.status==401){
					 $injector.get('$state').go('login');
				}
				switch(rejection.status){
					case 404:
						$injector.get('$state').go('404');
						$rootScope.$broadcast("error:404");
						break;
					case 500:
						toaster.pop({
				            type: 'error',
				            title: '错误提示',
				            body: rejection.data.message,
				            showCloseButton: true,
				            timeout: 3000
				        });
						$rootScope.$broadcast("error:500");
						break;
				}
				return $q.reject(rejection);
			}
		};
	}])
	.value('dataTableOptions', {
		name: '',
        url: '',
        pageOption: {
        	show: false,
        	pageSize: 20,
        	currentPage: 1,
        	showTotal: true,
        	displayedPages: 5
        },
        inquiring: false,
        queryOption: {
        	operation: "like",
            relation: "and"
        },
        queryOperationOptions: ["equal", "equal_ignore_case", "less", "great", 
        						"less_equal", "great_equal", "not_equal", "like", 
        						"left_like", "right_like", "is_null", "notnull",
        						"in", "between"],
        queryRelationOptions: ["and", "or", "exclusion"],
        onComplete:null
    })
	.factory('DataTable', ['$rootScope', 'baseService', '$q', 'dataTableOptions', function($rootScope, baseService, $q, dataTableOptions){
		/**
		 * create an instance of DataTable
		 * @param {Object} [options] 
		 */
		function DataTable(options) {
            var settings = angular.copy(dataTableOptions);
            angular.extend(this, settings, {
            	_pagination:{},
            	_sort:[],
            	_querys:[],
            	params:{},
            	rows:[]
            }, options);
        }
		
		/**
		 * creates an instance of Pagination
		 * @param {DataTable} dataTable
		 * @param {Object} options
		 */
		function Pagination(dataTable, options){
			angular.extend(this, dataTable.pageOption, options);
		}
		
		/**
		 * creates an instance of Query
		 */
		function Query(dataTable, options){
			angular.extend(this, dataTable.queryOption, options);
			// assert the operation is a valid value.
			if(dataTableOptions.queryOperationOptions.indexOf(this.operation) == -1){
				throw new Error("The operation '"+this.operation+"' is not a valid value, the allowable values:" + dataTableOptions.queryOperationOptions);
			}
			// assert the relation is a valid value.
			if(dataTableOptions.queryRelationOptions.indexOf(this.relation) == -1){
				throw new Error("The relation '"+this.relation+"' is not a valid value, the allowable values:" + dataTableOptions.queryRelationOptions);
			}
		}
		
		/**
		 * initialize a instance of Pagination
		 * @param {Object} options
		 * @returns
		 */
		DataTable.prototype.initPagination = function(options){
			options.show = true;
			this._pagination = new Pagination(this, options);
			return this._pagination;
		}
		
		/**
		 * build Page Result with response
		 */
		DataTable.prototype.buildPageResult = function(response){
			if(!response){
				this._pagination.pageResult = {
						show:false
					};
			}else{
				var page = response.page?response.page:this.dialog?eval("($rootScope.queryResponse." + this.dialog.pageKey +")"):'',
						pageSize = response.pageSize?response.pageSize:this.dialog?eval("($rootScope.queryResponse." + this.dialog.pageSizeKey +")"):'',
						total = response.total?response.total:this.dialog?eval("($rootScope.queryResponse." + this.dialog.totalKey +")"):'';
				// total为负数时表示做分页查询，但是不统计记录总数
				if(total < 0){
					if(pageSize == 0){
						this._pagination.pageResult = {show:false};
						return;
					}
					page = page > 0 ? page : this._pagination.currentPage;
					pageSize = pageSize > 0 ? pageSize : this._pagination.pageSize;
				}
				if(typeof pageSize!='number' || pageSize <= 0){
					throw new Error("The pageSize in response must be a number and can not less than or equal zero.");
				}
				if(typeof page!='number' || page <= 0){
					throw new Error("The page in response must be a number and can not less than or equal zero.");
				}
				
				// 显示总记录数时构建完整的分页信息
				if(total > 0){
					var totalPages = (total/pageSize).toCeil(),
						startRow = (page - 1) * pageSize + 1;
					this._pagination.pageResult = {
							show: true,
							totalCount: total,
							page: page,
							pageSize: pageSize,
							totalPages: totalPages,
							startRow: startRow,
							endRow: startRow -1 + (page==totalPages && response.total != pageSize?total%pageSize : pageSize)
					};
				}
				// 不显示总记录数时只能提供当前显示第*条到第*条数据，以及提供上一页、下一页按钮
				else{
					var count = response.rows.length,
						startRow = (count > 0) ? ((page - 1) * pageSize + 1) : 0,
						endRow = startRow + ((count > 0) ? (count-1) : 0);
					this._pagination.pageResult = {
							show: true,
							noTotal: true,
							page: page,
							pageSize: pageSize,
							startRow: startRow,
							endRow: endRow
					};
				}
			}
		}
		
		/**
		 * creates an instance of Sort
		 * @param {DataTable} dataTable
		 * @param {Object} params
		 */
		function Sort(params){
			angular.extend(this, {sorting:false}, params);
		}
		
		/**
		 * add a Sort Object in DataObject
		 * @param {Object} params
		 */
		DataTable.prototype.addSort = function(params){
			this._sort.push(new Sort(params));
		}
		
		/**
		 * sorting
		 * @param {Object} params
		 */
		DataTable.prototype.sorting = function(params){
			angular.forEach(this._sort, function(item){
				if(item.field==params.field){
					if(params.direction){
						item.sorting = true;
						item.direction = params.direction;
					}
					else{
						item.sorting = false;
						delete item.direction; 
					}
				}
			});
			this.queryIndex();
		}
		
		/**
		 * build query entity for dataTable
		 * @returns {Object} queryEntity
		 */
		DataTable.prototype.build = function(){
			var reqType = this.requestType?this.requestType:'POST';
			var queryEntity = {};
			var templatePa = this.dialog?this.dialog.dataParam:'';
			if(reqType=='POST' && !templatePa){
				if(this._pagination && this._pagination.show){
					queryEntity.pageBean = {
							page: this._pagination.currentPage,
							pageSize: this._pagination.pageSize,
							showTotal: this._pagination.showTotal
					};
				}
				if(this._sort && this._sort.length > 0){
					var tempSortList = [];
					angular.forEach(this._sort, function(item){
						if(item.sorting){
							tempSortList.push({
								property: item.field,
								direction: item.direction
							});
						}
					});
					if(tempSortList.length > 0){
						queryEntity.sorter = tempSortList;
					}
				}
			}
			if(this.params){
				angular.extend(queryEntity, this.params);
			}
			if(reqType=='POST' && !templatePa){
				if(this._querys && this._querys.length > 0){
					queryEntity.querys = [];
					angular.forEach(this._querys, function(q){
						queryEntity.querys.push({
							property: q.property,
							value: q.value,
							operation: q.operation.toUpperCase(),
							relation: q.relation.toUpperCase()
						});
					});
				}
			}else{
				if(this._querys&&this._querys.length>0){
					queryEntity = this._querys[0];
				}
				if(this.dialog&&this.dialog.needPage){
					queryEntity['page'] = this.pageOption?this._pagination.currentPage:1;
					queryEntity['pageSize'] = this.dialog?this.dialog.pageSize:this._pagination.pageSize;
				}
			}
			
			if(reqType=='POST' && templatePa && this.dialog.conditionfield){
				var conditions = parseToJson(this.dialog.conditionfield);
				if(this._querys && this._querys.length > 0){
					angular.forEach(this._querys, function(q){
						for (var i = 0; i < conditions.length; i++) {
							if(conditions[i].field==q.property){
								conditions[i].defaultValue = q.value;
							}
						}
					});
					for (var i = 0; i < conditions.length; i++) {
						templatePa = templatePa.replace(new RegExp("\\{"+conditions[i].field+"\\}","g"), conditions[i].defaultValue);
					}
					queryEntity = parseToJson(templatePa);
				}
			}
			return queryEntity;
		}
		
		/**
		 * query
		 */
		DataTable.prototype.query = function(){
			if(this.inquiring){
				$rootScope.$broadcast("dataTable:query:error", this, "The Data Table is inquiring now, please wait a moment.");
				return;
			}
			var that = this,
				deferred = $q.defer();
			// the default url of list
			if(!this.url){
				throw new Error("The property url of DataTable can not be empty.");
			}
			that.rows = [];
			that.inquiring = true;
			$rootScope.$broadcast("dataTable:query:begin", that);
			var dialog = this.dialog;
			var isGet = this.requestType&&this.requestType=='GET'?true:false;
			var query = isGet?baseService.get(this.url, this.build()):baseService.post(this.url, this.build());
			query.then(function(response) {
				if(!response){
					throw new Error("The response of request can not be null.");
				}
				if(response.constructor==Array){
					that.rows = response;
					that.buildPageResult();
				}
				else if(response.constructor==Object){
					var rowsKey = dialog?dialog.listKey:null;
					if(!rowsKey && (!response.hasOwnProperty("rows") || response.rows.constructor!=Array)){
						throw new Error("The response should contain Array type property 'rows'.");
					}
					$rootScope.queryResponse = response;
					that.rows = response.rows?response.rows:eval("($rootScope.queryResponse." + rowsKey +")");
					// build Page Result
					that.buildPageResult(response);
				}
				else{
					throw new Error("The response of request only could be Array or Object.");
				}
				deferred.resolve();
				// 发布请求完成的事件
				if(that.onComplete && that.onComplete.constructor==Function){
					that.onComplete.call(that);
				}
				that.inquiring = false;
				$rootScope.$broadcast("dataTable:query:complete", that);
			},
			function(result) {
            	deferred.reject(result);
            	that.inquiring = false;
            	$rootScope.$broadcast("dataTable:query:error", that, result);
            });
			
            
			return deferred.promise;
		}
		
		/**
		 * add param
		 * @param {Object} param
		 */
		DataTable.prototype.addParam = function(param){
			angular.extend(this.params, param);
			return this;
		}
		
		/**
		 * clear all params and reset pagination to page one
		 */
		DataTable.prototype.clearParam = function(){
			this.params = {};
			this._pagination.currentPage = 1;
		}
		
		/**
		 * add query
		 */
		DataTable.prototype.addQuery = function(query){
			if(this.requestType&&this.requestType=='GET'){
				this._querys.push(query);
			}else{
				var q = new Query(this, query);
				this.clearQuery(q.property);
				this._querys.push(q);
			}
		}
		
		/**
		 * get the size of query array
		 */
		DataTable.prototype.getQuerySize = function(){
			return this._querys.length;
		}
		
		/**
		 * clear query by property(clear all when no property)
		 */
		DataTable.prototype.clearQuery = function(property){
			if(!property){
				this._querys = [];
				return;
			}
			var that = this;
			angular.forEach(that._querys, function(item, i){
				if(item.property==property){
					that._querys.splice(i, 1);
				}
			});
		}
		
		/**
		 * at least one row being selected
		 */
		DataTable.prototype.hasSelectedRow = function(){
			var selectedRow = false;
			angular.forEach(this.rows, function(item){
				if(item.isSelected){
					selectedRow = true;
					return false;
				}
			});
			return selectedRow;
		}
		
		/**
		 * reset query condition and do query to refresh data.
		 */
		DataTable.prototype.reset = function(){
			this.clearQuery();
			this.query();
			$rootScope.$broadcast("dataTable:query:reset", this);
		}
		
		/**
		 * query currentPage is 1.
		 */
		DataTable.prototype.queryIndex = function(){
			this._pagination.currentPage = 1;
			this.query();
			$rootScope.$broadcast("dataTable:query:queryIndex", this);
		}
		
		
		
		/**
		 * get the select rows
		 */
		DataTable.prototype.selectRow = function(){
			var ary = [];
			angular.forEach(this.rows, function(item){
				if(item.isSelected){
					ary.push(item);
				}
			});
			return ary;
		}
		
		/**
		 * unselect row
		 */
		DataTable.prototype.unSelectRow = function(row){
			var keepGoing = true;
			angular.forEach(this.rows, function(item){
				if(!keepGoing) return;
				if(row){
					if(row===item){
						item.isSelected = false;
						keepGoing = false;
					}
				}
				else{
					item.isSelected = false;
				}
			});
		}
		
		/**
		 * get the select rows id array
		 */
		DataTable.prototype.selectRowIds = function(options){
			var ids = [];
			options = options || {};
			angular.extend(options, {"selectKey":"id"});
			angular.forEach(this.rows, function(item){
				if(item.isSelected){
					ids.push(item[options.selectKey]);
				}
			});
			return ids;
		}
		
		/**
		 * remove array
		 */
		DataTable.prototype.removeArray = function(options){
			if(!options.url){
				throw new Error("The url in options can not be empty.");
			}
			var ids = [],
				deferred = $q.defer(),
				opts = angular.extend({removeKey: 'id', paramKey: 'ids'}, options),
				that = this;
            for (var i = 0, c; c = this.rows[i++];) {
            	if(c.isSelected){
            		ids.push(c[opts.removeKey]);
            	}
            }
            baseService.remove(opts.url + "?"+opts.paramKey+"=" + ids.join(',')).then(function(response) {
            	deferred.resolve(response);
            	// refresh
            	that.query();
            }, function(response){
            	deferred.reject("删除失败：" + (response && response.message) ? response.message : '未知原因，请联系管理员.');
            });
            return deferred.promise;
		}
		return DataTable;
	}])
	.service('baseService', ['$http', '$q', 'context', function($http, $q, context) {
		var ctx = context(),
			reg = /^(\$\{(\w+)\})\/.*$/;
		var handleUrl = function(url){
			var match = reg.exec(url);
			if (match != null) {
				var name = match[2],
					mc = match[1],
					val = ctx[name];
				if(!val){
					throw new Error("The '"+name+"' in url:" + url + " does not defined in context provider." );
				}
				return url.replace(mc, val);
			}
			else {
				return url;
			}
		}
		var service = {
			get: function(url, params) {
				url = handleUrl(url);
				var deferred = $q.defer();
				$http.get(url, {
					params: params
				}).success(function(data, status) {
					deferred.resolve(data);
				}).error(function(data, status) {
					deferred.reject(data);
				});
				return deferred.promise;
			},
			post: function(url, param) {
				url = handleUrl(url);
				var deferred = $q.defer();
				$http.post(url, param).success(function(data, status) {
					if(data && data.hasOwnProperty('result')){
						if(data.result=='1'){
							deferred.resolve(data);
						}
						else{
							deferred.reject(data);
						}
					}
					else{
						deferred.resolve(data);
					}
				}).error(function(data) {
					deferred.reject(data);
				});
				return deferred.promise;
			},
			put: function(url, param) {
				url = handleUrl(url);
				var deferred = $q.defer();
				$http.put(url, param).success(function(data, status) {
					if(data && data.hasOwnProperty('result')){
						if(data.result=='1'){
							deferred.resolve(data);
						}
						else{
							deferred.reject(data);
						}
					}
					else{
						deferred.resolve(data);
					}
				}).error(function(data, status) {
					deferred.reject(data);
				});
				return deferred.promise;
			},
			remove: function(url, param) {
				url = handleUrl(url);
				var deferred = $q.defer();
				$http({
					method: 'delete',
					data: param,
					url: url
				}).success(function(data, status) {
					if(data && data.hasOwnProperty('result')){
						if(data.result=='1'){
							deferred.resolve(data);
						}
						else{
							deferred.reject(data);
						}
					}
					else{
						deferred.resolve(data);
					}
				}).error(function(data, status) {
					deferred.reject(status);
				});
				return deferred.promise;
			}
		}
		return service;
	}]).service('dialogService', ['$http', '$q', '$timeout', '$state', '$templateFactory', '$compile', '$rootScope', '$ocLazyLoad','$filter',
		function($http, $q, $timeout, $state, $templateFactory, $compile, $rootScope, $ocLazyLoad,$filter) {
		layer.config({
			zIndex: 13500
		});
		var service = {
			open: function(config) {
				layer.ready(function(){
				  layer.open(config);
				});
			},
			alert: function(content, config){
				var deferred = $q.defer();
				layer.ready(function(){
				  layer.alert(content, angular.extend(config || {}, {end:function(){
					  deferred.resolve();
				  }}));
				});
				return deferred.promise;
			},
			msg: function(content, config){
				var deferred = $q.defer();
				layer.ready(function(){
				  layer.msg(content, angular.extend({end:function(){
					  deferred.resolve();
				  }}, config || {}));
				});
				return deferred.promise;
			},
			confirm: function(content, config){
				var deferred = $q.defer();
				layer.ready(function(){
				  layer.confirm(content, angular.extend({title:$filter('translate')("please_confirm"), icon:3,btn: [$filter('translate')("confirm"),$filter('translate')("cancle")]}, config||{}), function(index){
					  deferred.resolve();
					  layer.close(index);
				  }, function(index){
					  deferred.reject();
					  layer.close(index);
				  });
				});
				return deferred.promise;
			},
			warn: function(content){
				return this.msg(content, {icon:0, time:2000});
			},
			success: function(content){
				return this.msg(content, {icon:1, offset:'t', time:1500});
			},
			fail: function(content){
				return this.alert(content, {icon:2, title:$filter('translate')("error"), btn:$filter('translate')("confirm")});
			},
			page: function(state, config){
				var me = this,
					s = $state.get(state);
				if(!s){
					throw new Error("There is no state '"+state+"' exist in ui-router.");
				}
				var newScope, deferred = $q.defer(), element = angular.element('<div id="tong" class="full-height" style="display:none;"></div>');
				angular.element('body').append(element);
				var	option = angular.extend({
						  type: 1,
						  title: $filter('translate')(s.data.pageTitle) || '详细信息',
						  content: element,
						  btn: [$filter('translate')("confirm"),$filter('translate')("cancle")],
						  area: ['950px', '650px'],
						  yes: function(index){
							  var me = this,
							  	  l = angular.noop();
							  
							  if(newScope && newScope.pageSure && angular.isFunction(newScope.pageSure)){
								  l = newScope.pageSure.call();
							  }
							  else{
								  l = true;
							  }
							  
							  $q.when(l).then(function(r){
								  if(r){
									  if(me.alwaysClose===false){
										  deferred.resolve({result: r, index: index});
									  }
									  else{
										  deferred.resolve(r);
									  } 
								  }
								  if(me.alwaysClose!==false){
									  layer.close(index);
								  }
							  }, function(){
								  deferred.resolve({index:index});
							  });
						  },
						  btn2: function(index){
							  deferred.reject();
						  },
						  end: function(){
							  if(element){
								  element.remove();
								  element = null;
							  }
							  if(newScope){
								  newScope.$destroy();
								  newScope = null;
							  }
						  },
						  resizing: function(layero){
							  $rootScope.$broadcast("layer:resizing", layero);
						  }
						}, config);
				$templateFactory.fromConfig(s).then(function(r){
					element.html(r);
					var p = angular.noop();
					if(s.resolve && s.resolve.loadPlugin){
						p = s.resolve.loadPlugin($ocLazyLoad); 
					}
					else{
						p = true;
					}
					$q.when(p).then(function(){
						var $new = $rootScope.$new();
						if(option.pageParam){
							$new['pageParam'] = option.pageParam;
						}
						var ele = $compile(element.contents())($new);
						if(ele && ele.scope && angular.isFunction(ele.scope)){
							newScope = ele.scope();
						}
					});
					me.open(option);
				});
				return deferred.promise;
			},
			sidebar: function(state, config){
				var me = this,
					s = $state.get(state);
				if(!s){
					throw new Error("There is no state '"+state+"' exist in ui-router.");
				}
				this.closeSidebar(true);
				var deferred = $q.defer(), element = angular.element('#right-sidebar');
				var	option = angular.extend({}, config);
				if(option.width){
					element.css("width", option.width);
				}
				$templateFactory.fromConfig(s).then(function(r){
					element.html(r);
					var p = angular.noop();
					if(s.resolve && s.resolve.loadPlugin){
						p = s.resolve.loadPlugin($ocLazyLoad); 
					}
					else{
						p = true;
					}
					$q.when(p).then(function(){
						var $new = $rootScope.$new();
						if(option.pageParam){
							$new['pageParam'] = option.pageParam;
						}
						$compile(element.contents())($new);
					});
					element.addClass("sidebar-open");
					if(option.bodyClose !== false){
						angular.element("body").bind("mousedown", function(event){
							if (!(event.target.id == 'right-sidebar' || $(event.target).parents("#right-sidebar").length>0)) {
								me.closeSidebar();
							}
						});
					}
				});
			},
			closeSidebar: function(makeSureTag){
				angular.element("body").unbind("mousedown");
				var element = angular.element('#right-sidebar'),
					content = element.contents();
				element.removeClass("sidebar-open");
				element.css("width", "360px");
				if(content && content.length > 0){
					var subScope = content.find("[ng-controller]").scope();
					if(subScope && subScope.$id!=element.scope().$id){
						subScope.$destroy();
					}
					element.empty();
				}
				if(!makeSureTag){
					$rootScope.$broadcast("sidebar:close");//发布sidebar子页面关闭广播
				}
			},
			close: function(index, delay){
				layer.ready(function(){
					$timeout(function(){
						layer.close(index);
					}, delay?delay:0);
				});
			}
		}
		return service;
	}]).service('ArrayToolService', [function() {
	    var service = {
	    		//上移按钮
		    	up:function(idx,list){
		    		if(idx<1){
		    			return;
		    		}
		    		var t=list[idx-1];
		    		list[idx-1]=list[idx];
		    		list[idx]=t;
		    	},
		    	//下移按钮
		    	down:function(idx,list){
		    		if(idx>=list.length-1){
		    			return;
		    		}
		    		var t=list[idx+1];
		    		list[idx+1]=list[idx];
		    		list[idx]=t;
		    	},
		    	resumeSn:function(list){
		    		for(var k = 0 ; k < list.length ; k++){
		    			list[k].sn = k;
					}
		    		return list;
		    	},
		    	/**
		    	 * idx 原位置
		    	 * num 目标位置
		    	 * list 数组
		    	 */
		    	moveToNum:function(idx,target,list){
		    		if(target==-1){
		    			target = 0;
		    		}else if(idx >= target){
		    			target = target+1;
		    		}
		    		var t= list.splice(idx,1);
		    		list.insert(target,t[0]);
		    		this.resumeSn(list);
		    	},
		    	//默认ngModel turnToIndex
		    	turnTo:function(rowScope,list){
		    		var toIndex =rowScope.turnToIndex - 1;
		    		if(!rowScope.turnToIndex || toIndex<0 || toIndex>=list.length) return; 
		    		
		    		var index = rowScope.$index;
		    		if(toIndex == index) return;
		    		
		    		var row= list.splice(index,1);
		    		list.insert(toIndex,row[0]);
		    		
		    		rowScope.turnToIndex= "";
		    	},
		    	//删除按钮
		    	del:function(idx,list){
		    		list.splice(idx,1);
		    	},
		    	//找到指定元素的未知
		    	idxOf:function(val,list){
		    		for (var i = 0; i < list.length; i++) {  
		    	        if (list[i] == val) return i;  
		    	    }  
		    	    return -1; 
		    	},
		    	//删除指定元素
		    	remove:function(val,list){
		    		var idx = this.idxOf(val,list);  
		    	    if (idx > -1) {  
		    	    	list.splice(idx, 1);  
		    	    }  
		    	},
		    	//置顶
		    	top:function(idx,list){
		    		if(idx>=list.length || idx<1){
		    	           return;
		    		}
		    		//逐个交换
		            for(var i=0;i<idx;i++){
			            var temp=list[i];
			            list[i]=list[idx];
			            list[idx]=temp;
		            }
		    	},
		    	//置底
		    	bottom:function(idx,list){
		    		if(idx>=list.length-1 || idx<0){
		                return;
		            }
		            //逐个交换
	                for(var i=list.length-1;i>idx;i--){
		                var temp=list[i];
		                list[i]=list[idx];
		                list[idx]=temp;
	                }
		    	}
	    };
	    return service;
	}])
	.service('indexColumnService', [ '$state', '$compile', '$rootScope','baseService', function($state, $compile, $rootScope, baseService) {
	    var service = {
	    		//根据栏目别名获取html和数据
	    		singlePreview:function($scope,alias){
	    			if(!$scope.data){
	    				$scope.data = {};
	    			}
	    			$scope.columnReload = function(curAlias){
	    				var url= "${portal}/portal/sysIndexColumn/sysIndexColumn/v1/getData?alias="+curAlias+"&params=";
	    				baseService.post(url,{}).then(function(rep){
	    					$scope.data[curAlias] = {};
	    					$scope.html = rep.html;
	    					var requestType = rep.requestType ? rep.requestType : 'POST';
	    					//post请求参数
	    					var dataParams = {};
	    					//get请求参数
	    					var urlParam = '';
	    					var dataParam = rep.dataParam;
	    					if(dataParam){
	    						dataParam =  parseToJson(dataParam);
	    						var isMany = dataParam.length > 1;
	    						for (var i = 0; i < dataParam.length; i++) {
	    							var value = dataParam[i]['value'];
	    							var name = dataParam[i]['name'];
	    							if(requestType=='POST'){
	    								try { value = parseToJson(value);} catch (e) {}
	    								if(isMany){
	    									dataParams[name] = value;
	    								}else{
	    									dataParams = value;
	    								}
	    							}else{
	    								urlParam = i>0? urlParam + '&'+name+'='+value : '?'+name+'='+value;
	    							}
	    						}
	    					}
	    					if(rep.dataFrom){
	    						if(requestType=='POST'){
		    						baseService.post(rep.dataFrom,dataParams).then(function(result){
		    							$scope.data[curAlias] = result;
		    						});
		    					}else{
		    						baseService.get(rep.dataFrom+urlParam).then(function(result){
		    							$scope.data[curAlias] = result;
		    						});
		    					}
	    					}
	    				});
	    			}
	    			
	    			$scope.columnReload(alias);
		    	},
		    	//解析布局
		    	showLayout:function($scope,layout){
		    		$scope.data = {};
		    		$scope.dataFrom = {};
		    		$scope.dataParams = {};
		    		$scope.requestType = {};
		    		var layoutObj = $(layout);
		    		var aliass = "";
		    		var spanEls = layoutObj.children().find("span[column-alias]");
		    		if(spanEls.length<1){
		    			return ;
		    		}
		    		$(spanEls).each(function(){
		    			aliass = !aliass? $(this).attr('column-alias'):aliass+','+$(this).attr('column-alias');
		    		});
		    		var url= "${portal}/portal/sysIndexColumn/sysIndexColumn/v1/getDatasByAlias";
    				baseService.post(url,aliass).then(function(rep){
    					rep.forEach(function(curData){  
    						if(curData){
    							var curData = parseToJson(curData);
    							var curAlias = curData.model.alias;
    							//处理html
    							var html = curData.html;
    							layoutObj.children().find("span[column-alias='"+curAlias+"']").replaceWith($(html));
    							var requestType = curData.requestType ? curData.requestType : 'POST';
    							$scope.dataFrom[curAlias] = curData.dataFrom;
    							$scope.requestType[curAlias] = requestType;
    							$scope.data[curAlias] = {};
    	    					
    	    					//post请求参数
    	    					var dataParams = {};
    	    					//get请求参数
    	    					var urlParam = '';
    	    					var dataParam = curData.dataParam;
    	    					if(dataParam){
    	    						dataParam =  parseToJson(dataParam);
    	    						var isMany = dataParam.length > 1;
    	    						for (var i = 0; i < dataParam.length; i++) {
    	    							var value = dataParam[i]['value'];
    	    							var name = dataParam[i]['name'];
    	    							if(requestType=='POST'){
    	    								try { value = parseToJson(value);} catch (e) {}
    	    								if(isMany){
    	    									dataParams[name] = value;
    	    								}else{
    	    									dataParams = value;
    	    								}
    	    							}else{
    	    								urlParam = i>0? urlParam + '&'+name+'='+value : '?'+name+'='+value;
    	    							}
    	    						}
    	    					}
    	    					if(curData.dataFrom){
    	    						$scope.dataParams[curAlias] = requestType=='POST'?dataParams:urlParam;
        	    					$scope.columnReload(curAlias);
    	    					}
    						}
						});
    					$scope.html = "";
    					for (var i = 0; i < layoutObj.length; i++) {
    						$scope.html += $(layoutObj[i]).html();
						}
    				});
		    		
    				$scope.columnReload = function(curAlias){
    					if($scope.requestType[curAlias]=='POST'){
    						baseService.post($scope.dataFrom[curAlias],$scope.dataParams[curAlias]).then(function(result){
    							$scope.data[curAlias] = result;
    						});
    					}else{
    						baseService.get($scope.dataFrom[curAlias]+$scope.dataParams[curAlias]).then(function(result){
    							$scope.data[curAlias] = result;
    						});
    					}
    				}
		    		
		    	}
	    };
	    return service;
	}]).service('formService', [ '$state', '$compile', '$rootScope','baseService', function($state, $compile, $rootScope, baseService) {
	    var service = {
	    		/**
	    		 * 格式化数据 
	    		 * @param scope    
	    		 * @param modelName 目標modelName
	    		 * @param exp	 函数表达式
	    		 * subFormDiv 子表div
	    		 */
	    		doMath:function(scope,modelName,funcexp){
	    			var value = FormMath.replaceName2Value(funcexp,scope);
	    			try{
	    				value = eval("("+value+")");
	    			}
	    			catch(e){
	    				return true;
	    			}
	    			if(/^(Infinity|NaN)$/i.test(value))return true;
	    			
	    			eval("scope."+modelName+"=value");
	    		},
	    		/**
	    		 * 數字格式化
	    		 * 		货币				千分位								
	    		 * {"isShowCoin":true,"isShowComdify":true,"coinValue":"￥","capital":false,"intValue":"2","decimalValue":"2"}
	    		 * @returns {String} 返回的数据
	    		 */
	    		numberFormat : function(value,formatorJson,nocomdify) {
	    			var coinvalue = formatorJson.coinValue, 
	    				iscomdify = formatorJson.isShowComdify, 
	    				decimallen=$.fn.toNumber(formatorJson.decimalValue),
	    				intLen = $.fn.toNumber(formatorJson.intValue);
	    			
	    			if(value=="undefined") return;
	    			value =$.fn.toNumber(value)+""; 
	    			
	    			if(intLen>0){
	    				var ary = value.split('.'); 
	    				var intStr = ary[0];
	    				var intNumberLen = intStr.length;
	    				if(intNumberLen > intLen){
	    					intStr = intStr.substring(intNumberLen-intLen,intNumberLen);
	    				}
	    				value =ary.length==2? intStr +"."+ary[1] : intStr;
	    			}
	    			
	    			// 小数处理
	    			if (decimallen > 0) {
	    				if (value.indexOf('.') != -1) {
	    					var ary = value.split('.');
	    					var temp = ary[ary.length - 1];
	    					if (temp.length > 0 && temp.length < decimallen) {
	    						var zeroLen = '';
	    						for ( var i = 0; i < decimallen
	    								- temp.length; i++) {
	    							zeroLen = zeroLen + '0';
	    						}
	    						value = value + zeroLen;
	    					}else if(temp.length > 0 && temp.length > decimallen ){
	    						temp = temp.substring(0,decimallen);
	    						ary[ary.length - 1] =temp;
	    						value =ary.join(".");
	    					}
	    				} else {
	    					var zeroLen = '';
	    					for ( var i = 0; i < decimallen; i++) {
	    						zeroLen = zeroLen + '0';
	    					}
	    					value = value + '.' + zeroLen;
	    				}
	    			}
	    			//处理千分位。
	    			if(iscomdify){
	    				value=this.formatComdify(value);
	    			}
	    			
	    			// 添加货币标签
	    			if (coinvalue != null && coinvalue != '') {
	    				value = coinvalue + value;
	    			}
	    			
	    			return value;
	    		},
	    		//千分位处理。
	    		formatComdify:function (num) {
	    		    return (num+ '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
	    		},
	    		
	    		/**
	    		 * 数字转金额大写
	    		 */
	    		convertCurrency : function(currencyDigits) {
	    			return FormMath.convertCurrency(currencyDigits);
	    		},
	    		/**
	    		 * 日期计算
	    		 * 日期开始，日期结束，计算类型 day,yeay,month
	    		 */
	    		doDateCalc:function(startTime,endTime,diffType){
	    			if(typeof startTime == "undefined" || startTime == "" 
	    				|| typeof endTime == "undefined" || endTime == ""){
	    				return "";
	    			}
	    			var result;
	    			var temptype = diffType;
	    			if (diffType == "hour"){
	    				diffType = "minute";
	    			}
	    			if(startTime.indexOf("-") == -1 && endTime.indexOf("-") == -1){
	    				result=FormMath.timeVal(startTime,endTime,diffType);//日期格式为 hh:mm:ss
	    			}else{
	    				result=FormMath.dateVal(startTime,endTime,diffType);//日期格式YYYY-MM-DD
	    			}
	    			if (isNaN(result)){
	    				result = "";
	    			} else if (temptype == "hour") {
	    				//精确到半小时
	    				temp = parseInt(result / 60);
	    				if (result % 60 >= 30){
	    					temp = temp + 0.5;
	    				}
	    				result = temp;
	    			}
	    			return result;
	    		}
	    };
	    return service;
	}])
	.service('commonService', [function() {
		var service = {
			/**
			 * 判断数组中是否包含指定的值。
			 * 判定aryChecked数组中是否val。
			 */
	 		isChecked:function(val,aryChecked){
	 			for(var i=0;i<aryChecked.length;i++){
	 				if(val==aryChecked[i])	return true;
	 			}
	    		return false;
	    	},
	    	/**
	    	 * 判断数组中是否包含数据。
	    	 * name : 属性名
	    	 * val : 值
	    	 * aryChecked : 列表数据。
	    	 */
	    	isExist:function(name,val,aryChecked){
	 			for(var i=0;i<aryChecked.length;i++){
	 				var obj=aryChecked[i];
	 				if(obj[name]==val) return true;
	 			}
	    		return false;
	    	},
	    	
	    	/**
	    	 * 数组操作。
	    	 * val:当前的值。
	    	 * checked:当前的值是否选中。
	    	 * aryChecked:选中的数据。
	    	 */
	    	operatorAry:function(val,checked,aryChecked){
	    		//判断指定的值在数组中存在。
	    		var isExist=this.isChecked(val,aryChecked);
	    		//如果当前数据选中，并且不存在，那么在数组中添加这个值。
	    		if(checked && !isExist){
	    			aryChecked.push(val);
	    		}
	    		//如果当前值没有选中，并且这个值在数组中存在，那么删除此值。
	    		else if(!checked && isExist){
					for(var i=0;i<aryChecked.length;i++){
						val==aryChecked[i] && aryChecked.splice(i,1);
		 			}
	    		}
	    	},
	    	/**
	    	 * 根据指定的值在json数组中查找对应的json对象。
	    	 * val ：指定的值。
	    	 * aryJson ：数据如下 
	    	 * [{val:1,name:""},{val:2,name:""}]
	    	 */
	    	getJson:function (val,aryJson){
	    		for(var i=0;i<aryJson.length;i++){
	    			var obj=aryJson[i];
	    			if(obj.val==val){
	    				return obj;
	    			}
	    		}
	    		return null;
	    	},
	    	/**
	    	 * 添加页面正在加载的动画效果
	    	 */
	    	spinner: function(element){
	    		if(!element || element.length==0){return;}
	    		var $ele = angular.element(element);
	    		$ele.addClass("sk-loading");
	    		$ele.addClass("ibox-content");
	    		var spinner = $ele.find(".sk-spinner");
	    		if(!spinner || spinner.length==0){
	    			$ele.prepend('<div class="sk-spinner sk-spinner-wave">'
			                +'  <div class="sk-rect1"></div>'
			                +'  <div class="sk-rect2"></div>'
			                +'  <div class="sk-rect3"></div>'
			                +'  <div class="sk-rect4"></div>'
			                +'  <div class="sk-rect5"></div>'
			                +'</div>');
	    		}
	    	},
	    	closeSpinner: function(element){
	    		if(!element || element.length==0){return;}
	    		var $ele = angular.element(element);
	    		$ele.removeClass("sk-loading");
	    		$ele.removeClass("ibox-content");
	    		var spinner = $ele.find(".sk-spinner");
	    		spinner.remove();
	    	}
		}
		return service;
	}])
	.service('mqttService', ['$rootScope','baseService','dialogService','$sessionStorage',function($rootScope,baseService,dialogService,$sessionStorage) {
		var service = {
			/**
			 * 初始化mqtt的客户端
			 * 
			 */
	 		initClient:function(){
	 			baseService.get("${portal}/portal/main/v1/getImHost")
	 			.then(function(response){
	 				var client = new Paho.MQTT.Client(response.host, Number(response.port), "pc_"+response.account+"_"+new Date().getTime());
	 				client.onMessageArrived = function(message){
	 					var chatViewScope = angular.element("#chatView").scope();
	 					if(chatViewScope){
	 						chatViewScope.onMessageArrived(message);
	 						chatViewScope.$apply();
	 					}else{
	 						var msgJson = JSON.parse(message.payloadString);
	 						$rootScope.hasUnReadMessage = true;
	 						service.updateUnread(msgJson.sessionCode);
	 						$rootScope.$apply();
	 					}
	 				};
	 				client.connect({
	 					cleanSession:true,
	 					keepAliveInterval:60,
	 					reconnect:true,
	 					onSuccess:function(obj){
	 						client.subscribe(response.account);
	 					}
	 				});
	 				$rootScope.mqttClient = client;
	 				//确保web端时间和服务器时间一致
	 				$rootScope.initServerTime = response.initServerTime;
	 				$rootScope.initAppTime = new Date().getTime();
	 			});
	    	},
	    	updateUnread:function(sessionCode,scope){
	    		if(sessionCode){
	    			var key = sessionCode+'_unread';
	    			var oldUnread = localStorage.getItem(key);
	    			var newUnread = oldUnread != null? Number(oldUnread) + 1:1
					localStorage.setItem(key,newUnread);
	    			return newUnread;
	    		}
	    		return 0;
	    	},
	    	clearUnread:function(sessionCode){
	    		var key = sessionCode+'_unread';
	    		localStorage.removeItem(key);
	    	},
	    	getUnread:function(sessionCode){
	    		var key = sessionCode+'_unread';
    			var oldUnread = localStorage.getItem(key);
    			return oldUnread  == null ? 0 : oldUnread;
	    	},
	    	destroy:function(){
	            if($rootScope.mqttClient){
	            	$rootScope.mqttClient.disconnect();
		            $rootScope.mqttClient = null;
	            }
	    	}
		}
		return service;
	}])
	.service('editDataService', ['$rootScope','baseService','dialogService','$q', function($rootScope, baseService, dialogService, $q) {
	    var service = {
	    		//获取表单详情
	    		init : function(scope){
	    			//获取BpmForm的详情
	    			baseService.get('${form}/form/dataTemplate/v1/getForm/'+scope.formKey+'/'+scope.boAlias+'?id='+scope.id+'&action='+scope.action).then(
	    				function(data){
	    					if(data.result){
	    						scope.data = data.data; 
	    						scope.permission = data.permission;
	    						scope.html  =data.form.formHtml;
	    						window.setTimeout(scope.initSubTableData,100);
	    					}else{
	    						dialogService.fail("表单内容为空");
	    					}
	    				},function(){}
	    			);
	    		},
	    		boSave : function(scope){
	    			var defer = $q.defer();
	    			if(scope.form.$invalid){
	    				dialogService.warn("表单校验不通过");
	    				defer.resolve();
	    			}
	    			var index = layer.load(0, {shade: false});
	    			baseService.post('${form}/form/dataTemplate/v1/boSave/'+scope.boAlias+'',scope.data).then(
	    				function(data){
	    					layer.close(index);
	    					if(data.state){
	    						dialogService.success(data.message);
	    					}else{
	    						dialogService.fail(data.message);
	    						defer.reject();
	    					}
	    				},function(){}
	    			);
	    		}
	        }
	    return service;
	}])
	.filter('chineseDate', function(){
	    var filter = function(input){
	    	var myregexp = /^(\d{4})(\d{1,2})(\d{1,2})$/g;
	    	if(!input || !myregexp.test(input)){
	    		return input;
	    	}
	        return input.replace(myregexp, "$1年$2月$3日");
	    };
	    return filter;
    })
    .filter('htDuration', function(){
    	var filter = function(input){
    		if(!input || input <1) {
    			return '';
    		}
	        return $.timeLag(input);
	    };
	    return filter;
    })
    .filter('shield', function() {
		var reg = /^1(3|4|5|7|8)\d{9}$/,
			repExp = /(\d{3})\d{4}(\d{4})/g;
	    return function(input) {
	    	if(reg.test(input)){
	    		return input.replace(repExp, "$1****$2");
	    	}
	    	return input;
	    }
	})
    .filter('toArray', function () {
    	  return function (obj, addKey) {
    		    if (!angular.isObject(obj)) return obj;
    		    if ( addKey === false ) {
    		      return Object.keys(obj).map(function(key) {
    		        return obj[key];
    		      });
    		    } else {
    		      return Object.keys(obj).map(function (key) {
    		        var value = obj[key];
    		        return angular.isObject(value) ?
    		          Object.defineProperty(value, '$key', { enumerable: false, value: key}) :
    		          { $key: key, $value: value };
    		      });
    		    }
    		  };
    		});
})();
