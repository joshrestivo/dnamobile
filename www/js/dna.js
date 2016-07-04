angular
	.module(
		'dnaMobile',
		[ 'ionic', 'ionic.service.core',
			'dnaMobile.controllers', 'ngCordova', 'ngResource',
			'angular-cache', 'favicon' ])

	.run(function($ionicPlatform, $state) {
	  $ionicPlatform.ready(function() {
		if (window.cordova && window.cordova.plugins.Keyboard) {
		  cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if (window.StatusBar) {
		  StatusBar.styleDefault();
		}
	  });

		$ionicPlatform.registerBackButtonAction(function (event) {
			if($state.current.name=="index"){
				navigator.app.exitApp();
			}
			else {
				navigator.app.backHistory();
			}
		}, 100);
	})

	.directive('ionSearch', function() {
		return {
			restrict: 'E',
			replace: true,
			scope: {
				getData: '&source',
				model: '=?',
				search: '=?filter'
			},
			link: function(scope, element, attrs) {
				attrs.minLength = attrs.minLength || 0;
				scope.placeholder = attrs.placeholder || '';
				scope.search = {value: ''};

				if (attrs.class)
					element.addClass(attrs.class);

				if (attrs.source) {
					scope.$watch('search.value', function (newValue, oldValue) {
						if (newValue.length > attrs.minLength) {
							scope.getData({str: newValue}).then(function (results) {
								scope.model = results;
							});
						} else {
							scope.model = [];
						}
					});
				}

				scope.clearSearch = function() {
					scope.search.value = '';
				};
			},
			template: '<div class="item-input-wrapper">' +
			'<i class="icon ion-android-search"></i>' +
			'<input type="search" placeholder="{{placeholder}}" ng-model="search.value">' +
			'<i ng-if="search.value.length > 0" ng-click="clearSearch()" class="icon ion-close"></i>' +
			'</div>'
		};
	})

	.config(
		function($stateProvider, $urlRouterProvider, $ionicConfigProvider,
			CacheFactoryProvider) {

		  angular.extend(CacheFactoryProvider.defaults, {
			'storageMode' : 'localStorage',
			'capacity' : 10,
			'maxAge' : 10800000,
			'deleteOnExpire' : 'aggressive',
			'recycleFreq' : 10000
		  });

		  if (ionic.Platform.isAndroid()) {
			$ionicConfigProvider.scrolling.jsScrolling(false);
		  }

		  $stateProvider

			  .state('index', {
				url : "/",
				templateUrl : "templates/main.html",
				controller : 'MainCtrl'
			  })

			  // Building Info

			  .state('buildings', {
				url : "/buildings",
				abstract : true,
				templateUrl : "templates/menu.html",
				controller : 'buildings'
			  })

			  .state('buildings.list', {
				url : "/list",
				views : {
				  'menuContent' : {
					templateUrl : "templates/buildings-list.html",
					controller : 'BuildingListCtrl'
				  }
				}
			  })

			  // Events Calendars
			  .state('events', {
				  url : "/events",
				  abstract : true,
				  templateUrl : "templates/menu.html",
				  controller : 'events'
			  })
				  
			  // DNA Google Calendar
			  .state('events.dna', {
				  url : "/dna",
				  views : {
					  'menuContent' : {
						  templateUrl : "templates/dna-events.html",
						  controller : 'dnaEventsCtrl'
					  }
				  }
			  })
				  
			  // DNA External Links
			  .state('dnalinks', {
				  url : "/dnalinks",
				  abstract : true,
				  templateUrl : "templates/menu.html",
				  controller : 'dnalinks'
			  })
				  
			  .state('dnalinks.list', {
				  url : "/list",
				  views : {
					  'menuContent' : {
						  templateUrl : "templates/links-list.html",
						  controller : 'dnaLinksCtrl'
					  }
				  }
			  }) 

			  // DNA News feed from saintlouisdna.org
			  .state('dnanews', {
				  url : "/dnanews",
				  abstract : true,
				  templateUrl : "templates/menu.html",
				  controller : 'dnanews'
			  })

			  .state('dnanews.posts', {
				  url : "/posts",
				  views : {
					  'menuContent' : {
						  templateUrl : "templates/posts-rss.html",
						  controller : 'rssPostCtrl'
					  }
				  }
			  })

			  // Street Closure Notifications from downtownstl.org
			  .state('streets', {
				  url : "/streets",
				  abstract : true,
				  templateUrl : "templates/menu.html",
				  controller : 'streets'
			  })

			  .state('streets.posts', {
				  url : "/posts",
				  views : {
					  'menuContent' : {
						  templateUrl : "templates/posts-rss.html",
						  controller : 'rssPostCtrl'
					  }
				  }
			  });

		  $urlRouterProvider.when('/c?id', '/requests/:id').when('/user/:id',
			  '/requests/:id').otherwise('/');
		});
