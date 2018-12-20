function uploadCtrl($scope,dialogService,baseService, FileUploader){
	var type = $scope.pageParam.type;
	var	max = $scope.pageParam.max;
	var	size = Number($scope.pageParam.size);
	var showCountMessage=false;
	var sameOrigin = true;
	var url = window.getContext().portal+"/system/file/v1/upload";
	var uploader = $scope.uploader = new FileUploader({
		url : url
	});
	
	if (max && typeof max == 'number') {
		//上传文件数目上限过滤器
		uploader.filters.push({
			name : 'countFilter',
			fn : function(item, options) {
				var result = this.queue.length < max;
				if(!result && !showCountMessage ){
					showCountMessage=true;
					 showMessage("最多只能上传" + max + "个文件");
				};
				return result;
			}
		});
	}
	if (type) {
		type = type.replace(/,/g, '\|');
		var reg = new RegExp("^.*.(" + type + ")$");
		//上传文件的文件类型过滤器
		uploader.filters.push({
			name : 'typeFilter',
			fn : function(item, options) {
				var result = reg.test(item.name);
				!result && (showMessage("文件类型只能是" + type));
				return result;
			}
		});
	}
	if (size && typeof size == 'number') {
		var realSize = size * 1024 * 1024;
		//上传文件的大小过滤器 
		uploader.filters.push({
			name : 'sizeFilter',
			fn : function(item, options) {
				var result = item.size <= realSize;
				!result && (showMessage("单个文件大小不能超过" + size + "M"));
				return result;
			}
		});
	}
	uploader.onSuccessItem = function(fileItem, response) {
		if(response.state){
			var result = parseToJson(response.value);
			fileItem.json = {
				id : result.fileId,
				name : result.fileName,
				size : result.size
			};
		}else{
			dialogService.fail("文件上传失败："+response.message);
		}
	};
	
	uploader.onRemoveItem = function(fileItem){
		if(fileItem.isUploaded){
			var url  = window.getContext().portal+"/system/file/v1/remove";
			baseService.post(url,fileItem.json.id).then(function(){
			},function(data){
				dialogService.fail("删除附件失败");
			});
		}
	}
	
	$scope.pageSure = function(){
		var fileArray = [];
		if($scope.uploader.queue){
			var queue = $scope.uploader.queue;
			for (var i = 0; i < queue.length; i++) {
				if(queue[i].json){
					fileArray.push(queue[i].json);
				}
			}
		}
		return fileArray;
	}
}




angular
.module('system', [])
.controller('uploadCtrl', uploadCtrl);