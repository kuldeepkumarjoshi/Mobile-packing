(function() {
  'use strict';

    angular.module('woocommerce-api.controllers')

    .controller('OrderAddressCtrl', function($scope,$state, $window, BasketData) {
      $scope.addressData = [];
      $scope.addressData.enabled =false;
      $scope.shipping_address = {};
      $scope.billing_address = {};
      $scope.populateAddressLoginUser=function(){
        if($window.localStorage['user']){
          var customer =  JSON.parse($window.localStorage['user']).customer;
          if(customer.shipping_address !=null){
            $scope.shipping_address=angular.copy(customer.shipping_address);
          }
          if(customer.billing_address !=null){
            $scope.billing_address=angular.copy(customer.billing_address);
          }
        }
      }
    $scope.populateAddressLoginUser();
      $scope.copyAction = function(){
        if($scope.addressData.isSameAddress){
          $scope.billing_address = $scope.shipping_address;
        }else{
          $scope.billing_address = {};
        }

      };
      $scope.loginFirst= function(){
        $scope.actionLogin($scope);
      }
      function isFormValid(){
        $scope.errorMsg = null;
        if($scope.shipping_address.address_1 == null ||  _.isEmpty($scope.shipping_address.address_1)){
          return false;
        }
        if($scope.shipping_address.city == null ||  _.isEmpty($scope.shipping_address.city)){
          return false;
        }
        if($scope.billing_address.address_1 == null ||  _.isEmpty($scope.billing_address.address_1)){
          return false;
        }
        if($scope.billing_address.city == null ||  _.isEmpty($scope.billing_address.city)){
          return false;
        }
        if($scope.billing_address.phone == null ||  _.isEmpty($scope.billing_address.phone)){
          return false;
        }else  if(isNaN($scope.billing_address.phone)){
            $scope.errorMsg = "Phone number must be in numbers";
            return false;
        }else  if($scope.billing_address.phone.length != 10){
            $scope.errorMsg = "Phone number must be of 10 digits";
            return false;
        }
        return true;
      }

      $scope.checkoutRedirect = function(){

        if(!isFormValid()){
          $scope.addressData.enabled =true;
          return;
        }
        $scope.billing_address.phone = '91'+$scope.billing_address.phone;
        $scope.billing_address.country = 'IN';
        BasketData.shipping_address = angular.copy($scope.shipping_address);
        BasketData.billing_address = angular.copy($scope.billing_address);
        $state.go('app.payment');
      }



    })
})();
