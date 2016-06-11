(function() {
  'use strict';

    angular.module('woocommerce-api.controllers')
.controller('SubcategoriesCtrl', function($scope,$location, $rootScope, Data, UserData, MetaData,CategoriesData) {
  $scope.isEmptyData = true;
    $scope.categories = [];

    $scope.moveToProduct = function(cat){
      $rootScope.cat = cat;
      if(cat.slug == "viewAll"){
        cat.slug = cat.slug2;
      }
      $location.path('/app/categories/'+cat.slug+'/'+cat.name);
    };

$rootScope.$broadcast('loading:show');
  if($rootScope.cat != null){
    $scope.isEmptyData = false;
      $scope.categories =angular.copy($rootScope.cat);
      $scope.categories.children.push({name:$scope.categories.name,count:$scope.categories.count,slug:"viewAll",slug2:$scope.categories.slug});
  }
$rootScope.$broadcast('loading:hide');
console.log(  $scope.categories);
$scope.getPercentageValue = function(value, total) {
    return value * 100 / total;
}

})


})();
