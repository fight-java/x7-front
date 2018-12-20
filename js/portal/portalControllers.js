//布局管理
function layoutDesignCtrl($scope, $compile, baseService, dialogService, $stateParams, $timeout, $sce, indexColumnService ,$filter) {
	$scope.layoutTempList = [];
	$scope.columnTempList = [];
	$scope.sysIndexLayout = {};
	$scope.editingField = {};
	$scope.currentInEle = null;
	
	$scope.layouts = [];
	//保存打开页面时的布局；
 	var originalLayouts = [];
	$scope.designHtml = "";
	baseService.get("${portal}/portal/sysIndexMyLayout/v1/design")
	.then(function(response) {
		$scope.sysIndexLayout = response.sysIndexMyLayout;
		$scope.layoutTempList = response.indexLayoutList;
		$scope.columnMap = response.columnMap;
		$scope.parserHtml();
		$timeout(function(){
			$scope.initDrag();
			initItemTooltip();
		}, 100);
	});	
	
	// 解析布局设置的html内容
	$scope.parserHtml = function(){
		if($scope.sysIndexLayout && $scope.sysIndexLayout.designHtml){
			var rows = $scope.getRowsByHtml($scope.sysIndexLayout.designHtml);
			angular.forEach(rows, function(row){
				var layout = $scope.getLayoutTempById($(row).attr("layout-id"));
				if(layout){
					layout.templateHtml =  $sce.trustAsHtml(row.innerHTML);
					$scope.layouts.push(layout);
				}
			});
			originalLayouts = [].concat($scope.layouts);
			!$scope.$$phase&&$scope.$digest();
			$scope.initDrop('.column');
		}
	}
	
	$scope.getRowsByHtml = function(html) {
		var elem = $(html),
			rows = [];
		for(var i=0,c;c=elem[i++];){
			if($(c).hasClass("row")){rows.push(c)}
		}
		return rows;
	}
	
	// 添加布局
	$scope.addLayout = function(item){
		var layoutId = item.attr("layout-id");
		$scope.layouts.push($scope.getLayoutTempById(layoutId));
		!$scope.$$phase&&$scope.$digest();
		$scope.initDrop('.column');
		item.remove();
	}
	
	// 通过id获取布局
	$scope.getLayoutTempById = function(id){
		var layout = null;
		angular.forEach($scope.layoutTempList, function(temp){
			if(temp.id==id){
				layout = angular.copy(temp);
			}
		});
		return layout;
	}
	
	// 初始化拖
	$scope.initDrag = function(){
		$(".dragfrom").each(function (i, el) {
            Sortable.create(el, {
                sort: false,
                group: {
                    name:'advanced',
                    pull: 'clone',
                    put: false
                },
                animation: 150
            });
        });
		$scope.initDrop('.dropto');
	}
	
	//给栏目添加删除按钮
	function initItemTooltip(){
		var $spans = $('#designPanel').find('span[column-alias]');
		$($spans).css('cursor','pointer');
		$($spans).css('paddingLeft','15px');
		$($spans).css('paddingRight','15px');
		$($spans).each(function(){
			initTooltip(this);
		});
		$scope.initDrop('.column');
		$('#designPanel').find('.column').mouseenter(function(e) {     
			$scope.currentInEle = e.srcElement || e.target;;
		})
	}
	
	// 初始化放
	$scope.initDrop = function(ele){
		$(ele).each(function (i, el) {
        	$scope.sort = Sortable.create(el, {
                sort: true,
                group: {
                    name:'advanced',
                    pull: false,
                    put: true
                },
                animation: 150,
                onAdd: function (evt){
                	var item = $(evt.item),
                		target = $(evt.target),
                		layoutId = item.attr("layout-id"),
                		columnAlias = item.attr("column-alias");
                	if(target.hasClass("dropto")){
                		if(layoutId){
                    		$scope.addLayout(item);
                    	}
                		else if(columnAlias){
                			item.remove();
                		}
                	}
                	else{
                		if(layoutId){
                			item.remove();
                		}
                		else if(columnAlias && target.children().length > 1){
                			item.remove();
                		}
                	}
                	initItemTooltip();
                },
                onSort: function(evt){
                },
                onEnd: function (evt) {
                	$timeout(function(){
                		if($scope.currentInEle && evt.from){
                			var $from = $(evt.from);
                			var $to = $($scope.currentInEle);
                			if($to.length==1 && $from.length==1 && !($to.position().top==$from.position().top&&$to.position().left==$from.position().left)){
                				$to = $to[0].tagName=='SPAN'? $($to).parent():$to;
                				$from = $from[0].tagName=='SPAN'? $($from).parent():$from;
                				if($from.hasClass("column")){
                					var $fromSpan = $from.find('span[column-alias]');
                            		var $toSpan = $to.find('span[column-alias]');
                            		$from.children().remove();
                            		if($toSpan.length>0){
                            			$from.append($toSpan);
                            			$to.children().remove();
                            		}
                            		$to.append($fromSpan);
                            		initItemTooltip();
                				}
                			}
                		}
                	},100);
                },
                onMove: function (evt, originalEvent) {
                	$('#fieldTooltip').remove();
                }
            });
        });
	}
	
	function initTooltip(item){
    	var $span = $(item);
    	$span.hover(function(){
    		var $item = $span.parent();
    		var rightWidth = $span.position().left-20;
			var obj = $item.find('#fieldTooltip');
			if(obj.length<1){
				var divHtml = $('<div id="fieldTooltip" style="position:absolute;top:0px;right:'+rightWidth+'px;z-index: 99;"></div>');
				var baseBtn = '<a  class="btn btn-danger fa fa-trash" title="移除" ng-click="removeColumnField($event)"></a>'; //创建删除按钮 
				divHtml.append(baseBtn);
				$span.append($compile(divHtml)($scope)); //添加到页面中 
                $("#fieldTooltip").show("fast"); //设置提示框的坐标，并显示 
			}
    	},function(){
    		$('#fieldTooltip').remove();
    	})
    }
	
	$scope.removeColumnField = function($event){
		$($event.target).parent().parent().remove();
		initItemTooltip();
	}
	
	// 清空内容
	$scope.clear = function(){
		$scope.layouts = [];
	}
	
	//重做
	$scope.redo = function(){
		$scope.layouts = [].concat(originalLayouts);
	}
	
	// 预览
    $scope.preview = function(){
    	removeSuperfluousDom();
    	var html = $("#designPanel").html();
    	initItemTooltip();
    	if(!html){
    		//布局内容不能为空国际化
    		dialogService.warn($filter('translate')('sysIndexMyLayout_LayoutNotEmpty'));
    		return;
    	}
    	html = $scope.getPureHtml(html);
    	dialogService.page('portal.sysIndexMyLayoutPreview', {area:['1024px', '580px'], pageParam: {html:html}});
    }
    
    $scope.selectField = function(field){
    	$scope.editingField = field;
    }
    
    $scope.removeField = function(field){
    	$scope.layouts.remove(field);
    }
    
    // 获取纯净的html内容
    $scope.getPureHtml = function(html){
    	var rows = $scope.getRowsByHtml(html),
			ary = [];
		
		angular.forEach(rows, function(row){
			var me = $(row),
				span = me.find("span.label"); 
			me.removeAttr("ng-repeat")
			  .removeAttr("ng-bind-html")
			  .removeClass("ng-scope")
			  .removeClass("ng-binding");
			span.removeAttr("ng-bind")
				.removeAttr("draggable")
				.removeAttr("style")
				.removeClass("ng-binding");
			ary.push(row.outerHTML);
		});
		return ary.join('');
    }
    
    $scope.save = function(){
    	removeSuperfluousDom();
    	$timeout(function(){
    		var html = $("#designPanel").html();
        	html = $scope.getPureHtml(html);
        	if(!html){
        		dialogService.confirm($filter('translate')('sysIndexMyLayout_layoutisempty')).then(function(){
        			var url = "${portal}/portal/sysIndexMyLayout/v1/deleteMyLayout";
        	    	baseService.remove(url).then(function(rep){
        	    		if(rep.state){
        	    			dialogService.success(rep.message);
        	    		}
        	    		else{
        	    			dialogService.error(rep.message);
        	    		}
        	    	});
        		}, function(){
        			return;
        		});
        	}
        	else{
        		$scope.sysIndexLayout.designHtml = $.base64.encode(html, "utf-8");
            	$scope.sysIndexLayout.templateHtml = '';
            	var url = "${portal}/portal/sysIndexMyLayout/v1/saveLayout";
            	baseService.post(url, $scope.sysIndexLayout.designHtml).then(function(rep){
            		if(rep.state){
            			dialogService.success($filter('translate')('sysIndexMyLayout_saveSuccess'));
            		}
            		else{
            			dialogService.error(rep.message);
            		}
            	});
        	}
    	},100);
    }
    
    //删除多余dom元素
    function removeSuperfluousDom(){
    	$('#fieldTooltip').remove();
    	$('.tooltip-container').remove();
    	$scope.editingField = {};
    	$('.superfluous').each(function(){
            var _dom = $(this).html();
            $(this).after(_dom).remove();
        });
    }
}


//布局页面预览
function previewCtrl($scope, baseService, dialogService, indexColumnService) {
	var html = "";
	//首页工作台布局
	if(!$scope.pageParam){
		var url="${portal}/portal/main/v1/myHome"
		baseService.get(url).then(function(rep){
    		if(rep.state){
    			html =  $.base64.decode(rep.value,"utf-8");
    			indexColumnService.showLayout($scope,html);
    		}
    	});
	}
	//布局预览
	else{
		html = $scope.pageParam.html;
		indexColumnService.showLayout($scope,html);
	}
}


/**
 *
 * Pass all functions into module
 */
angular.module('portal', [])
	.controller('layoutDesignCtrl', layoutDesignCtrl)
	.controller('previewCtrl', previewCtrl);