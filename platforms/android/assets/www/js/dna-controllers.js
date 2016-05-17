angular.module('dnaMobile.controllers',
	[ 'dnaMobile.services', 'dnaMobile.filters', 'ngSanitize' ])

.controller('MainCtrl', function($scope, $ionicModal, $timeout, $sce, dataLoader, $rootScope, $log) {
  $scope.items = [ {
	title : "Street Closures",
	icon : "ion-ios-speedometer",
	iconColor : "#7aca4f",
	sref : "streets.posts"
  }, {
	title : "DNA News",
	icon : "ion-ios-paper",
	iconColor : "#c5ae0a",
	sref : "dnanews.posts"
  }, {
	title : "DNA Events",
	icon : "ion-ios-calendar",
	iconColor : "#fb4828",
	sref : "events.dna"
  }, {
	title : "Building Contacts",
	icon : "ion-ios-people",
	iconColor : "#c41e3b",
	sref : "buildings.list"
  }, {
      title: "External Links",
      icon: "ion-ios-world",
      iconColor: "#5ebeb0",
      sref: "dnalinks.list"
  }];
  // {
  // title : "Citizens Service Bureau",
  // icon : "ion-ios-compose",
  // iconColor : "#5bc1af",
  // sref : "csb"
  // }

  $scope.data = {
	showReordering : false
  }

    $scope.logoUrl = 'http://saintlouisdna.org';
    $scope.logoImage = 'img/DNA-logo.png';
    $scope.facebookUrl = 'https://www.facebook.com/STL.DNA/';
    $scope.facebookLogo = 'img/facebook.png';
    $scope.twitterUrl = 'https://twitter.com/saintlouisdna';
    $scope.twitterLogo = 'img/twitter.png';

} )

.controller('buildings', function($rootScope) {
    $rootScope.url = 'https://dnac.6ceed.com/wp-json/dna/v1/buildings';
})

.controller('streets', function($rootScope) {
	$rootScope.url = 'http://www.downtownstl.org/category/downtown-street-alert/feed';
})

.controller('dnalinks', function($rootScope) {
    $rootScope.url = 'https://dnac.6ceed.com/wp-json/dna/v1/links';
})

.controller('dnanews', function($rootScope) {
    $rootScope.url = 'http://www.saintlouisdna.org/category/News/feed';
})

.controller('events', function() {})

.controller('BuildingListCtrl', function( $scope, $http, dataLoader, $ionicModal, $timeout, $ionicSlideBoxDelegate, $rootScope, $log) {

	var listApi = $rootScope.url + '/list',
        filterBarInstance;

	$scope.moreItems = false;

	$scope.loadPosts = function() {

		dataLoader.get( listApi ).then(function(response) {
			$scope.posts = response.data;
			$log.log(listApi, response.data);
		}, function(response) {
			$log.log(listApi, response.data);
		})
	};

	$scope.loadPosts();

    $ionicModal.fromTemplateUrl('templates/building-modal.html', {
        scope : $scope,
        animation : 'slide-in-right'
    }).then(function(modal) {
        $scope.modal = modal
    });

    $scope.openModal = function(building) {
        var bldgContactsApi = $rootScope.url + '/bldg_contacts/' + building.ID;
        var buildingApi = $rootScope.url + '/detail/' + building.ID;

        dataLoader.get( buildingApi ).then(function(response) {
            $scope.building = response.data[0];
            $log.log(buildingApi, response.data);
        }, function(response) {
            $log.log(buildingApi, response.data);
        });

        dataLoader.get( bldgContactsApi ).then(function(response) {
            var bldgContacts = response.data;
            rolesArray = {};
            for (i = 0; i < bldgContacts.length; i++) {
                var contact = bldgContacts[i];
                for (j = 0; j < contact.roles.length; j++) {
                    var role = contact.roles[j];
                    var contactDetails = [contact.title, contact.photo, contact.email];
                    if (rolesArray[role] === undefined){
                        rolesArray[role] = [];
                    }
                    rolesArray[role].push(contactDetails);
                }
            }

            $scope.rolesList = rolesArray;

            $log.log(bldgContactsApi, response.data);
        }, function(response) {
            $log.log(bldgContactsApi, response.data);
        });

        $scope.modal.show();
    };

    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });
     
	// Pull to refresh
	$scope.doRefresh = function() {
		$timeout( function() {
			$scope.loadPosts();
			//Stop the ion-refresher from spinning
			$scope.$broadcast('scroll.refreshComplete');
		}, 1000);
	};

})
	
.controller('dnaEventsCtrl', function($scope, $http, $ionicFilterBar, $cordovaCalendar, $cordovaToast) {

	var apiKey = ' AIzaSyDPdWQ9tUD12sIcux5imk376qGYf3weCNY';
	var calendarId = 'calendar@saintlouisdna.org';
	var pageTitle = 'DNA - Upcoming Events';
	var today = moment().format('YYYY-MM-DDTHH:mm:ssZ');

	$http({
		method: 'GET',
		url: encodeURI('https://www.googleapis.com/calendar/v3/calendars/' + calendarId + '/events?key=' + apiKey
			+ '&timeMin=' + today)
	}).then(function(response) {
		$scope.events = response.data.items;
		$scope.events.title = pageTitle;
    });

    $scope.createEvent = function(event) {
        $cordovaCalendar.createEvent({
            title: event.summary,
            location: event.location,
            notes: event.description,
            startDate: event.start.dateTime,
            endDate: event.end.dateTime
        }).then(function () {
            $cordovaToast.showLongBottom('Event has been added to calendar.')
                .then(function(success) {
                }, function(error) {
              });
        }, function (err) {
            console.error("Uhh Ohh, Charlie Brown: " + err);
        });
    }
})

.controller('dnaLinksCtrl', function($scope, $http, $rootScope, $ionicFilterBar, $log, $timeout, dataLoader) {
    var linksApi = $rootScope.url + '/list',
        filterBarInstance;

    $scope.moreItems = false;

    $scope.loadPosts = function() {
        dataLoader.get( linksApi ).then(function(response) {
            var links = response.data;
            console.log(links);
            linksArray = {};
            for (i = 0; i < links.length; i++) {
                var link = links[i];
                for (j = 0; j < link.cats.length; j++) {
                    var cat = link.cats[j];
                    var linkDetails = [link.title, link.desc, link.url];
                    if (linksArray[cat] === undefined){
                        linksArray[cat] = [];
                    }
                    linksArray[cat].push(linkDetails);
                }
            }

            $scope.posts = linksArray;

            $log.log(linksApi, response.data);
        }, function(response) {
            $log.log(linksApi, response.data);
        })
    };

    $scope.loadPosts();

    // Pull to refresh
    $scope.doRefresh = function() {
        $timeout(function () {
            $scope.loadPosts();
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
        }, 1000);

        $cordovaToast.showLongBottom('Your data is now oven fresh.')
            .then(function(success) {
            }, function(error) {
            });
    };

})

.controller('rssPostCtrl', function($scope, $ionicModal, $rootScope, $timeout, $cordovaToast, feedLoader) {

  var feedUrl = $rootScope.url;

  $scope.loadPosts = function() {
      feedLoader.get(feedUrl, 5).then(function (posts) {
          $scope.posts = posts;
      });
  };

  $scope.loadPosts();

  // Pull to refresh
  $scope.doRefresh = function() {
      $timeout(function () {
          $scope.loadPosts();
          //Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.refreshComplete');
      }, 1000);

      $cordovaToast.showLongBottom('Your data is now oven fresh.')
          .then(function(success) {
          }, function(error) {
      });
  };

  // Handle post modal
  $ionicModal.fromTemplateUrl('templates/post-modal.html', {
	scope : $scope,
	animation : 'slide-in-right'
  }).then(function(modal) {
	$scope.modal = modal
  });

  $scope.openModal = function(post) {
	$scope.post = post;
	$scope.modal.show()
  };

  $scope.closeModal = function() {
	$scope.modal.hide();
  };

  $scope.$on('$destroy', function() {
	$scope.modal.remove();
  });

    // Handle image modal
    $scope.zoomMin = 1;

    $ionicModal.fromTemplateUrl('templates/image-modal.html', {
        scope : $scope,
        animation : 'slide-in-right'
    }).then(function(modal) {
        $scope.modal2 = modal
    });

    $scope.openModal2 = function(image) {
        $scope.image = image;
        $scope.modal2.show();
    };

    $scope.closeModal2 = function() {
        $scope.modal2.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.modal2.remove();
    });
});