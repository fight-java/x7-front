function chatViewCtrl($scope, dialogService, baseService,mqttService,$rootScope){
	$scope.close = function() {
		dialogService.closeSidebar();
	}
	$scope.sessionList = [];
	$scope.currentSession = {};
	$scope.history = {};
	
	function initSessionList(){
		baseService.post(getContext()['portal']+"/im/imSessionUser/v1/mySessionList","")
    	.then(function(response) {
    		if(response.success){
    			var sessionList = response.imSessionUserList
    			$scope.users = response.users;
    			for(var i = 0 ; i < sessionList.length ; i++){
        			var unread = mqttService.getUnread(sessionList[i].sessionCode);
        			if(unread != 0){
        				sessionList[i].unread = unread;
        			}
        		}
        		$scope.sessionList = sessionList;
    		}else{
    			dialogService.fail(response.message || "初始化失败!");
    		}
    	});	
	}
	
	//选择用户发起单聊
	$scope.selectP2PUser=function(){
		dialogService.page('user-selector', {area:['1120px', '650px'], pageParam: {single:true}})
		 .then(function(result){
			 if(result && result.length > 0){
				 creatNewSession(result[0].account,'p2p');
			 }
		 });
	}
	
	//选择用户发起群聊
	$scope.selectTeamUser=function(){
		dialogService.page('user-selector', {area:['1120px', '650px'], pageParam: {single:false}})
		 .then(function(result){
			 if(result && result.length > 0){
				 var userArray = [];
				 for(var i = 0 ; i < result.length ;i++){
					 userArray.push(result[i].account)
				 }
				 creatNewSession(userArray.join(","),"team");
			 }
		 });
	}
	
	function creatNewSession(userStr,scene){
		baseService.post(getContext()['portal']+"/im/imMessageSession/v1/createSession?userStr="+userStr+"&scene="+scene,"")
    	.then(function(response) {
    		if(response.success){
    			baseService.post(getContext()['portal']+"/im/imSessionUser/v1/mySessionList",{sessionCode:response.imMessageSession.code})
    	    	.then(function(response) {
    	    		var list = response.imSessionUserList.concat($scope.sessionList);
    	    		$scope.sessionList = list;
    	    		$scope.toChat(response.imSessionUserList[0]);
    	    	});	
    		}
    	});	
	}
	
	$scope.toChat = function(session){
		if(!$scope.currentSession.session || session.sessionCode !== $scope.currentSession.session.code){
			$scope.currentSession = {};
			$scope.history = {};
			baseService.get(getContext()['portal']+"/im/imMessageSession/v1/initSession?sessionCode="+session.sessionCode)
	    	.then(function(response) {
	    		if(response.success){
	    			$scope.currentSession=response;
	    			updateUnread(session.sessionCode,true);
	    			queryHistory(session.sessionCode,1);
	    		}else{
	    			dialogService.fail(response.message || "初始化失败!");
	    		}
	    	});	
		}
	}
	
	$scope.loadMoreMessage = function(){
		if($scope.history.page * $scope.history.pageSize < $scope.history.total){
			queryHistory($scope.currentSession.session.code,$scope.history.page + 1);
		}
	}
	
	function queryHistory(sessionCode,page){
		baseService.post(getContext()['portal']+"/im/imMessageHistory/v1/listJson?sessionCode="+sessionCode,{pageBean:{page:page,pageSize:20}})
    	.then(function(response) {
    		if(response){
    			response.rows.reverse();
    			if($scope.history.rows){
    				var newRow = [].concat(response.rows).concat($scope.history.rows);
    				response.rows = newRow;
    				$scope.history = response;
    			}else{
    				$scope.history = response;
    				scrollToBottom();
    			}
    		}
    	});	
	}
	
	$scope.sendMessage = function(){
		if($scope.message){
			if($.isEmpty($scope.currentSession)){
				dialogService.warn("未选中聊天对象");
				return;
			}
			var msg = {
				sessionCode:$scope.currentSession.session.code,
				from:$scope.currentSession.currentUser,
				type:'text',
				messageId:UUIDjs.create(4).hex,
				sendTime:(new Date().getTime() - $rootScope.initAppTime) + $rootScope.initServerTime,
				content:{
					text:$scope.message
				}
			}
			var msgStr = JSON.stringify(msg);
			for(var key in $scope.currentSession.sessionUsers){
				if(key !== $scope.currentSession.currentUser){
					doSendMessage(key,msgStr);
				}
			}
			doSendMessage($scope.currentSession.extraDestination,msgStr)
			$scope.history.rows.push(msg);
			scrollToBottom();
			$scope.message="";
		}
	}
	
	function scrollToBottom(){
		setTimeout('$(".chat-discussion").animate({scrollTop:$(".chat-discussion")[0].scrollHeight})', 50);
	}
	
	$scope.onMessageArrived = function(message){
		var msgJson = JSON.parse(message.payloadString);
		if($scope.mqttClient && $scope.mqttClient.isConnected() && $scope.history.rows && msgJson.sessionCode == $scope.currentSession.session.code){
			$scope.history.rows.push(msgJson);
			$scope.$apply();
			scrollToBottom();
		}else{
			updateUnread(msgJson.sessionCode);
		}
	}
	
	function updateUnread(sessionCode,isRemove){
		//是否是清掉未读数
		if(isRemove){
			mqttService.clearUnread(sessionCode);
			for(var i = 0 ; i < $scope.sessionList.length ; i++){
				if($scope.sessionList[i].sessionCode == sessionCode){
					delete $scope.sessionList[i].unread;
				}
    		}
		}else{
			if(!$scope.currentSession.session || sessionCode != $scope.currentSession.session.code){
				for(var i = 0 ; i < $scope.sessionList.length ; i++){
					if($scope.sessionList[i].sessionCode == sessionCode){
						var unread = mqttService.updateUnread(sessionCode)
						$scope.sessionList[i].unread = unread;
					}
	    		}
			}
		}
		
	}
	
	function doSendMessage(destinationName,msg){
		if($scope.mqttClient && $scope.mqttClient.isConnected()){
			var message = new Paho.MQTT.Message(msg);
			message.destinationName = destinationName;
			$scope.mqttClient.send(message);
		}
	}
	
	initSessionList();
}

function htMessageContent() {
    return {
        restrict: 'A',
        scope: {
        	htMessageContent: '=',
        },
        controller: function ($scope, $element, $attrs) {
        	if($scope.htMessageContent.type == 'text'){
        		var content = typeof $scope.htMessageContent.content == 'string' ? JSON.parse($scope.htMessageContent.content) : $scope.htMessageContent.content;
        		$element.html(content.text);
        	}
        }
    };
}

function chatSessionIcon() {
    return {
        restrict: 'A',
        scope: {
        	chatSessionIcon: '=',
        },
        link: function($scope, element) {
        	var icon = '';
        	if($scope.chatSessionIcon.sessionScene == 'p2p'){
        		if($scope.chatSessionIcon.targetUser){
        			for(var i = 0 ; i < $scope.$parent.users.length ; i++){
        				var user = $scope.$parent.users[i];
        				if($scope.chatSessionIcon.targetUser == user.account && user.photo){
        					element.attr("src",getContext()['portal']+$scope.$parent.users[i].photo);
        				}
        			}
        		}
        	}else{
        		if($scope.chatSessionIcon.chatSessionIcon){
        			element.attr("src",getContext()['portal']+$scope.chatSessionIcon.chatSessionIcon);
        		}
        	}
        }
    };
}
function chatUserIcon() {
    return {
        restrict: 'A',
        scope: {
        	chatUserIcon: '=',
        },
        link: function($scope, element) {
        	if($scope.chatUserIcon){
    			for(var i = 0 ; i < $scope.$parent.users.length ; i++){
    				var user = $scope.$parent.users[i];
    				if($scope.chatUserIcon == user.account && user.photo){
    					element.attr("src",getContext()['portal']+$scope.$parent.users[i].photo);
    				}
    			}
    		}
        }
    };
}

angular.module('im', [])
.controller("chatViewCtrl",chatViewCtrl)
.directive('htMessageContent', htMessageContent)
.directive('chatSessionIcon', chatSessionIcon)
.directive('chatUserIcon', chatUserIcon);
