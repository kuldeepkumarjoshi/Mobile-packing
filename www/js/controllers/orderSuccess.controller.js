(function() {
  'use strict';

    angular.module('woocommerce-api.controllers')
    // Social Controller
    .controller('OrderSuccessCtrl', function($rootScope,$state,$window,$ionicHistory, $scope, $stateParams, UserData,BasketData,CartData) {
      var paymentOption = {};
      $rootScope.$broadcast('loading:show');
      function emptyBasket() {
          CartData.emptyBasket();//---current basket
          BasketData.emptyBasket();//---stored basket
      };

      function sendOrderToSave(){
        $scope.paymentMethod = $state.params.method;
        // Maybe a more robust way of handling this is necessary
        BasketData.sendOrder($state.params.method, true,$state.params.paymentId).then(
            function(response) {
                console.log("response : " + JSON.stringify(response));
                $scope.order = response.data.order;
                 emptyBasket();
                //
                  $ionicHistory.clearHistory();
                  $ionicHistory.nextViewOptions({
                    disableAnimate: true,
                    disableBack: true
                  });
                $rootScope.$broadcast('loading:hide');
            },
            function(response) {
                console.error("Error: order request could not be sent.", response);
                BasketData.broadcast('Product order','Hi Product not available.','OK','button-positive');
                emptyBasket();
                $rootScope.$broadcast('loading:hide');
                $ionicHistory.clearHistory();
                $ionicHistory.nextViewOptions({
                  disableAnimate: true,
                  disableBack: true
                });
                $state.go('app.home');

            });
      }


      sendOrderToSave();

      function sendOrderToSave2(){
        $scope.order = {
          total:2500,
          currency:'INR',
          id:14252,
          created_at : new Date()
        };
         emptyBasket();
        //
          $ionicHistory.clearHistory();
          $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
          });
        $rootScope.$broadcast('loading:hide');
      }
    $scope.reloadAndRedirect = function(){
      $ionicHistory.clearHistory();
      $ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      });
      $state.go('app.home');
    }
    });

})();
