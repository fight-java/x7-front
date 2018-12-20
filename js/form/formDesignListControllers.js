/**
 * 业务数据模板预览
 */
function bpmDataTemplatePreviewCtrl($scope,dialogService,$compile,baseService,$rootScope, $timeout, $sce, $state){
	$scope.isPreview = true;
	
	var alias = '';
	if(!$scope.pageParam){
		$scope.isPreview = false;
		var hashArray = $state.current.url.split('/');
		alias = hashArray[hashArray.length-1];
	}else{
		alias = $scope.pageParam.alias;
	}
	baseService.post('${form}/form/dataTemplate/v1/dataList_'+alias, {}).then(function(data){
		if(data.state){
			$scope.html = data.value;
		}else{
			$scope.html = data.message;
		}
	});
	
	 //操作按钮
	$scope.operating = function(templateId,id,action){
		var title = action == "edit" ? "编辑" : action=="get"? "查看":"添加";
        //跳转操作页面
		baseService.get('${form}/form/dataTemplate/v1/editTemplate?id='+templateId).then(function(template){
			var params = {title:title,alwaysClose: true,alias:template.alias, width: '75%', pageParam: {alias:template.alias,id:id,formKey:template.formKey,boAlias:template.boDefAlias,action:action}};
			if(action=='get'){
				params = {btn: ['关闭'], title:title, alwaysClose: true,alias:template.alias, width: '75%', pageParam: {alias:template.alias,id:id,formKey:template.formKey,boAlias:template.boDefAlias,action:action}};
			}
//			if($scope.isPreview){
				dialogService.page("bpmDataTemplateAdd",params).then(function(){
	        		if(action!='get'){
	        			$scope.dataTable.query();
	        		}
	        	});
//			}else{
//				dialogService.sidebar("form.bpmDataTemplateAdd",params);
//			}
			
			
    	});
    }
	
	$scope.toStartFlow = function(id){
		var obj = {'defId':id,'proInstId':''};
		$state.go('initiatedProcess.instance-toStart',{ids:$.base64.encode(JSON.stringify(obj),"utf-8")});
	}
	
	
	$scope.startFlow = function(defId, boAlias, businessKey){
		var index = layer.load(0, {shade: false});
		baseService.post("${bpmRunTime}/runtime/instance/v1/startForm?defId="+defId+"&businessKey="+businessKey+"&boAlias="+boAlias).then(function(data){
			layer.close(index);
			if(data.state){
				dialogService.success(data.message);
				$scope.dataTable.query();
			}else{
				dialogService.fail(data.message);
			}
		});
	}
	
	$scope.exports = function() {
		var table = $scope.dataTable;
		var params = {btn: ['导出','取消'], alwaysClose: true, width: 'calc(100% - 225px)', pageParam: {formKey:alias,page:table.pageOption,query:table.build()}};
		dialogService.page("bpmDataTemplateExport",params);
	};

	//显示子表记录
	$scope.showSubList = function(alias, refId){
		var params = {btn: ['取消'], alwaysClose: true, width: 'calc(100% - 225px)', pageParam: {alias:alias,refId:refId}};
		dialogService.page("receivedProcess.bpmDataTemplateSubList",params);
	}
}

function bpmDataTemplateSubListCtrl($scope,dialogService,$compile,baseService,$rootScope, $timeout, $stateParams, $state){
	$scope.tabs = [];
	$scope.alias = $scope.pageParam.alias;
	$scope.refId = $scope.pageParam.refId;
	$scope.data = {};
	$scope.init = function(){
		if($scope.alias &&$scope.refId){
			baseService.get('${form}/form/form/v1/getSubEntsByFormKey?formKey='+$scope.alias).then(function(ents){
				if(ents){
					$scope.AddTabs(ents);
				}
			});
		}
	}
	$scope.AddTabs = function(ents){
		for(var i=0;i<ents.length;i++){
			var attributeList = ents[i].attributeList;
			/*for(var k=0;k<attributeList.length;k++){
				attributeList[k].fieldName = attributeList[k].fieldName.toUpperCase();
			}*/
			var tab = {title: ents[i].comment,active:false,attributeList:attributeList,comment:ents[i].comment};
			getTableData(ents[i]);
			$scope.tabs.push(tab);
		}
	}
	
	function getTableData(ent){
		$scope.data[ent.comment] = [];
		baseService.get('${form}/form/dataTemplate/v1/getSubData?alias='+ent.name+'&refId='+$scope.refId).then(function(list){
			if(list){
				$scope.data[ent.comment] = list;
			}
		});
	}
	
}
	
function templateHtmlEditCtrl($scope,dialogService,$compile,baseService,$rootScope, $timeout){
	$scope.data = {};
	baseService.get('${form}/form/dataTemplate/v1/editTemplate?id='+$scope.pageParam.id).then(function(template){
		if(template){
			$scope.data = template;
		}
	});
	$scope.editorOptions = {
			lineWrapping : true,
			lineNumbers: true,
			showCursorWhenSelecting: true
	};
	//重新调整高度
	$timeout(function(){
		$("ui-codemirror[ng-model='data.templateHtml']").find('.CodeMirror').css('height',"460px");
		$("ui-codemirror[ng-model='data.templateHtml']").find('.CodeMirror-gutters').css('height',"460px");
	});
	
	$scope.pageSure = function(){
		return $scope.data;
	}
}

function editDataPreviewCtrl($scope,dialogService,$compile,baseService,$rootScope, $timeout, $state, editDataService, ArrayToolService){
	$scope.service = editDataService;
	$scope.ArrayTool = ArrayToolService;
	$scope.alias = $scope.pageParam.alias;
	$scope.formKey = $scope.pageParam.formKey;
	$scope.boAlias = $scope.pageParam.boAlias;
	$scope.id = $scope.pageParam.id;
	$scope.action = $scope.pageParam.action;
	editDataService.init($scope);
	$scope.add = function(path){
		var arr = path.split(".");
		if(arr.length<2)alert("subtable path is error!")
		var subTableName = arr[1].replace("sub_","")
		var tempData = $scope.data[arr[0]].initData[subTableName];
		
		if(!tempData)tempData={};
		var ary = eval("$scope.data." + path); 
		if(!angular.isArray(ary)) ary = [];
		
		ary.push(angular.copy(tempData));
		eval("$scope.data." + path+"=ary");
		!$rootScope.$$phase && $rootScope.$digest();
	};
	
	$scope.remove = function(path,index){
		var ary = eval("($scope.data." + path + ")");
		if(ary&&ary.length>0){
			ary.splice(index,1);
		}
	};
	
	$scope.initSubTableData = function(){
			var initSubTable = [];
			var data = $scope.data;
			$("[type='subGroup'][initdata]").each(function(i,item){
				initSubTable.push($(item).attr("tablename"));
			});
			
			for(var i=0,subTable;subTable=initSubTable[i++];){
				for(var boCode in $scope.data){
					var initData =data[boCode].initData[subTable];
					if(initData &&(!data[boCode]["sub_"+subTable]||data[boCode]["sub_"+subTable].length==0)){
						data[boCode]["sub_"+subTable] = [];
						data[boCode]["sub_"+subTable].push($.extend({},initData));
					}
				}
			}
			!$scope.$$phase&&$scope.$digest();
			
	}
	
	$scope.pageSure = function(){
		return $scope.action!='get'?{state:$scope.boSave()}:true;
	}
	
	$scope.boSave = function(){
		return editDataService.boSave($scope);
	} 
	
	window.setTimeout($scope.initSubTableData,100);
	
	if(window.ngReady){
		window.setTimeout(ngReady,10,$scope);
	}
	
	showResponse = function(responseText){
		var obj = new com.hotent.form.ResultMessage(responseText);
		if (obj.isSuccess()) {
			$.topCall.confirm("提示信息", obj.getMessage()+",是否继续操作", function(rtn) {
				if(rtn){
					var url=location.href.getNewUrl();
					window.location.href =  location.href.getNewUrl();
				}else{
					$.closeWindow();
				}
			});
		} else {
			$.ligerDialog.error(obj.getMessage(),"提示信息");
		}
	}
}

function bpmDataTemplateExportCtrl($scope,dialogService,$compile,baseService,$rootScope, $timeout, $sce, $state, ArrayToolService, $http){
	$scope.formKey = $scope.pageParam.formKey;
	$scope.filterKey = $scope.pageParam.filterKey?$scope.pageParam.filterKey:"";
	$scope.query = $scope.pageParam.query;
	$scope.page = $scope.pageParam.page;
	$scope.param = {};
	$scope.bpmDataTemplate = {};
	$scope.ArrayTool = ArrayToolService;
	
	
	baseService.get('${form}/form/dataTemplate/v1/getJson?formKey='+$scope.formKey).then(function(data){
		$scope.bpmDataTemplate = data;
		$scope.bpmDataTemplate.displayField = parseToJson(data.displayField);
	});
	
	$scope.init = function() {
		$scope.selAllExp=true;
		$scope.param.getType = "page";
	};
	
	$scope.pageSure = function(){
		return $scope.exportData();
	}

	$scope.exportData = function() {
		if(!$scope.param.expField){
			alert("请选择至少一个字段");
			return;
		}
		var expField = $.base64.encode($scope.param.expField,"utf-8");
		var url = getContext().form+'/form/dataTemplate/v1/export?formKey=' + $scope.formKey+'&getType='+$scope.param.getType+'&filterKey='+$scope.filterKey+'&expField='+expField;
		var index = layer.load(0, {shade: false});
		$http({            
			method:'POST',            
			url:url,            
			responseType: "arraybuffer",
			data:$scope.query
		}).success(function ( data )      
			{
				layer.close(index);
				// 这里会弹出一个下载框，增强用户体验            
				var blob = new Blob([data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
				var objectUrl = URL.createObjectURL(blob);//  创建a标签模拟下载            
				var aForExcel = $("<a><span class='forExcel'>下载excel</span></a>").attr("href",objectUrl);
				$("body").append(aForExcel);
				$(".forExcel").click();
				aForExcel.remove();
		}).error(function(data){
			layer.close(index);
			dialogService.fail(data.message);
		});
	};

	$scope.$on("afterLoadEvent", function(event, data) {
		$scope.bpmDataTemplate.displayField = JSON.parse(data.displayField);
	});
}

function templateAddToMenuCtrl($scope,dialogService,$compile,baseService,$rootScope, $timeout, $sce, $state, ArrayToolService, $http){
	$scope.data = {templateAlias:$scope.pageParam.alias};
	$scope.menuList = [];
	
	baseService.get('${portal}/sys/sysMenu/v1/getTree').then(function(data){
		varTree = new ZtreeCreator('varTree'+parseInt(Math.random()*1000), "${portal}/sys/sysMenu/v1/getTree",data).setDataKey({
			name : 'name'
		}).setCallback({
			onClick : $scope.setVariable
		}).makeCombTree("tempTree",455).initZtree({}, -1);
	});
	
	$scope.setVariable = function(event,treeId, node){
		varTree.hideMenu();
		$scope.$apply(function(){
			$scope.parentMenuName = node.name;
			$scope.data.alias = node.alias+'.';
			$scope.data.parentAlias = node.alias;
		});
		
	}
	
	$scope.onChangeAlias = function(){
		var alias = $scope.data.alias;
		if(!isMenuExist(alias)){
			var arr = alias.split(".");
			if(arr.length > 1 && arr[arr.length-1]){
				$scope.data.path = '/'+arr[arr.length-1];
			}else{
				$scope.data.path = '/';
			}
		}
	}
	
	function isMenuExist(alias){
		var isTrue = true;
		$.ajax({
			url:'${portal}/sys/sysMenu/v1/isMenuExistByAlias?alias='+alias,
			type:'GET',
			dataType:'json',
			async:false,
			success:function(data){
				if(data.state){
					isTrue = data.value;
					if(data.value){
						dialogService.fail("该别名已存在，请输入其他别名！");
					}
				}
			}
		})
		return isTrue;
	}
	
	$scope.setActiveParam = function(param,$event){
		var btnOffset =  $($event.target);
		$scope.currentEditParam = param;
		varTree.showMenu($($event.target),btnOffset.position().left+165,btnOffset.position().top+60);
	}
	
	$scope.pageSure = function(){
		if(!$scope.data.parentAlias){
			dialogService.fail("请选择父菜单！");
			return false;
		}
		if(!$scope.data.alias){
			dialogService.fail("请输入别名！");
			return false;
		}
		if(!$scope.data.name){
			dialogService.fail("请输入名称！");
			return false;
		}
		if(!$scope.data.path || $scope.data.path=='/'){
			dialogService.fail("请输入路径！");
			return false;
		}
		if(isMenuExist($scope.data.alias)){
			dialogService.fail("该别名已存在，请输入其他别名！");
			return false;
		}
		return $scope.data;
	}
	
}



/**
 *
 * Pass all functions into module
 */
angular
.module('formDesign', ['eip'])
.controller('bpmDataTemplatePreviewCtrl', bpmDataTemplatePreviewCtrl)
.controller('templateHtmlEditCtrl', templateHtmlEditCtrl)
.controller('editDataPreviewCtrl', editDataPreviewCtrl)
.controller('bpmDataTemplateExportCtrl', bpmDataTemplateExportCtrl)
.controller('templateAddToMenuCtrl', templateAddToMenuCtrl)
.controller('bpmDataTemplateSubListCtrl', bpmDataTemplateSubListCtrl);