function config($stateProvider, $urlRouterProvider, $ocLazyLoadProvider
		, IdleProvider, KeepaliveProvider,$translateProvider) {
    // Configure Idle settings
    IdleProvider.idle(5); // in seconds
    IdleProvider.timeout(120); // in seconds
    
    // 不使用默认首页的配置，通过AuthenticationService.loadDefaultPage()来加载默认页面
    //$urlRouterProvider.otherwise("/worktop/myHome");

    $ocLazyLoadProvider.config({
        // Set to true if you want to see what and when is dynamically loaded
        debug: false
    });
    
    window.stateProvider = $stateProvider; 
    
    $stateProvider
	    .state('login', {
	        url: "/login",
	        templateUrl: "views/login.html",
	        data: { pageTitle: '欢迎登陆', specialClass: 'gray-bg' }
	    })
	    .state('welcome', {
            url: "/welcome",
            templateUrl: "views/welcome.html",
            data: { pageTitle: '欢迎使用宏天软件EIP系统', specialClass: 'gray-bg' },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            files: ['js/plugins/ngclipboard/clipboard.min.js']
                        },
                        {
                            name: 'ngclipboard',
                            files: ['js/plugins/ngclipboard/ngclipboard.min.js']
                        }
                    ]);
                }
            }
        })
        .state('error', {
            url: "/systemError",
            templateUrl: "views/common/error.html",
            data: { pageTitle: '系统异常', specialClass: 'gray-bg' }
        })
	    .state('worktop', {
	        abstract: true,
	        url: "/worktop",
	        templateUrl: "views/common/content.html"
	    })
	    .state('worktop.myHome', {
	        url: "/myHome",
	        templateUrl: "views/portal/myHome.html",
	        data: { pageTitle: '我的首页', specialClass: 'gray-bg' },
	        resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                           {
						    serie: true,
						    files: [
						      'css/plugins/datapicker/angular-datapicker-schedule.css',
						      'css/plugins/daterangepicker/daterangepicker-bs3.css'
						    ]
						  },{
                    	    name: 'datePickerSchedule',
                    	    files: ['js/plugins/datapicker/angular-datepicker-schedule.js']
                    	  }
                    ]);
                }
            }
	    })
	    .state('modify-password', {
	    	url: "/modify-password",
			templateUrl: "views/common/modifyPassword.html",
			data: {pageTitle: 'topnavbar_modifyPassword'}
	    })
        .state('choose-style', {
            url: "/choose-style",
            templateUrl: "views/common/chooseStyle.html",
            data: {pageTitle: 'chooseStyle_selectColor'},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                    	{
							name: 'ui.switchery',
							files: [
							'css/plugins/switchery/switchery.css',
							'js/plugins/switchery/switchery.js',
							'js/plugins/switchery/ng-switchery.js']
                		}
                    ]);
                }
            }
        })
	    .state('bo-selector', {
	    	url: "/bo-selector",
			templateUrl: "views/selector/bo-selector.html",
			data: {pageTitle: '选择业务对象'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
	                        serie: true,
	                        files: [
	                        	  'css/common.table.css',
	                              'js/base/tableFixedHeight.js'
                            ]
	                    },
						{
							name: 'selector',
							files: ['js/selector/selector-controllers.js']
						}
					]);
				}
			}
	    })
	    .state('user-selector', {
	    	url: "/user-selector",
			templateUrl: "views/selector/user-selector.html",
			data: {pageTitle: 'select_user'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
	                        serie: true,
	                        files: [
	                        	  'css/common.table.css',
	                              'js/base/tableFixedHeight.js'
                            ]
	                    },
						{
							name: 'selector',
							files: ['js/selector/selector-controllers.js']
						}
					]);
				}
			}
	    })
	    
	    .state('org-selector', {
	    	url: "/org-selector",
			templateUrl: "views/selector/org-selector.html",
			data: {pageTitle: '选择组织'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
	                        serie: true,
	                        files: [
	                        	  'css/common.table.css',
	                              'js/base/tableFixedHeight.js'
                            ]
	                    },
						{
							name: 'selector',
							files: ['js/selector/selector-controllers.js']
						}
					]);
				}
			}
	    })
	    .state('pos-selector', {
	    	url: "/pos-selector",
			templateUrl: "views/selector/pos-selector.html",
			data: {pageTitle: '选择岗位'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
	                        serie: true,
	                        files: [
	                        	  'css/common.table.css',
	                              'js/util/util.js',
	                              'js/base/tableFixedHeight.js'
                            ]
	                    },
						{
							name: 'selector',
							files: ['js/selector/selector-controllers.js']
						}
					]);
				}
			}
	    })
	    .state('job-selector', {
	    	url: "/job-selector",
			templateUrl: "views/selector/job-selector.html",
			data: {pageTitle: '选择职务'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
	                        serie: true,
	                        files: [
	                        	  'css/common.table.css',
	                              'js/util/util.js',
	                              'js/base/tableFixedHeight.js'
                            ]
	                    },
						{
							name: 'selector',
							files: ['js/selector/selector-controllers.js']
						}
					]);
				}
			}
	    })
	    .state('role-selector', {
	    	url: "/role-selector",
			templateUrl: "views/selector/role-selector.html",
			data: {pageTitle: '选择角色'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
	                        serie: true,
	                        files: [
	                        	  'css/common.table.css',
	                              'js/util/util.js',
	                              'js/base/tableFixedHeight.js'
                            ]
	                    },
						{
							name: 'selector',
							files: ['js/selector/selector-controllers.js']
						}
					]);
				}
			}
	    })
	    
	    .state('dem-selector', {
	    	url: "/dem-selector",
			templateUrl: "views/selector/dem-selector.html",
			data: {pageTitle: '维度选择器'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
	                        serie: true,
	                        files: [
	                        	  'css/common.table.css',
	                              'js/util/util.js',
	                              'js/base/tableFixedHeight.js'
                            ]
	                    },
						{
							name: 'selector',
							files: ['js/selector/selector-controllers.js']
						}
					]);
				}
			}
	    })
	    
	    .state('systype-selector', {
	    	url: "/systype-selector",
			templateUrl: "views/selector/systype-selector.html",
			data: {pageTitle: '选择分类'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
	                        serie: true,
	                        files: [
	                        	  'css/common.table.css',
	                              'js/util/util.js',
	                              'js/base/tableFixedHeight.js'
                            ]
	                    },
						{
							name: 'selector',
							files: ['js/selector/selector-controllers.js']
						}
					]);
				}
			}
	    })
	    
	    
	    .state('task-toAgree', {
	    	url: "/taskToAgree",
			templateUrl: "views/receivedProcess/task/taskToAgree.html",
			data: { pageTitle: 'task_approval', specialClass: 'fixed-sidebar' }
	    })
	    .state('task-toEndProcess', {
	    	url: "/taskToEndProcess",
			templateUrl: "views/receivedProcess/task/taskToEndProcess.html",
			data: { pageTitle: 'termination_process', specialClass: 'fixed-sidebar' }
	    })
	    .state('task-toDelegate', {
	    	url: "/taskToDelegate",
			templateUrl: "views/receivedProcess/task/taskToDelegate.html",
			data: { pageTitle: 'task_transfer', specialClass: 'fixed-sidebar' }
	    })
	    .state('task-toAddSign', {
	    	url: "/taskToAddSign",
			templateUrl: "views/receivedProcess/task/taskToAddSignTask.html",
			data: { pageTitle: 'add_a_signing_task', specialClass: 'fixed-sidebar' }
	    })
	    .state('task-toTrans', {
	    	url: "/taskToTrans",
			templateUrl: "views/receivedProcess/task/taskToTrans.html",
			data: { pageTitle: 'task_flow', specialClass: 'fixed-sidebar' }
	    })
	    .state('task-toReject', {
	    	url: "/taskToReject",
			templateUrl: "views/receivedProcess/task/taskToReject.html",
			data: { pageTitle: 'reject', specialClass: 'fixed-sidebar' }
	    })
	    .state('task-backToStart', {
	    	url: "/taskBackToStart",
			templateUrl: "views/receivedProcess/task/taskToReject.html",
			data: { pageTitle: 'processMatters_reject_to_the_originator', specialClass: 'fixed-sidebar' }
	    })
	    .state('task-image', {
	    	url: "/taskImage",
			templateUrl: "views/receivedProcess/task/taskImage.html",
			data: { pageTitle: 'processMatters_flow_chart', specialClass: 'fixed-sidebar' }
	    })
	    .state('flow-image', {
	    	url: "/flowImage",
			templateUrl: "views/receivedProcess/instance/instanceFlowImage.html",
			data: { pageTitle: 'processMatters_flow_chart', specialClass: 'fixed-sidebar' }
	    })
	    .state('flow-opinions', {
	    	url: "/flowOpinions",
			templateUrl: "views/receivedProcess/instance/instanceFlowOpinions.html",
			data: { pageTitle: 'processMatters_history', specialClass: 'fixed-sidebar' }
	    })
	    .state('flow-toCopyTo', {
	    	url: "/receivedProcess/instance/instanceToCopyTo",
			templateUrl: "views/receivedProcess/instance/instanceToCopyTo.html",
			data: { pageTitle: 'processMatters_process_of_cc', specialClass: 'fixed-sidebar' }
	    })
	    .state('flow-toForward', {
	    	url: "/receivedProcess/instance/instanceToCopyTo",
			templateUrl: "views/receivedProcess/instance/instanceToCopyTo.html",
			data: { pageTitle: 'processMatters_process_forward', specialClass: 'fixed-sidebar' }
	    })
	    .state('flow-startCommu', {
	    	url: "/taskToCommu",
			templateUrl: "views/receivedProcess/task/taskToCommu.html",
			data: { pageTitle: 'initiate_communication', specialClass: 'fixed-sidebar' }
	    })
	    .state('flow-feedBack', {
	    	url: "/taskToFeedBack",
			templateUrl: "views/receivedProcess/task/taskToFeedBack.html",
			data: { pageTitle: 'communication_feedback', specialClass: 'fixed-sidebar' }
	    })
	    .state('task-revoke', {
	    	url: "/task-revoke",
			templateUrl: "views/initiatedProcess/revoke.html",
			data: { pageTitle: 'processMatters_revoke', specialClass: 'fixed-sidebar' },
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
 	                    {
                             name: 'initiatedProcess',
                             files: ['js/initiatedProcess/initiatedProcessControllers.js']
                         }
 	                ]);
				}
			}
	    })
	     .state('task-toDueTime', {
	    	url: "/taskToDueTime",
			templateUrl: "views/receivedProcess/task/taskDueTimeEdit.html",
			data: { pageTitle: '任务延期设置', specialClass: 'fixed-sidebar' }
	    })
	    
	    .state('pending-dueTimeList', {
	    	url: "/pending-dueTimeList",
			templateUrl: "views/receivedProcess/bpmTaskDueTimeList.html",
			data: { pageTitle: '任务延期记录', specialClass: 'fixed-sidebar' },
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
 	                    {
                             name: 'receivedProcess',
                             files: ['js/receivedProcess/receivedProcessControllers.js']
                         }
 	                ]);
				}
			}
	    })
	    .state('pending-dueTimeGet', {
	    	url: "/pending-dueTimeGet",
			templateUrl: "views/receivedProcess/bpmTaskDueTimeGet.html",
			data: { pageTitle: '延期记录明细', specialClass: 'fixed-sidebar' },
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
 	                    {
                             name: 'receivedProcess',
                             files: ['js/receivedProcess/receivedProcessControllers.js']
                         }
 	                ]);
				}
			}
	    })
	    
	    .state('initiatedProcess', {
	        abstract: true,
	        url: "/initiatedProcess",
	        templateUrl: "views/common/content.html",
	    })
	    .state('flow-sendNodeUsers', {
	    	url: "/flowSendNodeUsers",
			templateUrl: "views/initiatedProcess/sendNodeUsers.html",
			data: { pageTitle: 'select_node_personnel', specialClass: 'fixed-sidebar' }
	    })
	    .state('flow-selectDestination', {
	    	url: "/flowSelectDestination",
			templateUrl: "views/initiatedProcess/selectDestination.html",
			data: { pageTitle: '选择跳转路径', specialClass: 'fixed-sidebar' }
	    })
	    .state('task-turnDetail', {
	    	url: "/taskTurnDetail",
			templateUrl: "views/initiatedProcess/taskTurnDialog.html",
			data: { pageTitle: '转办详细信息', specialClass: 'fixed-sidebar' }
	    })
	    .state('task-cancelTurn', {
	    	url: "/taskCancelTurn",
			templateUrl: "views/initiatedProcess/cancelTurn.html",
			data: { pageTitle: 'cancel_transfer', specialClass: 'fixed-sidebar' }
	    })
	  
	    .state('initiatedProcess.instanceDetail', {
			url: "/instanceDetail/:id",
			templateUrl: "views/receivedProcess/instance/instanceDetail.html",
			data: { pageTitle: '我的抄送转发', specialClass: 'fixed-sidebar' },
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
                            name: 'receivedProcess',
                            files: ['js/receivedProcess/receivedProcessControllers.js']
                        }
					]);
				}
			}
		})
	    .state('task-transDetail', {
	    	url: "/taskTransDetail",
			templateUrl: "views/initiatedProcess/transDetail.html",
			data: { pageTitle: 'circulation_detail', specialClass: 'fixed-sidebar' }
	    })
	    .state('task-revokeTrans', {
	    	url: "/taskRevokeTrans",
			templateUrl: "views/initiatedProcess/revokeTrans.html",
			data: { pageTitle: 'revoke_circulation', specialClass: 'fixed-sidebar' },
	    })
	    .state('messageReceiver', {
	        abstract: true,
	        url: "/messageReceiver",
	        templateUrl: "views/common/content.html",
	    })
	    .state('portal', {
				abstract: true,
				url: "/portal",
				templateUrl: "views/common/content.html",
			})
		.state('mail-edit', {
	    	url: "/mail-edit/:title",
			templateUrl: "views/mail/mailEdit.html",
			data: {pageTitle: '添加邮件'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
							serie: true,
							files: [
	                        	'css/common.table.css',
	                            'js/base/tableFixedHeight.js',
	                            'css/plugins/zTree/metroStyle.css',
	                            'js/plugins/zTree/jquery.ztree.min.js',
	                            'css/plugins/codemirror/ambiance.css',
	                            'js/plugins/codemirror/mode/javascript/javascript.js'
							]
						},
						{
	                        name: 'ui.codemirror',
	                        files: ['js/plugins/ui-codemirror/ui-codemirror.min.js']
	                    },
	                    {
	                    	name: 'ngZtree',
	                    	files: ['js/plugins/zTree/ng-ztree.js']
	                    },
						{
							name: 'mail',
							files: ['js/mail/mailControllers.js']
						}
					]);
				}
			}
	    })
	    .state('flow-bpmDefSelector', {
	    	url: "/flow-bpmDefSelector",
			templateUrl: "views/selector/bpmDefSelector.html",
			data: {pageTitle: '流程选择'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/base/tableFixedHeight.js'
	 								
	 							]
	 						},
	 						{
	 							name: 'pOffice',
	 							files: ['js/pOffice/pOfficeControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    .state('customDialogShow', {
	    	url: "/customDialogShow",
			templateUrl: "views/form/customDialog/customDialogShowList.html",
			data: {pageTitle: '自定义对话框列表预览功能'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
						{
	                        serie: true,
	                        files: [
	                        	  'css/common.table.css',
	                              'js/base/tableFixedHeight.js'
                            ]
	                    },
	                    {
							name: 'form',
							files: ['js/form/formControllers.js']
						}
					]);
				}
			}
	    })
	    .state('customDialogShowTree', {
            url: "/customDialogShowTree",
            templateUrl: "views/form/customDialog/customDialogShowTree.html",
            data: {pageTitle: '自定义对话框树形预览功能'},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: true,
                            files: [
                                'css/common.table.css',
                                'css/plugins/zTree/metroStyle.css',
                                'js/plugins/zTree/jquery.ztree.min.js',
                                'js/plugins/zTree/jquery.ztree.excheck.min.js',
                                'js/util/util.js',
                                'js/base/tableFixedHeight.js'
                            ]
                        },
                        {
                            name: 'form',
                            files: ['js/form/formControllers.js']
                        }
                    ]);
                }
            }
        })
	    .state('chatView', {
	    	url: "/chatView",
			templateUrl: "views/im/chatView.html",
			data: {pageTitle: '即时聊天'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/base/tableFixedHeight.js',
	 								'js/plugins/mqtt/uuid.js'
	 							]
	 						},
	 						{
	 							name: 'im',
	 							files: ['js/im/imControllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('file-upload', {
	    	url: "/fileUpload",
			templateUrl: "views/sys/file/uploadDialog.html",
			data: {pageTitle: ''},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
								name: 'system',
								files: ['js/sys/systemControllers.js']
							},
	 						{
	 							name: 'angularFileUpload',
	 							files: ['js/lib/angular/angular-file-upload.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('mathExpEditor', {
	    	url: "/mathExpEditor",
			templateUrl: "views/form/formDesign/dragMathExpEditor.html",
			data: {pageTitle: '统计函数设计对话框',specialClass: 'fixed-sidebar' },
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
									'css/common.table.css',
									'css/x5/expression.css',
									'js/base/tableFixedHeight.js',
						        	'js/util/util.js',
						        	'css/plugins/zTree/metroStyle.css',
	                                'js/plugins/zTree/jquery.ztree.min.js',
	 								'js/plugins/zTree/ztreeCreator.js',
	 								'js/lib/javacode/codemirror.js',
	 								'js/lib/javacode/InitMirror.js'
	 							]
	 						},
	 						{
	 							name: 'formDesign',
	 							files: ['js/form/formDesignListControllers.js']
	 						},
	 						{
	 						    name: 'ngZtree',
	 						    files: ['js/plugins/zTree/ng-ztree.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('flow-filedAuthSetting', {
	    	url: "/flow-filedAuthSetting",
			templateUrl: "views/selector/filedAuthSetting.html",
			data: {pageTitle: '设置权限'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 						{
	 							serie: true,
	 							files: [
	 								'css/common.table.css',
	 								'js/util/util.js',
	 								'js/base/tableFixedHeight.js'
	 								
	 							]
	 						},
	 						{
	 							name: 'selector',
	 							files: ['js/selector/selector-controllers.js']
	 						}
	 					]);
				}
			}
	    })
	    
	    .state('bpmDataTemplateExport', {
	    	url: "/bpmDataTemplateExport",
			templateUrl: "views/form/bpmDataTemplate/bpmDataTemplateExport.html",
			data: {pageTitle: '导出设置'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 					{
 							serie: true,
 							files: [
								'css/common.table.css',
								'js/base/tableFixedHeight.js',
					        	'js/util/util.js'
 							]
 						},
 						{
 						    name: 'formDesign',
 						    files: ['js/form/formDesignListControllers.js']
 						}
 					]);
				}
			}
	    })
	    
	    .state('bpmDataTemplateAdd', {
	    	url: "/bpmDataTemplateAdd",
			templateUrl: "views/form/bpmDataTemplate/editDataPreview.html",
			data: {pageTitle: '添加'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
                     {
					    serie: true,
					    files: [
					      'js/x5/bpm/custFormHelper.js',
					      'js/x5/bpm/OfficeControl.js',
					      'js/x5/bpm/OfficePlugin.js',
					      'js/x5/bpm/webSignPlugin.js',
					      'js/plugins/My97DatePicker/WdatePicker.js',
					      'js/lib/select2/js/select2.full.min.js',
					      'js/lib/select2/js/i18n/zh-CN.js',
					      'js/lib/select2/css/select2.min.css',
					      'js/jquery/jquery.PrintArea.js',
					      'css/jquery/plugins/jquery.qtip.min.css',
					      'js/portal/jquery.base64.js',
					      'css/plugins/zTree/metroStyle.css',
					      'js/plugins/zTree/jquery.ztree.min.js',
					      'js/plugins/zTree/ztreeCreator.js',
					      'js/lib/ueditor/bpmdef.udeitor.config.js',
					      'js/lib/ueditor/ueditor.all.min.js',
					      'js/lib/ueditor/lang/zh-cn/zh-cn.js',
					      'js/lib/ueditor/plugins/flowVar.js',
					      'js/lib/ueditor/plugins/flowTitle.js',
					      'js/lib/ueditor/plugins/startTime.js',
					      'js/lib/ueditor/plugins/startUser.js',
					      'js/x5/bpm/custFormHelper.js',
					      'css/design/formDesign.css',
					    ]
					  },
                	  {
                	    name: 'ngZtree',
                	    files: ['js/plugins/zTree/ng-ztree.js']
                	  },
                	  {
                	    name: 'formDesign',
                	    files: ['js/form/formDesignListControllers.js']
                	  }
                	]);
				}
			}
	    })
	    
	    .state('receivedProcess.bpmDataTemplateSubList', {
	    	url: "/bpmDataTemplateSubList/:alias/:refId",
			templateUrl: "views/form/bpmDataTemplate/bpmDataTemplateSubList.html",
			data: {pageTitle: '子表数据'},
			resolve: {
				loadPlugin: function ($ocLazyLoad) {
					return $ocLazyLoad.load([
	 					{
 							serie: true,
 							files: [
								'css/common.table.css',
								'js/base/tableFixedHeight.js',
					        	'js/util/util.js'
 							]
 						},
 						{
 						    name: 'formDesign',
 						    files: ['js/form/formDesignListControllers.js']
 						}
 					]);
				}
			}
	    })
	    
	    // 国际化资源
	    var lang = "i18n-zh-CN";
	    if (window.localStorage.getItem("lang")) {
	    	lang = window.localStorage.getItem("lang");
	    }
	    // 设置默认语言
	    $translateProvider.fallbackLanguage(lang);
	    //$translateProvider.preferredLanguage(lang);
	    $translateProvider.useStaticFilesLoader({
	        prefix: 'js/i18n/',
	        suffix: '.json'
	    });

	    
}

function run($rootScope, $http, $location,baseService, $sessionStorage, $state,AuthenticationService, commonService, $localStorage, $window) {
	$rootScope.$state = $state;
	var loginCycleFlag = false, ctx = getContext();
	
	//动态添加菜单  登录 和run时都调用初始化动态菜单
    window.evalState = function(menus,$state){
    	if(!menus || menus.length==0) return;
    	for( var i=0;i<menus.length;i++ ){
    		var param = {
    		        url: menus[i].menuUrl,
    		        templateUrl: menus[i].templateUrl,
    		        data: { pageTitle: menus[i].name, specialClass: 'fixed-sidebar' }
    		    };
    		if(!menus[i].load){//menus[i].children && menus[i].children.length>0
    			param.abstract=true;
    		}
    		if(menus[i].load){
    			var lazyLoadStr = "function ($ocLazyLoad) {return $ocLazyLoad.load("+menus[i].load+");}";
    			param.resolve = {};
    			param.resolve.loadPlugin = eval("("+lazyLoadStr+")");
    		}
    		// 已经注册过不用再注册
    		
    		if($state.is(menus[i].alias)===undefined ){
    			stateProvider.state(menus[i].alias,param);
    		}
    		
    		if(menus[i].children && menus[i].children.length > 0){
    			evalState(menus[i].children,$state);
    		}
    	}
    }
	
    // keep user logged in after page refresh
    if ($sessionStorage.currentUser) {
        $http.defaults.headers.common.Authorization = 'Bearer ' + $sessionStorage.currentUser.token;
       
        // 默認支持語言
        if(window.localStorage.getItem("lang")){
        	$rootScope.lang = window.localStorage.getItem("lang").replace("i18n-",""); 
        	$http.defaults.headers.common["Accept-Language"] = $rootScope.lang;
        }else{
        	window.localStorage.setItem("lang","i18n-zh-CN");
        	$http.defaults.headers.common['Accept-Language'] = 'zh-CN';
        }
        
        $rootScope.currentUserName = $sessionStorage.currentUser.username;
        AuthenticationService.loadDefaultPage();
    }
    // redirect to login page if not logged in and trying to access a restricted page
    $rootScope.$on('$locationChangeStart', function (event, next, current) {
    	var publicPages = ['/login', '/welcome'];
        var restrictedPage = publicPages.indexOf($location.path()) === -1;
        if (restrictedPage && !$sessionStorage.currentUser) {
        	if(loginCycleFlag) {
        		event.preventDefault();
        		return;
        	}
        	regularLogin();
        }
    });
    
    var service = ctx['web'] + "/index.html";
    
    // 健全登录信息
    function regularLogin(){
    	var ticket = $.getParameter("ticket"),
    		code = $.getParameter("code");
    	// 单点登录重定向回来时，url地址后面会携带参数
    	if(ticket || code){
    		// 通过url地址后面的参数完成认证过程
    		AuthenticationService.ssoLogin({code:code, ticket:ticket}, loginCallback);
    	}
    	else{
    		loginCycleFlag = true;
    		// 重定向到登录页面(会根据当前系统登录方式决定重定向到常规登录或者单点登录界面)
    		AuthenticationService.ssoRedirect();
    	}
    }
    
    function loginCallback(rep){
    	loginCycleFlag = false;
        if (rep && rep.result) {
        	// 加载默认界面
        	AuthenticationService.loadDefaultPage();
        }
        else{
        	$state.go("error");
        }
    }
    
    $rootScope.$on("$stateChangeStart", function(){
    	commonService.spinner($("#main-view"));
    });
    
    $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
    	commonService.closeSpinner($("#main-view"));
        $rootScope.previousState_name = fromState.name;
        $rootScope.previousState_params = fromParams;
        if(toState && toState.name=='worktop.myHome' && $window.location.search){
        	// 清除url参数
        	$window.location.search = '';
        }
    });
    $rootScope.routeToback = function(path) {
    	var state_name = path?path:$rootScope.previousState_name?$rootScope.previousState_name:'worktop.myHome';
        var state_params = $rootScope.previousState_params?$rootScope.previousState_params:"";
    	$state.go(state_name,state_params);
    };
    $rootScope.$on("$stateChangeError", function(){
    	commonService.closeSpinner($("#main-view"));
    });
    $rootScope.$on("$stateChangeCancel", function(){
    	commonService.closeSpinner($("#main-view"));
    });
    $rootScope.$on("$stateNotFound", function(){
    });
    $rootScope.loadWorktop = function() {
        $state.go("worktop.myHome");
    };
}

angular
    .module('eip')
    .config(config)
    .run(run);
