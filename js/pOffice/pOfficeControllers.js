//常用语配置
function approvalItemCtrl($scope, dialogService,$filter){
	$scope.operating = function(id,action){
		var title = action == "edit" ? $filter('translate')('edit_approval') : action == "add" ?  $filter('translate')('add_approval') : $filter('translate')('view_approval');
		if(action=="edit"||action=="add"){
			dialogService.sidebar("pOffice.approvalItemListEdit", {bodyClose: false, width: '60%', pageParam: {id:id, title:title}});
			$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
				$scope.dataTable.query();//子页面关闭,父页面数据刷新
			});
		}else{
			dialogService.sidebar("pOffice.approvalItemListGet", {bodyClose: false, width: '60%', pageParam: {id:id, title:title}});	
		}
  }
}

//常用语编辑
function approvalItemEditCtrl($scope, dialogService, baseService,$filter){
	$scope.data={};
	$scope.data.type = 4;
	$scope.id = $scope.pageParam.id;
	$scope.title = $scope.pageParam.title;
	
	//获取详情
	$scope.detail=function(id){
		if(!id) return;
		var url='${bpmModel}/flow/approvalItem/v1/approvalItemGet?id='+id;
		baseService.get(url).then(function(rep){
			$scope.data = rep;
		});
	}
	
	$scope.detail($scope.id);
	
	//保存事件
	$scope.save = function(){
		var url = "${bpmModel}/flow/approvalItem/v1/save";
		baseService.post(url, $scope.data).then(function(rep){
		if(rep && rep.state){
			dialogService.success(rep.message).then(function(){
			$scope.close();
			});
		}else{
			dialogService.fail(rep.message || $filter('translate')('saveError'));
		}	
		});
	}
	
	//关闭事件
	$scope.close = function(){
		dialogService.closeSidebar();
	}
}

//代理
function agentCtrl($scope, dialogService,$filter){
	
	$scope.formatterAgent = function(value, row){
		if(row.type == "3"){
            return $filter('translate')('proxySettings_msg');
		 }else{
			 return value;
		 }
	}
	
	$scope.operating=function(id, action){
        var title = action == "edit" ? $filter('translate')('proxySettings_edit_agent') : action == "add" ? $filter('translate')('proxySettings_add_agent') : $filter('translate')('proxySettings_view_agent');
        if(action=="edit"||action=="add"){
		dialogService.sidebar("pOffice.agentListEdit", {bodyClose: false, width: '60%', pageParam: {id:id, title:title}});
		$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
	         $scope.dataTable.query();//子页面关闭,父页面数据刷新
	     });
	}else{
		dialogService.sidebar("pOffice.agentListGet", {bodyClose: false, width: '60%', pageParam: {id:id, title:title}});	
	}
  }
}
	
//代理添加编辑
function agentEditCtrl($scope, dialogService, baseService,$filter){
	$scope.data = {};
	$scope.data.type = 2;
	$scope.id = $scope.pageParam.id;
	$scope.title = $scope.pageParam.title;
	$scope.selectUsers = [];
	$scope.detail = function(id){
	if(!id) return;
		var url = "${bpmModel}/flow/agent/v1/agentGet?id="+id;
		baseService.get(url).then(function(rep){
			$scope.data = rep;
		});
	}
	
	//编辑
	$scope.detail($scope.id);
	//保存
	$scope.save = function(){
		var url = "${bpmModel}/flow/agent/v1/save";
		if(!$scope.validateData()){
			return ;
		}
		baseService.post(url, $scope.data).then(function(rep){
			if(rep.state){
				dialogService.success(rep.message).then(function(){
					$scope.close();
				});
			}else{
				dialogService.fail(rep.message || '保存失败');		
			}
		});
	}
	
	$scope.validateData = function(){
		
		if($scope.data.startDate && $scope.data.startDate.constructor.name=='m')$scope.data.startDate=$scope.data.startDate.format('YYYY-MM-DD HH:mm:ss');
		if($scope.data.endDate && $scope.data.endDate.constructor.name=='m')$scope.data.endDate=$scope.data.endDate.format('YYYY-MM-DD HH:mm:ss');
		if(!daysBetween($scope.data.startDate,$scope.data.endDate)){
			dialogService.fail($filter('translate')("mySchedule.start_time_cannot_be_greater_than_end_time"));
            return false;
		}
//		if(currentUserId == $scope.data.agentId){
//			dialogService.fail("代理人不能是本人,请重新选择!");
//			return false;
//		}
		if($scope.data.type == 1){
			if($.isEmpty($scope.data.agentId)){
				dialogService.fail($filter('translate')("proxySettings_the_agent_msg"));
				return false;
			}
				
		}else if($scope.data.type == 2){
			if($.isEmpty($scope.data.agentId)){
				dialogService.fail($filter('translate')("proxySettings_the_agent_msg"));
				return false;
			}
			if(!$scope.data.defList || $scope.data.defList.length<1){
				dialogService.fail($filter('translate')("proxySettings_defList_msg"));
				return false;
			}
		}else if($scope.data.type == 3){//条件代理
			if($.isEmpty($scope.data.flowKey)){
				dialogService.fail($filter('translate')("proxySettings_flowKey_msg"));
				return false;
			}
			if($.isEmpty($scope.data.conditionList) || $scope.data.conditionList.length<1 ){
				dialogService.fail($filter('translate')("proxySettings_conditionList_msg"));
				return false;
			}
		}
		return true;
	}
	
	//关闭事件
	$scope.close = function(){
		dialogService.closeSidebar();
	}
	
	$scope.removeAgentFlow = function($event,agentItem){
		$scope.data.defList.remove(agentItem);
		var tr = $($event.target).parent("td").parent("tr");
		$(tr).remove();
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
			 $scope.data.agentId = userIds.join(",");
			 $scope.data.agent = fullnames.join(",");
		 });
	}
	
	/**
	 * 选择流程定义。
	 */
	function checkExist(name,val,aryChecked){
		for(var i=0;i<aryChecked.length;i++){
			var obj=aryChecked[i];
			if(obj[name]==val) return true;
		}
		return false;
	}
	
	$scope.selectFlows = function(){
		$scope.data.defList = $scope.data.defList || [] ;
		var initData=[];
		for (var i=0,f;f=$scope.data.defList[i++];){
			initData.push({
				defKey:f.flowKey,
				name:f.flowName
			})
		}
		dialogService.page("flow-bpmDefSelector", {
		    title:$filter('translate')("proxySettings_flow_selector"),
		    pageParam: {data:initData}
		 }).then(function(aryDef){
			 for(var i=0;i<aryDef.length;i++){
					var json=aryDef[i];
					var isExist=checkExist("flowKey",json.defKey,$scope.data.defList);
					if(!isExist){
						$scope.data.defList.push({
							flowKey:json.defKey,
							flowName:json.name
						});
					}
			 }
		 });
		
	}
}

function bpmDefSelectorCtrl($scope,baseService,dialogService,ArrayToolService){
	$scope.ArrayTool = ArrayToolService;
    
	$scope.formSelectArr = [];

	// 获取父页面传递过来的值
	if($scope.pageParam && $scope.pageParam.data){
		$scope.formSelectArr = $scope.pageParam.data;
	}

	
	$scope.htSelectEvent = function(data){
		if(data.isSelected){
			// add
			$scope.formSelectArr.push(data);
			$scope.formSelectArr.unique(function(x,y){
				return x.id==y.id;
			});
			if($scope.pageParam && $scope.pageParam.single){
				angular.forEach($scope.formSelectArr, function(item){
					if(item.id!=data.id){
						$scope.removeSelectedArr('formSelectArr', item);
					}
				});
			}
		}else{
			// remove
			data.isSelected = true;
			$scope.formSelectArr.remove(data);
			data.isSelected = false;
		}
	}
	
	$scope.clearSelectedArr = function(arr){
		$scope[arr] = [];
		$scope.dataTable.unSelectRow();
	}
	
	$scope.removeSelectedArr = function(arr,obj){
		$scope[arr].remove(obj);
		$scope.bpmFormTable.unSelectRow(obj);
	}
	
	$scope.pageSure = function(){
		if($scope.pageParam && $scope.pageParam.single) return $scope.formSelectArr[0];
		return $scope.formSelectArr;
	}
	
}


/**
 *
 * Pass all functions into module
 */
angular
    .module('pOffice', [])
    .controller('approvalItemCtrl', approvalItemCtrl)
    .controller('approvalItemEditCtrl', approvalItemEditCtrl)
    .controller('agentCtrl', agentCtrl)
    .controller('bpmDefSelectorCtrl', bpmDefSelectorCtrl)
    .controller('agentEditCtrl', agentEditCtrl);
    