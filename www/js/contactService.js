/// <reference path="../typings/angularjs/angular.d.ts"/>

angular.module('woocommerce-api.customService', [])

.factory('ContactData', function($http,$q, CONFIG) {
    var data = {};
var deferred ;
data.createMessage = function(contact){
  deferred =$q.defer();
  var params = {};
  var url = generateQuery('POST', '/custom/createMessage', CONFIG, params);
  $http({
      method: 'POST',
      url: url,
      timeout: CONFIG.request_timeout,
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: contact
  }).then(
      function(result) {

          deferred.resolve(result);

      },
      function(result) {
          console.log(result)
          deferred.reject(result);
      }
  );
    return deferred.promise;
};
  data.getContactDetail = function(){
    deferred =$q.defer();
    var params = {};
    var url = generateQuery('GET', '/custom/getContactPage', CONFIG, params);

    console.log("contact detail request");
    $http({
        method: 'GET',
        url: url,
        timeout: CONFIG.request_timeout
    }).then(
        function(result) {

            deferred.resolve(result);

        },
        function(result) {
            console.log(result)
            deferred.reject(result);
        }
    );
      return deferred.promise;
  };

    return data;
});
