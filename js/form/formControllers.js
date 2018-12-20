//自定义对话框列表数据查看
function customDialogShowListCtrl($scope, $compile) {
    $scope.SelectArr = [];
    $scope.mapParam = "";
    $scope.conditionParams = [];
    if ($scope.pageParam) {
        if ($scope.pageParam.param != undefined && $scope.pageParam.param != "") {
            var mapParams = JSON.stringify($scope.pageParam.param);
            $scope.mapParam = mapParams.substring(1, mapParams.length - 1);
        }
        $scope.customDialog = $scope.pageParam.customDialog;
        $scope.requestType = $scope.customDialog.requestType?$scope.customDialog.requestType:'POST';
        var conditionfield = JSON.parse($scope.customDialog.conditionfield);
        $scope.conditionParams=conditionfield;
        $scope.comment = "";
        $scope.value = "";
        $scope.showPage = $scope.customDialog.needPage;
        $scope.pageParam.single = $scope.customDialog.selectNum == 1;
        if(conditionfield!=null){
            for (var i = 0; i < conditionfield.length; i++) {
                if (conditionfield[i].defaultType == 1) {
                    $scope.comment = $scope.comment + conditionfield[i].comment + ",";
                    $scope.value = $scope.value + conditionfield[i].field + ",";
                }
            }
        }
        if ($scope.comment != "") $scope.comment = $scope.comment.substring(0, $scope.comment.length - 1);
        if ($scope.value != "") $scope.value = $scope.value.substring(0, $scope.value.length - 1);
        //显示的字段
        $scope.displayfield = JSON.parse($scope.customDialog.displayfield);
        if($scope.customDialog.dsType=='dataSource'){
        	for (var i = 0; i < $scope.displayfield.length; i++) {
                $scope.displayfield[i].field = $scope.displayfield[i].field.toUpperCase();
            }
        }
        $scope.alias = $scope.pageParam.alias;
        $scope.queryUrl = $scope.customDialog.dsType=='dataSource'?'${form}/form/customDialog/v1/getListData?alias='+$scope.alias+'&mapParam='+$scope.mapParam:$scope.customDialog.url;
        $scope.htSelectEvent = function (data) {
            if (data.isSelected) {
                $scope.SelectArr.push(data);
                $scope.SelectArr.unique(function (x, y) {
                    return x.ID_ == y.ID_;
                });
                if ($scope.pageParam.single) {
                    angular.forEach($scope.SelectArr, function (item) {
                        if (item.ID_ != data.ID_) {
                            $scope.removeSelectedArr('SelectArr', item);
                        }
                    });
                }
            } else {
                // remove
                data.isSelected = true;
                $scope.SelectArr.remove(data);
                data.isSelected = false;
            }
        }

        $scope.removeSelectedArr = function (arr, obj) {
            $scope[arr].remove(obj);
            $scope.customDialogDataTable.unSelectRow(obj);
        }

    }
    // 响应对话框的确定按钮，并返回值到父页面

    $scope.pageSure = function () {
        var returnStr = JSON.parse($scope.customDialog.resultfield);
        //拿到返回的字段
        var field = new Array([returnStr.length]);
        var comment = new Array([returnStr.length]);
        var str = [];
        for (var i = 0; i < returnStr.length; i++) {
            field[i] = $scope.customDialog.dsType=='dataSource'?returnStr[i].field.toUpperCase():returnStr[i].field;
            comment[i] = $scope.customDialog.dsType=='dataSource'?returnStr[i].comment.toUpperCase():returnStr[i].comment;
        }
        var s = $scope.customDialogDataTable.selectRow();
        if ($scope.pageParam.single) {
            var temp = "";
            for (var i = 0; i < comment.length; i++) {
                temp += '"' + comment[i] + '":"' + s[0][field[i]] + '",';
            }
            if (temp != "") {
                temp = "{" + temp.substring(0, temp.length - 1) + "}";
            }
            str.push(JSON.parse(temp));
        } else {
            for (var i = 0; i < s.length; i++) {
                var temp = "";
                for (var j = 0; j < comment.length; j++) {
                    temp += '"' + comment[j] + '":"' + s[i][field[j]] + '",';
                }
                if (temp != "") {
                    temp = "{" + temp.substring(0, temp.length - 1) + "}";
                }
                str.push(JSON.parse(temp));
            }
        }

        return str;
    }
}
//自定义对话框树形数据查看
function customDialogShowTreeCtrl($scope, baseService) {
    var name = "";
    var customDialog = {};
    if ($scope.pageParam) {
        $scope.alias = $scope.pageParam.alias;
        customDialog = $scope.pageParam.customDialog;
        var resourcesTree;
        var isMulti = false;
        var idKey = JSON.parse(customDialog.displayfield).id;
        var pIdKey = JSON.parse(customDialog.displayfield).pid;
        name = JSON.parse(customDialog.displayfield).displayName;
        if (customDialog.selectNum != 1) {// 多选
            isMulti = true;
            var str = "";
            if (customDialog.parentCheck == 1) {
                str += "p";
            }
            if (customDialog.childrenCheck == 1) {
                str += "s";
            }
        }
        var setting = {
            data: {
                key: {
                    name: name,
                    title: name
                },
                simpleData: {
                    enable: true,
                    idKey: idKey,
                    pIdKey: pIdKey,
                    rootPId: -1
                }
            },
            view: {
                selectedMulti: isMulti,
                showIconFont: true
            },
            check: {
                enable: isMulti,
                chkboxType: {"Y": str, "N": str}
            },
            callback: {
                onClick: zTreeOnClick
            }
        };
        var mapParam = "";
        if ($scope.pageParam.param != undefined) {
            mapParam = JSON.stringify($scope.pageParam.param);
            mapParam = mapParam.substring(1, mapParam.length - 1);
        }
        var requestType = customDialog.dsType=='dataSource'?'GET':customDialog.requestType?customDialog.requestType:'POST';
        var url = "${form}/form/customDialog/v1/getTreeData?alias=" + $scope.alias + "&mapParam=" + mapParam;
        var paramsObj = {};
        if(customDialog.dsType!='dataSource'){
        	url = customDialog.url;
        	var templatePa = customDialog.dataParam;
        	if(customDialog.conditionfield){
        		var conditions = parseToJson(customDialog.conditionfield);
        		for (var i = 0; i < conditions.length; i++) {
					var con = conditions[i];
					if(requestType == 'POST'){
						if(templatePa){
							templatePa = templatePa.replace(new RegExp("\\{"+con.field+"\\}","g"), con.defaultValue);
						}else{
							paramsObj[con.field] = con.defaultValue;
						}
					}else{
						var ljChar = url.indexOf('?')==-1?'?':'&';
						url = url + ljChar + con.field + '=' + con.defaultValue;
					}
				}
        		if(templatePa){
        			paramsObj = parseToJson(templatePa);
        		}
        	}
        }
        var query = requestType == 'POST'?baseService.post(url,paramsObj):baseService.get(url);
        query.then(function (result) {
            resourcesTree = $.fn.zTree.init($("#resourcesTree"), setting, eval(result));
        });

        function zTreeOnClick() {
            var treeObj = $.fn.zTree.getZTreeObj("resourcesTree");
            var nodes = treeObj.getSelectedNodes();
        }
    }
    $scope.pageSure = function () {
        var treeObj = $.fn.zTree.getZTreeObj("resourcesTree");
        var returnStr = JSON.parse(customDialog.resultfield);
        var field = new Array([returnStr.length]);
        var comment = new Array([returnStr.length]);
        var str = [];
        for (var i = 0; i < returnStr.length; i++) {
            field[i] = returnStr[i].field;
            comment[i] = returnStr[i].comment;
        }
        if (!isMulti) {
            var nodes = treeObj.getSelectedNodes()[0];
            var temp = "";
            for (var i = 0; i < comment.length; i++) {
                temp += '"' + comment[i] + '":"' + nodes[field[i]] + '",';
            }
            if (temp != "") {
                temp = "{" + temp.substring(0, temp.length - 1) + "}";
            }
            str.push(JSON.parse(temp));
        } else {
            var nodes = resourcesTree.getCheckedNodes(true);
            $.each(nodes, function (i, n) {
                var temp = "";
                for (var i = 0; i < comment.length; i++) {
                    temp += '"' + comment[i] + '":"' + nodes[field[i]] + '",';
                }
                if (temp != "") {
                    temp = "{" + temp.substring(0, temp.length - 1) + "}";
                }
                str.push(JSON.parse(temp));
            });
        }
        return str;

    }

}

/**
 *
 * Pass all functions into module
 */
angular
    .module('form', [])
    .controller('customDialogShowTreeCtrl', customDialogShowTreeCtrl)
    .controller('customDialogShowListCtrl', customDialogShowListCtrl);