

function pendingMeetingCtrl($scope, baseService, dialogService){
	
	//关闭事件
	$scope.close = function(){
		dialogService.closeSidebar();
	}
}


function meetingAppointListCtrl($scope, baseService, dialogService,$state,$filter){
	
	var currentFirstDate;
	
	 setDate(new Date());	
     document.getElementById('last-week').onclick = function(){
	        setDate(addDate(currentFirstDate,-7));     
	      };       
     document.getElementById('next-week').onclick = function(){         
        setDate(addDate(currentFirstDate,7));
     };
     
	 $scope.pendingMeeting=function(id){
		 var obj = {'defId':id};
		 $state.go('initiatedProcess.instance-toStart',{ids:$.base64.encode(JSON.stringify(obj),"utf-8")});
	 }
     function setDate (date){ 
		 weekArr=[];
        var week = date.getDay()-1;
        date = addDate(date,week*-1);
        currentFirstDate = new Date(date);
        for(var i = 0;i<7;i++){ 
        	var dateStr=formatDate(i==0 ? date : addDate(date,1));
        	weekArr.push(dateStr);
        }
        loadGrid(weekArr);
      };
      
      function addDate (date,n){    
	        date.setDate(date.getDate()+n);    
	        return date;
	      };

	      
      function formatDate(date){       
        var year = date.getFullYear();
        var month = (date.getMonth()+1)<10?'0'+(date.getMonth()+1):date.getMonth()+1;
        var day = date.getDate()<10?'0'+date.getDate():date.getDate();
        var week = [$filter('translate')('needPendingMeetingList.sunday'),$filter('translate')('needPendingMeetingList.monday'),
			$filter('translate')('needPendingMeetingList.tuesday'),$filter('translate')('needPendingMeetingList.wednesday'),
			$filter('translate')('needPendingMeetingList.thursday'),$filter('translate')('needPendingMeetingList.friday'),
			$filter('translate')('needPendingMeetingList.saturday'),][date.getDay()];
        return year+'-'+month+'-'+day+'|'+week;
      };    
     
	function loadGrid(weekArr) {
		$scope.elArr=[];
		var queryStr="";
		$("#meetingTable").find(".table-body > table").data("hasLinkCompleted", null);
		for(var i=0;i<weekArr.length;i++){
			queryStr+=weekArr[i]+",";
			var el=weekArr[i].split('|')[1].replace("]",'');
			$scope.elArr.push({elName:el,title:weekArr[i].split('|')[0]+' '+el});
		}
		!$scope.$$phase && $scope.$digest();
		if($scope.dataTable){
			$scope.dataTable.addQuery({property: 'weekStr', operation: 'equal', value:queryStr });
			$scope.dataTable.query();
		}else{
			$scope.$on("table:ready", function(t, m){
				  m.addQuery({property: 'weekStr', operation: 'equal', value:queryStr });
				  m.query();
			});
		}
		
	}
}

//ht-fmt-appoint
function htFmtAppoint(baseService,$state){
	return {
		restrict: 'A',
		link: function(scope, element, attrs) { 
			if(attrs.htFmtAppoint !=''){
				var appointList=eval('('+attrs.htFmtAppoint+')');
				var html='';
				for(var i=0,a;a=appointList[i++];){
					if(i!=1) html+="<br/>"
					html+='<a href="#/receivedProcess/instanceDetail/'+a.meetingId+'&meetingManage.appointList" ui-sref="receivedProcess.instanceDetail({id:'+a.meetingId+',state:"meetingManage.appointList"})" >';
					html+= a.meetingName;
					if(a.hostName !='') html+='(' +a.hostName+')';
					html+= a.dateStr+"</a>";
				}
				$(element).html(html);
			}else{
				$(element).on('click',function(){
					var obj = {'defId':attrs.defid};
					$state.go('initiatedProcess.instance-toStart',{ids:$.base64.encode(JSON.stringify(obj),"utf-8")});
				})
			}			
		}
	};
}


/**
*
* Pass all functions into module
*/
angular
   .module('meeting', [])
   .controller('meetingAppointListCtrl', meetingAppointListCtrl)
   .controller('pendingMeetingCtrl', pendingMeetingCtrl)
   .directive('htFmtAppoint',htFmtAppoint);