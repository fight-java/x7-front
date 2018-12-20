//  行程管理 列表
function myScheduleListCtrl($scope, $compile,  baseService,dialogService,$filter) {
	
	$scope.operating = function(id,action){
		if(action == 'get'){
			dialogService.sidebar("myScheduleGet", {bodyClose: false, width: 'calc(100% - 225px)', pageParam: {id:id, title:$filter('translate')('mySchedule.view_itinerary_management'),action:action}});
		}else{
			var title = action == "add" ? $filter('translate')('mySchedule.add_itinerary') : $filter('translate')('mySchedule.edit_itinerary');
			dialogService.sidebar("mySchedule.addSchedule", {bodyClose: false, width: '40%', pageParam: {id:id, title:title,action:action}});
			$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
		         $scope.dataTable.query();//子页面关闭,父页面数据刷新
		     });
		}
	}
	
}

//  行程管理 编辑明细
function myScheduleEditCtrl($scope, $compile, baseService,dialogService,$filter){
	//关闭
	
	$scope.data = {
	}
	
	$scope.close = function(){
		dialogService.closeSidebar();
	}
	$scope.title = $scope.pageParam.title;
	
	if($scope.pageParam.initDate && !$scope.pageParam.id){
		$scope.data.date=$scope.pageParam.initDate;
	}else if(!$scope.pageParam.id){
		$scope.data.date=moment(new Date()).format('YYYY-MM-DD');
	}
	
	
	if($scope.pageParam && $scope.pageParam.id){
		baseService
		.get("${portal}/portal/mySchedule/v1/get/"+$scope.pageParam.id)
		.then(function(response) {
			$scope.data = response;
		});	
	}
	
	function checkInput(){
		if( ! $scope.data.name || $scope.data.name =='') {
			dialogService.warn($filter('translate')('mySchedule.please_enter_the_itinerary_name'));
			return false;
		}
		if(!$scope.data.date || $scope.data.date=='') {
			dialogService.warn($filter('translate')('mySchedule.travel_date_cannot_be_empty'));
			return false;
		}
		if(!$scope.data.startTiem || $scope.data.startTiem=='') {
			dialogService.warn($filter('translate')('mySchedule.start_time_cannot_be_empty'));
			return false;
		}
		if(!$scope.data.endTime || $scope.data.endTime==''){
			 dialogService.warn($filter('translate')('mySchedule.end_time_cannot_be_empty'));
			 return false;
		}
		
		if(new Date($scope.data.date+' '+$scope.data.startTiem).getTime() > new Date($scope.data.date+' '+$scope.data.endTime).getTime()){
			dialogService.warn($filter('translate')('mySchedule.start_time_cannot_be_greater_than_end_time'));
			return false;
		}
		
		return true;
	}
	
	$scope.pageSure = function(){
		if(!checkInput()) return;
		if(new Date().getTime() > new Date($scope.data.date).getTime()){
			dialogService.confirm($filter('translate')('mySchedule.the_selected_date_has_passed_is_it_sure_to_save')).then(function(){
				return baseService.post("${portal}/portal/mySchedule/v1/save",$scope.data);
			});
		}else{
			return baseService.post("${portal}/portal/mySchedule/v1/save",$scope.data);
		}
	}
	
	//保存
	$scope.save = function(){
		if(!checkInput()) return;
		if(new Date().getTime() > new Date($scope.data.date).getTime()){
			dialogService.confirm($filter('translate')('mySchedule.the_selected_date_has_passed_is_it_sure_to_save')).then(function(){
				baseService.post("${portal}/portal/mySchedule/v1/save",$scope.data)
				.then(function(response) {
					if(!response.state){
						dialogService.fail(response.message);
					}else{
						dialogService.success(response.message);
						$scope.close();
					}
			});	
			});
		}else{
			baseService.post("${portal}/portal/mySchedule/v1/save",$scope.data)
			.then(function(response) {
				if(!response.state){
					dialogService.fail(response.message);
				}else{
					dialogService.success(response.message);
					$scope.close();
				}
		});	
		}
		
	}
}

/**
 *
 * Pass all functions into module
 */
angular.module('mySchedule', [])
	.controller('myScheduleEditCtrl', myScheduleEditCtrl)
	.controller('myScheduleListCtrl', myScheduleListCtrl).filter('getTime', function(){
    	var filter = function(input){
    		if(!input || input =='') {
    			return '';
    		}
	        return input.split(' ')[1];
	    };
	    return filter;
    })

