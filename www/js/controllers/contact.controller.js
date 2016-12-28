(function() {
  'use strict';

    angular.module('woocommerce-api.controllers')

    .controller('ContactCtrl', function($rootScope,ContactData, $scope,BasketData) {
      $scope.contact={};
      $scope.contactData = [];
      $scope.contactData.enabled =false;


      $scope.packnationContact = function(){
              $rootScope.$broadcast('loading:show');
      ContactData.getContactDetail().then(function(res){
          $scope.packnationContact =res.data;
           console.log(res);
          $rootScope.$broadcast('loading:hide');
        },function(res){
            $rootScope.$broadcast('loading:hide');
        });
      }
      $scope.packnationContact();
        function isValid(){
          if($scope.contact.contactName == null ||  _.isEmpty($scope.contact.contactName)){
            return false;
          }else if($scope.contact.mobile == null ||  _.isEmpty($scope.contact.mobile)){
            return false;
          }else{
            return true;
          }
        }
        $scope.createMessage = function(){
          if(!isValid()){
              $scope.contactData.enabled =true;
            return false;
          }
            $rootScope.$broadcast('loading:show');
          ContactData.createMessage($scope.contact).then(function(res){
            $rootScope.$broadcast('loading:hide');
            console.log(res.data);
            BasketData.broadcast('Message Received',res.data.callbackMsg,'OK','button-positive');
            
            $scope.contactData = [];
            $scope.contactData.enabled =false;
          },function(res){
              $rootScope.$broadcast('loading:hide');
          })
        }
        // $scope.contact.contactName="kuldeep";
        // $scope.contact.email="kuldeepjoshi@gmail.com";
        // $scope.contact.mobile="9413640466";
        //   $scope.contact.message="hi kuldeep";




    })
})();
