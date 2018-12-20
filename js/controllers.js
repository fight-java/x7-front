function LoginCtrl($scope, $location, AuthenticationService,$rootScope,mqttService) {
    $scope.vm = {
    	username: '',
    	password: '',
    	loading: false
    };

    initController();

    function initController() {
        // reset login status
        AuthenticationService.Logout();
        mqttService.destroy();
    };

    $scope.login = function() {
        $scope.vm.loading = true;
        AuthenticationService.Login($scope.vm.username, $scope.vm.password, function (rep) {
            if (rep && rep.result) {
            	AuthenticationService.loadDefaultPage();
            } else {
                $scope.vm.error = rep.message;
                $scope.vm.loading = false;
            }
        });
    };
}

/**
 * MainCtrl - controller
 * Contains several global data used in different view
 *
 */
function MainCtrl($rootScope, $state, $scope,mqttService,dialogService,$sessionStorage,baseService,$localStorage,$http,$translate, AuthenticationService) {
	$scope.openChatView = function(){
		$rootScope.hasUnReadMessage = false;
		dialogService.sidebar("chatView", {bodyClose: false, width: '50%', pageParam: {title:"即时聊天"}});
	}
	
	$scope.initialise = function() {
		$scope.go = function(state) {
			$state.go(state);
		};
		
		$scope.tabData  = [];
	};
    $scope.color="01";
    $scope.style="";
    if($sessionStorage.color!=undefined){
        $scope.color=$sessionStorage.color;
    }
    if($sessionStorage.style!=undefined){
        $scope.style=$sessionStorage.style;
    }

    $scope.chooseColor=function(color){
        $scope.color=color;
	}
	$scope.chooseStyle=function(){
        dialogService
            .page("choose-style", {area:['450px', '300px'], alwaysClose: false})
            .then(function(response){

               var index = response.index;
                $sessionStorage.color=response.result.color;
                $scope.color=response.result.color;
                $scope.style=response.result.style==true?"skinBlack":"";
                $sessionStorage.style=$scope.style;
                dialogService.close(index);
            });
	}
	// 修改密码
	$scope.modifyPwd = function(){
		dialogService
		.page("modify-password", {area:['450px', '300px']});
	}

	$rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
		if(toState.name==='login'){
			$scope.tabData  = [];
			return;
		}
		if(!$.isEmpty(toParams)){
			return;
		}
		if(toState.data && toState.data.pageTitle){
			$scope.tabData.push({heading: toState.data.pageTitle, route: toState.name});
			$scope.tabData.unique(function(x, y){
				return x.route===y.route;
			});
		}
    });

	$scope.initialise();
	
    baseService.post('${portal}/i18n/custom/i18nMessageType/v1/all').then(function(rep){
       $scope.i18nMessageType = rep;
    });
    
    $scope.changeLanguage = function(language){
    	$translate.use("i18n-"+language);
    	window.localStorage.setItem("lang", "i18n-"+language);
    	$http.defaults.headers.common["Accept-Language"] = language;
    	//  delete $sessionStorage.frontMenus; 无效
    	window.sessionStorage.removeItem("ngStorage-frontMenus");
    	// 刷新当前页面
    	window.location.reload();
    }
    
    $scope.logout = function(){
    	AuthenticationService.Logout();
    }
};

function bootstrapTableCtrl($scope, $timeout){
}

function treeTableCtrl($scope, baseService){
	$scope.treeData = [];
	baseService
	.get("../mock/tree_data.json")
	.then(function(response){
		$scope.treeData = response;
	});
	
	$scope.$on("dataTable:query:reset", function(t, d){
		if(d.name!==$scope.dataTable.name){
			return;
		}
		$scope.treeInstance.cancelSelectedNode();
	});
	
	$scope.tree_click = function(e, i, n){
		$scope.dataTable.addQuery({property: 'categoryId', operation: 'equal', value: n.id});
		$scope.dataTable.query();
	}
}

function messageCtrl($scope, dialogService, baseService, toaster){
	$scope.messageSuccess = function(){
		dialogService.success("操作成功").then(function(){
			dialogService.msg("这是回调");
		});
	}
	
	$scope.messagePrompt = function(){
		dialogService.msg("已完成，但有些记录没有成功删除");
	}
	
	$scope.messageWarn = function(){
		dialogService.warn("该数据已被关联，无法删除");
	}
	
	$scope.dialogError = function(){
		dialogService.fail("操作失败").then(function(){
			dialogService.msg("错误消息的回调");
		});
	}
	
	$scope.dialogConfirm = function(){
		dialogService.confirm("确认要删除吗?").then(function(){
			dialogService.msg("您选择了确定");
		}, function(){
			dialogService.msg("您选择了取消");
		});
	}
	
	$scope.dialogDetail = function(selector){
		dialogService.page(selector, {pageParam:{id:1}})
					 .then(function(result){
						 dialogService.msg("回传的数据:" + JSON.stringify(result));
					 });
	}
	
	$scope.sidebar = function(){
		dialogService.sidebar("bo-detail", {bodyClose: false, width: '300px', pageParam: {name: '业务对象'}});
	}
	
	$scope.toasterSuccess = function(){
		toaster.success({ body:"Hi, welcome to Inspinia. This is example of Toastr notification box."});
	}
	
	$scope.toasterWarning = function(){
        toaster.warning({ title: "Title example", body:"This is example of Toastr notification box."});
    };
	
	$scope.toasterError = function(){
		toaster.pop({
            type: 'error',
            title: 'Title example',
            body: 'This is example of Toastr notification box.',
            showCloseButton: true,
            timeout: 1000
        });
	}
		
	$scope.treeData = [];
	baseService
	.get("../mock/tree_data.json")
	.then(function(response){
		$scope.treeData = response;
	});
	
	// 右键菜单点击前事件
	$scope.beforeRightClick = function(treeNode){
		if(treeNode.isParent){
			$scope.contextMenu = ['添加子项', '删除目录', '-', '授权'];
		}
		else{
			$scope.contextMenu = ['编辑', '删除'];
		}
	}
	
	// 点击某个右键菜单项
	$scope.menuClick = function(menu, treeNode){
		dialogService.msg(menu);
		switch(menu){
			case '添加子项':
				break;
			case '删除目录':
				break;
			case '授权':
				break;
			case '编辑':
				break;
			case '删除':
				break;
		}
	}
}

function myHomeCtrl($scope, baseService, indexColumnService, dialogService, $state, $sessionStorage){
	$scope.html = '';
	$scope.isAuth = true;
	
	$scope.initIndexColumn = function(){
		baseService.get("${portal}/portal/main/v1/myHome")
		.then(function(response) {
			if(response.state){
				html =  $.base64.decode(response.value,"utf-8");
				indexColumnService.showLayout($scope,html);
			}
		});	
	}
	
	if($sessionStorage.frontMenus){
		if($sessionStorage.frontMenus.length>0){
			$scope.initIndexColumn()
		}else{
			$scope.isAuth = false;
		}
	}else{
		$scope.$on("frontMenus:ready", function(e, frontMenus) {
			if(frontMenus.length>0){
				$scope.isAuth = true;
				$scope.initIndexColumn()
			}else{
				$scope.isAuth = false;
			}
	    })
	}
	
	
	//启动流程
	$scope.startFlow = function(id){
		var obj = {'defId':id};
		$state.go('initiatedProcess.instance-toStart',{ids:$.base64.encode(JSON.stringify(obj),"utf-8")});
	}
	
	
	$scope.initMySchedule = function(elem){
		//mySchedule-content
		var dateObj={};
		var scheduleArr={};
		var curSelectDate='';
		$scope.customClass={};
		$scope.chooseDateSchedule = [];
		
		$scope.$on('dateScheduleShow',function(e,d){
			setTimeout(function(){
				var parentElm=d.parent();
				$(parentElm).find('table').css('width',d.parent().width()-10);
				$(parentElm).find('.date-picker-date-time').css('top',0);
			},50)
		})
		
		
		
		$scope.addSchedule = function(){
			var conf ={type:'page',initDate:curSelectDate}; 
			dialogService.page('mySchedule.addSchedule', {area:['800px', '550px'],btn: ['保存','取消'],alwaysClose:false,pageParam: conf}).then(function(data){
				if(data.result && data.result.state) {
					dialogService.success('保存行程成功');
					dialogService.close(data.index);
					$scope.refreshSchedule();
				}else{
					var result=data.result && data.result.message ? data.result.message:'保存失败' ;
					dialogService.fail(result);
				}
			});
		}
		
		$scope.total = {total:0};
		
		 function getSortSchedule(){
	    	var arr = scheduleArr[curSelectDate] || [];
	    	  	arr.sort(function(a,b){
	    	  		return new Date(a.date+' '+a.startTiem).getTime() > new Date(b.date+' '+b.startTiem).getTime()
	    	  	})
	    	  	$scope.chooseDateSchedule=arr;
	    	  	$scope.total.total = arr.length;
		   }
		
		
		$scope.setDateCallBack = function(modelnNme,curDate,dateArr){
			curSelectDate=moment(curDate).format('YYYY-MM-DD');
		    var firstDate=moment(dateArr[0][0]).format('YYYY-MM-DD');
		    var lastDate=moment(dateArr[dateArr.length-1][dateArr[dateArr.length-1].length-1]).format('YYYY-MM-DD');
		    if(dateObj.first !=firstDate){
		    	dateObj['first']=firstDate;
		    	dateObj['last']=lastDate;
		    	$scope.refreshSchedule();
		    }else{
		    	getSortSchedule();
		    }
		}
		
	   
		$scope.refreshSchedule = function(){
	        scheduleArr={};
	        $scope.customClass={};
	    	var param={querys:[{property: "DATE_", operation: "BETWEEN", value:[dateObj['first'],dateObj['last']]}]}
	    	baseService.post('${portal}/portal/mySchedule/v1/list',param).then(function(data){
	    		if(data && data.rows){
	    			for(var i=0,d;d=data.rows[i++];){
	    				d.timeString=d.startTiem+'-'+d.endTime;
	    				if(!scheduleArr[d.date]) scheduleArr[d.date]=[];
	    				scheduleArr[d.date].push(d);
	    				$scope.customClass[d.date]='hasSchedule';
	    			}
	    			$scope.$broadcast('scheduleRefresh',$scope.customClass)
	    			getSortSchedule();
	    		}
	    	})
		}
		
	}
	
	
	//查看流程实例
	$scope.instanceDetail = function(id){
		$state.go('receivedProcess.instanceDetail',{id:id,state:'receivedProcess.handled'});
	}
	
	//任务处理
	$scope.taskDetail = function(id){
		$state.go('receivedProcess.pendingToStart',{id:id}); 
	}
	
	//查看邮件
	$scope.mailDetail = function(id){
		$state.go('mail.mailListDetail',{id:id});
	}
	
	//路由跳转
	$scope.stateGo = function(state,params){
		$state.go(state,params);
	}
	
	//路由跳转
	$scope.toHref = function(url){
		window.location.href = url;
	}
}



function chooseStyleCtrl($scope,$sessionStorage) {
    $scope.data = {};
    $scope.data.color="01"
    $scope.data.style=false;
    if($sessionStorage.color!=undefined){
        $scope.data.color=$sessionStorage.color;
    }
    if($sessionStorage.style!=undefined){
        $scope.data.style=$sessionStorage.style=="skinBlack"?true:false;
    }
    $scope.pageSure = function(){
    	return $scope.data;
	}

}
/**
 * 修改密码的控制器
 * @returns
 */
function modifyPasswordCtrl($scope, baseService, dialogService, $q,$filter){
	$scope.data = {};
	
	$scope.pageSure = function(){
		if($scope.modifyPwdForm.$invalid){
			dialogService.warn($filter('translate')("fill_in_the_content"));
			return;
		}
		else if($scope.data.reNewPwd!=$scope.data.newPwd){
			dialogService.warn($filter('translate')("inconsistent"));
            return;
		}
		else{
			var url = "${uc}/api/user/v1/user/changUserPsd",
				obj = angular.copy($scope.data),
				defer = $q.defer();
			delete obj["reNewPwd"];
			baseService.post(url, obj).then(function(r){
				if(r && r.state){
					dialogService.success(r.message).then(function(){
						defer.resolve();
					});
				}
				else{
					defer.reject();
					dialogService.fail(r && r.message);
				}
			});
			return defer.promise;
		}
	}
}

/**
 * 欢迎页面控制器
 * @returns
 */
function welcomeCtrl($scope, baseService, dialogService, $sessionStorage, $state){
	$scope.data = {};
	
	$scope.welcomeFail = function(){
		$scope.data = {"message":"您正在访问宏天软件的EIP系统，这是一个试用版本，您需要激活才能继续使用，但是现在系统似乎无法获取您的<span>机器码</span>，请与宏天售前人员联系。"};
	}
	
	$scope.init = function(){
		if($sessionStorage.welcome){
			var dataStr = $.base64.decode($sessionStorage.welcome, "utf-8");
			var data = angular.fromJson(dataStr);
			if(data && data.constructor==Object){
				$scope.data = data;
			}
			else{
				$scope.welcomeFail();
			}
		}
		else{
			$scope.welcomeFail();
		}
	}
	
	$scope.cert = function(){
		var url = "${uc}/actuator/cert";
		baseService
		.post(url, {activeCode: $scope.data.activationCode})
		.then(function(rep){
			if(rep && rep.result){
				dialogService.success(rep.message).then(function(){
					$state.go("login");
				});
			}
		}, function(r){
			if(r && !r.result){
				dialogService.fail(r.message);
			}
		});
	}
	
	$scope.init();
}

/**
 *
 * Pass all functions into module
 */
angular
    .module('eip')
    .controller('LoginCtrl', LoginCtrl)
    .controller('MainCtrl', MainCtrl)
    .controller('bootstrapTableCtrl', bootstrapTableCtrl)
    .controller('treeTableCtrl', treeTableCtrl)
    .controller('messageCtrl', messageCtrl)
    .controller('myHomeCtrl', myHomeCtrl)
    .controller('chooseStyleCtrl', chooseStyleCtrl)
    .controller('modifyPasswordCtrl', modifyPasswordCtrl)
    .controller('welcomeCtrl', welcomeCtrl);
