(function() {
  'use strict';

    angular.module('woocommerce-api.controllers')

    // Social Controller
    .controller('OrdersCtrl', function($rootScope, $scope,$window, $stateParams, UserData) {
      $scope.noOreder = false;
        var customerId = $stateParams.customer_id;
        $rootScope.$broadcast('loading:show');
        if($window.localStorage['user']){
            $scope.customer =    JSON.parse($window.localStorage['user']).customer;
          customerId = $scope.customer.id;
        }
        UserData.getOrdersAsync(customerId).then(
            function() {
                $scope.orders = UserData.getOrders();
                if($scope.orders.orders.length>0){
                  $scope.noOreder=false;
                }else{
                  $scope.noOreder= true;
                }
                $rootScope.$broadcast('loading:hide');
            }
        );

    });

})();
