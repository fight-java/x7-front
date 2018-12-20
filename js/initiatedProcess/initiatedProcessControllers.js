
function completedCtrl($scope, baseService){
	$scope.fomatterDuration = function(data){
		return $.timeLag(data);
	}
}


function revokeCtrl($rootScope, $scope, baseService, dialogService, $stateParams, $state,$filter){
	$scope.data = {};
	$scope.data.instanceId = $scope.pageParam.id;
	$scope.data.isHandRevoke = $scope.pageParam.isHandRevoke;
	baseService.get("${bpmRunTime}/runtime/task/v1/handlerTypes").then(function(rep){
		$scope.handlerTypes = rep;
	});
	
	$scope.saveRevoke = function(){
		if(!$scope.data.messageType){
			dialogService.warn($filter('translate')('processMatters_messageType_msg'));
			return ;
		}
		if(!$scope.data.cause){
			dialogService.warn($filter('translate')('processMatters_cause_msg'));
			return ;
		}
		var msg = $filter('translate')('processMatters_confirm_recall');
		if(!$scope.data.isHandRevoke){
			msg = $filter('translate')('processMatters_confirm_originator');
		}
		dialogService.confirm(msg).then(function(){
			var index = layer.load(0, {shade: false});
			baseService.post('${bpmRunTime}/runtime/instance/v1/revokeInstance',$scope.data).then(function(rep){
				layer.close(index);
				if(rep.state){
					layer.closeAll();
					dialogService.success(rep.message);
					$state.reload($rootScope.$state.$current.name);
				}else{
					dialogService.fail(rep.message);
				}
			},function(rep){
				layer.close(index);
				dialogService.fail(rep.message);
			});
		});
	}
	
}

function myDraftCtrl($scope, baseService, dialogService, $state){
	//启动流程
	$scope.startFlow = function(id,procDefId){
		var obj = {'defId':procDefId,'proInstId':id};
		$state.go('initiatedProcess.instance-toStart',{ids:$.base64.encode(JSON.stringify(obj),"utf-8")});
	}
}


function instanceToStartCtrl($scope, baseService, dialogService, $state){
	var ids = JSON.parse($.base64.decode($state.params.ids,"utf-8"));
	$scope.defId = ids.defId;
	$scope.proInstId = ids.proInstId?ids.proInstId:"''";
	$scope.params = ids.params?ids.params:"''";
}

function sendNodeUsersCtrl($scope, baseService, dialogService){
	$scope.data = {};
	$scope.selectUsers = [];
	$scope.defId = $scope.pageParam.defId;
	baseService.get("${bpmRunTime}/runtime/instance/v1/sendNodeUsers?defId="+$scope.defId+"&nodeId=").then(function(rep){
		$scope.listNode = rep;
	},function(rep){
		dialogService.fail(rep.message);
	});

	$scope.pageSure = function(){
		var json=[];
		for (key in $scope.data)
		{
			json.push({nodeId:key,executors:eval("("+$scope.data[key]+")")})
		}
	    return json;
	}
	
	$scope.closeEdit = function(){
		layer.closeAll();
	}
	
	$scope.selectUser = function(nodeId){
		dialogService.page('user-selector', {area:['1024px', '580px'], pageParam: {single:false,data:$scope.selectUsers}})
		 .then(function(result){
			 $scope.selectUsers = result;
			 var accounts=[];
		     var name=[];
		     $.each(result,function(i,item){
				accounts.push({id:item.id,type:"user", name:item.fullname});
				name.push(item.fullname);
			})
			$scope.data[nodeId] = JSON.stringify(accounts);
		    $scope[nodeId+"_Span"] = JSON.stringify(name.toString());
		 });
	}
}

function selectDestinationCtrl($scope, baseService, dialogService){
	$scope.selectNode = '';
	$scope.jumpType = '';
	$scope.defId = $scope.pageParam.defId;
	baseService.get("${bpmRunTime}/runtime/instance/v1/selectDestination?defId="+$scope.defId).then(function(rep){
		$scope.jumpType = rep.jumpType;
		$scope.outcomeUserMap = rep.outcomeUserMap;
		$scope.outcomeNodes = rep.outcomeNodes;
		$scope.allNodeDef = rep.allNodeDef;
		$scope.allNodeUserMap = rep.allNodeUserMap;
		$scope.jumpType = $scope.jumpType.split(",")[0];
	},function(rep){
		dialogService.fail(rep.message);
	});

	$scope.pageSure = function(){
		var destination = $("[name='destination']").val();
	 	var userArray = [];
	 	var nodeUsers =[];
	 	$("input[name='nodeUser']:checked").each(function (){
			var strVal = $(this).val().split(",");
			var user = {
				id:strVal[0],
				name:strVal[1],
				type:strVal[2]
			};
			userArray.push(user);
		});
	 	var nodeUser ={
				nodeId:destination,
				executors:userArray
		};
	 	nodeUsers.push(nodeUser);
	 	return nodeUsers;
	}
	
	$scope.closeEdit = function(){
		layer.closeAll();
	}
	
	$scope.isContains = function(base, value){
		return base.indexOf(value) != -1;
	}
	
	$scope.selectUser = function(nodeId){
		dialogService.page('user-selector', {area:['1024px', '580px'], pageParam: {single:false,data:$scope.selectUsers}})
		 .then(function(data){
			 var html = "";
			 for(var i = 0 ,user; user=data[i++];){
				 html = html + '<label class="checkbox-inline" name="nodeUserLabel"><input type="checkbox" name="nodeUser"  checked="checked" value="'+user.id+","+user.fullname+',user" />'+user.fullname+'</label>'
			 }
			 $("span[name='nodeUserSpan']").html(html);
		 });
	}
}

function delegateCtrl($scope, baseService, dialogService){
	
	$scope.turnDetail = function(id){
		dialogService.page('task-turnDetail', {area:['680px', '380px'], pageParam: {id:id}});
	}
	
	$scope.cancelTaskturn = function(id,subject){
		dialogService.page('task-cancelTurn', {area:['600px', '350px'],btn:[], pageParam: {taskId:id}});
	}
	
}

function taskTurnDetailCtrl($scope, baseService, dialogService, $stateParams){
	$scope.turnAssigns = [];
	baseService.get("${bpmRunTime}/runtime/instance/v1/taskTurnAssigns?taskTurnId="+$scope.pageParam.id).then(function(rep){
		$scope.turnAssigns = rep;
	});
}

function cancelTurnCtrl($rootScope, $scope, baseService, dialogService, $state){
	$scope.data = {};
	$scope.selectUsers = [];
	$scope.data.taskId = $scope.pageParam.taskId;
	baseService.get("${bpmRunTime}/runtime/task/v1/handlerTypes").then(function(rep){
		$scope.handlerTypes = rep;
	});
	
	$scope.saveCancelTurn = function(){
		if(!$scope.data.messageType){
			dialogService.warn("请选择通知方式");
			return ;
		}
		if(!$scope.data.opinion){
			dialogService.warn("请填写取消原因");
			return ;
		}
		var msg = "确定取消转办？";
		dialogService.confirm(msg).then(function(){
			var index = layer.load(0, {shade: false});
			baseService.post('${bpmRunTime}/runtime/task/v1/doCancelTurn',$scope.data).then(function(rep){
				layer.close(index);
				if(rep.state){
					$scope.closeEdit();
					dialogService.success(rep.message);
					$state.reload($rootScope.$state.$current.name);
				}else{
					dialogService.fail(rep.message);
				}
			},function(rep){
				layer.close(index);
				dialogService.fail(rep.message);
			});
		});
	}
	
	$scope.closeEdit = function(){
		layer.closeAll();
	}
}



function myCopyToCtrl($scope, baseService, dialogService){
	
	$scope.toCopyTo = function(id){
		dialogService.page("flow-toForward", {area: ['600px', '315px'],btn:[],pageParam:{proInstId:id,copyToType:1,from:'initiatedProcess.myCopyTo'}});
	}
}

function toCopyToCtrl($scope, baseService, dialogService, $state,$filter){
	$scope.data = {};
	$scope.selectUsers = [];
	$scope.pageTitle = $scope.pageParam.copyToType == 0?$filter('translate')('processMatters_process_of_cc'): $filter('translate')('processMatters_process_forward');
	var taskId = $scope.pageParam.taskId?$scope.pageParam.taskId:'';
	var proInstId = $scope.pageParam.proInstId?$scope.pageParam.proInstId:'';
	var from = $scope.pageParam.from;
	var url = "${bpmRunTime}/runtime/instance/v1/instanceToCopyTo?taskId="+taskId+"&proInstId="+proInstId+"&copyToType="+$scope.pageParam.copyToType;
	baseService.get(url).then(function(rep){
		$scope.handlerTypes = rep.handlerTypes;
		$scope.data.instanceId = rep.proInstId;
		$scope.data.copyToType = rep.copyToType;
	});

	$scope.saveCopyToType = function(){
		if(!$scope.data.userId) {
			dialogService.warn($filter('translate')('processMatters_please_select_personnel'));
			return;
		}
		if(!$scope.data.messageType){
			dialogService.warn($filter('translate')('processMatters_messageType_msg'));
			return ;
		}
		var msg = $filter('translate')('processMatters_copy_the_process');
		if($scope.data.copyToType==1){
			msg = $filter('translate')('processMatters_forward_the_process');
		}
		dialogService.confirm(msg).then(function(){
			var index = layer.load(0, {shade: false});
			baseService.post('${bpmRunTime}/runtime/instance/v1/transToMore',$scope.data).then(function(rep){
				layer.close(index);
				if(rep.state){
					dialogService.success(rep.message).then(function(){
						$scope.closeEdit();
					});
					$state.go(from);
				}else{
					dialogService.fail(rep.message);
				}
			},function(rep){
				layer.close(index);
				dialogService.fail(rep.message);
			});
		});
	}

	$scope.closeEdit = function(){
		layer.closeAll();
	}

	$scope.selectUser = function(){
		dialogService.page('user-selector', {area:['1024px', '580px'], pageParam: {single:false,data:$scope.selectUsers}})
			.then(function(result){
				$scope.selectUsers = result;
				var userIds = [];
				var fullnames = [];
				$(result).each(function(i){
					var userId=this['id'];
					var fullname=this['fullname'];
					userIds.push(userId);
					fullnames.push(fullname);
				});
				$scope.data.userId = userIds.join(",");
				$scope.userName = fullnames.join(",");
			});
	}
	$scope.removeSelectedArr = function(arr,obj){
		$scope[arr].remove(obj);
		var dataStrArr=$scope.data.userId.split(",").remove(obj.id);
		$scope.data.userId=dataStrArr.join(",");
	}
}

function myTransRecordCtrl($scope, baseService, dialogService){
	$scope.revokeTrans = function(taskId, subject){
		dialogService.page("task-revokeTrans", {area: ['600px', '280px'],btn:[],pageParam:{taskId:taskId,from:'initiatedProcess.myTransRecord'}}); 
	}
	$scope.showTaskTransDetail = function(id){
		dialogService.page("task-transDetail", {area: ['680px', '380px'],pageParam:{id:id}}); 
	}
}


function transDetailCtrl($scope, baseService, dialogService, $stateParams){
	$scope.turnAssigns = [];
	baseService.get("${bpmRunTime}/runtime/task/v1/getTaskTransById?id="+$scope.pageParam.id).then(function(rep){
		$scope.trans = rep;
	});
	
	$scope.closeEdit = function(){
		layer.closeAll();
	}
}

function revokeTransCtrl($rootScope, $scope, baseService, dialogService, $state){
	$scope.data = {};
	$scope.selectUsers = [];
	$scope.data.taskId = $scope.pageParam.taskId;
	var from = $scope.pageParam.from;
	baseService.get("${bpmRunTime}/runtime/task/v1/handlerTypes").then(function(rep){
		$scope.handlerTypes = rep;
	});
	
	$scope.saveRevokeTrans = function(){
		if(!$scope.data.notifyType){
			dialogService.warn("请选择通知方式");
			return ;
		}
		if(!$scope.data.opinion){
			dialogService.warn("请填写撤销原因");
			return ;
		}
		var msg = "确认撤销流转任务？";
		dialogService.confirm(msg).then(function(){
			var index = layer.load(0, {shade: false});
			baseService.post('${bpmRunTime}/runtime/task/v1/doRevokeTrans',$scope.data).then(function(rep){
				layer.close(index);
				if(rep.state){
					dialogService.success(rep.message).then(function(){
						$state.reload($rootScope.$state.$current.name);
						$scope.closeEdit();
					});
				}else{
					dialogService.fail(rep.message);
				}
			},function(rep){
				layer.close(index);
				dialogService.fail(rep.message);
			});
		});
	}
	
	$scope.closeEdit = function(){
		layer.closeAll();
	}
}

function newProcessCtrl($scope, baseService, dialogService, $state){
	//启动流程
	$scope.startFlow = function(id){
		var obj = {'defId':id};
		$state.go('initiatedProcess.instance-toStart',{ids:$.base64.encode(JSON.stringify(obj),"utf-8")});
	}
	
	//查看流程实例
	$scope.instanceDetail = function(id){
		var obj = {'defId':id};
		$state.go('receivedProcess.instanceDetail',{id:item.id,state:'receivedProcess.handled'});
	}
}

function myRequestCtrl($scope, baseService, dialogService){
	
	$scope.revoke = function(id, subject, status){
		if(status == "revokeToStart"){
			dialogService.warn("已撤回，不能再撤回", "提示", "show", 1);
    		return false;
    	}
		dialogService.page("task-revoke", {area: ['500px', '265px'],btn:[],pageParam:{id:id,subject:subject,isHandRevoke:false}}); 
	}
}


/**
 *
 * Pass all functions into module
 */
angular
    .module('initiatedProcess', [])
    .controller('completedCtrl', completedCtrl)
    .controller('revokeCtrl', revokeCtrl)
    .controller('myDraftCtrl', myDraftCtrl)
    .controller('instanceToStartCtrl', instanceToStartCtrl)
    .controller('delegateCtrl', delegateCtrl)
    .controller('myCopyToCtrl', myCopyToCtrl)
	.controller('toCopyToCtrl', toCopyToCtrl)
    .controller('myTransRecordCtrl', myTransRecordCtrl)
    .controller('newProcessCtrl', newProcessCtrl)
    .controller('sendNodeUsersCtrl', sendNodeUsersCtrl)
    .controller('selectDestinationCtrl', selectDestinationCtrl)
    .controller('taskTurnDetailCtrl', taskTurnDetailCtrl)
    .controller('cancelTurnCtrl', cancelTurnCtrl)
    .controller('revokeTransCtrl', revokeTransCtrl)
    .controller('transDetailCtrl', transDetailCtrl)
    .controller('myRequestCtrl', myRequestCtrl);
    