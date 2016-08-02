(function() {
  'use strict';

    angular.module('woocommerce-api.controllers')

    // Social Controller
    .controller('OrdersCtrl', function($rootScope, $scope,$window, $stateParams, UserData) {
        var customerId = $stateParams.customer_id;
        $rootScope.$broadcast('loading:show');
        if($window.localStorage['user']){
            $scope.customer =    JSON.parse($window.localStorage['user']).customer;
          customerId = $scope.customer.id;
        }
        UserData.getOrdersAsync(customerId).then(
            function() {
                $scope.orders = UserData.getOrders();
                $rootScope.$broadcast('loading:hide');
            }
        );

    });

})();
