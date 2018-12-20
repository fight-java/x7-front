//邮箱配置
function mailSettingTypeCtrl($scope, dialogService, baseService ,$filter) {
	$scope.operating = function(id, action) {
		var title = action == "edit" ? $filter('translate')('mailSettingList_edisemc')
				: action == "add" ? $filter('translate')('mailSettingList_adisemc') : $filter('translate')('mailSettingList_vdisemc');
		if (action == "edit" || action == "add") {
			dialogService.sidebar("mail.mailSettingListAdd", {
				bodyClose : false,
				width : '50%',
				pageParam : {
					id : id,
					title : title
				}
			});
			$scope.$on('sidebar:close', function() {// 添加监听事件,监听子页面是否关闭
				$scope.dataTable.query();// 子页面关闭,父页面数据刷新
			});
		} else {
			dialogService.sidebar("mail.mailSettingListDetail", {
				bodyClose : false,
				width : '50%',
				pageParam : {
					id : id,
					title : title
				}
			});
		}
	}
	
	//测试连接
	$scope.testConnect = function(id) {
		var url = "${portal}/mail/mail/mailSetting/v1/test?id=" + id;
		
		baseService.post(url)
				   .then(function(rep) {
					    if(rep && rep.state) {
							dialogService.success($filter('translate')('mailSettingList_conSuccess') || rep.message);
						}else{
							dialogService.fail($filter('translate')('mailSettingList_testConfailed') || rep.message);
						}
				   });
	}

	// 设为默认
	$scope.setDefault = function(id) {
		var url = "${portal}/mail/mail/mailSetting/v1/setDefault?id=" + id;
		baseService.post(url);
	}
}

// 邮箱配置编辑
function mailSettingEditTypeCtrl($scope, dialogService, baseService ,$filter) {
	$scope.data = {};
	$scope.id = $scope.pageParam.id;
	$scope.title = $scope.pageParam.title;
	$scope.isOriginPwd = false;

	// 初始化值
	if (!$scope.id) {
		$scope.data.mailType = 'pop3';
		$scope.data.validate = 1;
		$scope.data.isHandleAttach = 1;
	}

	// 自动添加端口
	$scope.showInfos = function() {
		if ($scope.data.mailAddress != '') {
			var address = $scope.data.mailAddress;
			var type = $scope.data.mailType;
			var s = address.substring(address.indexOf('@') + 1,
					address.length + 1).trim();
			if (type == 'pop3') {
				$scope.data.smtpHost = 'smtp.' + s;
				$scope.data.popHost = 'pop.' + s;
			}
			if (type == 'pop3') {
				if (s == 'gmail.com' || s == 'msn.com' || s == 'live.cn'
						|| s == 'live.com' || s == 'hotmail.com') {
					$scope.data.ssl = 0;
				} else {
					$scope.data.popPort = '110';
					$scope.data.smtpPort = '25';
				}
			} else if (type == 'imap') {
				if (s == 'gmail.com' || s == 'msn.com' || s == 'live.cn'
						|| s == 'live.com' || s == 'hotmail.com') {
					$scope.data.ssl = 0;
				} else {
					$scope.data.popPort = '143';
					$scope.data.smtpPort = '25';
				}
				$scope.data.imapHost = 'imap' + '.' + s;
			}
		}
	}

	// 改变ssl
	$scope.changeSSL = function() {
		if ($scope.data.ssl == '1' && $scope.data.mailType != 'exchange') {
			$scope.data.imapPort = '993';
			$scope.data.smtpPort = '465';
			$scope.data.popPort = '995';
		} else if ($scope.data.mailType != 'exchange') {
			$scope.data.imapPort = '143';
			$scope.data.smtpPort = '25';
			$scope.data.popPort = '110';
		}
	}
	
	$scope.$watch("data.password", function(n, o){
		if(n && o && n!==o){
			// 是否修改了密码
			$scope.isOriginPwd = true;
		}
	});

	// 获取详情
	$scope.detail = function(id) {
		if (!id){
			return;
		}
		var url = '${portal}/mail/mail/mailSetting/v1/getJson?id=' + id;
		baseService.get(url).then(function(rep) {
			$scope.data = rep;
		});
	}

	$scope.detail($scope.id);

	// 保存事件
	$scope.save = function() {
        if(!$scope.data.mailAddress){
            dialogService.fail($filter('translate')('mailSettingList_pfiteaf'));
            $("#mailAddress").focus();
            return false;
        }
        if(!$scope.data.id && !$scope.data.password){
            dialogService.fail($filter('translate')('mailSettingList_pfitepf'));
            $("#password").focus();
            return false;
        }
		var url = "${portal}/mail/mail/mailSetting/v1/save?isOriginPwd=" + $scope.isOriginPwd;
		baseService.post(url, $scope.data).then(function(rep) {
			if (rep && rep.state) {
				dialogService.success(rep.message).then(function() {
					$scope.close();
				});
			} else {
				dialogService.fail(rep.message || $filter('translate')('sysIndexMyLayout_saveFailure'));
			}
		});
	}

	// 测试连接
	$scope.testConnect = function() {
		if(!$scope.data.mailAddress){
			dialogService.fail($filter('translate')('mailSettingList_pfiteaf'));
			$("#mailAddress").focus();
			return false;
		}
		if(!$scope.data.id && !$scope.data.password){
			dialogService.fail($filter('translate')('mailSettingList_pfitepf'));
			$("#password").focus();
			return false;
		}
		
		var url = "${portal}/mail/mail/mailSetting/v1/test?isOriginPwd=" + $scope.isOriginPwd;
		
		baseService.post(url, $scope.data)
				   .then(function(rep) {
					    if(rep && rep.state) {
							dialogService.success($filter('translate')('mailSettingList_conSuccess') || rep.message);
						}else{
							dialogService.fail($filter('translate')('mailSettingList_testConfailed') || rep.message);
						}
				   });
	}
	
	// 关闭事件
	$scope.close = function() {
		dialogService.closeSidebar();
	}
}

// 邮箱联系人
function mailLinkmanTypeCtrl($scope, dialogService, baseService  ,$filter) {
	$scope.operating = function(id, action) {
		var title = action == "edit" ? $filter('translate')('mailLinkmanList_editMailboxContacts') : action == "add" ? $filter('translate')('mailLinkmanList_addMailboxContacts')
				: $filter('translate')('mailLinkmanList_viewtMailboxContacts');
		if (action == "edit" || action == "add") {
			dialogService.sidebar("mail.mailLinkmanListEdit", {
				bodyClose : false,
				width : '50%',
				pageParam : {
					id : id,
					title : title
				}
			});
			$scope.$on('sidebar:close', function() {// 添加监听事件,监听子页面是否关闭
				$scope.dataTable.query();// 子页面关闭,父页面数据刷新
			});
		} else {
			dialogService.sidebar("mail.mailLinkmanListDetail", {
				bodyClose : false,
				width : '50%',
				pageParam : {
					id : id,
					title : title
				}
			});
		}
	}
}

// 联系人添加编辑
function mailLinkmanEditCtrl($scope, dialogService, baseService ,$filter) {
	$scope.data = {};
	$scope.id = $scope.pageParam.id;
	$scope.title = $scope.pageParam.title;
	$scope.detail = function(id) {
		if (!id)
			return;
		var url = "${portal}/mail/mail/mailLinkman/v1/getJson?id=" + id;
		baseService.get(url).then(function(rep) {
			$scope.data = rep;
		});
	}

	// 编辑
	$scope.detail($scope.id);
	// 保存
	$scope.save = function() {
        if($scope.data.linkName==null || $scope.data.linkName==''){
            dialogService.fail($filter('translate')('mailLinkmanList_tcncnbe'));
            return;
        }else if($scope.data.linkAddress==null || $scope.data.linkAddress==''){
            dialogService.fail($filter('translate')('mailLinkmanList_cacnbe'));
            return;
        }
        $scope.data.sendTime = $("#sampleDate").val();
	    var url = "${portal}/mail/mail/mailLinkman/v1/save";
		baseService.post(url, $scope.data).then(function(rep) {
			if (rep || rep.state) {
				dialogService.success(rep.message).then(function() {
					$scope.close();
				});
			} else {
				dialogService.fail(rep.message || $filter('translate')('sysIndexMyLayout_saveFailure'));
			}
		});
	}

	// 关闭事件
	$scope.close = function() {
		dialogService.closeSidebar();
	}
}

// 邮箱邮件
function mailListCtrl($scope, $state, baseService, dialogService, $timeout ,$filter) {
	$scope.isTreeExpandAll = true;
	$scope.type = "";
	$scope.mailSetId="";
	$scope.defaultTypeNodeId = "";
	$scope.currentSetId = '';
	$scope.treeData = [];
	
	//树配置
	$scope.treeConfig = {
			data: {
				callback: {
					beforeCollapse: false
				},
				key : {
					name: "nickName",
					title: "nickName"
				},
				simpleData: {
					enable: true,
					idKey: "id",
					pIdKey: "parentId",
					rootPId: 0,
					
				},
				check: {
					enable: true
				}
			},
			view: {
				selectedMulti: false,
				showLine : false
			}
			
	}
	//加载树事件
	$scope.loadTree = function(){
		//加载树数据
		baseService.get("${portal}/mail/mail/mail/v1/getMailTreeData").then(function(rep) {
			if (!rep) {
				dialogService.fail($filter('translate')('mailSettingList_pleaseAddMailbox'));
			} else {
				for (var i = 0; i < rep.length; i++) {
					var c = rep[i];
					if(c.isDefault==1){
						$scope.mailSetId = c.id;
						for(var j=0,m;m=c.children[j++];){
							if(m.types===1){
								$scope.defaultTypeNodeId = m.id;
							}
						}
					}
				}
				$scope.treeData = rep;
				if(rep && rep.length>0){
					$scope.currentSetId = rep[0].id;
				}
				$scope.initQuery();
			}
		});
	}
	
	$scope.initQuery = function(){
		$scope.type=1;
		$timeout(function(){
			var currentNode = $scope.treeInstance.getNodeByParam("id", $scope.defaultTypeNodeId);
			if(currentNode){
				$scope.treeInstance.selectNode(currentNode);
			}
			$scope.dataTable.addQuery({property: 'setId', operation: 'equal', value: $scope.mailSetId});
			$scope.dataTable.addQuery({property: 'type', operation: 'equal', value: 1});
			$scope.dataTable.query();
		}, 100);
	}
	
	//加载树
	$scope.loadTree();
	
	//点击事件
	$scope.tree_click = function(e, n, i){
		$("#meetingTable").find(".table-body > table").data("hasLinkCompleted", null);
		$scope.type = n.types;
		$scope.setCurrentSetId(n);
		if(!n.types){
			return false;
		}
		else{
			$scope.dataTable.addQuery({property: 'setId', operation: 'equal', value: n.parentId});
			$scope.dataTable.addQuery({property: 'type', operation: 'equal', value: $scope.type});
			$scope.dataTable.query();
		}
	}
	
	$scope.setCurrentSetId = function(node){
		if(node.hasOwnProperty('mailAddress')){
			$scope.currentSetId = node.id;
		}else{
			$scope.currentSetId = node.parentId;
		}
	}
	
	//监听事件
	$scope.$on("dataTable:query:reset", function(t, d){
		if(d.name!==$scope.dataTable.name){
			return;
		}
		$scope.initQuery();
	});
	
	//操作
	$scope.operating = function(id, action) {
		var type = document.getElementById('types').value;
		if(type==""){
			type="1";
		}
		if(action=="add"){
			$state.go('mail.mailListSend', {setId: id});
		} else {
			$state.go('mail.mailListDetail', {id:id, type:type});
		}
	}
	
	
	//发送
	$scope.send = function(id,action) {
		if (!id)
			return;
		var url = "${portal}/mail/mail/mail/v1/getJson?id=" + id;
		baseService.get(url).then(function(rep) {
			$scope.data = rep;
			$scope.submit(action);
		});
	}
	
	$scope.submit = function(action){
		$scope.data.type = action;
		$scope.data.isReply = 0;
		var index = layer.load(0, {shade: false});
		baseService.post("${portal}/mail/mail/mail/v1/send", $scope.data).then(function(rep){
			layer.close(index);
			if (rep || rep.state) {
				dialogService.success($filter('translate')('mailList_sendSuccessfull') || rep.message);
				$scope.loadTree();
				$scope.dataTable.query();
			} else {
				dialogService.fail(rep.message);
			}
		});
	}
	
	
	
	
	//删除
	$scope.remove = function(){
		 var s = "";
		 $.each($('input:checkbox:checked'),function(){
			 if($(this).val()!="on"){
				 s += $(this).val()+",";
			 }
         });
		var type = document.getElementById('types').value;
		if(type==""){
			type="1";
		}
		var url = "${portal}/mail/mail/mail/v1/remove?ids="+s+"&&type="+type;
		dialogService.confirm($filter('translate')('confirm_delete')).then(function(){
			baseService.get(url).then(function(rep){
				if(rep && rep.state){
					dialogService.success(rep.message).then(function() {
						$scope.loadTree();
						$scope.dataTable.query();
					});
				}else{
					dialogService.fail(rep.message);
				}
			});
		});
	}
	
	//同步邮件
	$scope.sysnc = function(id){
		// 收取所有邮箱账号的邮件
		if(!id){
			
		}
		else{
			var index = layer.load(0, {shade: false});
			var url = "${portal}/mail/mail/mail/v1/sync?id="+id;	
			baseService.post(url).then(function(rep){
				layer.close(index);
				if(rep && rep.state){
					dialogService.success(rep.message).then(function() {
						//加载树
						$scope.loadTree();
						$scope.dataTable.query();
					});
				}else{
					dialogService.fail(rep.message);
				}
			});
		}
	}
}

function mailGetCtrl($scope, $stateParams, $state, dialogService, baseService, context ,$filter){
	$scope.id = $stateParams.id;
	$scope.type = $stateParams.type || "1";
	$scope.data = {};
	$scope.detail = function(id) {
		if (!id){
			return;
		}
		var url = "${portal}/mail/mail/mail/v1/getJson?id=" + id;
		baseService.get(url).then(function(rep) {
			if(rep.senderAddress){
				$scope.data.sender = $scope.buildMailer(rep.senderAddress, rep.senderName);
			}
			if(rep.receiverAddresses){
				$scope.data.receiver = $scope.buildMailer(rep.receiverAddresses, rep.receiverName);
			}
			if(rep.copyToAddresses){
				$scope.data.copyTo = $scope.buildMailer(rep.copyToAddresses, rep.copyToName);
			}
            if(rep.content){
            	$scope.data.content = $.base64.decode(rep.content, "utf-8");
            }
            $scope.data.id = rep.id;
            $scope.data.subject = rep.subject;
            $scope.data.sendDate = rep.sendDate;
            $scope.data.attachments = rep.mailAttachments;
		});
	}
	
	//删除
	$scope.remove = function(){
		var url = "${portal}/mail/mail/mail/v1/remove?&type="+$scope.type+"&ids=" + $scope.id;
		dialogService.confirm($filter('translate')('confirm_delete')).then(function(){
			baseService.get(url).then(function(rep){
				if(rep && rep.state){
					dialogService.success(rep.message).then(function() {
						$state.go("mail.mailList");
					});
				}else{
					dialogService.fail(rep.message);
				}
			});
		});
	}
	
	$scope.download=function(id){
		var contexts = context();
		var portal=contexts.portal;
		var url = portal+"/system/file/v1/downloadFile?fileId="+id;
		document.location.href=url;
	}
	
	//根据传入的邮箱地址和邮箱名称构建邮箱对象
	$scope.buildMailer = function(addresses, names){
		if(!addresses){
			return null;
		}
		var ary = [],
			addressAry = addresses.split(","),
			nameAry;
		if(names){
			nameAry = names.split(",");
		}
		
		if(addressAry && addressAry.length > 0){
			var pessimism = false;
			// 如果邮箱名称不存在 或者 数量与邮箱地址不匹配，则不使用邮箱名称，只使用邮箱地址
			if(!nameAry || nameAry.length!=addressAry.length){
				pessimism = true;
			}
			for(var i=0;i<addressAry.length;i++){
				if(pessimism){
					ary.push({name: addressAry[i], address: addressAry[i]});
				}
				else{
					ary.push({name: nameAry[i], address: addressAry[i]});
				}
			}
		}
		return ary;
	}
	
	$scope.detail($scope.id);
	
	//关闭
	$scope.close = function(){
		$state.go("mail.mailList");
	}
}

// 邮件编辑
function mailEditCtrl($scope, $stateParams, $state, dialogService, baseService ,$filter) {
	$scope.data = {};
	$scope.treeData = [];
	$scope.setId = $stateParams.setId;
	$scope.mailSettingList = {};
	$scope.data.receiverAddresses = "";
	$scope.data.copyToAddresses = "";
	$scope.data.bcCAddresses = "";
	var focusFiled='';
	//$scope.id = $stateParams.id;
    $scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        showCursorWhenSelecting: true
    };
	if($scope.setId!=null || $scope.setId!=''){
		var url = "${portal}/mail/mail/mail/v1/getJson?id=" + $scope.setId;
		baseService.get(url).then(function(rep) {
			$scope.data = rep;
		});
	}
    $scope.editorConfig = {
		toolbars : [['source']],
		initialFrameHeight: 250,
		focus : true
	};
	//获取发送人地址
	baseService.get("${portal}/mail/mail/mail/v1/getMailTreeData").then(function(rep) {
		$scope.mailSettingList = rep;
		for (var i = 0; i < rep.length; i++){
			if(rep[i].isDefault==1){
				$scope.data.senderAddress=rep[i].mailAddress;
				$(".selectload").find("option[value='"+rep[i].mailAddress+"']").attr("selected",true);
			}
		}
		if(rep && rep.length>0 && $scope.setId){
			for (var i = 0; i < rep.length; i++){
				if($scope.setId==rep[i].id){
					$scope.data.senderAddress = rep[i].mailAddress;
					break;
				}
			}
		}
	});
	
	$scope.memoryAddresses=[];
	baseService.post("${portal}/mail/mail/mailLinkman/v1/listJson",{pageBean:{page: 1, pageSize: 3}}).then(function(rep) {
		$scope.memoryAddresses = rep.rows;
	});	
	
	
	//加载树
	$scope.loadTree = function(condition){
		$scope.treeData = [];
		baseService.get("${portal}/mail/mail/mailLinkman/v1/getMailLinkmanData?condition="+condition).then(function(rep) {
			$scope.treeData = rep;
		});	
		
		$("input[address='true']").focus(function(){
			focusFiled=$(this).attr('ng-model').split(".")[1];
		}).blur(function(){
			setTimeout(function(){
				focusFiled='';
			}, 200);
		});
	}
	
	$scope.loadTree();
	
	//左键点击
	$scope.tree_click = function(e, i, n){
		if(focusFiled==''){
			dialogService.fail($filter('translate')('mailSettingList_pctaywtfi'));
			 return;
		}
		var address=n.linkAddress;
		address=address.substring(address.indexOf('(')+1,address.indexOf(')'));
		if(!$scope.data[focusFiled] || $scope.data[focusFiled]==''){
			$scope.data[focusFiled]=address;
		}else{
			var arrtemp=$scope.data[focusFiled].split(',');
			for(var i=0;i<arrtemp.length;i++){
				if(arrtemp[i]==address){
					 break;
				}else{
					if(i==arrtemp.length-1){
						$scope.data[focusFiled]+=","+address;
					}
				}
			}
		}
		$scope.$apply();
	}
	
	// 右键菜单点击前事件
	$scope.beforeRightClick = function(treeNode){
		$scope.contextMenu = [$filter('translate')('mailSettingList_delTheContact')];
	}
	
	// 点击某个右键菜单项
	$scope.menuClick = function(menu, treeNode){
		var url = "${portal}/mail/mail/mailLinkman/v1/remove?ids="+treeNode.id;
		dialogService.confirm($filter('translate')('confirm_delete')).then(function(){
			baseService.remove(url).then(function(rep) {
				if(rep && rep.state){
					dialogService.success(rep.message).then(function() {
						$scope.loadTree();
					});
				}else{
					dialogService.fail(rep.message);
				}
			});
		}, function(){
		});
	}

	//树配置
	$scope.treeConfig = {
			data: {
				callback: {
					beforeCollapse: false
				},
				key : {
					name: "linkAddress",
					title: "linkName"
				},
				simpleData: {
					enable: true,
					idKey: "id",
					pIdKey: "parentId",
					rootPId: 0,
					
				}
				
			},
			view: {
				selectedMulti: false,
				showLine : false
			}
			
	}
	

	// 保存到草稿
	$scope.send = function(action) {
		var url = "";
		baseService.post(url, $scope.data).then(function(rep) {
			if (rep && rep.state) {
				dialogService.success(rep.message).then(function() {
							 $scope.close(); 
				});
			} else {
				dialogService.fail(rep.message);
			}
		});
	}
	
	 //重 置
	$scope.reset=function() {
		$scope.data='';
	}
	
	var s = [];
	var m = []
	var q = [];
	//打开联系人列表
	$scope.selectLinkMan = function(type) {
		var selector = "user-selector";
		var pageParam = {
				single:false, /*是否单选*/
				data:[]
		};
		if(type=="receiverAddresses"){
			$scope.data.receiverAddresses = "";
			pageParam.data = s;
			dialogService.page(selector, {area:['1120px', '650px'], pageParam: pageParam}).then(function(result){
				s = result;
				for (var i = 0; i < result.length; i++) {
					if(i==result.length-1){
						$scope.data.receiverAddresses += result[i].email;
					}else{
						$scope.data.receiverAddresses += result[i].email+",";
					}
				}
			});
		}else if(type=="copyToAddresses"){
			$scope.data.copyToAddresses = "";
			pageParam.data = m;
			dialogService.page(selector, {area:['1120px', '650px'], pageParam: pageParam}).then(function(result){
				m = result;
				for (var i = 0; i < result.length; i++) {
					if(i==result.length-1){
						$scope.data.copyToAddresses += result[i].email;
					}else{
						$scope.data.copyToAddresses += result[i].email+",";
					}
				}
			});
		}else{
			$scope.data.bcCAddresses = "";
			pageParam.data = q;
			dialogService.page(selector, {area:['1120px', '650px'], pageParam: pageParam}).then(function(result){
				q = result;
				for (var i = 0; i < result.length; i++) {
					if(i==result.length-1){
						$scope.data.bcCAddresses += result[i].email;
					}else{
						$scope.data.bcCAddresses += result[i].email+",";
					}
				}
			});
		}
	}
	
	//发送
	$scope.sendMail = function(action) {
		if(!$scope.data.senderAddress){
			dialogService.fail($filter('translate')('mailSettingList_psts'));
			return;
		}
		if(!$scope.data.receiverAddresses){
			dialogService.fail($filter('translate')('mailSettingList_pfitaea'));
			return;
		}
		if(!$scope.data.subject){
			dialogService.fail($filter('translate')('mailSettingList_pfitet'));
			return;
		}
		if(!$scope.data.content){
			dialogService.fail($filter('translate')('mailSettingList_pfitcote'));
			return;
		}
		$scope.submit(action);
	}
	
	$scope.submit = function(action){
		$scope.data.type = action;
		$scope.data.isReply = 0;
		var index = layer.load(0, {shade: false});
		baseService.post("${portal}/mail/mail/mail/v1/send", $scope.data).then(function(rep){
			layer.close(index);
			if (rep && rep.state) {
				dialogService.success(rep.message);
				$scope.close(); 
			} else {
				dialogService.fail(rep.message);
			}
		});
	}
	
	//关闭
	$scope.close = function(){
		$state.go("mail.mailList");
	}
}

/**
 *
 * Pass all functions into module
 */
angular.module('mail', []).controller('mailSettingTypeCtrl',
		mailSettingTypeCtrl).controller('mailSettingEditTypeCtrl',
		mailSettingEditTypeCtrl).controller('mailLinkmanTypeCtrl',
		mailLinkmanTypeCtrl).controller('mailLinkmanEditCtrl',
		mailLinkmanEditCtrl).controller('mailListCtrl', mailListCtrl)
		.controller('mailGetCtrl', mailGetCtrl)
		.controller('mailEditCtrl', mailEditCtrl);
