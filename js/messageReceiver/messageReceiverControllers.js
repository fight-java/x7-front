function insideMessageCtrl($scope, baseService, dialogService ,$filter){
	$scope.fomatterReceiveTime = function(value, row, index){
		if (value == null || value == "")
			 return $filter('translate')('insideMessageList_UnreadMessage');
		return value;
	}
	
	$scope.openDetail = function(id, isPlublic, canReply){
		dialogService.sidebar("messageReceiver.insideMessageListGet", {bodyClose: false, width: '60%', pageParam: {id:id}});
		$scope.$on('sidebar:close', function(){//添加监听事件,监听子页面是否关闭
	         $scope.dataTable.query();//子页面关闭,父页面数据刷新
	     });
	}
}

function messageReadCtrl($scope, baseService, dialogService){
	var url='${portal}/innermsg/messageReceiver/v1/get?id='+$scope.pageParam.id;
	baseService.get(url).then(function(rep){
		$scope.sysMessage = rep;
	});
	
	//关闭事件
	$scope.close = function(){
		dialogService.closeSidebar();
	}
}

/**
*
* Pass all functions into module
*/
angular
   .module('messageReceiver', [])
   .controller('insideMessageCtrl', insideMessageCtrl)
   .controller('messageReadCtrl', messageReadCtrl);