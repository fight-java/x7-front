
function pendingCtrl($scope, baseService, dialogService, $location, $state,$filter){
	$scope.formatterDueTaskTime = function(value,row){
		if(!row.dueDateType || !value || row.dueUseTaskTime<0) return "";
 		 var className = "progress-bar-success",dateType = $filter('translate')('working_days'),
 		 detailHtml = "",detailHtml2="";
 		 var percent = row.dueUseTaskTime*100/value;
 		 percent = parseFloat(percent.toFixed(2));
 		 if(25<percent&&percent<=50){
 			 className = " progress-bar-info";
 		 }
 		 if(50<percent&&percent<=75){
 			 className = "progress-bar-warning";
 		 }
 		 if(75<percent){
 			 className = "progress-bar-danger";
 		 }
 		 if(percent>100){
 			 percent = 100;
 		 }
 		 if(row.dueDateType == "caltime"){
 			 detailHtml = "<img src='../front/img/caltime.png' title='"+$filter('translate')('calendar_days')+"'></img>  ";
 		 }else{
 			 detailHtml = "<img src='../front/img/worktime.png' title='"+$filter('translate')('working_days')+"'></img>  ";
 		 }
 		 
 		 if(row.dueStatus==0){
 			detailHtml2 += "<a class='fa fa-detail' ng-click='openTaskDueTimeDetail(\""+row.id +"\",\""+row.name+"\")' herf='#' title='"+$filter('translate')('detail')+"'></a>";
 		 }
 		 
 		 
 		 var progressHtml=	'<div class="row">'+
 		 						'<div class="col-sm-2" style="margin-top:4px;">'+detailHtml+
 		 						'</div>'+
 		 						'<div class="col-sm-8" style="padding:0;">'+
         			 				'<div class="progress progress-striped" >'+
         		 			  			'<div class="progress-bar '+className+'" style="width:'+percent+'%">'+
         		 			  				'<span style="color:black"> ' +  percent+'% '+ '</span>'+
         		 			  			'</div>'+
         		 					'</div>'+
     		 					'</div>'+
     		 					'<div class="col-sm-2" style="margin-left:-8px;margin-top:4px;">'+detailHtml2+
         		 				'</div>'+
         		 			'</div>';
 		  return '<div class="col-sm-12">'+progressHtml+'</div>';
	}
	
	$scope.toTask = function(id){
		var url= '${bpmRunTime}/runtime/task/v1/canLock?taskId=' + id
		baseService.get(url).then(function(rtn){
			//0:任务已经处理,1:可以锁定,2:不需要解锁 ,3:可以解锁，4,被其他人锁定,5:这种情况一般是管理员操作，所以不用出锁定按钮。
			switch(rtn){
				case 0:
					dialogService.fail($filter('translate')('processMatters_complete_msg'));
					break;
				case 1:
				case 2:
				case 3:
				case 5:
					$state.go('receivedProcess.pendingToStart',{id:id});
					break;
				case 4:
					dialogService.fail($filter('translate')('processMatters_lock_msg'));
					break;
				case 6:
					dialogService.fail($filter('translate')('processMatters_ban_msg'));
					break;
			}
		});
	}
	
	$scope.openTaskDueTimeDetail = function(id, name){
		dialogService.sidebar("pending-dueTimeList", {bodyClose: false, width: '40%', pageParam: {id:id, title:title}});
	}
	
}

function taskToStartCtrl($scope, baseService, dialogService, $stateParams, $state,$filter){
	$scope.taskId = $stateParams.id;
	$scope.title = $filter('translate')('processMatters_task_processing');
	$scope.isFirstNodeUserAssign = false;//${prop.firstNodeUserAssign};
	$scope.isSkipFirstNode = false;//${prop.skipFirstNode};
	var churl= '${bpmRunTime}/runtime/task/v1/canLock?taskId=' + $scope.taskId;
	baseService.get(churl).then(function(rtn){
		//0:任务已经处理,1:可以锁定,2:不需要解锁 ,3:可以解锁，4,被其他人锁定,5:这种情况一般是管理员操作，所以不用出锁定按钮。
		switch(rtn){
			case 0:
				dialogService.fail($filter('translate')('processMatters_complete_msg'));
				$state.go('receivedProcess.pending');
			case 1:
			case 2:
			case 3:
			case 5:
				break;
			case 4:
				dialogService.fail($filter('translate')('processMatters_lock_msg'));
				$state.go('receivedProcess.pending');
			case 6:
				dialogService.fail($filter('translate')('processMatters_ban_msg'));
				$state.go('receivedProcess.pending');
		}
	});
	var url = "${bpmRunTime}/runtime/task/v1/taskApprove?taskId="+$scope.taskId;
	baseService.get(url).then(function(rep){
		$scope.isPopWin = rep.popWin;
		$scope.nodeId = rep.nodeId;
	});
}

function taskToAgreeCtrl($scope, baseService, dialogService, $stateParams, $state,$filter){
	$scope.params = $scope.pageParam;
	$scope.actionName = $scope.params.actionName;
	$scope.taskId = $scope.params.taskId;
	$scope.jumpType = '';
	$scope.nodeUser = [];
	$scope.destination = '';
	$scope.urlForm = $scope.params.urlForm;
	var url = "${bpmRunTime}/runtime/task/v1/taskToAgree?taskId="+$scope.taskId+"&actionName="+$scope.actionName;
	baseService.get(url).then(function(rep){
		$scope.directHandlerSign = rep.directHandlerSign;
		$scope.goNextJustEndEvent = rep.goNextJustEndEvent;
		$scope.allNodeDef = rep.allNodeDef;
		$scope.allNodeUserMap = rep.allNodeUserMap;
		$scope.approvalItem = rep.approvalItem;
		$scope.jumpType = rep.jumpType;
		$scope.outcomeNodes = rep.outcomeNodes;
		$scope.outcomeUserMap = rep.outcomeUserMap;
		
	});
	$scope.jumpType = $scope.jumpType.split(",")[0];
	$scope.selectNode = '';
	$scope.chooseUser = function(){
		// 不必多选设置执行人的时候
		
		var callBack =function(data,dialog){
			var html = "";
			for(var i = 0 ,user; user=data[i++];){
				html = html + '<label class="checkbox-inline" name="nodeUserLabel"><input type="checkbox" name="nodeUser"  checked="checked" value="'+user.id+","+user.name+',user" />'+user.name+'</label>'
			}
			$("span[name='nodeUserSpan']").html(html);
		    dialog.dialog('close');
		};
		CombinateDialog.open({alias:"userSelector",callBack:callBack});
	};
	
	$scope.isContains = function(base, value){
		return base.indexOf(value) != -1;
	}
	
	$scope.setOpinion = function(approval){
		var oldOpinion = $("#opinion").val();
		$("#opinion").val(oldOpinion+approval);
	}
	
	$scope.cancel = function(){
		layer.closeAll();
	}
	
	$scope.submit = function(){
		var frm = $('#agreeForm');
		if(frm.$invalid){
			dialogService.fail($filter('translate')('form_verification_does_not_pass'));
			return;
		}
		var paramsObj = handlerOpinionJson($scope.params.passConf);
		delete paramsObj['hasFormOpinion'];
		delete paramsObj['bpmFormId'];
		if(paramsObj.data){
			paramsObj.data = $.base64.encode(paramsObj.data,"utf-8");
		}
		paramsObj.actionName = $scope.actionName;
		paramsObj.taskId = $scope.taskId;
		paramsObj.jumpType = $scope.jumpType;
		paramsObj.destination = $scope.destination;
		paramsObj.nodeUsers = JSON.stringify($scope.nodeUser);
		var ele = document.getElementById("bussinessFrom");
		var iframeObj = ele && ele.contentWindow; 
		var defer;
		var index = null;
		var url = "${bpmRunTime}/runtime/task/v1/complete";
		index = layer.load(0, {shade: false});
		if(iframeObj && iframeObj.saveForm){
			defer = iframeObj.saveForm();
			defer.done(function(){
				baseService.post(url, paramsObj).then(function(rep){
					showResponse(index,rep)
				});
			});
			defer.fail(function(msg){
				dialogService.fail( msg || "保存业务表单数据失败");
				if(index){
					layer.close(index);
				}
			});
		}else{
			baseService.post(url, paramsObj).then(function(rep){
				showResponse(index,rep)
			});
		}
	}
	
	function handlerOpinionJson(jsonObj){
		var opinion = $scope.opinion;
		var opinionObj=jsonObj.__form_opinion;
		if(!opinionObj) return jsonObj;
		for(var key in opinionObj){
			opinionObj[key]=opinion;
		}
		return angular.toJson(jsonObj);
	}
		
		
	function showResponse(index,response) {
		layer.closeAll();
		//执行后置脚本
		var script = "var tempFunction = function(data){ "+window.parent.curent_btn_after_script_+"};"
		var afterScriptPassed =  eval(script+"tempFunction(response);");

		if (response.state) {
			dialogService.success(response.message);
			$state.go("receivedProcess.pending");
		} else {
			dialogService.fail(response.message);
		}
	}
}
	

function taskImageCtrl($scope, baseService, dialogService,$filter){
		if(!$scope.pageParam.taskId){
			return '';
		}
		$scope.imageUrl = "${bpmRunTime}/runtime/instance/v1/getBpmImage?defId=&bpmnInstId=&taskId="+$scope.pageParam.taskId+"&proInstId=";
		$scope.getImageBase64 = function(){
			if($scope.imageBase64){
				return $scope.imageBase64;
			}
			var imageBase64 = '';
			$.ajax({
				url:$scope.imageUrl,
				type:'GET',
				dataType:'text',
				async:false,
				success:function(data){
					imageBase64 = data;
					$scope.imageBase64 = data;
				}
			})
			return imageBase64;
		}

	var url = "${bpmRunTime}/runtime/task/v1/taskImage?taskId="+$scope.pageParam.taskId;
	baseService.get(url).then(function(rep){
		$scope.bpmDefLayout = rep.bpmDefLayout;
		$scope.instId = rep.instId;
		$scope.parentInstId = rep.parentInstId;
	});
	
	//显示指定流程实例的轨迹图
	$scope.showFlowMap = function(instId,nodeId,nodeType,type) {
		var title=type=="subFlow"?$filter('translate')('view_subprocess'):$filter('translate')('view_main_process');
		dialogService.page("flow-image", {area: ['950px', '600px'],btn:[],pageParam:{instId:instId,nodeId:nodeId,nodeType:nodeType,type:type}});
	}
	
}

function flowImageCtrl($scope, baseService, dialogService, $stateParams,$filter){
	$scope.imageBase64s = {};
	$scope.instId = $scope.pageParam?$scope.pageParam.instId:$stateParams.id;
	
	var getInstanceUrl = '';
	if($scope.instId||$scope.pageParam.defId){
		var action = $scope.instId?'proInstId='+$scope.instId:'defId='+$scope.pageParam.defId;
		getInstanceUrl = "${bpmRunTime}/runtime/instance/v1/instanceFlowImage?"+action;
	}
	
	baseService.get(getInstanceUrl).then(function(rep){
		$scope.bpmDefLayout = rep.bpmDefLayout;
		$scope.bpmProcessInstance = rep.bpmProcessInstance;
		$scope.bpmProcessInstanceList = rep.bpmProcessInstanceList;
		$scope.defId = rep.defId;
		$scope.from = rep.from;
		$scope.instanceId = rep.instanceId;
		$scope.parentInstId = rep.parentInstId;
	});
	
	$scope.getImageBase64 = function(bpmnInstId, procDefId){
		if(!bpmnInstId&&!procDefId){
			return '';
		}
		if($scope.imageBase64s[bpmnInstId]||$scope.imageBase64s[procDefId]){
			return $scope.imageBase64s[bpmnInstId]?$scope.imageBase64s[bpmnInstId]:$scope.imageBase64s[procDefId];
		}
		var imageUrl = "${bpmRunTime}/runtime/instance/v1/getBpmImage?taskId=&proInstId=";
		imageUrl += bpmnInstId?'&defId=&bpmnInstId='+bpmnInstId:'&defId='+procDefId+'&bpmnInstId=';
		var imageBase64 = '';
		$.ajax({
			url:imageUrl,
			type:'GET',
			dataType:'text',
			async:false,
			success:function(data){
				if(bpmnInstId){
					$scope.imageBase64s[bpmnInstId] = data;
				}else{
					$scope.imageBase64s[procDefId] = data;
				}
				imageBase64 = data;
			}
		})
		return imageBase64;
	}
	
	$scope.getImageBase64ByDefId = function(){
		if(!$scope.defId){
			return '';
		}
		var imageUrl = "${bpmRunTime}/runtime/instance/v1/getBpmImage?defId="+$scope.defId;
		if($scope.imageBase64){
			return $scope.imageBase64;
		}
		var imageBase64 = '';
		$.ajax({
			url:imageUrl,
			type:'GET',
			dataType:'text',
			async:false,
			success:function(data){
				imageBase64 = data;
				$scope.imageBase64 = data;
			}
		})
		return imageBase64;
	}
	
	//显示指定流程实例的轨迹图
	$scope.showFlowMap = function(instId,nodeId,nodeType,type) {
		var title=type=="subFlow"?$filter('translate')('view_subprocess'):$filter('translate')('view_main_process');
		dialogService.page("flow-image", {area: ['950px', '600px'],btn:[],pageParam:{instId:instId,nodeId:nodeId,nodeType:nodeType,type:type}});
	}
	
}

/**
 * 审批历史
 */
function flowOpinionCtrl($scope, baseService, dialogService, $stateParams){
	if(!$scope.pageParam){
		var url = "${bpmRunTime}/runtime/instance/v1/instanceFlowOpinions?instId=" + $stateParams.id;
		baseService.get(url).then(function(rep){
			$scope.opinionList = rep;
		});
	}else{
		var url = "${bpmRunTime}/runtime/instance/v1/instanceFlowOpinions?taskId="+$scope.pageParam.taskId+"&instId=";
		baseService.get(url).then(function(rep){
			$scope.opinionList = rep;
		});
	}
	$scope.switch = function(event){
    var target = event.target;
    if (!$(target).parent().find("#tableData").is(":visible")){
        $(target).parent().find("#tableData").css("display","block");
        $(target).parent().find("#divData").css("display","none");
    }else {
        $(target).parent().find("#divData").css("display","block");
        $(target).parent().find("#tableData").css("display","none");
    }
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

function toDelegateCtrl($rootScope, $scope, baseService, dialogService,$state,$filter){
	$scope.data = {};
	$scope.selectUsers = [];
	$scope.data.taskId = $scope.pageParam.taskId;
	baseService.get("${bpmRunTime}/runtime/task/v1/handlerTypes").then(function(rep){
		$scope.handlerTypes = rep;
	});
	
	$scope.saveDelegate = function(){
		if(!$scope.data.userId) {
			dialogService.warn($filter('translate')('processMatters_please_select_personnel'));
			return;
		}
		if(!$scope.data.messageType){
			dialogService.warn($filter('translate')('processMatters_messageType_msg'));
			return ;
		}
		var msg = $filter('translate')('determine_the_transfer_to_the_process');
		dialogService.confirm(msg).then(function(){
			var index = layer.load(0, {shade: false});
			baseService.post('${bpmRunTime}/runtime/task/v1/delegate',$scope.data).then(function(rep){
				layer.close(index);
				var script = "var tempFunction = function(data){ " + window.parent.curent_btn_after_script_ + "};"
				var afterScriptPassed = eval(script + "tempFunction(rep);");
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
	
	$scope.selectUser = function(){
		dialogService.page('user-selector', {area:['1024px', '580px'], pageParam: {single:true,data:$scope.selectUsers}})
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
}

function toAddSignCtrl($scope, baseService, dialogService,$filter){
	$scope.data = {};
	$scope.selectUsers = [];
	$scope.data.taskId = $scope.pageParam.taskId;
	baseService.get("${bpmRunTime}/runtime/task/v1/handlerTypes").then(function(rep){
		$scope.handlerTypes = rep;
	});
	
	$scope.saveAddSign = function(){
		if(!$scope.data.userId) {
			dialogService.warn($filter('translate')('please_choose_the_signing_staff'));
			return;
		}
		if(!$scope.data.messageType){
			dialogService.warn($filter('translate')('processMatters_messageType_msg'));
			return ;
		}
		var msg = $filter('translate')('make_sure_to_add_a_signing_task');
		dialogService.confirm(msg).then(function(){
			var index = layer.load(0, {shade: false});
			baseService.post('${bpmRunTime}/runtime/task/v1/taskSignUsers',$scope.data).then(function(rep){
				layer.close(index);
				if(rep.state){
					$scope.closeEdit();
					dialogService.success(rep.message);
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

function toTransCtrl($rootScope, $scope, baseService, dialogService, $state,$filter){
	$scope.data = {};
	$scope.selectUsers = [];
	$scope.transRecordList = [];
	$scope.data.taskId = $scope.pageParam.taskId;
	baseService.get("${bpmRunTime}/runtime/task/v1/handlerTypes").then(function(rep){
		$scope.handlerTypes = rep;
	});
	
	baseService.get("${bpmRunTime}/runtime/task/v1/getTransRecordList?taskId="+$scope.data.taskId).then(function(rep){
		$scope.transRecordList = rep;
	});
	
	$scope.saveTrans = function(){
		if(!$scope.data.notifyType){
			dialogService.warn($filter('translate')('processMatters_messageType_msg'));
			return ;
		}
		if(!$scope.data.userIds||!$scope.data.opinion) {
			dialogService.warn($filter('translate')('choose_to_fill_in_the_content'));
			return;
		}
		var msg = $filter('translate')('are_you_sure_of_the_flow');
		dialogService.confirm(msg).then(function(){
			var index = layer.load(0, {shade: false});
			baseService.post('${bpmRunTime}/runtime/task/v1/taskToTrans',$scope.data).then(function(rep){
				layer.close(index);
				var script = "var tempFunction = function(data){ "+window.parent.curent_btn_after_script_+"};"
				var afterScriptPassed =  eval(script+"tempFunction(rep);");	
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
	
	//投票类型
	function setVoteType(type){
		switch(type){
			case 1:
				$scope.data.voteType = "percent";
				break;
			case 2:
			case 3:
				$scope.data.voteType = "amount";
				break;
		}
	}
	
	function setAmount(type){
		var obj=$("#voteAmount");
		var objLabel=$("#voteAmountUnit");
		switch(type){
			case 1:
				$scope.data.voteAmount = 100;
				objLabel.show();
				break;
			case 2:
			case 3:
				$scope.data.voteAmount = 1;
				objLabel.hide();
				break;
		}
	}
	
	$scope.voteTypeChange = function(e){
		if($(e).val()=="amount"){
			$("#voteAmountUnit").hide();
		}
		else{
			$("#voteAmountUnit").show();
		}
	}
	
	//设定决策类型
	function setDecideType(type){
		
		switch(type){
			case 1:
			case 3:
				$scope.data.decideType = "agree";
				break;
			case 2:
				$scope.data.decideType = "refuse";
				break;
		}
	}
	
	/**
	* 1.全票通过
	*  2.一票否决
	*  3.一票通过
	*  4.自定义
	*/
	$scope.setVote = function(type){
		var hide=(type!=4);
		toHidden(hide);
		
		setDecideType(type);
		//
		setVoteType(type);
		//设置票数
		setAmount(type);
	    
	}
	
	function toHidden(hidden){
		$(".hight").each(function(i){
			hidden?$(this).hide():$(this).show();
		});
	}
	
	$scope.setVote(1);
	
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
			 $scope.data.userIds = userIds.join(",");
			 $scope.receiver = fullnames.join(",");
		 });
	}
	
	$scope.removeSelectedArr = function(arr,obj){
		$scope[arr].remove(obj);
		var dataStrArr=$scope.data.userId.split(",").remove(obj.id);
		$scope.data.userId=dataStrArr.join(",");
	}
}

function toRejectCtrl($scope, baseService, dialogService,$filter){
	$scope.data = {};
	$scope.data.taskId = $scope.pageParam.taskId;
	$scope.data.actionName = $scope.pageParam.actionName;
	$scope.backNode = '';
	$scope.backMode = '';
	var url = "${bpmRunTime}/runtime/task/v1/taskToReject?taskId="+$scope.data.taskId+"&backModel="+$scope.data.actionName;
	baseService.get(url).then(function(rep){
		$scope.backNode = rep.backNode;
		$scope.backMode = rep.backMode;
		$scope.canRejectToStart = rep.canRejectToStart;//允许驳回到发起人
		$scope.canRejectToAnyNode = rep.canRejectToAnyNode;//允许驳回指定节点
		$scope.canRejectPreAct = rep.canRejectPreAct;//允许驳回到上一步
		$scope.canReject = rep.canReject;//允许驳回
		$scope.bpmExeStacksUserNode = rep.bpmExeStacksUserNode;//允许直来直往的节点
		$scope.bpmExeStacksGoMapUserNode = rep.bpmExeStacksGoMapUserNode;//允许按流程图执行的节点
	});
	
	$scope.rejectModeClick = function(){
		$scope.data.destination = "";
		$scope.data.actionName = "reject";
		//退回方式
		$scope.showNodeChoice();
	}
	
	$scope.showNodeChoice = function() {
		//退回方式
		var rejectRadio = $("input[name='rejectMode']:checked");
		var rejectMode = rejectRadio.val();
		var backHandMode = $("input[name='backHandMode']:checked").val()||$scope.backMode;
		if (rejectRadio.attr("showDestination")) {
			rejectMode = "rejectToDestination" //驳回指定节点与驳回使用同一handle ，区别有没有destination
		}
		$scope.data.destination = "";
		if (rejectMode == "backToStart"||rejectRadio.attr("id") == "rejectPreAct") {
			$(".nodeChoice").hide();
		} else {
			if (backHandMode == "direct") {
				$("#nodeChoice1").hide();
				$("#nodeChoice2").show();
			} else {
				//按流程图走
				$("#nodeChoice1").show();
				$("#nodeChoice2").hide();
			}
		}
	}
	
	$scope.saveReject = function(){
		if(!$scope.data.opinion){
			dialogService.warn($filter('translate')('please_fill_in_the_rejection'));
			return ;
		}
		var isRejectPreAct = $scope.rejectMode == "rejectPreAct";
		$scope.rejectMode = $scope.data.actionName;
		if ($scope.rejectMode == "reject") {
			if (isRejectPreAct == false) {
				$scope.data.destination = $scope.backHandMode == "direct" ? $("#userNodeSelect").val() : $("#goMapUserNodeSelect").val();
			} else {
				//取可退回的最近节点
				$scope.data.destination = $scope.backHandMode == "direct" ? $("#userNodeSelect").find("option:eq(1)").val() : $("#goMapUserNodeSelect").find("option:eq(1)").val();
			}
		}
		//如果流程定义中配置的仅只能驳回的节点
		if ($scope.backNode != "" && $scope.canRejectToStart != true) {
			$scope.data.destination = $scope.backNode;
			//检查可驳回合法性
			var isLegality = false;
			var select = $scope.backMode == "direct" ? "userNodeSelect" : "goMapUserNodeSelect";
			//直来直往
			$("#" + select + " option").each(function(index, item) {
				if ($(this).val() == $scope.backNode) {
					isLegality = true;
					return false;
				}
			});
			if (!isLegality) {
				dialogService.fail($filter('translate')('rejected_to_the_node')+"[" + $scope.backNode + "]，"+$filter('translate')('contact_administrator'));
				return false;
			}

		} else if ($scope.rejectMode == "reject" && $scope.data.destination == "" && $("input[showDestination='true']:checked").length == 1) {
			dialogService.fail($filter('translate')('please_select_the_node_that_is_rejected'));
			return false;
		}
		var msg = $filter('translate')('are_you_sure_you_want_to_reject_it');
		dialogService.confirm(msg).then(function(){
			var index = layer.load(0, {shade: false});
			baseService.post('${bpmRunTime}/runtime/task/v1/complete',$scope.data).then(function(rep){
				layer.close(index);
				if(rep.state){
					$scope.closeEdit();
					dialogService.success(rep.message);
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
	
	$scope.isContains = function(base, value){
		return base.indexOf(value) != -1;
	}

}

function taskDueTimeEditCtrl($scope, baseService, dialogService,$filter){
	$scope.taskId = $scope.pageParam.taskId;
	$scope.className = "progress-bar-success";
	$scope.percent = 0;
	$scope.progress = "";
	
	$scope.addRow=function(classVar){
		$scope.data[classVar +"List"].push(angular.copy(obj[classVar]))
	}
	
	$scope.$on("beforeSaveEvent",function(ev,data){
		if($scope.data.addDueTime==0){
			data.pass = false;
            dialogService.warn($filter('translate')('increase_task_time_cannot_be_0'));
		}
	});
	
	$scope.$on("afterLoadEvent",function(ev,data){
		data.addDueTime = 0;
		// className progress
		 $scope.className = "progress-bar-success";
  		 var percent = (data.dueTime - data.remainingTime)*100/data.dueTime;
  		 $scope.percent = parseFloat(percent.toFixed(2));
  		 if(25<$scope.percent&&$scope.percent<=50){
  			 $scope.className = " progress-bar-info";
  		 }
  		 if(50<$scope.percent&&$scope.percent<=75){
  			 $scope.className = "progress-bar-warning";
  		 }
  		 if(75<$scope.percent){
  			 $scope.className = "progress-bar-danger";
  		 }
  		 if(percent>100){
  			 $scope.percent = 100;
  		 }
  		$scope.percent = $scope.percent + "%";
		
  		$scope.data.fileId = "";
  		$scope.data.remark = "";
	});
	
	$scope.$watch('data.addDueTime',function(newValue, oldVlaue){
		if(newValue){
			baseService.get("${bpmRunTime}/runtime/bpmTaskDueTime/v1/getExpirationDate?id="+$scope.data.id+"&addDueTime="+newValue).then(function(data){
				$scope.expirationDate2 = data;
			});
		}
	});
	
	$scope.pageSure = function(){
		return baseService.post("${bpmRunTime}/runtime/bpmTaskDueTime/v1/save",JSON.stringify($scope.data));
	}
}


function taskCommuCtrl($scope, baseService, dialogService,$filter){
	$scope.data = {};
	$scope.data.taskId = $scope.pageParam.taskId;
	$scope.type = $scope.pageParam.type;
	$scope.selectUsers = [];
	baseService.get("${bpmRunTime}/runtime/task/v1/handlerTypes").then(function(rep){
		$scope.handlerTypes = rep;
	});
	var url = "${bpmRunTime}/runtime/task/v1/getTaskCommu?taskId="+$scope.data.taskId;
	baseService.get(url).then(function(rep){
		$scope.commuReceivers = rep.commuReceivers;
	});
	
	$scope.saveCommu = function(){
		if(!$scope.data.userId) {
			dialogService.warn($filter('translate')('processMatters_please_select_personnel'));
			return;
		}
		if(!$scope.data.messageType){
			dialogService.warn($filter('translate')('processMatters_messageType_msg'));
			return ;
		}
		if(!$scope.data.opinion){
			dialogService.warn($filter('translate')('communication_content_cannot_be_empty'));
			return ;
		}
		var msg = $filter('translate')('are_you_sure_to_initiate_communication');
		dialogService.confirm(msg).then(function(){
			var index = layer.load(0, {shade: false});
			baseService.post('${bpmRunTime}/runtime/task/v1/communicate',$scope.data).then(function(rep){
				layer.close(index);
				if(rep.state){
					$scope.closeEdit();
					dialogService.success(rep.message);
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

function feedBackCtrl($scope, baseService, dialogService,$filter){
	$scope.data = {};
	$scope.data.taskId = $scope.pageParam.taskId;
	baseService.get("${bpmRunTime}/runtime/task/v1/handlerTypes").then(function(rep){
		$scope.handlerTypes = rep;
	});
	var url = "${bpmRunTime}/runtime/task/v1/getTaskCommu?taskId="+$scope.data.taskId;
	baseService.get(url).then(function(rep){
		$scope.taskCommu = rep.taskCommu;
	});
	
	$scope.feedBack = function(){
		if(!$scope.data.messageType){
			dialogService.warn($filter('translate')('processMatters_messageType_msg'));
			return ;
		}
		var msg = $filter('translate')('are_you_sure_you_want_to_feedback');
		var params = {};
		var currentUserInfo = $.parseJSON(window.sessionStorage['ngStorage-currentUser']);
		params.account = currentUserInfo.account;
		params.taskId = $scope.data.taskId;
		params.opinion = $scope.data.opinion;
		params.notifyType = $scope.data.messageType;
		params.actionName = "commu";
		dialogService.confirm(msg).then(function(){
			var index = layer.load(0, {shade: false});
			baseService.post('${bpmRunTime}/runtime/instance/v1/doNext',params).then(function(rep){
				layer.close(index);
				if(rep.state){
					$scope.closeEdit();
					dialogService.success(rep.message);
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

function toEndProcessCtrl($scope, baseService, dialogService,$filter){
	$scope.data = {};
	$scope.data.taskId = $scope.pageParam.taskId;
	baseService.get("${bpmRunTime}/runtime/task/v1/handlerTypes").then(function(rep){
		$scope.handlerTypes = rep;
	});
	
	$scope.toEndProcess = function(){
		if(!$scope.data.messageType){
			dialogService.warn($filter('translate')('processMatters_messageType_msg'));
			return ;
		}
		if(!$scope.data.endReason){
			dialogService.warn($filter('translate')('please_fill_in_the_reason_for_termination'));
			return ;
		}
		var msg = $filter('translate')('are_you_sure_you_want_to_terminate_the_process');
		var params = {};
		var currentUserInfo = $.parseJSON(window.sessionStorage['ngStorage-currentUser']);
		$scope.data.account = currentUserInfo.account;
		dialogService.confirm(msg).then(function(){
			var index = layer.load(0, {shade: false});
			baseService.post('${bpmRunTime}/runtime/instance/v1/doEndProcess',$scope.data).then(function(rep){
				layer.close(index);
				if(rep.state){
					$scope.closeEdit();
					dialogService.success(rep.message);
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

/**
 * 查看已办事项
 * @param $scope
 * @param baseService
 * @param dialogService
 */
function instanceDetailCtrl($scope, baseService, dialogService, $stateParams,$filter){
	$scope.state = $stateParams.state;

	if(!$stateParams.id){
		dialogService.error($filter('translate')('processMatters_instance_id_must_be_passed_in'));
		return;
	}
	// 流程图懒加载
	$scope.selectImage = function(url){
		$scope.imageUrl = url;
	}
	// 审批历史懒加载
	$scope.selectHistory = function(url){
		$scope.historyUrl = url;
	}
	// 流程实例表单懒加载
	$scope.selectForm = function(url){
		$scope.formUrl = url;
	}
	$scope.instance = {};
	var url = '${bpmRunTime}/runtime/instance/v1/get?id=' + $stateParams.id;
	if('receivedProcess.receiverCopyTo' == $scope.state){
		url = '${bpmRunTime}/runtime/instance/v1/realDetail?cptoReceiverId='+$stateParams.bid+'&id=' + $stateParams.id; 
	}
	// 获取流程实例详情
	baseService.get(url)
	  .then(function(r){
		   $scope.instance = r;
	});
	
}

/**
 * 流程实例表单
 */
function instanceFormCtrl($scope, baseService, dialogService, $stateParams){
	if(!$stateParams.id){
		return;
	}
	$scope.proInstId = $stateParams.id;
	var url = "${bpmRunTime}/runtime/instance/v1/getInstFormAndBO?proInstId=" + $stateParams.id;;
	baseService.get(url).then(function(rep){
		if(rep.result){
			dialogService.error(rep.result);
		}
		else{
			$scope.form = rep.form;
			$scope.data = rep.data;
			$scope.opinionList = rep.opinionList;
			$scope.permission = $scope.$eval(rep.permission);
		}
	});
}

/**
 * 流程图 
 */
function instanceImageCtrl($scope, baseService, dialogService, $stateParams){
	if(!$stateParams.id){
		return;
	}
	
	// 流程节点状态图例
	$scope.legends = [
		{"color": "#FF0000", "title": "待审批"},
		{"color": "#F89800", "title": "提交"},
		{"color": "#FFE76E", "title": "重新提交"},
		{"color": "#00FF00", "title": "同意"},
		{"color": "#C33A1F", "title": "挂起"},
		{"color": "#0000FF", "title": "反对"},
		{"color": "#8A0902", "title": "驳回"},
		{"color": "#FFA500", "title": "驳回到发起人"},
		{"color": "#023B62", "title": "撤销"},
		{"color": "#F23B62", "title": "撤销到发起人"},
		{"color": "#338848", "title": "会签通过"},
		{"color": "#82B7D7", "title": "会签不通过"},
		{"color": "#EEAF97", "title": "人工终止"},
		{"color": "#4A4A4A", "title": "完成"}
	];
	
	$scope.flow = {
		instanceId: $stateParams.id
	};
	$scope.imageBase64s = {};
	
	var url = "${bpmRunTime}/runtime/instance/v1/instanceFlowImage?proInstId="+$scope.flow.instanceId;
	baseService.get(url).then(function(rep){
		$scope.flow = rep;
	});
	
	$scope.getImageBase64 = function(proInstId){
		if($scope.imageBase64s[proInstId]){
			return $scope.imageBase64s[proInstId];
		}
		var imageUrl = "${bpmRunTime}/runtime/instance/v1/getBpmImage?proInstId=" + proInstId;
		var imageBase64 = '';
		$.ajax({
			url:imageUrl,
			type:'GET',
			dataType:'text',
			async:false,
			success:function(data){
				$scope.imageBase64s[proInstId] = data;
				imageBase64 = data;
			}
		})
		return imageBase64;
	}
}


function dueTimeListCtrl($scope, baseService, dialogService){
	$scope.formatterFileId = function(value,row){
		if(!value) return "";
		var jsonArr = jQuery.parseJSON(value);
		var fmtHtml = "";
		$(jsonArr).each(function(idx,obj){
			fmtHtml +=  '<a class="btn  fa-cloud-download" style="margin-top:-7px" ng-onclick="downFile('+obj.id+')" title="下载该文件">'+obj.name+'</a>';
		});
		return fmtHtml;
	}
	
	$scope.downFile = function(id){
		window.location.href= "${system}/system/file/download?id="+id;
	}
	
	$scope.openDetail = function(id){
		dialogService.sidebar("pending-dueTimeGet", {bodyClose: false, width: '40%', pageParam: {id:id, title:title}});
	}
	
	
}

function dueTimeEditCtrl(){
	$scope.data = {};
	$scope.id = $scope.pageParam.id;
	$scope.title = $scope.pageParam.title;
	$scope.detail = function(id){
	if(!id) return;
		var url = "${bpmRunTime}/runtime/bpmTaskDueTime/v1/get?id="+id;
		baseService.get(url).then(function(rep){
			$scope.data = rep;
		});
	}
	$scope.detail($scope.id);
}

function handledCtrl($scope, baseService, dialogService){
	//撤回
	$scope.cancelTaskturn = function(id,subject){
		dialogService.page("task-revoke", {area: ['500px', '270px'],btn:[],pageParam:{id:id,subject:subject,isHandRevoke:true}}); 
	}
}

function completedCtrl($scope, baseService, dialogService){
	$scope.fomatterDuration = function(data){
		return $.timeLag(data);
	}
	
	$scope.toCopyTo = function(id){
		dialogService.page("flow-toForward", {area: ['600px', '315px'],btn:[],pageParam:{proInstId:id,copyToType:1,from:'receivedProcess.completed'}}); 
	}
	
}

function receiverCopyToCtrl($scope, baseService, dialogService){
	
	$scope.showDetail = function(isRead, bId, instId){
		dialogService.alert(isRead+"："+ bId+"："+ instId);
	}
	
	$scope.toCopyTo = function(id){
		dialogService.page("flow-toForward", {area: ['600px', '315px'],btn:[],pageParam:{proInstId:id,copyToType:1,from:'receivedProcess.receiverCopyTo'}}); 
	}
}




/**
 *
 * Pass all functions into module
 */
angular
    .module('receivedProcess', [])
    .controller('pendingCtrl', pendingCtrl)
    .controller('taskToStartCtrl', taskToStartCtrl)
    .controller('taskToAgreeCtrl', taskToAgreeCtrl)
    .controller('dueTimeListCtrl', dueTimeListCtrl)
    .controller('dueTimeEditCtrl', dueTimeEditCtrl)
    .controller('handledCtrl', handledCtrl)
    .controller('completedCtrl', completedCtrl)
    .controller('taskImageCtrl', taskImageCtrl)
    .controller('flowImageCtrl', flowImageCtrl)
    .controller('flowOpinionCtrl', flowOpinionCtrl)
    .controller('toCopyToCtrl', toCopyToCtrl)
    .controller('feedBackCtrl', feedBackCtrl)
    .controller('taskCommuCtrl', taskCommuCtrl)
    .controller('toEndProcessCtrl', toEndProcessCtrl)
    .controller('toDelegateCtrl', toDelegateCtrl)
    .controller('toAddSignCtrl', toAddSignCtrl)
    .controller('toTransCtrl', toTransCtrl)
    .controller('toRejectCtrl', toRejectCtrl)
    .controller('taskDueTimeEditCtrl', taskDueTimeEditCtrl)
    .controller('instanceDetailCtrl', instanceDetailCtrl)
    .controller('instanceFormCtrl', instanceFormCtrl)
    .controller('instanceImageCtrl', instanceImageCtrl)
    .controller('receiverCopyToCtrl', receiverCopyToCtrl);
    