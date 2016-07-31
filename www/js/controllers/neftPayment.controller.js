(function() {
  'use strict';

    angular.module('woocommerce-api.controllers')

    // Social Controller
    .controller('NeftPaymentCtrl', function($rootScope,$ionicHistory, $scope, $stateParams, UserData,BasketData) {
      $rootScope.$broadcast('loading:show');
      neftCompletePayment();

      function neftCompletePayment(){
        $scope.paid = true;
        // Maybe a more robust way of handling this is necessary
        BasketData.sendOrder('bacs', true,'').then(
            function(response) {
                console.log("response : " + JSON.stringify(response));
                $scope.order = response.data.order;
                BasketData.emptyBasket();
                  $rootScope.$broadcast('loading:hide');
                  $ionicHistory.clearHistory();
                  $ionicHistory.nextViewOptions({
                    disableAnimate: true,
                    disableBack: true
                  });
            },
            function(response) {
                console.error("Error: order request could not be sent.", response);
                BasketData.broadcast('Product order','Hi Product not available.','OK','button-positive');
                BasketData.emptyBasket();
                $rootScope.$broadcast('loading:hide');
            });


      }

    });

})();
