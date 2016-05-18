(function() {
  'use strict';

    angular.module('woocommerce-api.controllers')
.controller('SubcategoriesCtrl', function($scope, $rootScope, Data, UserData, MetaData,CategoriesData) {
  $scope.isEmptyData = true;
    $scope.categories = [];

$rootScope.$broadcast('loading:show');
  if($rootScope.cat != null){
    $scope.isEmptyData = false;
      $scope.categories=$rootScope.cat;
  }
$rootScope.$broadcast('loading:hide');
console.log(  $scope.categories);
$scope.getPercentageValue = function(value, total) {
    return value * 100 / total;
}

})


})();
