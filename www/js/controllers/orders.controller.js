(function() {
  'use strict';

    angular.module('woocommerce-api.controllers')

    // Social Controller
    .controller('OrdersCtrl', function($rootScope, $scope, $stateParams, UserData) {

        $rootScope.$broadcast('loading:show');

        UserData.getOrdersAsync($stateParams.customer_id).then(
            function() {
                $scope.orders = UserData.getOrders();
                $rootScope.$broadcast('loading:hide');
            }
        );

    });

})();