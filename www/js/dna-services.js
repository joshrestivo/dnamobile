angular.module('dnaMobile.services', ['cb.x2js'])


.factory('$localstorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            return JSON.parse($window.localStorage[key] || '{}');
        }
    }
}])

.factory('dataLoader', function($http, $log) {
	return {
		get: function(url){
          return $http.get(url);
		}
	}
})

.factory('dnaCache', function($cacheFactory) {
 return $cacheFactory('theData');
})

.factory('feedLoader', ['$http', '$q',
                        function($http, $q ) {
  return {
    get: function(feedUrl, numPosts, defaultImage, defaultThumb) {
      
      defaultImage = defaultImage || 'img/default-img.jpg';
      defaultThumb = defaultThumb || 'img/default-img-thumb.jpg';
      
      var deferred = $q.defer();
      var descLength = 200;
      var posts = [];
      
      $http.get(feedUrl, numPosts).then(function (result) {
        var x2js = new X2JS();
        var json = x2js.xml_str2json(result.data);
        var items = json.rss.channel.item;


        // RSS Fixup
        if (items.length < numPosts) {
        	numPosts = items.length;
        }

        for (var i = 0; i < numPosts; i++) {
          post = items[i];
          try {
     		post.description = post.description.replace(/\r?\n|\r/).replace(/<p>The post.*appeared first on.*<\/p>/g,'').replace(/<img.*?>/,'');
            post.description = post.description.replace(/<p><\/p>/g,'').slice(0,descLength) + '...';
          	post.descriptionFull = post.encoded.__cdata.replace(/<p>The post.*appeared first on.*<\/p>/g,'').replace(/<img.*>/g,'');
          	post.imageThumb =  post.encoded.__cdata.match(/<img.*src=\".*\".*\/>/)[0].match(/http:\/\/.*?\.(jpg|png)/g)[0];
     		post.imageLarge = post.encoded.__cdata.match(/<img.*src=\".*\".*\/>/)[0].match(/http:\/\/.*?\.(jpg|png)/g)[0].replace(/-150x150\./,'\.');

   		  }
   		  catch(err) {
   			// Fixme. Innocuous NaN error  
   		    // console.log("Uhh ohh. rssFixup failed.", + err);
   		  }
          if (post.imageLarge == null) {
            if (post.imageThumb) {
              post.imageLarge = post.imageThumb;
            } else {
              post.imageLarge = defaultImage;
            }
            if (post.imageThumb == null) {
              if (post.imageLarge) {
                post.imageThumb = post.imageLarge;
              } else {
                post.imageThumb = defaultThumb;
              }
            }
          }

   		  posts.push(post);
        }
        json.rss.channel.item = posts;
        deferred.resolve(json.rss.channel);

      });
      return deferred.promise;
    }
  }
}])

// A RESTful factory for retrieving CSB service requests 
.factory('requests_utils', ['$http', '$q', 
                     function ($http,   $q) {

  var baseUrl = 'https://www.stlouis-mo.gov/powernap/stlouis/api.cfm/requests/32346.xml';
  var api_key = 'MTQ0NDk1MDkwOTIwNDAuNDg3MzkxMDEzMjk0';

  var requests = $http.get(baseUrl + '.xml').then(function (result) {
    var x2js = new X2JS();
    return x2js.xml_str2json( result.data ).service_requests.request;
  });

  var factory = {};
  factory.statuses = [
    'unknown',
    'new',
    'open',
    'closed',
    'investigating',
    'planned',
    'in progress',
    'fixed',
    'fixed - user',
    'fixed - council'
  ];


  factory.all = function () {services.service('shareProperties', function() {
	  this.personArray = [];

	  this.clear = function() {
	   this.personArray = [];
	   }
	 });
    return requests;
  };

  factory.get = function (service_request_id) {
    var request = $http.get(baseUrl + '/' + service_request_id + '.xml').then(function (result) {
      var x2js = new X2JS();
      return x2js.xml_str2json( result.data ).service_requests.request;
    });

    return request;
  };

  factory.post = function(request) {
    var params = {
      api_key: api_key,
      service_code: request.service_code,
      address_string: request.address
    };

    if (request.service_request_id) params.service_request_id = request.service_request_id;
    if (request.email) params.email = request.email;
    if (request.media_url) params.media_url = request.media_url;
    if (request.description) params.description = request.description;
    if (request.lat) params.lat = request.lat;
    if (request.long) params.long = request.long;
    if (request.expected_datetime) params.expected_datetime = request.expected_datetime;
    if (request.status) params.status = request.status;


    var result = $q.defer();

    $http({
      method: 'POST',
      url: baseUrl + '.xml',
      data: $.param(params),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function (data) {
      var x2js = new X2JS();
      var ans = x2js.xml_str2json( data ).service_requests.request;
      result.resolve(ans.service_request_id);
    });
    services.service('shareProperties', function() {
    	 this.personArray = [];

    	 this.clear = function() {
    	  this.personArray = [];
    	  }
    	});
    return result.promise;
  };

  return factory;
}])


// A RESTful factory for retrieving CSBservice requests 
.factory('services_utils', ['$http', '$q', 
                   function ($http,   $q) {

  var baseUrl = 'http://cors.io/?u=https://www.stlouis-mo.gov/powernap/stlouis/api.cfm/requests/32346';
  var apiKey = 'MTQ0NDk1MDkwOTIwNDAuNDg3MzkxMDEzMjk0';

  var services = $http.get(baseUrl + '.xml?api_key=' + apiKey).then(function (result) {
    var x2js = new X2JS();
    return x2js.xml_str2json( result.data ).services.service;
  });

  var factory = {};
  factory.all = function () {
    return services;
  };

  return factory;
  }])
  
.directive('fallbackSrc', function () {
  var fallbackSrc = {
    link: function postLink(scope, iElement, iAttrs) {
      iElement.bind('error', function() {
        angular.element(this).attr("src", iAttrs.fallbackSrc);
      });
    }
  };
   return fallbackSrc;
});