(function() {
  'use strict';

    angular.module('woocommerce-api.controllers')

    .controller('OrderAddressCtrl', function($scope, $window, BasketData) {
      $scope.addressData = [];
      $scope.shipping_address = {};
      $scope.billing_address = {};
      if($window.localStorage['user']){
        var customer =  JSON.parse($window.localStorage['user']).customer;
        if(customer.shipping_address !=null){
          $scope.shipping_address=angular.copy(customer.shipping_address);
        }
        if(customer.billing_address !=null){
          $scope.billing_address=angular.copy(customer.billing_address);
        }
      }
      $scope.copyAction = function(){
        if($scope.addressData.isSameAddress){
          $scope.billing_address = $scope.shipping_address;
        }else{
          $scope.billing_address = {};
        }

      };

      $scope.checkoutRedirect = function(){
        BasketData.shipping_address =   $scope.shipping_address;
        BasketData.billing_address = $scope.billing_address;
        $state.go('app.payment');
      }



    })
})();
